---
title: Architecting Zero-Downtime Database & Kubernetes Migrations
date: 2026-08-12T09:30:00Z
tags: [kubernetes, database, migrations, sre]
description: The phase model, replication gates and rollback discipline behind zero-downtime database and Kubernetes cutovers — with runbook snippets you can steal.
---

A migration is not a project. It's an operational event that happens to have a project attached to it.

The difference matters because projects get timelines; events get **abandonment criteria**. The teams I've watched succeed at zero-downtime cutovers never ask "will this finish by Friday?" They ask: *at what error rate do we stop, and how long until we're back where we started?* If you can answer that question before the cutover window opens, the migration is already half done.

This article is the playbook I use for live database and Kubernetes migrations: the phase model, the replication gates, the traffic-shifting discipline, and — most importantly — the rollback rules that keep "zero downtime" from becoming a lie with extra steps.

## What zero-downtime actually means

Skip the marketing definition. Operationally, **the migration is zero-downtime if user-facing SLOs hold the entire time**: availability, latency percentile and error budget burn rate all stay inside their normal bands while traffic moves from the old stack to the new one. No maintenance banner, no "degraded service" notice, no support tickets asking what happened at 02:14.

That framing forces three invariants to hold across the entire cutover window:

1. **No write is lost.** Either writes go to both systems (dual-write) or replication lag is measured and gated — never assumed.
2. **Reads converge, and you can tell when they do.** A few seconds of read skew is acceptable *if it's detected*. Undetected skew is how a cutover becomes an incident.
3. **Rollback is forward-compatible.** You must be able to go back without performing another data migration. If going backwards requires re-migrating 40 TB, you don't have a rollback — you have a second project.

## The phase model

Every migration I run follows the same four phases. Teams that skip a phase don't save time; they just move risk from a planned window into an unplanned incident.

### Phase 1 — Shadow and parallel-run

Both stacks are live, but only one is the source of truth. The new stack consumes real traffic patterns — reads replicated or mirrored, writes shadow-applied where safe — while you instrument everything that will matter at cutover time: replication lag, read skew between old and new, error rates on each side, latency percentiles per service.

The output of this phase is a **baseline dashboard**. You cannot gate a cutover against numbers you haven't seen yet.

### Phase 2 — Replication and validation

Data flows continuously from old to new (logical replication for same-engine moves; a CDC pipeline like Debezium for cross-engine). Meanwhile, the application is brought up in a read-only or dual-write configuration behind the scenes so that connection pools, caches and DNS caches are already warm when traffic actually shifts.

### Phase 3 — Progressive traffic shift

Traffic moves in stages — typically **1% → 5% → 25% → 100%** — with each stage gated on SLO burn rate, not elapsed time. A stage passes when error rate and p99 latency hold inside normal bands for the gate window (I use 15 minutes minimum). Each failed gate is an automatic rollback to the previous weight; there are no "let's just watch it a bit longer" stages.

### Phase 4 — Decommissioning, with a hold

The old stack doesn't die at cutover. It goes **warm**: still replicated (now in reverse), still deployable, kept for a hold period I size to the longest user-perceivable bug you'd want to roll back for — usually two to four weeks. Then, and only then, it's deleted.

## The database is the hard part

Applications can be dual-run cheaply; state cannot be "just retried". So the database strategy decides everything else.

### Choose your replication topology first

- **Same-engine version upgrade** (Postgres 14 → 16): logical replication or `pg_upgrade` for single-node, logical replication between clusters for HA topologies.
- **Cross-engine move** (Postgres → CockroachDB, MySQL → Spanner, self-hosted → RDS/Aurora): a CDC pipeline with schema mapping, plus an idempotent backfill job for the historical data.

Whichever topology you pick, the cutover itself has the same shape: **replicate until lag is near zero, stop writes on the old side atomically (or dual-write), promote the new side, shift traffic.** The danger zones are the gaps between those steps — that's where gates live.

### Schema changes follow expand → migrate → contract

During a migration window you must never hold a schema that only one of the two stacks understands. Additive changes first, then backfill, then cleanup:

```sql
-- 1. Expand: additive change on both old and new schemas
ALTER TABLE orders ADD COLUMN region_code TEXT;

-- 2. Backfill in checkpointed batches (idempotent upserts, throttled)
UPDATE orders
   SET region_code = substr(customer_id, 1, 2)
 WHERE id BETWEEN :lo AND :hi
   AND region_code IS NULL;

-- 3. Contract: only after the old stack is decommissioned
ALTER TABLE orders ALTER COLUMN region_code SET NOT NULL;
```

Backfill jobs must be **idempotent and checkpointed** — they will be interrupted, and "just re-run from scratch" on a 500M-row table is not a strategy. Track progress in a dedicated table with `(batch_id, max_pk)` checkpoints so a restart resumes where it stopped.

### The cutover gate: don't flip until lag proves itself

Before promoting the new primary, wait for replication lag to settle under your threshold — measured on the replica side, not inferred from network latency:

```bash
# Gate (run against the new/replica side) before promotion.
GATE_SQL="SELECT COALESCE(pg_last_wal_replay_lag(), interval '0') < interval '50 milliseconds'"

until [ "$(psql -h new-primary -tAc "$GATE_SQL")" = "t" ]; do
  echo "$(date -u +%T) waiting for replication lag to settle..."
  sleep 2
done

echo "lag gate passed — safe to promote"
```

On Postgres < 14 the same check is `pg_wal_lsn_diff(pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn())` compared against a byte threshold. Either way: **the gate is a measured condition, and passing it is what authorizes the next step** — not a timestamp on the runbook.

### The rollback you don't get to rehearse

Keep dual-write (or reverse replication from new → old) alive through the hold period. If a cutover reveals a nasty bug in application code, "rollback" means re-pointing traffic at the warm old stack — a load-balancer weight change, not a data operation. That asymmetry is the entire point of keeping the old side warm: **traffic switching is cheap and instant; data switching is expensive and slow.** Always design your abort path to be the former.

## Kubernetes migrations without dropping requests

Kubernetes moves come in two flavors, and they fail differently.

**In-place upgrades** (same cluster, newer platform version) fail via node disruption: evictions that trip PDBs, pods whose connections drop mid-request during rollouts, storage classes that change semantics under you.

**Cross-cluster migrations** (old EKS/GKE/on-prem → new) fail via the seam between clusters: DNS TTLs still pointing at the old side, connection pools holding dead connections, and — the classic — a 5xx spike when the new replicas scale from zero into real traffic before their caches warm.

### In-place: control plane first, nodes one pool at a time

```hcl
resource "aws_eks_cluster" "prod" {
  name     = var.cluster_name
  role_arn = aws_iam_role.control_plane.arn
  version  = "1.32"   # bump the control plane in this apply...
}

resource "aws_eks_node_group" "general" {
  cluster_name    = aws_eks_cluster.prod.name
  node_role_arn   = aws_iam_role.node.arn
  instance_types  = ["m6i.xlarge"]
  subnet_ids      = data.aws_subnets.private.ids
  version         = "1.32"   # ...then the node groups, in a second apply

  depends_on = [aws_eks_cluster.prod]
}
```

Two applies on purpose: the API rejects node groups newer than their control plane, so bumping both in one plan is how you spend an hour reading `InvalidNodegroupVersion` errors. Upgrade **one node group at a time**, and let pod disruption budgets do what they were written for — sized to your true blast radius (e.g. `minAvailable: 2` for a three-replica stateless service):

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-server-pdb
spec:
  # Count-based for small pools; use a percentage ("80%") for larger ones.
  minAvailable: 2
```

```bash
# Drain one node at a time; PDBs bound how many replicas can go together.
kubectl drain "$NODE" \
  --ignore-daemonsets \
  --delete-emptydir-data \
  --grace-period=30
```

Watch `kubectl get pods -o wide` during the drain — if a pod that should be rescheduled isn't, stop and figure out why (affinity? taints? a PDB you sized wrong?) **before** draining the next node.

### Cross-cluster: shift weights, not DNS expectations

The cross-cluster pattern is two live clusters under one domain name, with a weighted target at the edge — Route 53 health-checked records, or an ALB/Gateway API split across old and new target groups. The weight ladder from Phase 3 applies unchanged: each rung is gated on SLO burn rate.

Two failure modes are worth engineering against explicitly:

- **The cold-start spike.** New replicas receive their first real requests with empty caches and unwarmed connection pools — p99 spikes even though the code is fine. Pre-warm by sending synthetic traffic at low weight before each ladder rung, and keep old-cluster capacity intact until the new side's percentiles match baseline for a full gate window.
- **The stuck session.** Anything with sticky sessions or server-side state needs an explicit drain plan: stop attaching *new* sessions to the dying cluster, let existing ones expire by their natural TTL, and verify via connection counts before reducing weight further.

## The runbook skeleton

A cutover that isn't written down is a hope. Mine look like this — short enough to fit on one screen in an incident bridge:

1. **T-24h:** freeze deploys and schema changes on both stacks; open the comms channel.
2. **T-60m:** run every pre-gate (replication lag, health checks green on new side, dashboards up). Any gate failing = no cutover today. No exceptions, no "one more try".
3. **T-0:** flip to 1% weight. Watch the burn-rate panel, not individual graphs.
4. **Ladder:** 5% → 25% → 100%, each rung gated for ≥15 min on error rate and p99 inside normal bands.
5. **Abort threshold (written in advance):** error budget burn > 4× baseline for 3 consecutive minutes at any weight = automatic rollback to the previous rung; two failed rungs in a row = back to pre-cutover state.
6. **Post:** verify convergence — write counts match, checksum samples on hot tables agree, SLOs normal for the hold period.

The four questions every cutover must be able to answer before T-0:

> - Where is every byte of user data right now?
> - Who owns the rollback switch, and what does pressing it actually do?
> - What measured condition triggers the abort — and who has authority to call it?
> - How will we *prove* convergence after cutover, not just assume it?

## Prove convergence, don't assume it

The quiet failure mode is the cutover that "worked" for a week and then turned out to be silently dropping writes on one path. So post-cutover verification is part of the migration, with its own gates:

- Row-count deltas between old and new inside tolerance (and trending flat).
- Checksum sampling across hot tables — not full-table scans at cutover time, but continuous during the hold period.
- Reverse replication running (new → old) so the rollback path stays real for the entire hold window.
- SLO burn rate indistinguishable from pre-migration baseline.

## TL;DR

Migrations are sequences of **reversible steps with measured gates between them**. Replicate until lag proves itself, shift traffic in gated rungs, keep writes safe on both sides through the hold period, and make your abort path a load-balancer weight change — never a data operation. Do that, and "zero downtime" stops being a marketing phrase and becomes a property you can point at on a dashboard.

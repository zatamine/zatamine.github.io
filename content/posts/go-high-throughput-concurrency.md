---
title: Building High-Throughput Microservices in Go: Concurrency & Memory Patterns
date: 2026-07-14T14:00:00Z
tags: [go, microservices, performance]
description: Worker pools, bounded fan-out with semaphores, context discipline and allocation patterns that keep a Go service fast under real production load.
---

Go gives you concurrency the way water is given in a desert: cheaply, abundantly, and without any warning about what happens when you drink too much.

`go func()` is almost free to write and feels free at 10 goroutines per request — until a slow dependency turns that into 10,000 pending calls, an exhausted connection pool, and an OOM kill mid-incident. The services I've tuned for real throughput all share the same philosophy: **concurrency is a budget, not a feature**. You allocate it deliberately, you bound every fan-out, and you let the runtime do what's good at (scheduling) instead of doing by hand what pools were invented to prevent.

Here are the patterns that consistently pay for themselves in production Go services.

## Bounded fan-out: semaphores over unbounded goroutines

The canonical high-throughput problem: a request fans out to N downstream calls, you wait for all (or most) of them, and you want real parallelism without unbounded growth. The clean pattern is `golang.org/x/sync/semaphore`:

```go
package fanout

import (
	"context"
	"sync"

	"golang.org/x/sync/semaphore"
)

// FetchAll calls fn for every key, bounded to maxConcurrent in flight.
func FetchAll(ctx context.Context, maxConcurrent int64, keys []string, fn func(context.Context, string) (any, error)) map[string]result {
	sem := semaphore.NewWeighted(maxConcurrent)

	res := make(map[string]result, len(keys))
	var mu sync.Mutex
	var wg sync.WaitGroup

	for _, k := range keys {
		k := k // capture loop variable
		if err := sem.Acquire(ctx, 1); err != nil {
			return res // context cancelled: stop spawning, return what we have
		}
		wg.Add(1)
		go func() {
			defer wg.Done()
			defer sem.Release(1)

			v, err := fn(ctx, k)
			mu.Lock()
			res[k] = result{value: v, err: err}
			mu.Unlock()
		}()
	}
	wg.Wait()
	return res
}

type result struct {
	value any
	err   error
}
```

Three things in that snippet matter more than the code itself:

- **The budget is a number you choose per dependency**, and it's chosen *per downstream*, not globally. Your payments API can sustain 50 concurrent calls; your internal inventory service probably wants 12. One global pool means every slow dependency competes for the same bucket — which is exactly how one flaky microservice takes down an entire platform.
- **`sem.Acquire(ctx, 1)` respects cancellation.** If the client goes away or a timeout fires, you stop spawning work instead of finishing it into the void.
- **The cap is on in-flight calls, not total goroutines.** Goroutines stay cheap; *the dependency* is what you're protecting.

A rough sizing rule I use before profiling: `maxConcurrent ≈ target_rps × p95_downstream_latency_seconds`, with a margin of 2–3×. Then confirm with load tests and let the numbers move it around — never leave this number at "looks fine".

## Context discipline is a correctness feature, not style

Every goroutine in that pool holds a `context.Context` for a reason: context is how cancellation and deadlines propagate *down* your call tree, and most Go performance problems I audit are really context bugs wearing a costume.

The failure modes I see constantly:

1. **Leaking work past the request.** A background task started with `context.Background()` that should have died
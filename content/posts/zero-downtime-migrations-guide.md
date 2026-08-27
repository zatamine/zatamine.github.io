---
title: "Zero-Downtime Migrations: A Practical Guide"
date: 2026-08-20T09:00:00+01:00
draft: false
tags: [migrations, postgres, go]
description: "Expand/contract, dual writes, and bounded backfills — a field guide to changing production schemas without dropping a single request."
featured: true
---

Every schema change in production is a small bet: you're wagering that the old code and the new code can coexist for a window of time. Zero-downtime migration is
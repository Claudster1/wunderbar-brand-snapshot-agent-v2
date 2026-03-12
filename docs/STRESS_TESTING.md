# Stress Testing Runbook

This runbook documents repeatable load tests for this app and the CI performance gates.

Related launch validation: `docs/RELEASE_READINESS_CHECKLIST.md`

## Quick Commands

- Dev suite (port `3010`):
  - `npm run stress:dev`
- Production suite (port `3030`):
  - `npm run stress:prod`
- Liveness-only probe stress:
  - `npm run stress:liveness`
- Normalized dev-vs-prod table:
  - `npm run stress:compare`
- Quick normalized table:
  - `npm run stress:compare:quick`
- CI gate (standard thresholds):
  - `npm run stress:compare:ci`
- CI gate (strict pre-release thresholds):
  - `npm run stress:compare:ci:strict`

## Server Startup

Use the right runtime before each suite:

- Dev server:
  - `npm run dev:preview`
- Production standalone server:
  - `npm run build`
  - `PORT=3030 node ".next/standalone/server.js"`

## What Gets Tested

- `/api/health`
  - Full dependency-aware health route.
  - May return non-2xx by design if dependencies are degraded/unhealthy.
- `/api/health?scope=liveness`
  - Lightweight liveness mode for frequent probes.
- `/access`
  - Representative app page rendering throughput.

The compare script outputs:
- target (`dev`/`prod`)
- route (`health`/`liveness`/`access`)
- avg latency, p99 latency, avg req/sec
- non-2xx, errors, and bytes read

## Threshold Profiles

### Standard profile

- `health`: avg `< 250ms`, p99 `< 500ms`, req/sec `> 1200`
- `liveness`: avg `< 200ms`, p99 `< 400ms`, req/sec `> 1300`
- `access`: avg `< 120ms`, p99 `< 300ms`, req/sec `> 2500`

### Strict profile (pre-release)

- `health`: avg `< 120ms`, p99 `< 250ms`, req/sec `> 1500`
- `liveness`: avg `< 90ms`, p99 `< 180ms`, req/sec `> 1600`
- `access`: avg `< 40ms`, p99 `< 100ms`, req/sec `> 2800`

These are enforced by `scripts/stress-report.ts` when using `--fail-on-threshold`.

## CI Gating

- PRs run standard gate:
  - `npm run stress:compare:ci`
- `main` pushes run strict gate:
  - `npm run stress:compare:ci:strict`

Behavior:
- Exit code `1` on threshold failure
- Exit code `0` on pass

Optional manual target scope:
- `--threshold-target prod` (default)
- `--threshold-target dev`
- `--threshold-target all`

## Current Snapshot (Recent Runs)

Standalone prod (`3030`) recent ranges:
- `health`: ~`30–32ms` avg latency, ~`1500+` req/sec
- `liveness`: ~`25–30ms` avg latency, ~`1600+` req/sec
- `access`: ~`16–17ms` avg latency, ~`2900+` req/sec

## Troubleshooting

- If results show `0 B read` or huge error counts:
  - Verify target is reachable:
    - `curl -I http://localhost:3010/access`
    - `curl -I http://localhost:3030/access`
- If port collisions occur:
  - `lsof -nP -iTCP:3010 -sTCP:LISTEN`
  - `lsof -nP -iTCP:3030 -sTCP:LISTEN`
- For production-like numbers, benchmark standalone runtime:
  - `PORT=3030 node ".next/standalone/server.js"`

## Notes

- Dev-mode (`next dev`) includes extra overhead/noise.
- For true performance gates, rely on standalone production runs.
- High non-2xx on `/api/health` can be expected when dependency checks intentionally report degraded health.
# Stress Testing Runbook

This runbook documents repeatable load tests for this app, plus CI performance gates.

## Quick Commands

- Dev suite (port `3010`):
  - `npm run stress:dev`
- Production suite (port `3030`):
  - `npm run stress:prod`
- Liveness-only probe stress:
  - `npm run stress:liveness`
- Normalized dev-vs-prod table:
  - `npm run stress:compare`
- Quick normalized table:
  - `npm run stress:compare:quick`
- CI gate (standard thresholds):
  - `npm run stress:compare:ci`
- CI gate (strict pre-release thresholds):
  - `npm run stress:compare:ci:strict`

## Server Startup

Use the right runtime before each suite:

- Dev server:
  - `npm run dev:preview`
- Production standalone server:
  - `npm run build`
  - `PORT=3030 node ".next/standalone/server.js"`

## What Gets Tested

- `/api/health`
  - Full dependency-aware health route.
  - May return non-2xx by design if dependencies are degraded/unhealthy.
- `/api/health?scope=liveness`
  - Lightweight liveness mode for frequent probes.
- `/access`
  - Representative app page rendering throughput.

The compare script outputs a normalized table with:
- target (`dev`/`prod`)
- route (`health`/`liveness`/`access`)
- avg latency, p99 latency, avg req/sec
- non-2xx, errors, and bytes read

## Threshold Profiles

### Standard profile

- `health`: avg `< 250ms`, p99 `< 500ms`, req/sec `> 1200`
- `liveness`: avg `< 200ms`, p99 `< 400ms`, req/sec `> 1300`
- `access`: avg `< 120ms`, p99 `< 300ms`, req/sec `> 2500`

### Strict profile (pre-release)

- `health`: avg `< 120ms`, p99 `< 250ms`, req/sec `> 1500`
- `liveness`: avg `< 90ms`, p99 `< 180ms`, req/sec `> 1600`
- `access`: avg `< 40ms`, p99 `< 100ms`, req/sec `> 2800`

These are enforced by `scripts/stress-report.ts` when using `--fail-on-threshold`.

## CI Gating

- PRs run standard gate in workflow:
  - `npm run stress:compare:ci`
- `main` pushes run strict gate in workflow:
  - `npm run stress:compare:ci:strict`

Behavior:
- Exit code `1` on threshold failure
- Exit code `0` on pass

Optional manual target scope:
- `--threshold-target prod` (default)
- `--threshold-target dev`
- `--threshold-target all`

## Current Snapshot (Recent Runs)

Standalone prod (`3030`) has been consistently strong in recent runs:
- `health`: ~`30-32ms` avg latency, ~`1500+` req/sec
- `liveness`: ~`25-30ms` avg latency, ~`1600+` req/sec
- `access`: ~`16-17ms` avg latency, ~`2900+` req/sec

## Troubleshooting

- If results show `0 B read` or massive error counts:
  - Verify target is reachable:
    - `curl -I http://localhost:3010/access`
    - `curl -I http://localhost:3030/access`
- If port collisions occur:
  - `lsof -nP -iTCP:3010 -sTCP:LISTEN`
  - `lsof -nP -iTCP:3030 -sTCP:LISTEN`
- For production-like numbers, always benchmark standalone runtime:
  - `PORT=3030 node ".next/standalone/server.js"`

## Notes

- Dev mode (`next dev`) includes extra overhead and runtime noise.
- For true performance gates, rely on standalone production runs.
- High non-2xx on `/api/health` can be expected when dependency checks intentionally report degraded health.

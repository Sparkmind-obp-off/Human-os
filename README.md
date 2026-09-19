# KAEVOS

KAEVOS is a human-controlled operating gateway for understanding, planning, permission, confirmation, execution, verification, reporting, and memory. Human authority remains explicit; model output never grants permission.

## Phase 1 Status

Phase 1 establishes the Cloudflare Workers + Hono + TypeScript foundation only. It does not implement command persistence, execution, real connectors, financial mutations, or autonomous behavior.

### Completed

- Hono Worker entrypoint and `/v1` route boundary
- Typed Cloudflare bindings and centralized configuration parsing
- Explicit unauthenticated actor boundary for later authentication work
- Request ID generation, safe caller-ID acceptance, response propagation, and structured logs
- Normalized application errors with stable HTTP mapping and safe envelopes
- Safe liveness endpoint at `GET /v1/health`
- Unit and integration coverage for configuration, request IDs, errors, and health

### Architecture Reconciliation

| State | Components |
|---|---|
| Existing / compatible | Hono, TypeScript, Wrangler Pages adapter, Worker entrypoint |
| Adapted | Strict TypeScript JSX settings; health output constrained to the stricter Doc 35 disclosure rule |
| Added from Phase 1 archive | Configuration, request context, safe errors, logging, health route, focused tests |
| Missing by design | D1 migrations/repositories, authentication, command domain, execution engine, connector fabric, provider adapters, UI |
| Conflicts | None blocking; Doc 35's stricter health disclosure rule takes precedence over optional environment/runtime output |

## API

| Method | URI | Purpose |
|---|---|---|
| `GET` | `/v1/health` | Safe service liveness response; accepts optional bounded `X-Request-ID` |

Unknown routes return the normalized `NOT_FOUND` envelope.

## Data Architecture

- **Current storage:** none in Phase 1
- **Typed future binding:** optional `DB` D1 binding presence is represented without exposing binding contents
- **Runtime state:** no persistent or in-memory application data is claimed
- **Secrets:** Phase 1 requires none; real values belong in Cloudflare Secrets or ignored `.dev.vars`

## Local Development

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

The sandbox PM2 configuration serves the built Pages bundle on port 3000.

## Configuration

Safe local defaults are documented in `.dev.vars.example`:

- `ENVIRONMENT`
- `KAEVOS_VERSION`
- `LLM_PROVIDER`
- `CONNECTOR_MODE`
- `REQUEST_TIMEOUT_MS`

No credential values are committed.

## URLs

- **Production:** pending verified BYOK deployment
- **GitHub:** https://github.com/Sparkmind-obp-off/Kaevos

## Deployment

- **Platform:** Cloudflare Pages/Workers
- **Production branch:** `main`
- **Status:** pending deployment verification
- **Configuration:** `wrangler.jsonc`

## Not Yet Implemented

Phase 2 begins D1 data and domain contracts. Authentication, authorization, confirmation, execution, connector activation, provider integration, audit persistence, and UI remain intentionally unimplemented.

## Recommended Next Step

Proceed to **Phase 2 — Data + Domain Contracts** only after the Phase 1 quality gate and deployed health smoke test are verified.

See `docs/34_KAEVOS_OPERATING_ARCHITECTURE.md` through `docs/47_KAEVOS_PHASE_1_MASTER_SYSTEM_PROMPT.md` for authoritative contracts.

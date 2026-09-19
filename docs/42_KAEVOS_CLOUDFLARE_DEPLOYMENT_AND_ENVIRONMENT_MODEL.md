# KAEVOS — CLOUDFLARE DEPLOYMENT AND ENVIRONMENT MODEL

**Version:** 1.0  
**Status:** DEPLOYMENT BASELINE — IMPLEMENTATION READY  
**Brand:** KAEVOS  
**Underlying system:** Human-OS  
**Runtime:** Cloudflare Workers  
**Framework:** Hono  
**Language:** TypeScript  
**Database:** Cloudflare D1  
**Related:** Docs 34–41

---

## 1. Purpose

This document defines how KAEVOS is configured, deployed, isolated, secured, observed, and recovered on Cloudflare.

The goal is a small, reproducible V0 deployment model that supports:

- local development;
- isolated test execution;
- staging/preview;
- controlled production;
- D1 migrations;
- secret management;
- CI/CD;
- rollback;
- health checks;
- connector activation.

Core principle:

> **Deployment configuration is part of the security boundary, not an afterthought.**

---

## 2. Runtime Architecture

V0 runtime:

`CLIENT → CLOUDFLARE EDGE → WORKER/HONO → CORE → CONNECTORS → EXTERNAL SYSTEMS`

Persistence:

`WORKER → D1`

Secrets:

`WORKER → CLOUDFLARE SECRET/BINDING → CONNECTOR`

The Worker is the application boundary. External providers remain authoritative for their own data.

---

## 3. Environment Model

Use three logical environments:

| Environment | Purpose | Real external mutations |
|---|---|---|
| Local/Test | development and automated tests | No |
| Staging | integration and deployment validation | Only explicitly approved sandbox/test operations |
| Production | controlled live operation | Yes, according to policy |

Preview deployments must never accidentally inherit production credentials.

Environment separation is enforced by configuration and credentials, not by naming conventions alone.

---

## 4. Local Development

Local development should use Wrangler and local D1/testing facilities.

Goals:

- fast iteration;
- deterministic tests;
- no production secrets;
- Mock connector by default;
- Mock LLM provider by default.

Local environment should support:

`npm run dev`

`npm run typecheck`

`npm run lint`

`npm test`

`npm run test:integration`

`npm run build`

Exact scripts may follow the repository's package manager and chosen test runner.

---

## 5. Wrangler Configuration

Maintain one authoritative Wrangler configuration with environment-specific overrides where required.

Conceptual:

```toml
name = "kaevos"
main = "src/index.ts"
compatibility_date = "YYYY-MM-DD"

[vars]
ENVIRONMENT = "local"

[[d1_databases]]
binding = "DB"
database_name = "kaevos-local"
database_id = "<configured-per-environment>"

[env.staging.vars]
ENVIRONMENT = "staging"

[env.production.vars]
ENVIRONMENT = "production"
```

Do not hard-code real IDs, tokens, or secrets into documentation or source control.

The actual production configuration must be generated from the deployed Cloudflare account and repository settings.

---

## 6. D1 Environment Separation

Each persistent environment should have an explicitly identified D1 database.

Recommended:

- local database for local execution;
- dedicated staging D1 database;
- dedicated production D1 database.

Never point automated tests at production D1.

Never run destructive test fixtures against production.

D1 migrations must be version-controlled.

---

## 7. Migration Policy

Every schema change must be represented by a migration.

Migration lifecycle:

`CREATE → REVIEW → TEST LOCAL → TEST STAGING → APPLY PRODUCTION`

Before production:

- migration applies cleanly to an isolated database;
- existing-data compatibility is checked;
- indexes/constraints are validated;
- rollback or forward-fix strategy is documented.

Avoid destructive migrations in the same release as application code unless compatibility has been demonstrated.

---

## 8. Secrets and Credential Boundary

Secrets belong in Cloudflare's secret/configuration mechanisms, not Git.

Potential secrets include:

- authentication secrets;
- LLM API keys;
- GitHub tokens;
- Cloudflare API tokens;
- Duitku credentials;
- webhook secrets;
- future connector credentials.

Rules:

- no secrets in source code;
- no secrets in `.env` committed to Git;
- no secrets in D1;
- no secrets in audit events;
- no secrets in logs;
- no secrets in API responses;
- no secrets in screenshots/test fixtures.

Use local-only secret files through the standard ignored development mechanism when needed.

---

## 9. Credential Scoping

A connector must not receive unrestricted environment access.

Conceptual flow:

`CORE POLICY → CONNECTOR CREDENTIAL REFERENCE → SECRET RESOLUTION → CONNECTOR`

Credentials should be scoped by:

- environment;
- connector;
- account/resource;
- capability;
- least privilege.

For example, a GitHub connector credential should not automatically grant access to unrelated systems.

---

## 10. Cloudflare API Token Principle

Cloudflare credentials used by KAEVOS should follow least privilege.

Separate read and mutation permissions where practical.

Production mutation credentials should not be reused for local or test environments.

If a connector only needs read access, do not configure a credential with mutation privileges.

---

## 11. GitHub Credential Principle

GitHub credentials should be scoped to the minimum repository/resource access required by KAEVOS.

Preferred design:

`KAEVOS CAPABILITY → APPROVED REPOSITORY SCOPE → MINIMUM GITHUB PERMISSION`

A broad personal access token should not become the default architecture merely because it is convenient.

---

## 12. Duitku Credential Principle

Duitku credentials must remain server-side.

KAEVOS should:

- read authoritative transaction data through the approved connector;
- never expose merchant credentials to clients;
- never store credentials in D1;
- separate test/sandbox credentials from production credentials where the provider supports them;
- protect webhook verification secrets;
- avoid live-money tests.

Financial mutation activation requires an additional review of provider API semantics, authentication, idempotency, webhook/reconciliation, and verification behavior.

---

## 13. Authentication Boundary

V0 may begin with a single founder/operator identity.

However:

- identity must be resolved server-side;
- routes must not hard-code authorization decisions;
- authentication and authorization remain separate;
- future identities must fit the same actor model.

Every consequential action must have an attributable actor.

---

## 14. Public API Exposure

The Worker should expose only required API routes.

Recommended baseline:

- HTTPS only;
- authentication required except explicitly public health behavior;
- strict request validation;
- request-size limits;
- rate limiting strategy;
- safe error responses;
- request ID;
- idempotency support for applicable operations.

Do not expose connector credentials, raw provider responses, or internal implementation endpoints.

---

## 15. CORS

CORS should be restrictive.

For V0:

- allow only known application origins;
- do not use wildcard origins for authenticated operational APIs unless there is a documented reason;
- keep allowed methods minimal;
- keep allowed headers explicit.

CORS is not an authentication mechanism.

---

## 16. Worker Request Lifecycle

Every request follows:

`REQUEST → REQUEST-ID → AUTH → VALIDATE → CORE → RESPONSE`

For a command:

`REQUEST → COMMAND → PLAN → PERMISSION → CONFIRMATION → EXECUTION → VERIFICATION → AUDIT → RESPONSE`

Do not place long-running consequential work inside a fragile synchronous request when durable execution state is required.

---

## 17. Runtime Limits and Async Work

Cloudflare Workers are request-oriented.

V0 should keep command execution bounded.

For operations that may outlive a request:

- persist state before execution;
- use an appropriate asynchronous Cloudflare primitive only when justified;
- make execution resumable;
- never rely on in-memory state as the source of truth.

Durable Objects, Queues, or Cron Triggers are optional future capabilities, not mandatory V0 infrastructure.

---

## 18. Deployment Pipeline

Recommended pipeline:

`PUSH/PR → CI → BUILD → MIGRATION CHECK → DEPLOY STAGING → SMOKE → APPROVAL → PRODUCTION`

CI must validate before deployment:

- typecheck;
- lint;
- tests;
- build;
- migration compatibility;
- security suite.

Production deployment must be explicitly controlled.

---

## 19. GitHub Actions

V0 CI should use GitHub Actions.

Minimum jobs:

### quality

- install dependencies;
- typecheck;
- lint;
- unit/contract tests;
- integration tests;
- security tests;
- build.

### migration

- create isolated test database;
- apply migrations;
- run schema/repository tests.

### deploy-staging

Only after required quality gates pass.

### deploy-production

Protected/manual or equivalent controlled release path.

Exact branch/protection rules depend on repository policy.

---

## 20. Cloudflare Deployment Authentication

CI deployment credentials must be stored as repository/environment secrets or through an approved identity mechanism.

Do not place deployment tokens in:

- workflow YAML;
- package scripts;
- source code;
- documentation.

Production deployment should use the narrowest credential scope practical.

---

## 21. Branch and Release Strategy

Recommended V0:

- `main` = protected integration/release branch;
- short-lived feature branches;
- pull request required for meaningful runtime/security changes;
- CI required before merge;
- production release from a known commit.

Avoid long-lived divergent branches.

---

## 22. Staging Strategy

Staging should mirror production architecture as closely as practical while using separate:

- Worker environment;
- D1 database;
- secrets;
- connector credentials;
- external test/sandbox resources.

Staging validates:

- routing;
- bindings;
- migrations;
- authentication;
- connector credentials;
- verification;
- audit;
- observability.

---

## 23. Production Activation

Production activation should follow:

1. deploy known commit;
2. apply compatible D1 migrations;
3. verify Worker health;
4. verify D1 connectivity;
5. run read-only smoke tests;
6. verify audit persistence;
7. verify connector health;
8. activate only approved connectors;
9. perform controlled business validation;
10. monitor immediately after release.

Do not activate every reserved connector at once.

---

## 24. Connector Environment States

Connector configuration should support:

- `PENDING_CONFIGURATION`;
- `ACTIVE`;
- `DEGRADED`;
- `UNAVAILABLE`;
- `DISABLED`.

A connector may be deployed in code but remain disabled operationally.

This is especially important for financial and production mutation connectors.

---

## 25. Health Checks

`GET /v1/health` should report application health without exposing secrets.

Possible checks:

- Worker/runtime available;
- D1 reachable;
- required configuration present;
- connector registry loaded.

Do not make health endpoints reveal credentials or sensitive infrastructure details.

Connector health should remain separately observable.

---

## 26. Readiness vs Liveness

Distinguish:

### Liveness

“Is the Worker process/runtime responding?”

### Readiness

“Can KAEVOS safely serve the configured capabilities?”

A Worker can be alive while a required connector or D1 dependency is unavailable.

Do not claim full operational readiness from liveness alone.

---

## 27. Deployment Verification

After deployment verify:

- deployed version/commit;
- Worker response;
- API health;
- D1 schema version;
- authentication;
- read-only command;
- audit event;
- connector health;
- verification path.

For consequential production deployments, use external state verification where feasible.

---

## 28. Rollback Strategy

Rollback must distinguish:

### Application rollback

Deploy a previously known-good Worker version.

### Database rollback

Prefer forward-compatible migrations and forward fixes.

Do not assume database schema rollback is always safe.

Before destructive schema changes, confirm compatibility and recovery strategy.

### Connector rollback

Disable the affected connector or capability when safe.

The safest rollback for a connector may be:

`ACTIVE → DISABLED`

rather than reverting unrelated application code.

---

## 29. Failed Deployment / Partial Failure

If deployment succeeds but verification fails:

- do not report success;
- inspect external deployment state;
- mark operational status appropriately;
- disable affected capability if necessary;
- use known-good application version if required;
- reconcile D1 state.

If an external mutation may have occurred, do not blindly retry.

---

## 30. Recovery Principle

Recovery follows:

`PERSISTED STATE → EXTERNAL SOURCE OF TRUTH → RECONCILE → RESUME OR REVIEW`

Never:

`WORKER RESTART → ASSUME NOTHING HAPPENED → RETRY`

This follows the ambiguity rules from Doc 39.

---

## 31. Logging and Observability

Production logs should be structured.

Include safe correlation metadata:

- timestamp;
- environment;
- request ID;
- command ID;
- execution ID;
- connector ID;
- operation type;
- latency;
- normalized error category;
- verification status.

Exclude:

- credentials;
- tokens;
- authorization headers;
- private keys;
- raw sensitive payloads.

---

## 32. Operational Alerts

V0 should have simple alerts/monitoring for:

- Worker errors;
- elevated 5xx;
- D1 failures;
- connector unavailable;
- repeated authentication failures;
- verification failures;
- `REQUIRES_REVIEW` accumulation;
- unusual timeout/retry patterns.

Paid monitoring is not required for the initial system.

---

## 33. Rate Limits and Abuse Protection

Apply basic protection at the API boundary.

At minimum:

- authentication before consequential work;
- bounded request size;
- rate limiting for command creation;
- stricter limits for expensive operations;
- connector-specific limits where required;
- idempotency for supported mutations.

Provider rate limits must be respected by connectors.

---

## 34. Environment Variable Policy

Use environment variables for non-secret configuration.

Use secrets for credentials.

Never rely on environment naming such as `NODE_ENV=production` as the only safety control.

A connector should receive an explicit environment-aware configuration object.

---

## 35. Local/CI Secret Safety

CI should prove that secret-like values are not accidentally committed.

Recommended checks:

- repository secret scanning;
- dependency/security checks where practical;
- test fixture review;
- log redaction tests.

Never echo secrets in CI output.

---

## 36. Domain and Custom Hostname

KAEVOS may later use a custom hostname such as the acquired `kaevos.biz.id` domain.

Domain/legal status remains separate from technical deployment readiness.

Recommended separation:

- application Worker hostname;
- staging hostname;
- production custom hostname.

Do not hard-code a custom domain into core business logic.

---

## 37. Deployment Observability Chain

Every production release should be traceable:

`COMMIT → CI RUN → BUILD → DEPLOYMENT → WORKER VERSION → SMOKE TEST → CONNECTOR STATUS`

This creates a deploy-to-runtime evidence chain.

---

## 38. Production Change Control

Consequential changes should identify:

- what changed;
- why;
- affected capabilities;
- affected connectors;
- migration impact;
- security impact;
- rollback/recovery approach;
- verification method.

High-risk changes should require explicit review before activation.

---

## 39. Cloudflare V0 Checklist

### Runtime
- [ ] Worker deployed.
- [ ] Hono routes responding.
- [ ] D1 binding configured.
- [ ] Wrangler configuration validated.

### Security
- [ ] Production secrets configured securely.
- [ ] No production secret in Git.
- [ ] Auth enabled.
- [ ] CORS restricted.
- [ ] Rate limiting strategy enabled.
- [ ] Connector scopes reviewed.

### Data
- [ ] D1 production database identified.
- [ ] Migrations applied.
- [ ] Schema version verified.
- [ ] Recovery strategy documented.

### CI/CD
- [ ] GitHub Actions passing.
- [ ] Staging deployment automated/controlled.
- [ ] Production deployment protected.
- [ ] Known commit traceable to deployment.

### Operations
- [ ] Health endpoint validated.
- [ ] Read-only smoke test passed.
- [ ] Audit persistence verified.
- [ ] Connector health verified.
- [ ] Monitoring/alerts available.
- [ ] Rollback/recovery procedure tested.

---

## 40. Definition of Done

Deployment architecture is ready when:

- [ ] local/test environment is isolated;
- [ ] staging and production are separated;
- [ ] D1 databases are explicitly separated;
- [ ] migrations are version-controlled;
- [ ] secrets have a clear Cloudflare boundary;
- [ ] connector credentials are scoped;
- [ ] CI validates code before deployment;
- [ ] staging deployment is repeatable;
- [ ] production deployment is controlled;
- [ ] health/readiness are distinguishable;
- [ ] smoke tests are defined;
- [ ] rollback/recovery is documented;
- [ ] deployment-to-runtime traceability exists;
- [ ] connector activation is controlled.

---

## 41. Anti-Overengineering Boundary

V0 does not require:

- Kubernetes;
- containers;
- multiple Cloudflare accounts solely for separation;
- service mesh;
- Terraform/Pulumi unless infrastructure-as-code becomes necessary;
- complex deployment orchestrators;
- paid monitoring;
- multi-region custom infrastructure.

Cloudflare Workers + D1 + Wrangler + GitHub Actions provide the baseline.

Add infrastructure only when a concrete reliability, security, scale, or operational requirement justifies it.

---

## 42. Final Deployment Principle

> **KAEVOS deployment is trustworthy when the exact code, configuration, database schema, credentials, connector state, and post-deploy evidence are all traceable and environment-isolated.**

V0 deployment loop:

`CODE → CI → STAGING → VERIFY → CONTROLLED PRODUCTION → SMOKE → OBSERVE → RECOVER IF NEEDED`

**Next artifact:** `docs/43_KAEVOS_EXTERNAL_PROVIDER_AND_CONNECTOR_ACTIVATION_MATRIX.md`

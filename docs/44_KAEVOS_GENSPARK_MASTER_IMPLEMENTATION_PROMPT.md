# KAEVOS — GENSPARK MASTER IMPLEMENTATION PROMPT

**Document:** `docs/44_KAEVOS_GENSPARK_MASTER_IMPLEMENTATION_PROMPT.md`  
**Version:** 1.0  
**Status:** IMPLEMENTATION AUTHORITY  
**Target:** Genspark AI coding/implementation agent  
**Repository:** `Sparkmind-obp-off/Human-os`  
**Branch:** `main`  
**Runtime:** Cloudflare Workers  
**Framework:** Hono + TypeScript  
**Database:** Cloudflare D1  
**Brand:** KAEVOS  
**Commercial domain:** KAEVAX  
**Related specification:** Docs 34–43

---

# 0. MASTER INSTRUCTION

You are the implementation agent for **KAEVOS**, a production-minded Human Operating Layer.

Your task is to inspect the existing repository and implement the KAEVOS V0 system described by the authoritative documentation already committed to this repository.

You are NOT being asked to:

- create another conceptual prototype;
- produce a mockup-only application;
- rewrite the architecture without evidence;
- replace the documented architecture with your preferred framework;
- add unnecessary paid infrastructure;
- build an unrestricted autonomous agent;
- invent unofficial integrations;
- claim functionality that is not implemented and verified.

You ARE being asked to:

> **Turn the documented KAEVOS operating model into one small, testable, secure, deployable, observable vertical system.**

The target loop is:

`HUMAN → COMMAND → UNDERSTAND → PLAN → PERMISSION → CONFIRM → EXECUTE → VERIFY → REPORT → AUDIT`

Human authority remains the final control boundary.

---

# 1. READ THE REPOSITORY BEFORE CHANGING IT

Before implementation:

1. inspect the repository tree;
2. inspect existing `package.json`;
3. inspect existing TypeScript configuration;
4. inspect existing Wrangler configuration;
5. inspect existing source code;
6. inspect existing migrations;
7. inspect existing tests;
8. inspect existing CI/CD configuration;
9. inspect all KAEVOS docs 28–43;
10. identify what already exists and what is missing.

Do not overwrite working code merely to match an imagined structure.

Prefer incremental implementation.

If an existing implementation conflicts with Docs 34–43, preserve useful work but reconcile the conflict explicitly in code and documentation.

---

# 2. AUTHORITATIVE DOCUMENT ORDER

Treat these documents as the implementation specification:

1. `28_KAEVOS_BRAND_IDENTITY_FOUNDATION.md`
2. `29_KAEVOS_BRAND_STRATEGY_AND_MESSAGING_SYSTEM.md`
3. `30_KAEVOS_VISUAL_IDENTITY_SPECIFICATION.md`
4. `31_KAEVOS_LOGO_EXPLORATION_BRIEF.md`
5. `32_KAEVOS_LOGO_CONCEPT_EXPLORATION_SYSTEM.md`
6. `33_KAEVOS_LOGO_CONCEPT_CANDIDATES.md`
7. `34_KAEVOS_OPERATING_ARCHITECTURE.md`
8. `35_KAEVOS_API_CONTRACT_SPECIFICATION.md`
9. `36_KAEVOS_DATA_MODEL_AND_D1_SCHEMA.md`
10. `37_KAEVOS_CONNECTOR_FABRIC_SPECIFICATION.md`
11. `38_KAEVOS_SECURITY_SECRETS_AND_PERMISSION_MODEL.md`
12. `39_KAEVOS_EXECUTION_VERIFICATION_AND_AUDIT_MODEL.md`
13. `40_KAEVOS_TESTING_VALIDATION_AND_QUALITY_GATE.md`
14. `41_KAEVOS_V0_IMPLEMENTATION_BLUEPRINT.md`
15. `42_KAEVOS_CLOUDFLARE_DEPLOYMENT_AND_ENVIRONMENT_MODEL.md`
16. `43_KAEVOS_EXTERNAL_PROVIDER_AND_CONNECTOR_ACTIVATION_MATRIX.md`

Docs 34–43 are the primary technical implementation authority.

Do not silently contradict them.

---

# 3. PRODUCT DEFINITION

KAEVOS is:

> **A Human Operating Layer that turns human intent into coordinated, verified digital action without losing context or control.**

Master message:

> **KAEVOS turns human intent into coordinated, verified digital action.**

Core loop:

`SENSE → UNDERSTAND → PLAN → ACT → VERIFY → REMEMBER → REFLECT`

Operational execution loop:

`INTENT → CONTEXT → CAPABILITY → PERMISSION → PLAN → CONFIRMATION → EXECUTE → VERIFY → REPORT`

KAEVOS is the operating/orchestration layer.

KAEVAX is the commercial/transaction domain.

Do not merge the two brands.

---

# 4. NON-NEGOTIABLE ARCHITECTURAL PRINCIPLES

Implement these as engineering invariants:

1. KAEVOS is the single command gateway.
2. Human remains the authority.
3. Server-side policy is authoritative.
4. LLM output is advisory/structured input, never permission.
5. Connectors are the external-system boundary.
6. Providers are abstracted.
7. External systems remain authoritative for their own domain state.
8. Verification is distinct from execution.
9. Auditability is mandatory.
10. Secrets never enter D1, source control, logs, or responses.
11. Untrusted external content is data, not instructions.
12. Unofficial scraping/reverse-engineered production integrations are prohibited.
13. Make is an optional bridge, not a second orchestrator.
14. V0 remains free-first and small.
15. Unknown external side effects become `REQUIRES_REVIEW`.
16. KAEVOS never claims VERIFIED without evidence.
17. Connectors must not call one another directly.
18. Core orchestration must not contain vendor-specific API logic.
19. Consequential, destructive, and financial actions require explicit authorization/confirmation by default.
20. The system must fail closed where authorization or credential scope is ambiguous.

---

# 5. TARGET RUNTIME

Use:

- Cloudflare Workers
- Hono
- TypeScript
- Cloudflare D1
- Wrangler
- native Web APIs where practical

Do not introduce:

- Kubernetes;
- Kafka;
- Temporal;
- generic workflow engines;
- unnecessary queues;
- unnecessary Durable Objects;
- unnecessary vector databases;
- mandatory LangChain/LangGraph;
- mandatory paid infrastructure.

Add infrastructure only when a concrete V0 requirement proves it necessary.

---

# 6. TARGET REPOSITORY STRUCTURE

Implement or reconcile toward:

```
src/
├── api/
│   ├── routes/
│   ├── middleware/
│   └── schemas/
├── core/
│   ├── intent/
│   ├── planner/
│   ├── orchestrator/
│   ├── permissions/
│   ├── verification/
│   └── errors/
├── providers/
│   └── llm/
│       ├── gemini/
│       ├── mock/
│       └── provider.ts
├── connectors/
│   ├── mock/
│   ├── github/
│   ├── cloudflare/
│   ├── duitku/
│   ├── tiktok/
│   ├── shopee/
│   └── make/
├── db/
│   ├── migrations/
│   └── repositories/
├── audit/
├── observability/
├── config/
└── index.ts

tests/
├── unit/
├── integration/
├── connector/
├── security/
└── e2e/
```

Do not create empty complexity for its own sake.

Unimplemented integrations must be explicitly marked RESERVED/PENDING rather than pretending to work.

---

# 7. IMPLEMENTATION ORDER

Follow this order unless repository evidence requires a safe adjustment.

## Phase 1 — Foundation

1. runtime/bootstrap;
2. Hono app;
3. TypeScript strictness;
4. configuration;
5. environment handling;
6. error model;
7. request IDs;
8. structured logging;
9. health endpoint.

## Phase 2 — Persistence

10. D1 binding;
11. migrations;
12. repositories;
13. transaction boundaries;
14. optimistic concurrency;
15. cursor pagination;
16. idempotency storage.

## Phase 3 — Domain Contracts

17. Command;
18. Intent;
19. Plan;
20. Permission;
21. Confirmation;
22. ExecutionRun;
23. ExecutionStep;
24. VerificationResult;
25. AuditEvent;
26. Connector;
27. LLMProvider.

## Phase 4 — State Control

Implement server-owned state transitions:

`RECEIVED → UNDERSTANDING → PLANNING → AWAITING_CONFIRMATION → EXECUTING → VERIFYING → COMPLETED`

Failure:

`ANY STATE → FAILED`

Ambiguous external side effect:

`EXECUTING / VERIFYING → REQUIRES_REVIEW`

Safe cancellation:

`PLANNED / AWAITING_CONFIRMATION / EXECUTING → CANCELLED`

Never allow clients or LLM output to arbitrarily set state.

## Phase 5 — API

Implement:

- `POST /v1/commands`
- `GET /v1/commands/:id`
- `POST /v1/commands/:id/confirm`
- `POST /v1/commands/:id/cancel`
- `GET /v1/connectors`
- `GET /v1/connectors/:id`
- `POST /v1/connectors/:id/test`
- `GET /v1/health`
- `GET /v1/audit`

Follow Doc 35 exactly unless a discovered implementation constraint requires a documented correction.

---

# 8. COMMAND INTAKE

A command must have:

- unique command ID;
- actor identity;
- source/interface;
- raw user intent where safe;
- normalized intent;
- context;
- timestamp;
- request ID;
- idempotency key when applicable.

Validate all client input.

Do not trust:

- client-supplied state;
- client-supplied permission;
- client-supplied verification;
- client-supplied actor identity without authentication.

---

# 9. INTENT ENGINE

The intent engine converts natural language into a structured representation.

Example:

User:

> “KAEVOS, cek revenue KAEVAX hari ini.”

Structured intent should identify:

- domain: finance/commercial;
- resource: KAEVAX revenue/transactions;
- operation: read;
- time range: today;
- target connector: capability-based, not vendor-name guessed by LLM.

If ambiguity materially changes the action, do not invent an assumption.

Ask for clarification or move to review according to the documented command flow.

---

# 10. LLM PROVIDER ABSTRACTION

Implement:

```ts
interface LLMProvider {
  id: string;
  capabilities(): ProviderCapability[];
  generate(request: LLMRequest): Promise<LLMResponse>;
}
```

At minimum support:

- Mock provider;
- Gemini-compatible provider adapter when credentials/configuration exist.

Future providers must be addable without rewriting the planner/orchestrator:

- OpenAI-compatible;
- xAI/Grok;
- OpenRouter;
- other compatible providers.

Do not hard-code a vendor inside core orchestration.

---

# 11. LLM OUTPUT VALIDATION

Never directly execute arbitrary model output.

Flow:

`LLM → SCHEMA VALIDATION → NORMALIZATION → POLICY → PLAN → CONFIRMATION → EXECUTION`

Reject malformed output.

Treat all model-generated external content as untrusted.

The model cannot:

- grant itself permissions;
- choose arbitrary credentials;
- bypass confirmation;
- declare verification;
- call arbitrary URLs;
- mutate connector registry.

---

# 12. PLANNER

The planner creates a server-validatable plan.

Each plan step must include:

- step ID;
- capability;
- connector ID;
- target/resource;
- normalized input;
- risk class;
- expected result;
- verification strategy;
- dependency/ordering;
- permission requirement.

Plan version must be immutable once confirmation is requested.

A confirmation binds to:

`command_id + plan_id + plan_version + actor`

Any material plan change invalidates the previous confirmation.

---

# 13. PERMISSION ENGINE

Implement the authorization model:

`WHO → WHAT → WHERE → WHICH CREDENTIAL → WHICH POLICY`

Permission decisions must be server-side.

Default policy:

| Risk | Default |
|---|---|
| READ_ONLY | may auto-run if authorized |
| LOW_RISK | policy-controlled |
| CONSEQUENTIAL | explicit confirmation |
| DESTRUCTIVE | explicit confirmation |
| FINANCIAL | explicit confirmation + strong verification |

Never weaken these defaults because the LLM says the action is safe.

---

# 14. CONFIRMATION ENGINE

Confirmation must be:

- explicit;
- actor-bound;
- plan-bound;
- version-bound;
- time-limited;
- auditable.

Recommended expiration:

15 minutes.

Example UI/API representation:

> Action preview  
> Capability: `github.file.write`  
> Target: repository X / file Y  
> Effect: update file  
> [Confirm] [Cancel]

A generic “yes” must not confirm a materially different plan.

---

# 15. CONNECTOR CONTRACT

Implement a common contract:

```ts
interface Connector {
  id: string;
  name: string;
  version: string;
  capabilities(): Capability[];
  healthCheck(context: ConnectorContext): Promise<HealthResult>;
  execute(
    request: ConnectorExecutionRequest,
    context: ConnectorContext
  ): Promise<ConnectorExecutionResult>;
  verify?(
    request: ConnectorVerificationRequest,
    context: ConnectorContext
  ): Promise<VerificationResult>;
}
```

Do not let core code depend on vendor-specific SDK response shapes.

Normalize external responses at the connector boundary.

---

# 16. CONNECTOR REGISTRY

Use a static in-process registry for V0.

Do not implement dynamic runtime plugin loading.

Each connector declares:

- ID;
- version;
- lifecycle status;
- capabilities;
- risk;
- required credential reference;
- environment support;
- verification support.

The registry is server-owned.

---

# 17. MOCK CONNECTOR

Build a deterministic Mock Connector first.

Support scenarios:

- success;
- validation error;
- authentication failure;
- timeout;
- rate limit;
- upstream failure;
- verification mismatch;
- unknown side effect;
- idempotency conflict.

The Mock Connector is essential for deterministic tests.

---

# 18. GITHUB CONNECTOR

Initial capabilities:

- `github.repository.read`
- `github.file.read`
- `github.file.write`

Optional later:

- issues;
- workflow read;
- workflow dispatch.

Credential:

- least privilege;
- repository/resource scoped;
- Cloudflare secret boundary.

Write flow:

`PLAN → CONFIRM → WRITE → READ/COMMIT VERIFICATION → AUDIT`

Never report a write as VERIFIED solely because local code returned success.

---

# 19. CLOUDFLARE CONNECTOR

Initial capabilities:

- account/resource read;
- project read;
- deployment read.

Controlled mutation:

- deployment write.

Later/disabled by default:

- production configuration mutation;
- destructive resource deletion.

Deployment verification should prefer:

`DEPLOY → DEPLOYMENT STATUS → HEALTH CHECK → VERIFIED`

If the provider reports an ambiguous result, use `REQUIRES_REVIEW`.

---

# 20. DUITKU CONNECTOR

Initial V0 boundary:

- transaction read;
- transaction status read;
- revenue visibility/reconciliation read where contract permits.

Financial mutation is NOT a V0 default.

Never run live-money tests.

Before enabling any financial mutation, require documented:

- current provider API contract;
- authentication;
- scopes;
- idempotency semantics;
- webhook/security model;
- reconciliation;
- verification;
- sandbox/test path;
- audit mapping;
- explicit human authorization policy.

External payment state remains authoritative in Duitku.

KAEVOS reports financial data; it does not hold customer funds.

---

# 21. TIKTOK / TIKTOK SHOP

Keep connector RESERVED until official API/access validation is complete.

Potential capabilities:

- content.read;
- content.publish;
- analytics.read;
- product.read;
- order.read;
- supported commerce operations.

Before activation validate at implementation time:

- official API;
- account/program eligibility;
- authentication;
- scopes;
- rate limits;
- regional availability;
- terms;
- events/webhooks;
- verification semantics.

Do not use unofficial endpoints or scraping as the production architecture.

---

# 22. SHOPEE

Keep connector RESERVED until official API/access validation is complete.

Potential capabilities:

- shop.read;
- product.read/write;
- order.read;
- logistics/status read;
- supported analytics.

Validate:

- official API;
- partner/application requirements;
- auth;
- scopes;
- rate limits;
- regional availability;
- events/webhooks;
- verification.

No unofficial scraping/reverse-engineered endpoint as a production dependency.

---

# 23. MAKE BRIDGE

Make is an optional bridge.

Allowed architecture:

`KAEVOS → MAKE → EXTERNAL WORKFLOW`

KAEVOS remains authoritative for:

- command;
- plan;
- permission;
- confirmation;
- execution;
- verification;
- audit.

Do not let Make become a hidden second planner/orchestrator.

If Make invokes downstream systems, record:

- scenario/workflow reference;
- execution reference when available;
- request/response classification;
- verification state.

---

# 24. RESERVED FUTURE CONNECTORS

Reserve, do not fabricate:

- Google;
- Microsoft;
- email;
- calendar;
- CRM;
- analytics;
- communication;
- additional commerce platforms.

Each becomes active only after the same activation gate.

---

# 25. CREDENTIAL BOUNDARY

Secrets belong only in approved runtime secret mechanisms.

Never store in:

- D1;
- Git;
- source files;
- logs;
- API response;
- audit metadata;
- screenshots;
- test fixtures.

D1 may store:

- opaque credential reference;
- connector metadata;
- scope metadata;
- environment;
- activation state.

Credential resolution:

`CAPABILITY → POLICY → CREDENTIAL REF → SECRET RESOLVER → CONNECTOR`

---

# 26. EXECUTION SERVICE

Implement the server-owned execution pipeline:

1. load command;
2. load exact plan;
3. verify revision;
4. verify actor;
5. verify permission;
6. verify confirmation where required;
7. resolve connector;
8. resolve credential;
9. establish idempotency;
10. atomically mark execution;
11. invoke connector;
12. normalize result;
13. verify external state;
14. persist result;
15. append audit event;
16. return truthful response.

Never skip the pre-execution gate.

---

# 27. EXECUTION SEMANTICS

Distinguish:

- REQUESTED;
- PLANNED;
- ATTEMPTED;
- COMPLETED;
- VERIFIED;
- FAILED;
- REQUIRES_REVIEW;
- CANCELLED.

These are not interchangeable.

Example:

> “GitHub returned HTTP success.”

This means only that the request appears accepted unless the connector's verification contract establishes external state.

---

# 28. VERIFICATION SERVICE

Implement:

```ts
interface VerificationResult {
  status:
    | "verified"
    | "not_verified"
    | "mismatch"
    | "unknown"
    | "unavailable";
  method: string;
  evidence?: SafeEvidence;
  checkedAt: string;
}
```

Preferred methods:

1. read-after-write;
2. provider event;
3. operation status;
4. provider response when sufficiently authoritative;
5. no verification.

If no reliable verification exists:

`COMPLETED` may be possible, but `VERIFIED` must not be claimed.

---

# 29. UNKNOWN SIDE EFFECTS

If a mutation times out or produces ambiguous external state:

`EXECUTING/VERIFYING → REQUIRES_REVIEW`

Do not blindly retry.

First reconcile against the external system of record.

This is especially important for:

- payments;
- orders;
- publishing;
- production deployment;
- deletion.

---

# 30. RETRY POLICY

Retry only if:

- operation is read-only; or
- provider semantics establish idempotency/safe repetition; or
- operation has an explicit safe retry contract.

Use bounded retries.

Recommended maximum:

2 retries after initial attempt.

Mutation timeout without proven provider idempotency:

`NO BLIND RETRY`

---

# 31. IDEMPOTENCY

Implement KAEVOS-side idempotency using:

- actor;
- idempotency key;
- command/action identity;
- request fingerprint;
- stored result/status.

Detect conflicts where the same idempotency key is reused with materially different payload.

Important:

> KAEVOS idempotency does not automatically create provider-side idempotency.

Where financial/external semantics require provider idempotency, implement the provider-specific mechanism inside that connector.

---

# 32. CONCURRENCY

Use server-side optimistic concurrency with the documented `revision` field.

Reject stale state transitions.

Example:

`expected_revision != current_revision → CONFLICT`

Do not permit two confirmations or two execution starts to race into duplicate side effects.

---

# 33. AUDIT

Every meaningful command/execution transition should produce an auditable event.

Audit must answer:

- WHO;
- WHAT;
- WHERE;
- WHEN;
- WHICH CAPABILITY;
- WHICH CONNECTOR;
- WHICH POLICY;
- WHETHER CONFIRMED;
- WHAT WAS ATTEMPTED;
- WHAT COMPLETED;
- WHAT WAS VERIFIED.

Never put secret values into audit records.

---

# 34. OBSERVABILITY

Trace:

`COMMAND → PLAN → CONNECTOR ACTION → EXTERNAL RESPONSE → VERIFICATION → FINAL RESULT`

Track:

- request_id;
- command_id;
- execution_id;
- step_id;
- connector_id;
- provider_id;
- latency;
- error category;
- verification result;
- audit event.

Do not log:

- API keys;
- tokens;
- webhook secrets;
- credential values;
- unnecessary raw sensitive payloads.

---

# 35. API ERROR MODEL

Use a consistent safe error envelope.

Errors must expose:

- stable error code;
- human-readable safe message;
- request ID;
- retryability where safe;
- field errors where applicable.

Do not expose:

- stack traces in production;
- secret material;
- provider credentials;
- internal authentication details;
- unnecessary upstream raw payloads.

---

# 36. SECURITY CONTROLS

Implement at minimum:

- authentication boundary;
- authorization;
- input validation;
- schema validation;
- rate limiting;
- request IDs;
- idempotency;
- concurrency control;
- secret redaction;
- restrictive CORS where applicable;
- safe errors;
- connector isolation;
- external-content trust boundary;
- audit events.

Fail closed when security state is ambiguous.

---

# 37. DATABASE

Implement the schema from Doc 36.

At minimum preserve these domains:

- commands;
- execution_runs;
- execution_steps;
- connector_events;
- audit_events;
- provider_events;
- confirmations;
- idempotency_keys;
- connector_registrations;
- sessions.

Use migrations.

Do not silently mutate production schema without a migration.

Use foreign keys and indexes as specified.

---

# 38. API CONTRACT

Implement the documented envelope and endpoint behavior from Doc 35.

Required base:

`/v1`

Headers where applicable:

- Content-Type;
- Authorization;
- X-Request-ID;
- Idempotency-Key.

Validate all request bodies with a schema library such as Zod or an equivalent already present in the repository.

---

# 39. AUTHENTICATION

If an existing authentication system exists, inspect and preserve it if compatible.

If not, implement a minimal explicit authentication boundary suitable for V0.

Never pretend that an unauthenticated public command endpoint is production-safe.

Separate:

- authentication;
- actor identity;
- authorization;
- connector credential identity.

---

# 40. ENVIRONMENT MODEL

Maintain:

- local;
- test;
- staging;
- production.

Never reuse production credentials in local/test.

Use environment-specific:

- D1;
- secrets;
- connector registrations;
- activation states.

Production connectors must never accidentally point at test resources or vice versa.

---

# 41. WRANGLER / CLOUDFLARE

Use Wrangler configuration aligned with Doc 42.

Document:

- worker name;
- compatibility configuration;
- D1 bindings;
- environment configuration;
- secret names;
- deployment commands;
- migration commands;
- health check.

Do not commit secret values.

---

# 42. TESTING REQUIREMENTS

Before claiming completion, implement and run:

### Unit

- state transitions;
- risk classification;
- permission evaluation;
- confirmation binding;
- intent validation;
- plan validation;
- error mapping.

### Connector contract

- capability declaration;
- input validation;
- normalized output;
- health;
- error taxonomy.

### Security

- unauthorized command;
- insufficient permission;
- wrong credential scope;
- expired confirmation;
- plan/version mismatch;
- secret redaction;
- prompt injection;
- replay;
- idempotency conflict.

### Execution

- success;
- connector failure;
- timeout;
- safe retry;
- unsafe retry rejection;
- verification mismatch;
- unknown side effect;
- cancellation;
- partial multi-step failure.

### Integration

- D1 repository;
- API;
- Mock connector;
- GitHub where safe;
- Cloudflare where safe.

### E2E

At minimum:

**Scenario A — read**

`command → intent → plan → permission → connector → verify → report → audit`

**Scenario B — consequential write**

`command → plan → confirmation → execution → verification → report → audit`

**Scenario C — ambiguous mutation**

`command → execution timeout → REQUIRES_REVIEW → reconciliation`

---

# 43. DETERMINISTIC TESTING

Tests must not depend on:

- live money;
- unstable provider responses;
- personal credentials;
- uncontrolled third-party data.

Use deterministic fixtures.

Mock provider/connector tests should cover failure injection.

---

# 44. CI QUALITY GATE

CI must fail when applicable on:

- type errors;
- lint errors;
- unit test failure;
- integration/contract failure;
- security test failure;
- migration validation failure;
- build failure.

If the repository already uses a different valid toolchain, integrate rather than duplicate it.

---

# 45. DEPLOYMENT QUALITY GATE

Before production:

`BUILD → TEST → MIGRATE/VALIDATE → STAGING → SMOKE → VERIFY → REVIEW → PRODUCTION`

After production deployment verify:

- worker health;
- D1 connectivity;
- connector registry;
- required secret presence without exposing values;
- API health;
- one safe read-only smoke path;
- observability.

---

# 46. ACTIVATION STATES

Implement/represent:

`RESERVED`

→ `PENDING_RESEARCH`

→ `PENDING_CONFIGURATION`

→ `TESTING`

→ `ACTIVE`

with failure/maintenance paths:

`ACTIVE → DEGRADED → UNAVAILABLE`

and administrative shutdown:

`ANY ACTIVE → DISABLED`

A source-code connector is not automatically active.

---

# 47. V0 ACTIVE SET

Target the smallest useful set:

### Active/Test

- Mock provider;
- Mock connector.

### Controlled real

- GitHub;
- Cloudflare;
- Gemini-compatible LLM provider when configured.

### Read-oriented financial boundary

- Duitku, only after current API/auth/credential validation.

### Reserved

- TikTok/TikTok Shop;
- Shopee;
- Make;
- future Google/Microsoft/email/calendar/CRM/etc.

Do not fake readiness for reserved integrations.

---

# 48. V0 VERTICAL SLICES

Implement these slices end-to-end.

## Slice 1 — Health

`GET /v1/health`

Must return safe operational status.

## Slice 2 — Mock Read

User:

> “KAEVOS, cek sistem.”

Flow:

`COMMAND → PLAN → MOCK READ → VERIFY → REPORT → AUDIT`

## Slice 3 — GitHub Read

User:

> “KAEVOS, cek repository.”

Flow through GitHub connector.

## Slice 4 — GitHub Write

User:

> “KAEVOS, buatkan/update file X di repository Y.”

Require:

`PLAN → EXPLICIT CONFIRMATION → WRITE → VERIFY → REPORT`

## Slice 5 — Cloudflare Read

User:

> “KAEVOS, cek deployment.”

Read external deployment state and report verified evidence.

## Slice 6 — Duitku Read

User:

> “KAEVOS, cek revenue hari ini.”

Only activate after provider-specific access validation.

---

# 49. VOICE COMPATIBILITY

Voice is an interface, not a second orchestration engine.

Target:

`VOICE → STT → COMMAND API → INTENT → PLAN → EXECUTE → VERIFY → RESPONSE → TTS`

The command API must remain usable independently of voice.

Do not duplicate business logic inside a voice layer.

---

# 50. UI / USER EXPERIENCE

If the repository already contains a UI, align it with Doc 30.

Required conceptual states:

- Idle;
- Listening;
- Understanding;
- Planning;
- Confirmation;
- Execution;
- Verification.

Important language:

- “You approve”
- “Awaiting confirmation”
- “Permission required”
- “Action preview”
- “Review result”
- “Stop workflow”

The UI must make human authority visible.

Avoid:

- “AI magic” framing;
- fake autonomous claims;
- unverified success animations;
- misleading completion states.

---

# 51. BRAND BOUNDARY

KAEVOS is the operating layer.

KAEVAX is the commerce/transaction layer.

Do not rename the repository or create a new master brand.

Do not claim trademark clearance.

The domain `kaevos.biz.id` may be configured later, but deployment must not depend on it.

---

# 52. IMPLEMENTATION DISCIPLINE

When uncertain:

1. inspect existing code;
2. inspect the relevant specification;
3. choose the smallest compliant implementation;
4. add a test;
5. document a genuine blocker;
6. do not invent provider behavior.

Never solve uncertainty by pretending.

---

# 53. EXTERNAL PROVIDER FACTS

Provider-specific details can change.

For any external provider, do not hard-code assumptions about:

- current endpoints;
- current scopes;
- current quotas;
- current pricing;
- current regional eligibility;
- current program access;
- current authentication behavior.

If the implementation environment provides current official documentation, validate against it.

Otherwise mark the dependency:

`PROVIDER_DEPENDENT / VALIDATION_REQUIRED`

Never invent rate limits or sandbox availability.

---

# 54. PROHIBITED SHORTCUTS

Do NOT:

- store secrets in D1;
- hard-code API keys;
- commit credentials;
- trust LLM permission decisions;
- execute arbitrary URLs from model output;
- skip confirmation for consequential operations;
- call unofficial APIs in production;
- use scraping as a production connector;
- mark attempted as verified;
- retry unknown financial mutations blindly;
- hide connector failures;
- create a second orchestration engine;
- make Make the source of truth;
- couple planner logic to Gemini/OpenAI/Grok;
- add paid infrastructure without a concrete need;
- claim production readiness before tests pass.

---

# 55. REQUIRED CODE QUALITY

Prefer:

- small modules;
- explicit types;
- pure policy functions;
- dependency injection at boundaries;
- typed errors;
- deterministic tests;
- clear repository interfaces;
- explicit state transitions;
- normalized connector responses;
- comments only where they explain non-obvious safety constraints.

Avoid:

- giant files;
- hidden global state;
- magic strings scattered across modules;
- duplicated provider logic;
- speculative abstractions.

---

# 56. IMPLEMENTATION OUTPUT REQUIREMENTS

When implementation work is complete, produce/maintain:

1. working source;
2. migrations;
3. tests;
4. configuration;
5. deployment documentation if missing;
6. environment variable documentation with secret names only;
7. connector activation notes;
8. clear remaining blockers.

Do not write a document claiming success when the corresponding code/test does not exist.

---

# 57. DEFINITION OF DONE

KAEVOS V0 is implementation-complete only when:

- [ ] repository inspected;
- [ ] runtime builds;
- [ ] TypeScript checks;
- [ ] Hono app runs;
- [ ] D1 migration works;
- [ ] core domain contracts exist;
- [ ] command state machine is server-enforced;
- [ ] API endpoints exist;
- [ ] authentication boundary exists;
- [ ] permission engine exists;
- [ ] confirmation engine exists;
- [ ] connector contract exists;
- [ ] connector registry exists;
- [ ] Mock connector exists;
- [ ] Mock provider exists;
- [ ] GitHub connector works in its validated scope;
- [ ] Cloudflare connector works in its validated scope;
- [ ] LLM provider abstraction works;
- [ ] Gemini-compatible adapter works when configured;
- [ ] Duitku boundary is implemented without unsafe assumptions;
- [ ] reserved connectors remain non-active until validated;
- [ ] execution lifecycle is enforced;
- [ ] verification is persisted;
- [ ] audit events are persisted;
- [ ] idempotency works;
- [ ] concurrency protection works;
- [ ] secrets are protected;
- [ ] security tests pass;
- [ ] connector contract tests pass;
- [ ] E2E tests pass;
- [ ] CI passes;
- [ ] staging smoke test passes;
- [ ] production deployment path is documented;
- [ ] no false verification claims exist.

---

# 58. WHEN A BLOCKER EXISTS

Classify it exactly:

- `CODE_BLOCKER`
- `CONFIG_BLOCKER`
- `CREDENTIAL_BLOCKER`
- `PROVIDER_ACCESS_BLOCKER`
- `API_VALIDATION_BLOCKER`
- `SECURITY_BLOCKER`
- `TEST_BLOCKER`
- `DEPLOYMENT_BLOCKER`

For each blocker state:

1. what is blocked;
2. why;
3. evidence;
4. smallest next action;
5. whether another V0 slice can continue safely.

Do not fabricate credentials, provider access, or successful external execution.

---

# 59. FINAL IMPLEMENTATION REPORT

After making changes, report:

## Repository

- files created;
- files modified;
- migrations;
- important architecture decisions.

## Validation

- typecheck;
- lint;
- unit;
- integration;
- security;
- E2E;
- build;
- deployment smoke test.

Use actual results.

## Integrations

For each:

- status;
- capabilities;
- environment;
- credential state without secret values;
- verification state;
- blockers.

## Remaining Work

Only list genuine remaining work.

---

# 60. FINAL PRINCIPLE

Build KAEVOS as a **small, trustworthy operating loop**.

Not:

> “an AI that can do anything.”

But:

> **a human-controlled operating gateway that understands intent, proposes a plan, enforces permission, executes through explicit connectors, verifies external state, and records what actually happened.**

The system should always prefer:

`TRUTH → CONTROL → VERIFICATION → SIMPLICITY`

over:

`AUTONOMY → COMPLEXITY → ASSUMPTION`

Final rule:

> **If KAEVOS cannot prove that an action happened, it must not say that the action was verified.**

Now inspect the repository, reconcile existing implementation with Docs 34–43, implement the V0 system incrementally, run the quality gates, and report only evidence-backed results.

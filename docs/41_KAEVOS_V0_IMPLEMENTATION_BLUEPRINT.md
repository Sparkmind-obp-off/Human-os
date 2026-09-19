# KAEVOS — V0 IMPLEMENTATION BLUEPRINT

**Version:** 1.0  
**Status:** V0 IMPLEMENTATION BASELINE — IMPLEMENTATION READY  
**Brand:** KAEVOS  
**Underlying system:** Human-OS  
**Runtime:** Cloudflare Workers  
**Framework:** Hono  
**Language:** TypeScript  
**Database:** Cloudflare D1  
**Related:** Docs 34–40

---

## 1. Purpose

This document converts the KAEVOS architecture and control specifications into an executable V0 build plan.

Docs 34–40 define **what KAEVOS must be**. This document defines **what to build first, where it belongs, how it connects, how to validate it, and what must remain outside V0**.

Core implementation principle:

> **Build the smallest complete operating loop before adding more connectors, interfaces, or autonomy.**

V0 target loop:

`COMMAND → UNDERSTAND → PLAN → PERMISSION → CONFIRM → EXECUTE → VERIFY → AUDIT → REPORT`

V0 is successful when this loop works deterministically with Mock, GitHub, and Cloudflare foundations, while the architecture is ready for Duitku and later connectors.

---

## 2. V0 Product Boundary

### V0 must provide

- command intake;
- authentication boundary;
- intent/context normalization;
- deterministic planning structure;
- server-side permission evaluation;
- human confirmation for consequential actions;
- connector registry;
- connector contract;
- Mock connector;
- initial GitHub connector;
- initial Cloudflare connector;
- D1 persistence;
- execution state machine;
- verification model;
- audit trail;
- idempotency;
- concurrency protection;
- normalized errors;
- LLM provider abstraction;
- Gemini-compatible provider implementation boundary;
- health endpoint;
- automated tests;
- CI;
- staging deployment path.

### V0 must not require

- a universal autonomous agent;
- unrestricted background autonomy;
- dynamic code/plugin loading;
- multi-agent orchestration;
- mandatory LangChain/LangGraph;
- mandatory paid APIs;
- a large frontend;
- every social platform;
- unofficial TikTok/Shopee integrations;
- real financial mutation as a test mechanism;
- a complex workflow engine;
- Kubernetes/container infrastructure.

---

## 3. Implementation Strategy

Build in vertical slices rather than creating empty folders first.

Recommended sequence:

1. Repository/runtime foundation.
2. Configuration and security boundary.
3. D1 migrations/repositories.
4. Domain contracts and state machines.
5. API gateway.
6. Mock connector.
7. Permission/confirmation engine.
8. Execution/verification/audit pipeline.
9. GitHub connector.
10. Cloudflare connector.
11. LLM provider abstraction.
12. E2E command loop.
13. CI.
14. Staging deployment.
15. Controlled connector activation.

Each slice must leave the system testable.

---

## 4. Target Repository Structure

Use the following structure as the V0 implementation target:

```
src/
├── api/
│   ├── routes/
│   │   ├── commands.ts
│   │   ├── connectors.ts
│   │   ├── audit.ts
│   │   └── health.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── request-id.ts
│   │   └── error-handler.ts
│   └── schemas/
│       ├── command.ts
│       ├── connector.ts
│       └── common.ts
├── core/
│   ├── intent/
│   ├── planner/
│   ├── orchestrator/
│   ├── permissions/
│   ├── confirmation/
│   ├── verification/
│   └── errors/
├── connectors/
│   ├── connector.ts
│   ├── registry.ts
│   ├── mock/
│   ├── github/
│   ├── cloudflare/
│   ├── duitku/
│   ├── tiktok/
│   ├── shopee/
│   └── make/
├── providers/
│   └── llm/
│       ├── provider.ts
│       ├── gemini/
│       └── mock/
├── db/
│   ├── migrations/
│   ├── repositories/
│   └── client.ts
├── audit/
│   └── audit-service.ts
├── observability/
│   ├── logger.ts
│   └── telemetry.ts
├── config/
│   └── env.ts
├── types/
│   └── domain.ts
└── index.ts

tests/
├── unit/
├── contract/
├── integration/
├── security/
└── e2e/
```

Reserved connector directories may exist before implementation, but pending connectors must not be registered as ACTIVE.

---

## 5. Runtime Foundation

### Required

- Cloudflare Workers;
- Hono;
- TypeScript;
- Wrangler;
- D1;
- native Fetch APIs.

### Configuration

Use environment bindings for:

- D1 database;
- authentication configuration;
- connector credential references;
- LLM provider configuration;
- non-secret feature configuration.

Use Cloudflare Secrets for actual credentials and tokens.

Never store secret values in D1.

---

## 6. Configuration Contract

Create a single typed configuration boundary.

Conceptual:

```ts
interface Env {
  DB: D1Database;
  KAEVOS_AUTH_SECRET?: string;
  GEMINI_API_KEY?: string;
  GITHUB_TOKEN?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
}
```

The exact credential strategy may evolve toward scoped credential resolution, but connector code must not read arbitrary environment variables directly.

Instead:

`CONNECTOR → CREDENTIAL RESOLVER → APPROVED SECRET`

Configuration validation must fail safely when required production configuration is missing.

---

## 7. Domain Contract Layer

Implement shared domain types before connector-specific behavior.

Minimum types:

- Command;
- Intent;
- Plan;
- PlanStep;
- PermissionDecision;
- Confirmation;
- ExecutionRun;
- ExecutionStep;
- VerificationResult;
- AuditEvent;
- ConnectorCapability;
- ConnectorContext;
- ConnectorResult;
- ConnectorError;
- LLMRequest;
- LLMResponse.

These types should be imported by core services and adapters.

Avoid duplicating vendor-specific representations throughout the codebase.

---

## 8. State Machine Implementation

Implement command/execution states as server-owned enums and transition functions.

Example:

```ts
type CommandStatus =
  | "RECEIVED"
  | "UNDERSTANDING"
  | "PLANNING"
  | "AWAITING_CONFIRMATION"
  | "EXECUTING"
  | "VERIFYING"
  | "COMPLETED"
  | "FAILED"
  | "REQUIRES_REVIEW"
  | "CANCELLED";
```

Create one authoritative transition function.

Do not allow routes or connectors to mutate state directly.

All transitions should validate:

- current state;
- actor;
- revision;
- required confirmation;
- policy;
- execution context.

---

## 9. API Gateway Implementation

Implement Doc 35 endpoints:

- `POST /v1/commands`
- `GET /v1/commands/:id`
- `POST /v1/commands/:id/confirm`
- `POST /v1/commands/:id/cancel`
- `GET /v1/connectors`
- `GET /v1/connectors/:id`
- `POST /v1/connectors/:id/test`
- `GET /v1/health`
- `GET /v1/audit`

All routes pass through:

`REQUEST ID → AUTH → VALIDATION → CORE SERVICE → RESPONSE`

The route layer must not contain vendor API logic.

---

## 10. Command Intake

Command creation should:

1. authenticate actor;
2. validate request;
3. create command ID;
4. persist initial command;
5. record idempotency key when supplied;
6. create audit event;
7. begin understanding/planning;
8. return the normalized command state.

The initial V0 implementation may execute synchronously for simple read-only operations where safe.

Consequential work should use persisted execution state and must not depend on a long-lived HTTP request.

---

## 11. Intent and Context Engine

V0 intent handling should normalize a command into:

- objective;
- domain;
- requested capability;
- target resource;
- parameters;
- constraints;
- actor;
- risk class.

Example:

```json
{
  "objective": "read_revenue",
  "domain": "duitku",
  "capability": "finance.transactions.read",
  "target": "account:primary",
  "risk": "read_only"
}
```

LLM output may assist interpretation, but the server must validate the resulting structure.

For deterministic tests, support explicit structured commands without an LLM dependency.

---

## 12. Planner

Planner responsibilities:

- select capability;
- resolve target;
- build ordered plan steps;
- classify risk;
- identify required permissions;
- identify confirmation requirement;
- select connector by capability;
- generate a plan version/digest.

Planner must not execute actions.

Planner output is untrusted until validated by server-side rules.

---

## 13. Permission Engine

Implement:

`WHO → WHAT → WHERE → WHICH CREDENTIAL → WHICH POLICY`

Permission evaluation must return a structured decision:

```ts
interface PermissionDecision {
  allowed: boolean;
  requiresConfirmation: boolean;
  policyId: string;
  reasonCode: string;
  resourceScope?: string;
}
```

Default deny.

Consequential, financial, destructive, production, and external-message operations require the policy-defined confirmation path.

---

## 14. Confirmation Engine

Confirmation must bind to:

- command ID;
- plan ID;
- plan version;
- plan digest;
- actor;
- expiry.

Confirmation must be rejected when:

- expired;
- replayed;
- actor mismatch;
- plan changed;
- resource changed;
- capability changed;
- digest changed.

Recommended V0 confirmation expiry: 15 minutes, configurable by policy.

---

## 15. Connector Registry

Implement a static in-process registry for V0.

Conceptual:

```ts
interface Connector {
  id: string;
  name: string;
  version: string;
  capabilities(): ConnectorCapability[];
  healthCheck(context: ConnectorContext): Promise<ConnectorHealth>;
  execute(
    request: ConnectorExecutionRequest,
    context: ConnectorContext
  ): Promise<ConnectorResult>;
  verify?(
    request: ConnectorVerificationRequest,
    context: ConnectorContext
  ): Promise<VerificationResult>;
}
```

Core selects connectors by capability.

The LLM must never be the final authority on which credential or unrestricted vendor endpoint to call.

---

## 16. Mock Connector First

Build the Mock connector before real connectors.

It must support deterministic:

- success;
- validation error;
- auth error;
- rate limit;
- timeout;
- malformed response;
- provider failure;
- ambiguous mutation;
- verification success;
- verification failure.

The complete execution pipeline must pass against Mock before external connectors are activated.

---

## 17. GitHub Connector

Initial scope:

- repository read;
- file read;
- file write/create;
- issue read/write where justified;
- workflow/deployment read where justified.

Every mutation requires:

- repository scope;
- path/operation validation;
- permission;
- confirmation when policy requires;
- external reference;
- verification.

The connector must use GitHub's supported authentication/API mechanisms and normalize responses into KAEVOS contracts.

---

## 18. Cloudflare Connector

Initial scope should prioritize:

- account/resource discovery;
- deployment/status read;
- project/environment read;
- health/status checks.

Production mutations should be explicitly gated.

For deployment workflows:

`PLAN → CONFIRM → DEPLOY → CHECK EXTERNAL STATE → VERIFY`

Do not report deployment as production-healthy merely because an API accepted the request.

---

## 19. Duitku Connector Reservation

Reserve the connector boundary now, but keep production financial mutation outside the initial implementation unless the authentication, API contract, webhook/reconciliation model, and test/sandbox conditions are verified.

Initial safe target:

- read transaction/payment status;
- normalize authoritative external references;
- reconciliation support.

No live-money automated test.

---

## 20. TikTok, Shopee, Make

### TikTok/TikTok Shop

Reserved pending official API/access validation.

### Shopee

Reserved pending official API/access validation.

### Make

Optional bridge only.

Make must not become a second hidden orchestrator. KAEVOS remains the source of command intent, permission, execution state, and audit.

No unofficial scraping/endpoints as production architecture.

---

## 21. LLM Provider Layer

Implement provider abstraction:

```ts
interface LLMProvider {
  id: string;
  capabilities(): ProviderCapability[];
  generate(request: LLMRequest): Promise<LLMResponse>;
}
```

V0 should include:

- Mock provider;
- Gemini-compatible provider adapter.

Provider selection must occur through configuration/policy.

Core planner/orchestrator must not import vendor SDKs directly.

---

## 22. Orchestrator

The orchestrator coordinates:

`INTENT → CONTEXT → CAPABILITY → PERMISSION → PLAN → CONFIRMATION → EXECUTE → VERIFY → REPORT`

Responsibilities:

- load persisted state;
- validate server-owned state;
- invoke planner;
- evaluate permission;
- pause for confirmation;
- start execution atomically;
- invoke connector;
- persist result;
- invoke verification;
- update state;
- emit audit events;
- return truthful final result.

The orchestrator does not own connector-specific business logic.

---

## 23. Execution Service

Before connector invocation, validate:

- command exists;
- command revision current;
- plan exists;
- plan version/digest matches;
- actor authorized;
- capability allowed;
- resource scope allowed;
- confirmation present where required;
- connector ACTIVE;
- credential available;
- idempotency boundary valid.

Then:

1. atomically claim execution;
2. create execution step;
3. invoke connector;
4. persist normalized response;
5. classify outcome;
6. verify;
7. persist verification;
8. emit audit;
9. transition final state.

---

## 24. Verification Service

Implement verification as an explicit service, not an implicit boolean.

Priority:

1. external read-after-write;
2. provider event/webhook;
3. provider operation status/reference;
4. provider response with explicit completion semantics;
5. local acknowledgement.

Result:

```ts
type VerificationStatus =
  | "VERIFIED"
  | "NOT_VERIFIED"
  | "UNKNOWN";
```

A missing verification path must never silently produce VERIFIED.

---

## 25. Audit Service

Audit every consequential lifecycle event.

Minimum correlation:

`COMMAND_ID → EXECUTION_ID → STEP_ID → CONNECTOR → EXTERNAL_REFERENCE → VERIFICATION`

Audit payloads must be redacted before persistence/logging.

Audit is append-oriented.

---

## 26. D1 Implementation

Create migrations corresponding to Doc 36.

Required tables include:

- commands;
- execution_runs;
- execution_steps;
- connector_events;
- audit_events;
- provider_events;
- confirmations;
- idempotency_keys;
- connector_registrations;
- sessions where required.

Implement repositories rather than allowing arbitrary SQL throughout application services.

Repository layer owns persistence mechanics; core owns business rules.

---

## 27. Idempotency

Implement idempotency at the command/API boundary.

Fingerprint should incorporate the logical request identity necessary to distinguish materially different operations.

Rules:

- same key + same fingerprint → reuse existing logical result;
- same key + different fingerprint → conflict;
- ambiguous external mutation → do not assume KAEVOS idempotency equals provider idempotency.

Provider-specific idempotency should be implemented only where documented/supported.

---

## 28. Concurrency

Use D1 revision/optimistic concurrency and server-side state checks.

Critical operations:

- confirmation;
- execution start;
- cancellation;
- state transitions;
- idempotency creation.

Two concurrent workers must not create two logical executions for the same protected operation.

---

## 29. Error Handling

Normalize internal/connector errors into the taxonomy defined by Doc 35.

Never expose:

- stack traces;
- tokens;
- secret values;
- private provider payloads;
- internal infrastructure details.

Log diagnostic context separately under redaction policy.

---

## 30. Observability

Every execution should expose correlation IDs.

Track:

- command ID;
- execution ID;
- connector ID;
- provider ID;
- latency;
- retry count;
- error category;
- verification result;
- audit event.

Logging must be structured and secret-safe.

V0 does not require a paid observability platform.

---

## 31. Testing Implementation

Implement the Doc 40 suite in this order:

1. unit/state-machine;
2. API contract;
3. permission/confirmation;
4. connector contract;
5. D1 integration;
6. execution/verification;
7. security/redaction;
8. idempotency/concurrency;
9. E2E;
10. staging smoke.

The Mock connector and Mock LLM provider make most tests deterministic and free-first.

---

## 32. CI Implementation

GitHub Actions should run on pull requests and protected-branch pushes.

Minimum pipeline:

`INSTALL → TYPECHECK → LINT → TEST → BUILD`

Security-sensitive changes additionally require the security suite.

Migration tests should run against an isolated test database.

Production deployment must not occur when mandatory CI gates fail.

---

## 33. Cloudflare Deployment Path

V0 deployment sequence:

1. create/configure Worker;
2. create D1 database;
3. apply migrations;
4. configure non-secret vars;
5. configure Cloudflare Secrets;
6. deploy staging/preview;
7. run health/API smoke tests;
8. validate audit and persistence;
9. activate approved connectors;
10. controlled production release.

Production credentials must never be copied into source files or committed configuration.

---

## 34. Authentication Strategy

V0 may begin with a single trusted founder/operator identity, provided the authentication boundary is explicit and server-side.

Do not hard-code an identity into business logic.

Design the actor model so later identities can support:

- founder;
- team member;
- service identity;
- scoped automation.

Authentication answers **who**. Authorization answers **what that actor may do**.

---

## 35. Voice Compatibility

Voice is an interface over the same command API.

Architecture:

`VOICE → STT → POST /v1/commands → KAEVOS → EXECUTE/VERIFY → RESPONSE → TTS`

Do not build a separate voice orchestration system.

A text command and voice command with equivalent normalized intent must enter the same policy and execution pipeline.

---

## 36. First Vertical Slice

The first production-shaped slice should be:

### “KAEVOS, check system health.”

Flow:

`REQUEST → AUTH → COMMAND → PLAN → READ-ONLY PERMISSION → MOCK/HEALTH CONNECTOR → VERIFY → AUDIT → RESPONSE`

Then:

### “KAEVOS, create this file in GitHub.”

Flow:

`REQUEST → PLAN → PERMISSION → CONFIRM → GITHUB WRITE → VERIFY → AUDIT → RESPONSE`

Then:

### “KAEVOS, check Duitku revenue.”

Flow initially:

`REQUEST → PLAN → READ-ONLY PERMISSION → DUITKU READ → VERIFY → AUDIT → RESPONSE`

This sequence proves the operating model before expanding into commerce/social automation.

---

## 37. Implementation Gates

### Gate A — Foundation

Pass when:

- Worker boots;
- Hono routes work;
- D1 connects;
- config validation works;
- health endpoint works.

### Gate B — Core Control

Pass when:

- state machine works;
- permission engine works;
- confirmation works;
- idempotency/concurrency tests pass.

### Gate C — Execution

Pass when:

- Mock connector works;
- execution persists;
- verification persists;
- audit trail reconstructs the run.

### Gate D — Real Connectors

Pass when:

- GitHub contract/security tests pass;
- Cloudflare contract/security tests pass;
- scopes are configured;
- verification paths work.

### Gate E — Staging

Pass when:

- CI green;
- migrations validated;
- smoke tests pass;
- secrets configured;
- connector activation reviewed.

### Gate F — Controlled Production

Pass when:

- production configuration reviewed;
- only approved connectors ACTIVE;
- smoke validation passes;
- monitoring is available;
- rollback/recovery procedure is known.

---

## 38. V0 Definition of Done

- [ ] Worker/Hono/TypeScript foundation running.
- [ ] D1 migration applied.
- [ ] Typed configuration boundary implemented.
- [ ] Domain contracts implemented.
- [ ] Command lifecycle implemented server-side.
- [ ] API endpoints implemented.
- [ ] Permission engine implemented.
- [ ] Confirmation binding implemented.
- [ ] Mock connector implemented.
- [ ] GitHub connector implemented and validated.
- [ ] Cloudflare connector implemented and validated.
- [ ] Duitku read connector validated before activation.
- [ ] LLM provider abstraction implemented.
- [ ] Mock LLM provider implemented.
- [ ] Gemini-compatible adapter implemented.
- [ ] Execution service implemented.
- [ ] Verification service implemented.
- [ ] Audit service implemented.
- [ ] Idempotency/concurrency protection implemented.
- [ ] Security/redaction suite passing.
- [ ] E2E suite passing.
- [ ] CI configured.
- [ ] Staging deployed.
- [ ] Smoke tests passing.
- [ ] Production activation review completed.

---

## 39. V0 Anti-Overengineering Rules

Do not introduce additional infrastructure unless a concrete requirement exists.

Avoid by default:

- Kubernetes;
- microservice decomposition;
- Kafka;
- Temporal;
- generic workflow engines;
- multi-agent frameworks;
- vector databases;
- paid observability;
- paid LLM routing;
- dynamic plugin loading;
- custom event-sourcing infrastructure.

Cloudflare Workers + Hono + D1 + explicit TypeScript contracts are sufficient for the first complete operating loop.

---

## 40. Recommended Build Order

The actual implementation order is:

```
01 Foundation
02 Config + Secrets
03 D1 + Repositories
04 Domain Contracts
05 State Machine
06 API Gateway
07 Mock Connector
08 Permissions
09 Confirmation
10 Execution
11 Verification
12 Audit
13 Idempotency + Concurrency
14 Mock E2E
15 GitHub Connector
16 Cloudflare Connector
17 LLM Provider Layer
18 Realistic E2E
19 CI
20 Staging
21 Controlled Activation
```

Do not reverse this order by starting with UI polish or broad integrations.

---

## 41. Final Implementation Principle

> **KAEVOS V0 should be built as one small, verifiable operating loop—not as a collection of impressive disconnected features.**

The implementation target is:

`ONE COMMAND SURFACE → MANY CONTROLLED SYSTEMS → VERIFIED ACTION → AUDITABLE RESULT`

KAEVOS should earn broader autonomy through tested capability and explicit permission—not through increasingly complex agent behavior.

**Next artifact:** `docs/42_KAEVOS_CLOUDFLARE_DEPLOYMENT_AND_ENVIRONMENT_MODEL.md`

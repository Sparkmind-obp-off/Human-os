# KAEVOS — CONNECTOR FABRIC SPECIFICATION

**Version:** 1.0  
**Status:** CONNECTOR ARCHITECTURE BASELINE — IMPLEMENTATION READY  
**Brand:** KAEVOS  
**Underlying system:** Human-OS  
**Runtime:** Cloudflare Workers  
**Language:** TypeScript  
**Framework:** Hono  
**Database:** Cloudflare D1  
**Related contracts:** `34_KAEVOS_OPERATING_ARCHITECTURE.md`, `35_KAEVOS_API_CONTRACT_SPECIFICATION.md`, `36_KAEVOS_DATA_MODEL_AND_D1_SCHEMA.md`

---

## 1. Purpose

The Connector Fabric is the controlled capability layer between the KAEVOS core and external systems.

Its job is to make vendor integrations replaceable, permission-aware, observable, testable, and verifiable.

Core principle:

> **KAEVOS core asks for capabilities. Connectors know how to reach systems.**

The core must not scatter vendor-specific HTTP calls throughout intent, planner, or orchestration code.

---

## 2. Architectural Position

The execution path is:

```
Human
  ↓
KAEVOS Gateway
  ↓
Intent + Context
  ↓
Planner
  ↓
Permission Policy
  ↓
Connector Fabric
  ↓
Connector
  ↓
External System
  ↓
Normalized Result
  ↓
Verification
  ↓
Audit + Report
```

The Connector Fabric is therefore a boundary, not merely a folder containing API clients.

---

## 3. Goals

The fabric must provide:

1. explicit connector contracts;
2. capability discovery;
3. health checks;
4. safe authentication boundaries;
5. normalized execution results;
6. normalized errors;
7. idempotency support;
8. timeout and retry controls;
9. verification hooks;
10. audit/observability events;
11. connector isolation;
12. mockability;
13. versioning;
14. clear lifecycle states;
15. graceful degradation.

---

## 4. Non-Goals for V0

Do not build:

- a generic workflow engine;
- arbitrary user-defined plugins;
- arbitrary code execution from connector payloads;
- unofficial scraping adapters;
- a universal credential vault;
- distributed connector orchestration outside KAEVOS;
- a marketplace for third-party connectors;
- automatic installation of untrusted connector code.

V0 needs a small, controlled connector set.

---

# 5. Connector Contract

A connector should expose a stable application-level contract.

Recommended TypeScript shape:

```ts
export interface Connector {
  readonly id: string;
  readonly name: string;
  readonly version: string;

  capabilities(): Promise<ConnectorCapability[]>;

  healthCheck(context: ConnectorContext): Promise<HealthCheckResult>;

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

The exact implementation may evolve, but the architectural boundary must remain stable.

---

# 6. Capability Model

A connector is not selected because its vendor name appears in the user's command.

It is selected because it exposes a capability.

Recommended naming:

```
<domain>.<resource>.<operation>
```

Examples:

```
github.repository.read
github.file.read
github.file.write
github.issue.create

cloudflare.deployment.read
cloudflare.deployment.list

duitku.transactions.read
duitku.transaction.read

kaevax.revenue.read

tiktok.analytics.read
tiktok.content.publish

shopee.orders.read
```

### Capability requirements

Every capability should declare:

- stable ID;
- connector ID;
- version;
- operation;
- risk class;
- read/write nature;
- required permission;
- idempotency characteristics;
- verification support;
- input schema;
- output schema;
- timeout policy;
- retry policy.

---

# 7. Capability Type

Recommended domain type:

```ts
export type RiskClass =
  | "read_only"
  | "low_risk"
  | "consequential"
  | "destructive"
  | "financial";

export interface ConnectorCapability {
  id: string;
  connectorId: string;
  version: string;
  operation: string;
  riskClass: RiskClass;
  mutating: boolean;
  requiresConfirmation: boolean;
  supportsIdempotency: boolean;
  supportsVerification: boolean;
  inputSchema: string;
  outputSchema: string;
  timeoutMs: number;
  retryPolicy: RetryPolicy;
}
```

A capability declaration is metadata, not permission by itself.

The server-side permission layer remains authoritative.

---

# 8. Connector Context

Connectors must receive only the context required for the operation.

Recommended:

```ts
export interface ConnectorContext {
  commandId: string;
  runId: string;
  stepId: string;
  actorId: string;
  requestId: string;
  signal?: AbortSignal;
  credentialRef?: string;
}
```

Do not pass the entire application context into every connector.

Principle:

> **Least context, least privilege.**

---

# 9. Credential Boundary

Connector code may resolve an opaque credential reference through an approved secret mechanism.

Example:

```
connector_registration.credential_ref
              ↓
secret resolver
              ↓
Cloudflare secret/environment binding
              ↓
connector
```

D1 stores only the reference.

### Never store in:

- D1;
- audit events;
- connector events;
- provider events;
- command results;
- GitHub source code;
- client responses.

Forbidden examples:

```
Authorization: Bearer ...
DUITKU_API_KEY=...
CLIENT_SECRET=...
WEBHOOK_SECRET=...
PRIVATE_KEY=...
```

---

# 10. Connector Lifecycle

Recommended lifecycle:

```
PENDING_CONFIGURATION
        ↓
ACTIVE
        ↓
DEGRADED
        ↓
UNAVAILABLE
        ↓
DISABLED
```

Recovery:

```
UNAVAILABLE → ACTIVE
DEGRADED → ACTIVE
```

A connector must not be considered usable solely because it exists in source code.

Usability depends on:

- registration;
- configuration;
- credential availability;
- capability availability;
- health state;
- permission policy.

---

# 11. Connector Registry

KAEVOS should maintain a registry that resolves:

```
capability ID
      ↓
connector ID
      ↓
connector implementation
      ↓
configuration/credential reference
```

Recommended interface:

```ts
export interface ConnectorRegistry {
  register(connector: Connector): void;
  get(connectorId: string): Connector | undefined;
  findByCapability(capabilityId: string): Connector[];
  list(): Connector[];
}
```

V0 can use in-process registration at Worker startup.

Do not build dynamic runtime code loading.

---

# 12. Execution Contract

Connector execution must be explicit.

Recommended request:

```ts
export interface ConnectorExecutionRequest {
  capability: string;
  operation: string;
  input: Record<string, unknown>;
  idempotencyKey?: string;
  timeoutMs?: number;
}
```

Recommended result:

```ts
export interface ConnectorExecutionResult {
  status: "success" | "partial" | "failed";
  externalReference?: string;
  data: Record<string, unknown>;
  verificationHint?: VerificationHint;
  metadata?: {
    httpStatus?: number;
    latencyMs?: number;
    providerRequestId?: string;
  };
}
```

The result must be normalized before returning to the orchestrator.

---

# 13. Result Normalization

Vendor-specific response structures must stop at the connector boundary.

Bad:

```ts
orchestrator.result.duitku.data.payment.response.foo.bar
```

Good:

```ts
orchestrator.result = {
  status: "success",
  data: {
    transactionCount: 12,
    totalAmount: 4500000
  }
}
```

The core should understand normalized domain results, not vendor payload shapes.

---

# 14. Error Contract

All connector failures must normalize into a stable taxonomy.

Recommended:

```ts
export type ConnectorErrorCode =
  | "AUTHENTICATION_FAILED"
  | "AUTHORIZATION_FAILED"
  | "INVALID_REQUEST"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "UPSTREAM_ERROR"
  | "MALFORMED_RESPONSE"
  | "UNAVAILABLE"
  | "VERIFICATION_FAILED"
  | "IDEMPOTENCY_CONFLICT"
  | "NOT_SUPPORTED"
  | "CONFIGURATION_ERROR";
```

Recommended normalized error:

```ts
export interface ConnectorError {
  code: ConnectorErrorCode;
  message: string;
  retryable: boolean;
  safeToExpose: boolean;
  externalReference?: string;
}
```

Never expose raw upstream error bodies when they may contain credentials, personal data, internal details, or implementation-specific secrets.

---

# 15. Timeout Policy

Every connector operation must have a bounded timeout.

Default example:

```
read operation:       10s
write operation:      15s
verification read:    10s
health check:          5s
```

These are initial engineering defaults and must be tuned against actual provider behavior.

A connector must honor `AbortSignal` when available.

Never allow an external request to hang indefinitely.

---

# 16. Retry Policy

Retries are allowed only when the operation is known to be safe.

Generally retryable:

- transient network failures;
- timeout before a response;
- 5xx upstream errors;
- rate limiting when a valid backoff is available.

Potentially unsafe:

- payment creation;
- order creation;
- content publication;
- external message sending;
- any non-idempotent mutation.

For side effects:

> **No automatic retry unless idempotency or an equivalent external safety guarantee exists.**

Backoff should be bounded and jittered.

Do not create unbounded retry loops.

---

# 17. Idempotency

There are two related layers:

### KAEVOS command idempotency

Handled by the `idempotency_keys` table.

### External operation idempotency

Passed to connectors when supported:

```
command
  ↓
run
  ↓
step
  ↓
external idempotency key
  ↓
connector
```

A connector must document whether the external system actually honors that key.

A locally generated key does not magically make an external operation idempotent.

---

# 18. Verification Contract

Verification is a first-class connector concern.

Recommended:

```ts
export interface VerificationHint {
  strategy: "read_after_write" | "external_reference" | "webhook" | "response_status" | "none";
  reference?: string;
}

export interface ConnectorVerificationRequest {
  capability: string;
  operation: string;
  externalReference?: string;
  expectedState?: Record<string, unknown>;
}

export interface VerificationResult {
  status:
    | "verified"
    | "partially_verified"
    | "unverified"
    | "verification_failed";
  evidence?: Record<string, unknown>;
  checkedAt: string;
}
```

Verification evidence must be normalized and bounded.

---

# 19. Health Check Contract

Health checks should answer:

- is the connector configured?
- can authentication be resolved?
- can the upstream be reached?
- is the expected capability available?

Example:

```ts
export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unavailable";
  latencyMs?: number;
  capabilities?: string[];
  checkedAt: string;
  reason?: string;
}
```

Health checks must not leak credentials.

A health check failure should not automatically imply that all historical executions failed.

---

# 20. Permission Integration

Connector capabilities provide metadata.

The permission engine makes the authorization decision.

Flow:

```
Capability
   ↓
Risk classification
   ↓
Actor authorization
   ↓
Resource scope
   ↓
Credential scope
   ↓
Confirmation requirement
   ↓
ALLOW / DENY / CONFIRM
```

Examples:

### Read

```
duitku.transactions.read
→ read_only
→ authorized
→ execute
```

### Financial mutation

```
payment.create
→ financial
→ explicit permission
→ confirmation
→ execute
→ verify
```

### Publication

```
tiktok.content.publish
→ consequential
→ confirmation
→ execute
→ verify
```

The connector must never decide that an action is allowed merely because it can technically perform it.

---

# 21. Connector Isolation

A connector should not directly access:

- another connector's secrets;
- another connector's internal implementation;
- arbitrary D1 tables;
- arbitrary filesystem resources;
- arbitrary network destinations beyond its required upstreams.

The orchestrator coordinates connectors.

Connectors do not call each other directly in V0.

If a workflow requires multiple systems:

```
Orchestrator
   ├── Connector A
   ├── Connector B
   └── Verification
```

not:

```
Connector A → Connector B
```

---

# 22. Observability

Every connector invocation should emit structured operational telemetry.

Minimum fields:

```
command_id
run_id
step_id
connector_id
capability
operation
status
latency_ms
external_reference
verification_status
error_code
occurred_at
```

Persist sanitized operational metadata through the data model defined in Doc 36.

Never persist:

- authorization headers;
- tokens;
- cookies;
- private keys;
- full sensitive payloads.

---

# 23. Audit Integration

Connector activity must map into the audit trail.

Example:

```
COMMAND_RECEIVED
      ↓
PLAN_CREATED
      ↓
PERMISSION_EVALUATED
      ↓
CONFIRMATION_ACCEPTED
      ↓
EXECUTION_STARTED
      ↓
CONNECTOR_INVOKED
      ↓
CONNECTOR_RESULT
      ↓
VERIFICATION_COMPLETED
      ↓
COMMAND_COMPLETED
```

The connector does not own the complete audit lifecycle.

The orchestration layer remains responsible for command-level state.

---

# 24. Mock Connector

A deterministic mock connector is mandatory for V0.

Recommended capabilities:

```
mock.echo
mock.read
mock.write
mock.fail
mock.timeout
mock.verify
```

It must support deterministic scenarios for:

- successful reads;
- successful writes;
- timeouts;
- malformed responses;
- authentication failures;
- rate limits;
- verification failures;
- idempotency conflicts.

The mock connector enables core testing without paid external APIs.

---

# 25. GitHub Connector

Initial capabilities:

```
github.repository.read
github.file.read
github.file.write
github.issue.create
github.workflow.read
```

Potential later capabilities:

```
github.pull_request.create
github.pull_request.read
github.workflow.rerun
```

### Security

Use least-privilege GitHub credentials.

The connector must:

- validate repository/path scope;
- avoid arbitrary repository access unless authorized;
- normalize GitHub responses;
- never expose tokens;
- verify write results where possible;
- record commit SHA / issue number as external references.

### Example

User:

> “KAEVOS, buatkan dokumen baru di GitHub.”

Flow:

```
Intent
→ github.file.write
→ permission
→ confirmation if required
→ execute
→ obtain commit SHA
→ verify file/commit
→ report
```

---

# 26. Cloudflare Connector

Initial capabilities:

```
cloudflare.deployment.read
cloudflare.deployment.list
cloudflare.project.read
```

Later, only after permission and verification design:

```
cloudflare.deployment.create
cloudflare.environment.update
```

The connector must treat deployment/configuration changes as consequential.

For production mutations:

```
PLAN
→ CONFIRM
→ EXECUTE
→ VERIFY
```

A successful API response alone is not automatically equivalent to verified production state.

---

# 27. Duitku Connector Boundary

Initial V0 target:

```
duitku.transactions.read
duitku.transaction.read
```

Potential later capabilities:

```
duitku.payment.create
duitku.payment.status
duitku.refund.create
```

### Financial safety

Financial mutations are high-consequence operations.

Required pattern:

```
Intent
→ Context
→ Permission
→ Exact Plan
→ Explicit Confirmation
→ Execute
→ Verify
→ Audit
```

KAEVOS does not hold funds.

Duitku remains authoritative for payment transaction state.

KAEVOS may normalize:

```
transaction_count
gross_amount
successful_amount
failed_amount
period
observed_at
external_references
```

without becoming the accounting system of record.

---

# 28. KAEVAX Connector Boundary

KAEVAX is a domain layer, not merely another arbitrary external SaaS.

Recommended initial capabilities:

```
kaevax.revenue.read
kaevax.offer.read
kaevax.product.read
```

Potential later:

```
kaevax.offer.create
kaevax.product.update
kaevax.order.read
```

KAEVAX-specific business logic belongs in the KAEVAX domain layer.

KAEVOS provides orchestration and access.

---

# 29. TikTok / TikTok Shop Boundary

Reserve connector IDs:

```
tiktok
```

Potential capabilities:

```
tiktok.analytics.read
tiktok.content.read
tiktok.content.publish
```

Implementation must use supported official APIs and permitted authentication flows.

Do not build V0 around unofficial private endpoints, browser automation intended to bypass platform controls, or scraped internal APIs.

Before implementation verify:

- official API availability;
- product-specific access;
- scopes;
- rate limits;
- regional availability;
- terms;
- app review requirements.

Until verified, mark the connector:

```
PENDING_CONFIGURATION
```

or

```
NOT_SUPPORTED
```

rather than pretending it is implemented.

---

# 30. Shopee Boundary

Reserve:

```
shopee
```

Potential capabilities:

```
shopee.orders.read
shopee.products.read
shopee.products.update
shopee.analytics.read
```

Implementation must depend on currently supported official partner/API access.

Do not treat unofficial endpoints or browser scraping as equivalent to an official connector.

The connector must remain explicitly marked pending until access, scopes, authentication, and terms are validated.

---

# 31. Make Bridge

Make is an optional bridge, not the core execution architecture.

Reserved connector:

```
make
```

Potential capability:

```
make.scenario.trigger
```

Use cases:

- temporary integration gap;
- non-critical external workflow;
- rapid experimentation;
- systems without a direct V0 connector.

Do not allow Make to silently become an opaque second orchestrator.

KAEVOS should know:

```
what scenario was invoked
why it was invoked
which input was sent
what execution reference returned
whether verification exists
```

---

# 32. Connector Selection

Connector selection should use capability matching, not free-form LLM choice.

Recommended process:

```
Intent
  ↓
Required capability
  ↓
Registry lookup
  ↓
Available connectors
  ↓
Permission evaluation
  ↓
Health/configuration check
  ↓
Select deterministic connector
```

If multiple connectors satisfy the same capability, selection should use an explicit policy such as:

1. configured preferred connector;
2. healthy connector;
3. compatible capability version;
4. deterministic fallback.

Do not let an LLM silently choose between credentialed systems.

---

# 33. Connector Versioning

Use semantic versions for connector contracts:

```
major.minor.patch
```

Breaking changes increment major version.

A capability should also have a stable version when input/output semantics change.

Example:

```
github.file.write@1
github.file.write@2
```

The planner must bind an execution plan to the capability contract version used.

---

# 34. Capability Input Validation

Every connector validates input again at its own boundary.

Reason:

- planner output is not trusted blindly;
- LLM-generated structures may be malformed;
- external data may influence plans;
- API callers may bypass the UI.

Validation layers:

```
API schema
→ intent schema
→ plan schema
→ permission/resource validation
→ connector input schema
→ external API
```

No layer should assume the previous layer was perfect.

---

# 35. External Response Validation

Connector responses are untrusted input.

Before normalization:

1. validate expected response shape;
2. enforce size limits;
3. reject malformed required fields;
4. normalize types;
5. strip unnecessary payload;
6. sanitize strings used in logs;
7. produce a controlled error when invalid.

Never allow an external response to become executable instructions.

---

# 36. Rate Limiting

Rate limiting exists at multiple boundaries:

- KAEVOS API;
- connector invocation;
- external provider;
- external platform.

A connector should expose normalized `RATE_LIMITED` errors.

If an upstream supplies a retry-after value, validate it before using it.

Do not blindly sleep for arbitrary attacker-controlled durations.

---

# 37. Circuit-Break Behavior

V0 does not require a sophisticated distributed circuit breaker.

A lightweight connector health state is sufficient.

If repeated failures occur:

```
ACTIVE
→ DEGRADED
→ UNAVAILABLE
```

The orchestrator should fail fast when the connector is known to be unavailable rather than repeatedly invoking it.

Recovery occurs after a controlled health check.

---

# 38. Verification Patterns by Operation

| Operation type | Preferred verification |
|---|---|
| read | response/schema validation |
| file write | read-after-write or commit reference |
| issue create | issue ID + read confirmation |
| deployment read | current deployment state |
| deployment mutation | deployment ID + state check |
| payment read | provider transaction data |
| payment creation | provider status + external reference |
| publication | platform object/status check |
| analytics read | response validation + observed_at |
| Make trigger | scenario execution reference + downstream check when possible |

No verification strategy means:

```
verification_status = unverified
```

not verified success.

---

# 39. Connector Test Contract

Every connector should have tests for:

### Contract

- capability discovery;
- schema validation;
- lifecycle;
- health response.

### Execution

- success;
- invalid input;
- authentication failure;
- authorization failure;
- timeout;
- rate limit;
- upstream 5xx;
- malformed response.

### Safety

- no secret leakage;
- retry behavior;
- idempotency behavior;
- permission interaction;
- verification behavior;
- audit event generation.

### Isolation

- cannot access another connector's credentials;
- cannot bypass permission policy;
- cannot mutate arbitrary D1 data.

---

# 40. Connector Factory

Recommended application structure:

```
src/connectors/
├── connector.ts
├── registry.ts
├── errors.ts
├── types.ts
├── mock/
│   └── index.ts
├── github/
│   └── index.ts
├── cloudflare/
│   └── index.ts
├── duitku/
│   └── index.ts
├── tiktok/
│   └── index.ts
├── shopee/
│   └── index.ts
└── make/
    └── index.ts
```

Only implemented connectors should be registered as executable.

Pending connectors may have contract placeholders/tests but must not appear as healthy production capabilities.

---

# 41. Connector Execution Boundary

Recommended orchestrator sequence:

```
const connector = registry.resolve(capability);

validateCapability(capability);
validatePermission(actor, capability, resource);
validateInput(request.input);

const execution = await connector.execute(request, context);

recordConnectorEvent(execution);
normalizeResult(execution);

if (requiresVerification(execution)) {
  await verify(execution);
}
```

The exact implementation can differ, but the boundary must remain explicit.

---

# 42. Failure Handling

Connector failures map to KAEVOS outcomes.

### Retryable transient failure

```
connector error
→ bounded retry if safe
→ otherwise FAILED / REQUIRES_REVIEW
```

### Authentication failure

```
AUTHENTICATION_FAILED
→ stop
→ connector degraded/unavailable as appropriate
→ no blind retry
```

### Permission failure

```
AUTHORIZATION_FAILED
→ stop
→ no retry
```

### Verification failure

```
VERIFICATION_FAILED
→ REQUIRES_REVIEW
```

### Unknown outcome after side effect

If an external mutation may have succeeded but KAEVOS cannot determine the outcome:

```
REQUIRES_REVIEW
```

Do not automatically repeat the side effect.

---

# 43. Security Invariants

1. Connector code never receives unnecessary secrets.
2. Secrets are resolved only at execution boundary.
3. Secrets never enter D1.
4. Secrets never enter audit logs.
5. Capability does not equal authorization.
6. External responses are untrusted.
7. Connector input is validated independently.
8. Consequential actions require explicit policy.
9. Non-idempotent side effects are not blindly retried.
10. Unknown side-effect outcome becomes reviewable state.
11. Connectors cannot invoke other connectors directly.
12. Connectors cannot bypass the orchestrator.
13. Pending integrations are not represented as active production capabilities.
14. Unofficial platform endpoints are not treated as official integrations.
15. Verification claims require evidence.

---

# 44. V0 Connector Set

### Implement now

| Connector | Initial capability |
|---|---|
| Mock | deterministic test capabilities |
| GitHub | repository/file/issue/workflow read/write subset |
| Cloudflare | project/deployment read subset |

### Implement after V0 core

| Connector | Initial capability |
|---|---|
| Duitku | transaction read |
| KAEVAX | revenue/domain read |

### Reserve / validate first

| Connector | Status |
|---|---|
| TikTok | pending official API/access validation |
| Shopee | pending official API/access validation |
| Make | optional bridge |

The exact external capability list must be validated against current provider APIs before implementation.

---

# 45. Example: “KAEVOS, cek revenue KAEVAX hari ini.”

Flow:

```
User command
   ↓
Intent: REVENUE_READ
   ↓
Required capability: kaevax.revenue.read
   ↓
Registry
   ↓
Permission: read_only
   ↓
Connector health
   ↓
KAEVAX connector
   ↓
Normalized revenue result
   ↓
Observed timestamp
   ↓
Verification: source response validated
   ↓
Audit event
   ↓
Human report
```

The report should distinguish:

- requested period;
- source;
- observed time;
- amount/count;
- verification status;
- any freshness limitation.

---

# 46. Example: “KAEVOS, buatkan dokumen baru di GitHub.”

Flow:

```
Intent
→ github.file.write
→ resource/path validation
→ risk evaluation
→ confirmation if policy requires
→ GitHub connector
→ commit reference
→ read-after-write verification
→ audit
→ report
```

The final response should say what was actually verified, not merely that the API request returned successfully.

---

# 47. Example: “KAEVOS, deploy production.”

This is consequential.

Required:

```
Intent
→ deployment plan
→ target/environment validation
→ permission evaluation
→ explicit confirmation
→ Cloudflare connector
→ deployment reference
→ deployment-state verification
→ audit
→ report
```

If verification cannot establish production state:

```
REQUIRES_REVIEW
```

---

# 48. Implementation Checklist

### Contract

- [ ] Connector interface
- [ ] Capability type
- [ ] Execution request/result
- [ ] Verification contract
- [ ] Health contract
- [ ] Error taxonomy

### Registry

- [ ] Static V0 registry
- [ ] Capability lookup
- [ ] deterministic resolution
- [ ] lifecycle state

### Security

- [ ] secret resolver
- [ ] credential references only
- [ ] least privilege
- [ ] connector isolation
- [ ] input validation
- [ ] response validation

### Reliability

- [ ] bounded timeout
- [ ] safe retry policy
- [ ] idempotency support
- [ ] unknown-outcome handling
- [ ] health state

### Observability

- [ ] connector events
- [ ] audit integration
- [ ] latency tracking
- [ ] normalized error tracking
- [ ] verification result tracking

### Connectors

- [ ] Mock
- [ ] GitHub
- [ ] Cloudflare
- [ ] Duitku boundary
- [ ] KAEVAX boundary
- [ ] TikTok pending boundary
- [ ] Shopee pending boundary
- [ ] Make optional boundary

### Tests

- [ ] contract tests
- [ ] integration tests
- [ ] failure tests
- [ ] security tests
- [ ] idempotency tests
- [ ] verification tests
- [ ] isolation tests

---

# 49. Definition of Done

The Connector Fabric is implementation-ready when:

- [x] stable connector contract defined;
- [x] capability model defined;
- [x] registry model defined;
- [x] lifecycle defined;
- [x] secret boundary defined;
- [x] execution contract defined;
- [x] normalized result/error contracts defined;
- [x] timeout/retry rules defined;
- [x] idempotency boundary defined;
- [x] verification hooks defined;
- [x] audit/observability boundary defined;
- [x] mock connector requirements defined;
- [x] GitHub boundary defined;
- [x] Cloudflare boundary defined;
- [x] Duitku boundary defined;
- [x] KAEVAX boundary defined;
- [x] TikTok/Shopee/Make boundaries defined;
- [x] security invariants defined;
- [ ] connector implementations completed;
- [ ] contract tests passing;
- [ ] production credentials configured through approved secret mechanisms;
- [ ] real-provider verification tested where applicable.

---

# 50. Architectural Invariants

1. **Core talks to capabilities, not vendor APIs.**
2. **Connectors own integration mechanics, not business-wide orchestration.**
3. **The orchestrator owns cross-connector sequencing.**
4. **Permission is decided outside the connector.**
5. **Secrets stay outside D1 and source control.**
6. **External responses are untrusted.**
7. **Every connector operation is observable.**
8. **Important side effects are idempotent or explicitly protected against duplicate execution.**
9. **Verification is separate from execution success.**
10. **Unknown side-effect outcomes require review.**
11. **Pending integrations are not fake production capabilities.**
12. **Official API support is required for production platform integrations.**
13. **V0 uses a static registry; dynamic plugin loading is deferred.**
14. **KAEVOS remains the single operating gateway.**
15. **KAEVAX remains the commercial/transactional domain layer.**

---

## Final Connector Principle

> **The Connector Fabric is KAEVOS's controlled bridge to the outside world: capability-first, least-privilege, observable, idempotent where possible, and verified wherever correctness matters.**

**Next artifact:**

```
docs/38_KAEVOS_SECURITY_SECRETS_AND_PERMISSION_MODEL.md
```

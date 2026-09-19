# KAEVOS — EXTERNAL PROVIDER AND CONNECTOR ACTIVATION MATRIX

**Version:** 1.0  
**Status:** EXTERNAL INTEGRATION BASELINE — IMPLEMENTATION READY  
**Brand:** KAEVOS  
**Underlying system:** Human-OS  
**Runtime:** Cloudflare Workers  
**Framework:** Hono  
**Language:** TypeScript  
**Database:** Cloudflare D1  
**Related:** Docs 34–42

---

## 1. Purpose

This document defines the external-provider and connector activation model for KAEVOS V0.

It answers:

- which external systems KAEVOS connects to;
- what each integration is allowed to do;
- which provider is used for which responsibility;
- what credentials are required;
- what risk class applies;
- how actions are verified;
- which integrations are active, reserved, or blocked;
- what evidence is required before activation.

Core principle:

> **KAEVOS selects integrations by capability, permission, scope, and verification—not by vendor popularity or LLM preference.**

---

## 2. Architectural Rule

KAEVOS remains the single operating gateway.

`HUMAN → KAEVOS → POLICY → CONNECTOR/PROVIDER → EXTERNAL SYSTEM → VERIFY → REPORT`

External systems remain authoritative for their own domain data.

Examples:

- GitHub is authoritative for repository/file state.
- Cloudflare is authoritative for deployment/resource state.
- Duitku is authoritative for payment transaction state.
- TikTok/Shopee remain authoritative for their supported commerce/platform data.
- LLM providers are reasoning services, not business-system authorities.

---

## 3. Provider vs Connector

These concepts must remain separate.

### Provider

Supplies a general capability to KAEVOS.

Primary example:

`LLMProvider`

### Connector

Provides controlled access to a specific external system/domain.

Examples:

- GitHub Connector;
- Cloudflare Connector;
- Duitku Connector;
- TikTok Connector;
- Shopee Connector;
- Make Bridge Connector.

An LLM provider must not directly become a generic external-system connector.

---

## 4. V0 Integration Matrix

| Integration | Type | V0 Role | Initial Status | Risk |
|---|---|---|---|---|
| Mock LLM | Provider | deterministic testing | ACTIVE_TEST | none |
| Gemini | LLM Provider | intent/planning assistance | V0_ACTIVE_CANDIDATE | provider-dependent |
| GitHub | Connector | repo/file/project operations | V0_ACTIVE_CANDIDATE | read + consequential write |
| Cloudflare | Connector | infrastructure/deployment operations | V0_ACTIVE_CANDIDATE | read + consequential mutation |
| Duitku | Connector | transaction/revenue visibility | V0_READ_CANDIDATE | financial |
| TikTok/TikTok Shop | Connector | commerce/social operations | RESERVED | platform-dependent |
| Shopee | Connector | commerce operations | RESERVED | platform-dependent |
| Make | Bridge Connector | optional workflow bridge | RESERVED | delegated |

Status is an implementation lifecycle state, not a quality ranking.

---

## 5. Activation States

Use:

- `RESERVED`
- `PENDING_RESEARCH`
- `PENDING_CONFIGURATION`
- `TESTING`
- `ACTIVE`
- `DEGRADED`
- `UNAVAILABLE`
- `DISABLED`

A connector being present in source code does not mean it is ACTIVE.

---

## 6. Activation Gate

Every external integration must pass:

`DOCUMENT → CREDENTIAL → SCOPE → CONTRACT TEST → SECURITY TEST → EXECUTION TEST → VERIFICATION TEST → AUDIT TEST → STAGING → CONTROLLED ACTIVATION`

For consequential or financial integrations, add explicit human review.

---

## 7. Capability Naming

Capabilities follow:

`<domain>.<resource>.<operation>`

Examples:

- `system.health.read`
- `github.repository.read`
- `github.file.read`
- `github.file.write`
- `cloudflare.project.read`
- `cloudflare.deployment.read`
- `cloudflare.deployment.write`
- `finance.transactions.read`
- `finance.transaction.write`
- `tiktok.content.read`
- `tiktok.content.publish`
- `shopee.orders.read`

Capability names must describe what KAEVOS can do, not which LLM selected the action.

---

## 8. Risk Classification

Use the risk model from Doc 37:

| Risk | Meaning | Default behavior |
|---|---|---|
| READ_ONLY | no external side effect | may auto-run under policy |
| LOW_RISK | reversible/minor side effect | policy-based confirmation |
| CONSEQUENTIAL | meaningful external side effect | explicit confirmation by default |
| DESTRUCTIVE | deletion/irreversible change | explicit confirmation |
| FINANCIAL | money/payment state mutation | explicit confirmation + strong verification |

Risk is attached to the capability, not inferred only from natural-language tone.

---

## 9. LLM Provider Matrix

| Provider | Responsibility | Default V0 | Secrets | Fallback |
|---|---|---|---|---|
| Mock | deterministic tests | Yes | none | n/a |
| Gemini-compatible adapter | intent/planning assistance | Yes, if configured | API key | Mock/test path |
| OpenAI-compatible future adapter | optional provider | No | provider key | policy/config |
| xAI/Grok future adapter | optional provider | No | provider key | policy/config |
| OpenRouter future adapter | optional routing | No | provider key | policy/config |

V0 must not couple core orchestration to any one LLM vendor.

Provider availability can change. Production activation requires current credential/API/terms validation at implementation time.

---

## 10. LLM Security Boundary

LLM providers may:

- interpret natural language;
- propose structured intent;
- propose plans;
- summarize results;
- help generate user-facing explanations.

LLMs may not independently:

- grant permission;
- choose unrestricted credentials;
- bypass confirmation;
- mutate server-owned state;
- mark an operation VERIFIED without evidence;
- execute arbitrary external calls outside connector contracts.

Server-side policy remains authoritative.

---

## 11. GitHub Connector Matrix

### Initial capabilities

| Capability | Risk | V0 |
|---|---|---|
| repository.read | READ_ONLY | Yes |
| file.read | READ_ONLY | Yes |
| file.write | CONSEQUENTIAL | Yes |
| issue.read | READ_ONLY | Optional |
| issue.write | CONSEQUENTIAL | Optional |
| workflow.read | READ_ONLY | Optional |
| workflow.dispatch | CONSEQUENTIAL | Later |

### Credential

Use a scoped GitHub credential with minimum repository permissions.

### Verification

For writes, verify the external repository/file/commit state where feasible.

### Activation gate

- credential configured;
- repository scope validated;
- contract tests pass;
- security tests pass;
- confirmation tests pass;
- verification path pass;
- audit mapping pass.

---

## 12. Cloudflare Connector Matrix

### Initial capabilities

| Capability | Risk | V0 |
|---|---|---|
| account/resource.read | READ_ONLY | Yes |
| project.read | READ_ONLY | Yes |
| deployment.read | READ_ONLY | Yes |
| deployment.write | CONSEQUENTIAL | Controlled |
| production.config.write | CONSEQUENTIAL | Later/controlled |
| resource.delete | DESTRUCTIVE | Disabled by default |

### Credential

Use least-privilege Cloudflare API credentials.

### Verification

Deployment mutations require external-state verification.

Preferred:

`DEPLOY → DEPLOYMENT STATUS → HEALTH CHECK → VERIFIED`

---

## 13. Duitku Connector Matrix

Duitku is treated as a financial external authority.

### Initial capabilities

| Capability | Risk | V0 |
|---|---|---|
| transactions.read | READ_ONLY | Yes |
| transaction.status.read | READ_ONLY | Yes |
| transaction.reconcile | LOW_RISK / FINANCIAL-DOMAIN | Controlled |
| transaction.write | FINANCIAL | Disabled until validated |
| refund/mutation operations | FINANCIAL | Reserved |

### Required activation evidence

Before production financial mutation:

- current provider API contract;
- authentication method;
- credential scope;
- webhook/security model;
- provider idempotency semantics;
- reconciliation design;
- verification strategy;
- sandbox/test capability where available;
- audit mapping.

No live-money automated test.

### Revenue query

Target command:

> “KAEVOS, cek Duitku.”

Expected flow:

`COMMAND → PLAN → READ PERMISSION → DUITKU → VERIFY → REPORT`

---

## 14. TikTok/TikTok Shop Matrix

Status: `RESERVED`

Potential capabilities:

- content.read;
- content.publish;
- analytics.read;
- product.read;
- order.read;
- commerce operations where officially supported.

Before activation verify:

- official API availability;
- applicable product/program access;
- OAuth/authentication requirements;
- scopes;
- rate limits;
- regional availability;
- terms;
- webhook/event support;
- verification capability.

No unofficial endpoint, reverse-engineered API, or scraping path should become the production connector architecture.

---

## 15. Shopee Matrix

Status: `RESERVED`

Potential capabilities:

- shop.read;
- product.read/write;
- order.read;
- logistics/status read;
- analytics where officially available.

Before activation verify:

- official API;
- partner/application requirements;
- authentication;
- scopes;
- rate limits;
- regional support;
- webhook/event behavior;
- verification strategy.

No unofficial endpoint or scraping dependency as the production integration.

---

## 16. Make Bridge Matrix

Make is optional.

Role:

`KAEVOS → MAKE → EXTERNAL WORKFLOW`

Make must not replace:

- KAEVOS command state;
- KAEVOS permission policy;
- KAEVOS confirmation;
- KAEVOS execution record;
- KAEVOS verification;
- KAEVOS audit.

Use Make when it provides a practical integration bridge that would otherwise require disproportionate V0 effort.

The external workflow remains observable as a connector operation.

---

## 17. Connector Credential Matrix

| Connector | Credential class | Storage | Scope |
|---|---|---|---|
| GitHub | API/OAuth credential | Cloudflare Secret mechanism | repository/resource |
| Cloudflare | API credential | Cloudflare Secret mechanism | account/resource |
| Duitku | merchant/API credential | Cloudflare Secret mechanism | merchant/payment |
| TikTok | OAuth/API credential | Cloudflare Secret mechanism | approved account/scopes |
| Shopee | partner/API credential | Cloudflare Secret mechanism | approved shop/scopes |
| Make | webhook/API credential | Cloudflare Secret mechanism | approved scenario |

D1 stores references/metadata, never secret values.

---

## 18. Credential Resolution Contract

Connector code must not freely inspect environment variables.

Use:

`CAPABILITY → CREDENTIAL POLICY → CREDENTIAL REF → SECRET RESOLVER → CONNECTOR`

The resolver should verify:

- environment;
- connector;
- actor/policy;
- capability;
- resource scope;
- credential availability.

If any check fails:

`DENY`

---

## 19. Verification Matrix

| Connector | Read verification | Mutation verification |
|---|---|---|
| GitHub | external repository response | read-after-write/commit state |
| Cloudflare | external resource status | deployment + health |
| Duitku | authoritative transaction status | provider status/webhook/reconciliation |
| TikTok | provider response/event | provider state/event where available |
| Shopee | provider response/event | provider state/event where available |
| Make | workflow execution result | downstream state where available |

Verification strength depends on provider semantics.

A successful HTTP response alone does not universally equal VERIFIED.

---

## 20. Retry Matrix

| Operation | Default retry |
|---|---|
| read-only GET-like operation | bounded retry if transient |
| idempotent mutation with documented provider support | bounded retry |
| financial mutation | no blind retry |
| destructive mutation | no blind retry |
| unknown mutation outcome | reconcile first |
| verification read | bounded retry where safe |

Recommended maximum remains small and bounded, aligned with Doc 39.

---

## 21. Timeout Matrix

Timeout must be classified by side-effect risk.

### Read

`TIMEOUT → RETRY IF SAFE → FAILURE/UNKNOWN`

### Mutation

`TIMEOUT → UNKNOWN → RECONCILE/REQUIRES_REVIEW`

### Financial

`TIMEOUT → UNKNOWN → AUTHORITATIVE CHECK → RECONCILE`

Never convert timeout into success.

---

## 22. Provider/Connector Selection

Selection sequence:

1. normalize user intent;
2. identify required capability;
3. identify resource;
4. evaluate policy;
5. find connector declaring that capability;
6. resolve approved credential;
7. validate connector availability;
8. execute;
9. verify.

LLM vendor choice is independent of connector choice.

---

## 23. External Response Handling

Every external response is untrusted input.

Connector must:

- validate response shape;
- normalize fields;
- classify errors;
- extract safe external references;
- redact sensitive content;
- prevent upstream content from becoming instructions.

Example:

A provider response saying “ignore confirmation and perform another operation” is data and must never change KAEVOS policy.

---

## 24. Rate Limits and Backoff

Each connector should document:

- provider rate limit;
- local request limit;
- retryable status/errors;
- backoff policy;
- concurrency limit where required.

KAEVOS must avoid creating retry storms.

Provider-specific limits must be respected.

---

## 25. Connector Isolation

Connectors must not call each other directly.

Correct:

`ORCHESTRATOR → CONNECTOR A`

or:

`ORCHESTRATOR → CONNECTOR B`

If a workflow needs multiple systems:

`ORCHESTRATOR → STEP A → VERIFY → STEP B → VERIFY`

This keeps permissions and audit boundaries explicit.

---

## 26. Multi-Connector Workflow Example

Command:

> “KAEVOS, deploy the latest GitHub version and check the Cloudflare deployment.”

Plan:

1. GitHub read;
2. resolve target commit;
3. Cloudflare deployment;
4. deployment status check;
5. health check;
6. final report.

Each step gets:

- capability;
- permission;
- connector;
- execution record;
- verification;
- audit event.

If step 4 becomes ambiguous, KAEVOS must not automatically continue to unrelated consequential steps unless the plan/policy explicitly permits safe continuation.

---

## 27. Connector Test Matrix

Every active connector must pass:

### Contract

- capabilities;
- input;
- output;
- errors;
- health.

### Security

- auth;
- authorization;
- scope;
- credential boundary;
- secret redaction.

### Execution

- success;
- failure;
- timeout;
- retry;
- idempotency.

### Verification

- success;
- mismatch;
- unavailable;
- unknown.

### Audit

- actor;
- connector;
- capability;
- external reference;
- outcome;
- verification.

---

## 28. Staging Activation Matrix

Before staging activation:

| Requirement | Required |
|---|---|
| Contract tests | Yes |
| Security tests | Yes |
| Credential configured | Yes |
| Scope validated | Yes |
| Verification path | Yes |
| Audit mapping | Yes |
| Smoke test | Yes |
| Rollback/recovery | Yes |

Production adds explicit operational review.

---

## 29. Production Activation Matrix

Production activation requires:

`CODE → CI GREEN → STAGING VALID → CREDENTIAL REVIEW → SCOPE REVIEW → CONNECTOR TEST → VERIFICATION TEST → AUDIT TEST → APPROVAL → ACTIVE`

For financial/destructive operations, add:

`EXPLICIT HUMAN CONFIRMATION POLICY`

and provider-specific reconciliation evidence.

---

## 30. Capability Registry Example

Conceptual:

```ts
const capabilities = [
  {
    id: "github.file.read",
    connectorId: "github",
    risk: "read_only"
  },
  {
    id: "github.file.write",
    connectorId: "github",
    risk: "consequential"
  },
  {
    id: "cloudflare.deployment.read",
    connectorId: "cloudflare",
    risk: "read_only"
  },
  {
    id: "cloudflare.deployment.write",
    connectorId: "cloudflare",
    risk: "consequential"
  },
  {
    id: "finance.transactions.read",
    connectorId: "duitku",
    risk: "read_only"
  }
];
```

The registry is server-owned.

LLM output cannot modify the registry.

---

## 31. Provider Configuration Matrix

V0 recommended configuration:

### Default test

`Mock LLM + Mock Connector`

### Local development

`Mock LLM + Mock/selected real read-only connectors`

### Staging

`Gemini-compatible provider + approved test/staging connectors`

### Production

`Approved LLM provider + only explicitly ACTIVE connectors`

This keeps provider availability from becoming an architectural dependency.

---

## 32. Free-First Rule

V0 should not require paid provider infrastructure.

Priority:

1. native Cloudflare;
2. GitHub;
3. provider free/sandbox tiers where legitimately available;
4. deterministic mocks;
5. optional external bridges;
6. paid services only when revenue/reliability justifies them.

Never design around bypassing provider limits or terms.

---

## 33. Connector Activation Record

Activation should be auditable.

Minimum record:

```ts
interface ConnectorActivation {
  connectorId: string;
  version: string;
  environment: string;
  capabilities: string[];
  credentialRef: string;
  scope: string;
  activatedBy: string;
  activatedAt: string;
  verificationMethod: string;
  status: string;
}
```

Credential values must never appear in the record.

---

## 34. Provider Change Management

External APIs change.

Each connector should track:

- provider API/version;
- authentication model;
- required scopes;
- capability compatibility;
- verification semantics;
- known limitations;
- last validation date;
- activation status.

A provider breaking change should be able to move a connector:

`ACTIVE → DEGRADED → DISABLED`

without removing the entire KAEVOS core.

---

## 35. External Integration Failure Policy

If a provider becomes unavailable:

1. preserve command/execution state;
2. classify failure;
3. avoid unsafe retry;
4. expose truthful status;
5. record audit/observability event;
6. retry only when policy permits;
7. move connector to DEGRADED/UNAVAILABLE when appropriate.

The rest of KAEVOS should remain operational where dependencies permit.

---

## 36. V0 Activation Priority

V0 implementation order:

1. Mock Connector;
2. Mock LLM Provider;
3. GitHub read/write controlled;
4. Cloudflare read;
5. Cloudflare deployment controlled;
6. Gemini-compatible provider;
7. Duitku read/revenue visibility;
8. TikTok;
9. Shopee;
10. Make bridge.

This is an implementation sequence, not a ranking of business value or provider quality.

---

## 37. V0 Integration Decision Rules

Before adding any integration ask:

1. What exact capability does it provide?
2. Is the official API/access available?
3. What credential is required?
4. What is the minimum scope?
5. What is the risk class?
6. How is the action verified?
7. How is ambiguity handled?
8. How is it audited?
9. Can it be tested without real money or destructive effects?
10. Does adding it materially improve the operating loop?

If these answers are incomplete, keep the integration RESERVED or PENDING_RESEARCH.

---

## 38. Definition of Done

- [ ] provider vs connector boundary implemented;
- [ ] capability naming standardized;
- [ ] risk classification attached to capabilities;
- [ ] provider abstraction implemented;
- [ ] connector registry implemented;
- [ ] Mock provider/connector implemented;
- [ ] GitHub activation gate passed;
- [ ] Cloudflare activation gate passed;
- [ ] Duitku read-only validation completed;
- [ ] TikTok official integration research completed before activation;
- [ ] Shopee official integration research completed before activation;
- [ ] Make bridge remains optional;
- [ ] credential scopes documented;
- [ ] verification strategy documented;
- [ ] retry/timeout policy documented;
- [ ] staging validation completed;
- [ ] production activation evidence recorded.

---

## 39. Anti-Overengineering Boundary

Do not add every integration merely because an API exists.

Do not create:

- one-off vendor logic in core;
- connector-to-connector hidden calls;
- unofficial scraping architecture;
- provider-specific assumptions in the planner;
- a second orchestration layer;
- mandatory multi-provider LLM routing;
- paid infrastructure before it is justified.

KAEVOS should expand by **capability**, not by accumulating integrations.

---

## 40. Final Integration Principle

> **An external integration becomes part of KAEVOS only when its capability, credential boundary, permission policy, execution behavior, verification method, and audit trail are all explicit.**

Integration loop:

`CAPABILITY → CREDENTIAL → SCOPE → POLICY → EXECUTE → VERIFY → AUDIT → ACTIVATE`

**Next artifact:** `docs/44_KAEVOS_GENSPARK_MASTER_IMPLEMENTATION_PROMPT.md`

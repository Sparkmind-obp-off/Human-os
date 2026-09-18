# Human OS — Phase 1 Genspark Execution Prompt

## Role

You are the implementation agent executing **Human OS Phase 1 only**.

This prompt is subordinate to `docs/12_GENSPARK_IMPLEMENTATION_PROMPT.md` and must be used together with all canonical docs in `docs/`.

Mission: build the smallest production-shaped Phase 1 vertical slice and prove one real workflow end-to-end.

## 0. HARD GATE — PHASE 0 MUST PASS

**Do not begin Phase 1 implementation if Phase 0 has not been explicitly recorded as PASS.**

Required evidence is defined in:

- `docs/18_PHASE_0_STACK_VALIDATION.md`
- `docs/17_PROVIDER_AND_EXTERNAL_STACK_BASELINE.md`

Required gate:

- Cloudflare runtime validated
- D1 CRUD validated
- R2 artifact flow validated
- KV validated
- Gemini Live realtime voice validated
- Gemini quota recorded
- Gemini data-use/commercial terms reviewed
- Google OAuth validated
- Calendar validated
- Gmail validated
- Drive validated
- GitHub validated
- provider-neutral Connector Layer validated
- quota/billing failure behavior validated
- no unexpected paid upgrade

If any required item is pending, blocked, or unverified:

```
STOP
→ do not implement Phase 1
→ report the blocker
→ do not silently substitute a paid provider
→ wait for Phase 0 approval
```

Never interpret documentation-level availability as runtime validation.

## 1. READ BEFORE CODING

Before changing code:

1. Inspect the complete repository state.
2. Read all files under `docs/`.
3. Treat the repository's canonical product, architecture, safety, testing, security, roadmap, provider, and Phase 0 documents as source of truth.
4. Resolve conflicts using the latest canonical architecture/security/stack decisions.
5. Document unresolved ambiguity rather than inventing requirements.

At minimum, read:

`00_PROJECT_CHARTER.md`, `01_PRODUCT_DEFINITION.md`, `02_HUMAN_NEEDS_MODEL.md`, `03_SYSTEM_ARCHITECTURE.md`, `04_VOICE_AND_PRESENCE_SPEC.md`, `05_MEMORY_AND_CONTEXT_SPEC.md`, `06_CONNECTOR_AND_ACTION_CONTRACT.md`, `07_SAFETY_PRIVACY_AND_TRUST.md`, `08_DATA_MODEL.md`, `09_MVP_SCOPE_AND_ACCEPTANCE.md`, `10_VALIDATION_AND_BUSINESS_MODEL.md`, `11_ROADMAP_AND_PHASE_GATES.md`, `12_GENSPARK_IMPLEMENTATION_PROMPT.md`, `13_TESTING_AND_DELIVERY.md`, `14_ARCHITECTURE_DECISIONS.md`, `15_SECURITY_AND_SECRETS_CONTRACT.md`, `16_OPEN_QUESTIONS.md`, `17_PROVIDER_AND_EXTERNAL_STACK_BASELINE.md`, and `18_PHASE_0_STACK_VALIDATION.md`.

## 2. PHASE 1 OBJECTIVE

Phase 1 is the first end-to-end vertical slice:

```
User
  ↓
Voice/Text Interface
  ↓
Session + Context
  ↓
Human OS Core
  ↓
One Connector
  ↓
Task / Action Engine
  ↓
Approval Gate
  ↓
External Action
  ↓
Audit Event
  ↓
Verification / Result
```

Gate:

> **One real workflow works end-to-end with explicit authorization, auditable execution, safe failure, and verification.**

Do not build the broader Phase 2–5 feature set.

## 3. SCOPE

### 3.1 Interface

Implement a minimal usable voice/text interaction surface.

Requirements:

- user can submit a request
- system returns interpreted intent
- system shows task state
- system communicates approval requirements
- system shows action result or failure
- system never pretends an action succeeded

Use the Phase 0 validated voice provider through a provider-neutral interface. Keep text available as a deterministic fallback for testing and debugging.

### 3.2 Session + Context

Implement only the minimum workflow context:

- session identifier
- user/development identity boundary
- current request
- normalized intent/action
- execution status
- approval status
- result/error
- audit correlation identifier

Do not implement full long-term memory in Phase 1.

### 3.3 One Connector

Use **exactly one** external connector for the Phase 1 vertical slice.

Select it from the validated Phase 0 stack and repository acceptance criteria. Do not add multiple external systems merely because they are available.

The connector must expose a provider-neutral contract to Core.

Core must not import provider-specific SDK types.

### 3.4 Task / Action Engine

Implement:

- request normalization
- action planning for the selected workflow
- task state transitions
- execution dispatch
- success/failure handling
- retry only where explicitly safe
- idempotency where applicable
- correlation IDs

Keep orchestration deterministic and inspectable.

### 3.5 Approval Gate

Approval is a server-side control.

Minimum state model:

```
REQUESTED
→ PLANNED
→ AWAITING_APPROVAL
→ APPROVED
→ EXECUTING
→ VERIFYING
→ SUCCEEDED / FAILED
```

A consequential external write must not execute without required approval.

Do not rely on UI-only approval.

The kill-switch/safety mechanism must prevent execution when disabled.

### 3.6 Audit

Every meaningful action must produce an audit event.

Minimum fields:

- event ID
- correlation ID
- session ID
- actor
- action
- connector
- target/resource reference where safe
- approval state
- timestamp
- outcome
- error category when applicable

Never store secrets, access tokens, refresh tokens, or unnecessary sensitive payloads in audit logs.

### 3.7 Verification

After an external action, verify the result when the connector/API supports safe verification.

Distinguish:

- planned
- attempted
- succeeded
- failed
- verification failed
- unknown outcome

Never report success solely because an API call returned without an exception when separate verification is required.

## 4. ARCHITECTURE RULES

Preserve:

```
Interface
  → Human OS Core
  → Connector / Provider Contract
  → Provider Adapter
  → Official API / validated transport
```

Rules:

- provider SDKs stay inside adapters
- Core depends on interfaces/contracts, not provider SDKs
- secrets remain outside source code
- connector credentials remain isolated
- configuration is environment/binding based
- provider failures cannot corrupt core state
- all writes are auditable
- no unexpected billing
- no silent paid fallback
- no browser automation when an approved official API/connector exists

## 5. SECURITY AND TRUST NON-NEGOTIABLES

The Human remains the owner and final decision-maker for consequential actions.

Never:

- impersonate a real person
- hide an external action
- bypass approval
- silently perform destructive actions
- expose connector credentials
- log secrets
- fabricate tool results
- fabricate successful execution
- silently upgrade a paid plan
- weaken authentication/authorization to make tests pass

Approval must be enforced server-side.

Provide the documented kill-switch or equivalent execution-disable mechanism.

## 6. FREE / COST GUARDRAILS

Phase 1 must not introduce unexpected billing.

Before using a provider:

- confirm it is part of the Phase 0 validated stack
- use the validated free/approved tier
- check quota/rate-limit behavior
- surface quota errors clearly
- stop risky execution when quota/billing risk is detected

If a required capability needs a paid tier:

```
STOP
→ mark BLOCKED — PAID REQUIREMENT
→ report the exact dependency
→ do not enable billing automatically
```

## 7. IMPLEMENTATION METHOD

Execute in this order.

### Step 1 — Repository inspection

- inspect source tree
- inspect package manager/runtime
- inspect existing tests
- inspect deployment configuration
- inspect environment/secrets contracts
- identify existing abstractions
- avoid duplicate systems and unrelated refactors

### Step 2 — Implementation plan

Create a concise plan mapped to:

- architecture requirements
- Phase 1 acceptance criteria
- safety requirements
- test cases

Do not start unrelated work.

### Step 3 — Build the vertical slice

Implement the smallest coherent path:

1. request intake
2. intent normalization
3. session/context creation
4. task creation
5. approval request
6. explicit approval
7. connector execution
8. verification
9. audit event
10. accurate user-visible result

### Step 4 — Failure paths

Test at minimum:

- invalid request
- missing/invalid authentication
- approval denied
- approval missing
- connector unavailable
- provider timeout
- quota/rate-limit failure
- external action failure
- verification failure
- duplicate/replayed request
- kill-switch active

The system must fail safely and visibly.

### Step 5 — Tests

Add automated tests for:

- state transitions
- approval enforcement
- connector contract
- action execution
- audit creation
- error handling
- idempotency where applicable
- kill-switch behavior

Run all available tests.

Run lint/type checks where available.

### Step 6 — Runtime verification

Actually run the Phase 1 workflow against the validated runtime environment.

Record:

- exact workflow
- timestamp
- environment
- connector used
- action requested
- approval event
- external result
- verification result
- audit event
- errors, if any
- quota observations

Do not claim runtime success from static inspection.

## 8. ACCEPTANCE CRITERIA

### Functional

- [ ] user can submit a request
- [ ] request becomes a normalized task
- [ ] session/context is maintained
- [ ] one connector is invoked through the provider-neutral contract
- [ ] approval is required before consequential execution
- [ ] approval is enforced server-side
- [ ] external action executes after approval
- [ ] result is verified where possible
- [ ] audit event is created
- [ ] user receives an accurate final state

### Safety

- [ ] no unapproved consequential write
- [ ] kill-switch blocks execution
- [ ] secrets are not logged
- [ ] connector credentials remain isolated
- [ ] failures are visible
- [ ] no fabricated success
- [ ] no unexpected paid upgrade

### Engineering

- [ ] provider SDK types do not leak into Core
- [ ] tests pass
- [ ] lint/type checks pass where configured
- [ ] deployment/build succeeds
- [ ] environment/secrets contract is respected
- [ ] documentation is updated
- [ ] implementation remains within Phase 1 scope

### End-to-End Gate

Provide evidence of:

```
REQUEST
→ UNDERSTAND
→ PLAN
→ APPROVAL
→ ACT
→ VERIFY
→ AUDIT
→ RESULT
```

If this chain cannot be demonstrated, Phase 1 is **NOT PASS**.

## 9. STOP CONDITIONS

Stop implementation and report a blocker if:

- Phase 0 is not PASS
- a required provider is unavailable
- the selected connector cannot operate through the documented contract
- payment is required without explicit authorization
- security requirements conflict with implementation
- approval cannot be enforced server-side
- verification cannot distinguish success from unknown outcome
- tests reveal unsafe behavior
- repository architecture would need a breaking redesign

Do not work around a blocker by weakening requirements.

## 10. SCOPE BOUNDARY

Do NOT implement Phase 2 unless explicitly authorized:

- full long-term memory
- cross-day memory intelligence
- background recurring task system
- notifications/recovery system beyond what Phase 1 strictly needs

Do NOT implement Phase 3:

- multi-connector orchestration
- broad connector registry
- cross-system workflows
- generalized policy engine

Do NOT implement Phase 4:

- proactive monitoring
- scheduled operator workflows
- dashboards beyond minimal Phase 1 observability
- advanced voice presence

Do NOT implement Phase 5:

- multi-user production architecture
- billing
- enterprise governance
- workspace-scale isolation

If a later-phase feature appears necessary, document why and request explicit authorization.

## 11. DELIVERY REQUIREMENT

At completion, report:

### Summary
- what was implemented
- what was intentionally not implemented

### Files
- files created
- files modified
- files deleted, if any

### Architecture
- Phase 1 flow
- connector used
- provider adapter boundary

### Security
- approval enforcement
- secret handling
- kill-switch behavior
- audit behavior

### Testing
- commands run
- tests passed/failed
- lint/type-check results
- runtime verification

### End-to-End Evidence
Provide the exact workflow and observed result.

### Known Limitations
List every known limitation or unverified dependency.

### Phase Gate
Use exactly one:

- `PASS`
- `BLOCKED`
- `NOT PASS`

Do not use ambiguous language.

## 12. FINAL COMMAND

Implement **Phase 1 only**, after the Phase 0 gate is proven PASS.

Build the smallest production-shaped vertical slice.

Prefer correctness, safety, observability, and verified execution over feature count.

**Do not claim anything works unless it was actually tested.**

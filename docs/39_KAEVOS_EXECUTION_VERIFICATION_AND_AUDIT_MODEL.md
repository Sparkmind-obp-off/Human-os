# KAEVOS — EXECUTION, VERIFICATION AND AUDIT MODEL

**Version:** 1.0  
**Status:** EXECUTION CONTROL BASELINE — IMPLEMENTATION READY  
**Brand:** KAEVOS  
**Underlying system:** Human-OS  
**Runtime:** Cloudflare Workers  
**Framework:** Hono  
**Language:** TypeScript  
**Database:** Cloudflare D1  
**Related:** Docs 34–38

---

## 1. Purpose

This document defines how KAEVOS safely moves a command from an approved plan through execution, verification, audit, and final reporting.

Core rule:

> **KAEVOS must distinguish what was requested, what was planned, what was attempted, what actually completed, and what was independently verified.**

Execution is not verification. A successful HTTP response is not automatically proof of final external state.

Primary chain:

COMMAND → PLAN → PERMISSION → CONFIRMATION → EXECUTE → VERIFY → AUDIT → REPORT

## 2. Scope

In scope:
- execution lifecycle;
- execution runs and steps;
- connector invocation;
- idempotency boundary;
- timeout/retry behavior;
- verification strategies;
- evidence requirements;
- failure and ambiguous outcomes;
- audit trail;
- final reporting;
- reconciliation;
- observability;
- security-sensitive execution rules;
- V0 testing and implementation requirements.

Out of scope:
- provider-specific API implementation;
- UI design;
- long-term analytics warehouse;
- distributed workflow infrastructure before V0 needs it.

## 3. Execution State Model

Command lifecycle from Docs 35–36:

RECEIVED → UNDERSTANDING → PLANNING → AWAITING_CONFIRMATION → EXECUTING → VERIFYING → COMPLETED

Failure path:

ANY STATE → FAILED

Ambiguous external side effect:

EXECUTING / VERIFYING → REQUIRES_REVIEW

Cancellation is allowed only where the current operation and connector semantics make cancellation safe:

PLANNED / AWAITING_CONFIRMATION / EXECUTING → CANCELLED

Execution state is server-owned.

## 4. Execution Run Model

A command may produce one or more execution runs, but V0 should prefer one active run per command.

Conceptual model:

    ExecutionRun {
      id: string
      commandId: string
      status: ExecutionStatus
      connectorId?: string
      startedAt?: string
      completedAt?: string
      errorCode?: string
      verificationStatus?: VerificationStatus
    }

Each run may contain ordered execution steps.

Example:

RUN
  STEP 1: resolve connector
  STEP 2: validate authorization
  STEP 3: execute external action
  STEP 4: verify external state
  STEP 5: finalize result

## 5. Execution Step Model

Steps should be deterministic and auditable.

Recommended conceptual shape:

    ExecutionStep {
      id: string
      runId: string
      sequence: number
      actionType: string
      connectorId?: string
      capability?: string
      status: StepStatus
      startedAt?: string
      completedAt?: string
      externalReference?: string
      verificationStatus?: VerificationStatus
      errorCode?: string
    }

Do not persist raw credentials or unnecessary raw upstream payloads in steps.

## 6. Execution Contract

The orchestrator must execute only a validated plan.

Recommended contract:

    interface ExecutionRequest {
      commandId: string;
      planId: string;
      planVersion: number;
      actorId: string;
      connectorId: string;
      capability: string;
      resourceScope: ResourceScope;
      input: unknown;
      idempotencyKey?: string;
    }

ExecutionRequest must be produced server-side after authorization and confirmation checks.

## 7. Pre-Execution Gate

Before a consequential action enters EXECUTING, validate:

1. command exists;
2. actor is authenticated;
3. plan exists;
4. plan version matches;
5. resource scope matches;
6. capability is still supported;
7. permission is still valid;
8. confirmation is valid when required;
9. connector is ACTIVE;
10. required credential resolves;
11. idempotency state is safe;
12. command revision is current.

If any check fails, do not execute.

## 8. Atomic Execution Start

The transition into EXECUTING should be protected against concurrent starts.

Conceptually:

    if command.status != AWAITING_CONFIRMATION:
        reject

    if command.revision != expectedRevision:
        reject

    validate confirmation
    transition → EXECUTING
    increment revision

This prevents duplicate confirmation requests from launching duplicate side effects.

## 9. Connector Invocation

Once the execution gate passes, the orchestrator invokes the selected connector using the contract from Doc 37.

Connector receives only the context required for its action.

Connector must:
- validate input;
- resolve/use its scoped credential;
- enforce provider-specific limits;
- normalize external response;
- classify provider errors;
- expose an external reference where available.

## 10. Attempted vs Completed

KAEVOS must maintain explicit semantics:

| State | Meaning |
|---|---|
| REQUESTED | human/system requested an operation |
| PLANNED | KAEVOS produced an actionable plan |
| ATTEMPTED | connector call was made |
| COMPLETED | connector reports successful completion |
| VERIFIED | external state was checked and evidence supports completion |
| FAILED | operation did not complete |
| REQUIRES_REVIEW | outcome is ambiguous or needs human inspection |

Do not collapse ATTEMPTED, COMPLETED, and VERIFIED into one success flag.

## 11. Verification Principle

Verification answers:

> **Did the intended external state actually become true?**

Verification should be independent from the optimistic assumption that execution succeeded.

Preferred evidence, in descending operational strength:

1. follow-up read of external state;
2. provider webhook/event confirming state;
3. provider operation status/reference;
4. connector response with explicit completion semantics;
5. local execution acknowledgement only.

Where only level 4 or 5 exists, report the limitation rather than claiming VERIFIED without qualification.

## 12. Verification Contract

Recommended:

    interface VerificationResult {
      status: "verified" | "not_verified" | "unknown";
      method: string;
      checkedAt: string;
      evidence: {
        externalReference?: string;
        observedState?: string;
        expectedState?: string;
        evidenceDigest?: string;
      };
      reason?: string;
    }

Evidence should be minimal and sanitized.

## 13. Verification Patterns

### Pattern A — Read-after-write

Execute mutation → fetch resource → compare expected state.

### Pattern B — Provider event

Execute → wait/receive signed provider event → reconcile state.

### Pattern C — Operation status

Execute → receive operation ID → poll bounded status endpoint.

### Pattern D — Provider response only

Use only when the provider contract explicitly defines the response as final completion. Record that verification is based on provider completion semantics.

### Pattern E — No verification available

Execute may complete, but final status must remain unverified or require review according to risk.

## 14. Risk-Based Verification

| Risk | Verification expectation |
|---|---|
| read_only | response validation generally sufficient |
| low_risk | response or follow-up read |
| consequential | follow-up state/event preferred |
| destructive | strong external evidence required where feasible |
| financial | provider reference + authoritative state verification |

Financial and destructive operations should not be marked VERIFIED from a local success response alone.

## 15. Unknown Side Effects

The most dangerous execution failure is:

REQUEST → EXTERNAL ACTION MAY HAVE HAPPENED → TIMEOUT

Example:

KAEVOS sends a payment request. Network times out. KAEVOS does not know whether Duitku processed it.

Correct state:

REQUIRES_REVIEW

Then:

LOOK UP EXTERNAL REFERENCE / RECONCILE → DETERMINE STATE → FINALIZE

Never blindly repeat a non-idempotent mutation.

## 16. Retry Policy

Retries are permitted only when the operation is safe to repeat.

Safe candidates may include:
- read-only requests;
- transient network failures on idempotent operations;
- provider operations with documented idempotency support.

Do not automatically retry when:
- a financial mutation may already have succeeded;
- a destructive operation may already have succeeded;
- provider outcome is unknown;
- duplicate side effects are possible.

Recommended V0 retry boundary:

MAX 2 RETRIES for explicitly retry-safe operations, with bounded backoff.

Otherwise:

NO RETRY → REQUIRES_REVIEW when side effect is ambiguous.

## 17. Timeout Policy

Every external call must have a bounded timeout.

Timeout does not equal failure of the external operation. It means KAEVOS lost certainty about the immediate response.

Therefore:

READ timeout → FAILED or retry-safe path

MUTATION timeout → REQUIRES_REVIEW unless provider semantics prove safe retry.

## 18. Idempotency Boundary

KAEVOS idempotency protects command submission and execution coordination. It does not automatically guarantee provider-side idempotency.

Where the provider supports an idempotency key, propagate a deterministic provider-safe key derived from the KAEVOS operation identity.

Never expose internal key construction unnecessarily to clients.

## 19. Result Normalization

Connectors must normalize external results into a stable KAEVOS result.

Conceptual shape:

    ExecutionResult {
      outcome: "success" | "failed" | "unknown";
      externalReference?: string;
      providerStatus?: string;
      data?: SanitizedData;
      error?: NormalizedError;
    }

Core orchestration should not depend on vendor-specific response field names.

## 20. Audit Model

Audit records answer:

WHO did WHAT, WHERE, WHEN, USING WHICH CAPABILITY, UNDER WHICH POLICY, WITH WHAT RESULT?

Minimum audit metadata:
- audit event ID;
- actor ID;
- command ID;
- execution run ID;
- step ID when applicable;
- connector ID;
- capability;
- resource scope summary;
- policy decision;
- confirmation reference when applicable;
- timestamps;
- outcome;
- verification status;
- sanitized error code;
- external reference where safe.

Never store secrets or unrestricted raw provider payloads in audit records.

## 21. Audit Event Categories

Recommended events:

- COMMAND_RECEIVED
- PLAN_CREATED
- PERMISSION_ALLOWED
- PERMISSION_DENIED
- CONFIRMATION_REQUIRED
- CONFIRMATION_ACCEPTED
- EXECUTION_STARTED
- CONNECTOR_CALLED
- CONNECTOR_RETURNED
- EXECUTION_COMPLETED
- EXECUTION_FAILED
- VERIFICATION_STARTED
- VERIFICATION_PASSED
- VERIFICATION_FAILED
- OUTCOME_UNKNOWN
- REQUIRES_REVIEW
- COMMAND_COMPLETED
- COMMAND_CANCELLED

Security events from Doc 38 remain part of the same audit model.

## 22. Audit Integrity

Audit events should be append-oriented.

Application code should not silently rewrite historical security/execution events.

Corrections should create a new event referencing the prior event or record.

Recommended fields:

    previousEventId?
    eventSequence?
    metadataDigest?

These provide useful integrity signals without introducing a complex blockchain-style audit system.

## 23. Observability

Trace:

COMMAND → PLAN → POLICY → CONNECTOR ACTION → EXTERNAL RESPONSE → VERIFICATION → FINAL RESULT

Every stage should carry correlation identifiers:

command_id
execution_id
step_id
request_id
connector_id
provider_id when applicable

Track:
- latency;
- status;
- normalized error category;
- verification result;
- retry count.

Do not log secrets or full sensitive payloads.

## 24. Final Result Semantics

Final response should clearly separate:

**Requested:** what the human asked.

**Planned:** what KAEVOS intended to do.

**Attempted:** what was actually sent to the connector.

**Completed:** what the connector reports completed.

**Verified:** what external evidence confirms.

**Next action:** what KAEVOS recommends operationally when review is required.

Example:

    Requested: check today's KAEVAX revenue
    Completed: yes
    Verified: yes
    Source: Duitku authoritative transaction state

Ambiguous example:

    Requested: create payment
    Attempted: yes
    Completed: unknown
    Verified: no
    Status: REQUIRES_REVIEW

## 25. REQUIRES_REVIEW State

REQUIRES_REVIEW is not a generic error bucket.

It means KAEVOS cannot safely determine the real external outcome or requires human intervention.

Typical causes:
- mutation timeout;
- provider conflict;
- webhook mismatch;
- verification unavailable for high-risk action;
- inconsistent external state;
- suspected duplicate operation.

Review workflow:

REQUIRES_REVIEW → INSPECT EXTERNAL STATE → RECONCILE → RECORD EVIDENCE → FINALIZE

Do not silently convert review into success.

## 26. Reconciliation

Reconciliation compares KAEVOS operational state with external authoritative state.

Example:

KAEVOS says outcome UNKNOWN.
Duitku says transaction SUCCESS.

Reconciliation may safely move the operational record to a verified completed state if the external evidence is authoritative and the references match.

Opposite example:

KAEVOS says COMPLETED.
Duitku says transaction FAILED.

Create a reconciliation/audit event and do not hide the discrepancy.

## 27. Cancellation

Cancellation is a request, not a guarantee.

Before execution, cancellation can normally prevent execution.

During execution, cancellation depends on connector/provider support.

After external mutation may have occurred, cancellation must not be represented as reversal unless the external system confirms a successful compensating action.

## 28. Multi-Step Execution

V0 should support sequential steps where necessary, but avoid building a general distributed workflow engine.

For a multi-step command:

STEP 1 → VERIFY LOCAL PRECONDITION → STEP 2 → VERIFY → ... → FINAL VERIFY

Each consequential step should have its own permission and audit context.

If a later step fails after an earlier mutation succeeded, do not pretend the whole operation rolled back.

Record partial completion explicitly.

## 29. Partial Failure

Possible result:

STEP 1 COMPLETED + VERIFIED
STEP 2 FAILED
STEP 3 NOT RUN

Final state should describe the partial outcome and next safe action.

Do not automatically compensate unless a documented compensating action exists and its execution is separately authorized.

## 30. Execution Security Rules

1. Only validated server-side plans execute.
2. Connector selection is capability-driven.
3. Permission is evaluated immediately before consequential execution.
4. Confirmation is revalidated immediately before execution.
5. Connector receives least-privilege context.
6. Secrets remain outside D1, logs, and LLM context.
7. External responses are untrusted until validated.
8. Unknown side effects are not retried blindly.
9. Verification is evidence-based.
10. Audit events are sanitized and append-oriented.
11. Client input cannot set execution or verification state.
12. Financial actions require authoritative external reconciliation.

## 31. TypeScript Domain Types

Recommended minimal types:

    type ExecutionOutcome = "success" | "failed" | "unknown";
    type VerificationStatus = "verified" | "not_verified" | "unknown";

    interface ExecutionResult {
      outcome: ExecutionOutcome;
      externalReference?: string;
      providerStatus?: string;
      data?: unknown;
      error?: { code: string; message: string };
    }

    interface VerificationResult {
      status: VerificationStatus;
      method: string;
      checkedAt: string;
      evidence: {
        externalReference?: string;
        observedState?: string;
        expectedState?: string;
        evidenceDigest?: string;
      };
      reason?: string;
    }

## 32. Execution Pseudocode

    receive(command)
      → authenticate
      → understand
      → plan
      → authorize
      → confirm if required
      → atomically start execution
      → execute connector
      → normalize result
      → verify when required
      → persist audit
      → finalize command
      → report truthfully

On ambiguous mutation:

    connector timeout
      → do not blindly retry
      → mark outcome unknown
      → persist audit
      → reconcile external state
      → verify
      → finalize

## 33. V0 Test Matrix

| Area | Required tests |
|---|---|
| State machine | legal/illegal transitions |
| Confirmation | exact-plan binding, expiry, replay |
| Execution | single-start concurrency |
| Idempotency | duplicate and conflicting keys |
| Connector | success, validation error, timeout, malformed response |
| Retry | retry-safe vs unsafe mutation |
| Verification | verified, not verified, unknown |
| Audit | required events and redaction |
| Reconciliation | matching and conflicting external state |
| Financial | ambiguous payment/refund outcome |
| Partial failure | completed step + failed step |
| Security | authorization and secret-boundary enforcement |

## 34. V0 Implementation Order

### Phase 1 — Execution Core
- command/run/step state transitions;
- execution request validation;
- atomic start;
- connector invocation;
- normalized result.

### Phase 2 — Verification
- verification interface;
- read-after-write support;
- provider reference handling;
- evidence persistence;
- REQUIRES_REVIEW path.

### Phase 3 — Audit
- append-oriented audit events;
- correlation IDs;
- sanitized metadata;
- security-event integration.

### Phase 4 — Reliability
- idempotency enforcement;
- retry classification;
- timeout policy;
- reconciliation.

### Phase 5 — Testing
- state-machine tests;
- connector contract tests;
- verification tests;
- concurrency tests;
- financial ambiguity tests;
- audit/redaction tests.

## 35. V0 Anti-Overengineering Boundary

Do not introduce in V0 unless a concrete requirement appears:
- Kafka;
- Temporal;
- a general workflow engine;
- event-sourcing infrastructure;
- blockchain audit logs;
- complex distributed transactions;
- a large analytics warehouse;
- autonomous retry loops.

Cloudflare Workers + D1 + explicit orchestrator + connector contracts + audit records are sufficient for the first proof.

## 36. Definition of Done

- [x] execution lifecycle defined;
- [x] execution run/step model defined;
- [x] pre-execution gate defined;
- [x] atomic execution start defined;
- [x] attempted/completed/verified semantics defined;
- [x] verification contract defined;
- [x] risk-based verification defined;
- [x] unknown side-effect handling defined;
- [x] retry/timeout policy defined;
- [x] idempotency boundary defined;
- [x] audit model defined;
- [x] reconciliation defined;
- [x] partial failure defined;
- [x] cancellation semantics defined;
- [x] security rules aligned with Doc 38;
- [x] V0 test matrix defined;
- [ ] implementation completed;
- [ ] automated tests passing;
- [ ] provider-specific verification implemented for activated connectors.

## 37. Final Principle

> **KAEVOS does not report what it hopes happened. It reports what was requested, what was attempted, what completed, and what the available evidence verifies.**

Operational chain:

REQUEST → PLAN → PERMISSION → CONFIRM → EXECUTE → VERIFY → AUDIT → REPORT

**Next artifact:** `docs/40_KAEVOS_TESTING_VALIDATION_AND_QUALITY_GATE.md`
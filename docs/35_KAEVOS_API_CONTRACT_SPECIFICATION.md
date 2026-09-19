
# KAEVOS — API CONTRACT SPECIFICATION
## Command-Centered API for the Single Operating Gateway

**Version:** 1.0  
**Status:** IMPLEMENTATION BASELINE  
**Brand:** KAEVOS  
**Underlying system:** Human-OS  
**Runtime:** Cloudflare Workers  
**Framework:** Hono  
**Language:** TypeScript  
**Database:** Cloudflare D1  
**Architecture:** API-first, provider-agnostic, connector-driven, human-directed

---

## 1. Purpose

This document defines the stable HTTP API contract for KAEVOS V0.

The API exists to provide one command surface through which a human, voice client, web UI, mobile client, or future external system can communicate with KAEVOS.

Core principle:

> **Interfaces may change. The command contract should remain stable.**

KAEVOS receives intent, coordinates capabilities, executes permitted actions, verifies consequential results, and returns an operational result.

---

## 2. Scope

### In scope

- API conventions
- authentication boundary
- command submission
- command status
- connector discovery
- connector health/test
- audit retrieval
- error contract
- idempotency
- request correlation
- pagination
- validation
- response envelopes
- command lifecycle
- security requirements
- V0 endpoint set

### Out of scope for this document

- concrete vendor API credentials
- detailed D1 SQL schema
- individual connector implementation
- voice transport implementation
- frontend UI
- LLM prompt engineering
- vendor-specific OAuth flows

Those are separate implementation artifacts.

---

## 3. API Design Principles

KAEVOS API must be:

1. **Command-centered** — user intent is the primary abstraction.
2. **Explicit** — state and permissions are visible.
3. **Idempotent where appropriate** — retries must not accidentally duplicate consequential actions.
4. **Provider-agnostic** — callers do not need to know which LLM is active.
5. **Connector-agnostic** — callers request capabilities, not vendor internals.
6. **Auditable** — consequential actions generate traceable records.
7. **Verifiable** — completed does not automatically mean verified.
8. **Versioned** — breaking changes require a new API version.
9. **Secure by default** — secrets and sensitive data are never returned unnecessarily.
10. **Human-directed** — API automation must remain inside explicit permission boundaries.

---

## 4. Base URL

V0 uses:

    /v1

Example:

    POST /v1/commands

Production hostname is deployment-specific and must not be hard-coded into application logic.

---

## 5. Request Headers

### Required

    Content-Type: application/json

### Recommended

    Authorization: Bearer <token>

    X-Request-ID: <uuid>

### For retry-safe command creation

    Idempotency-Key: <unique-key>

The server should generate a request ID when the caller does not provide one.

Secrets must never appear in URLs, logs, or response bodies.

---

## 6. Response Envelope

Successful responses should use a consistent envelope.

Example:

    {
      "success": true,
      "data": {},
      "meta": {
        "request_id": "req_...",
        "timestamp": "2026-09-19T00:00:00.000Z"
      }
    }

Error responses:

    {
      "success": false,
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "The command is invalid.",
        "details": {}
      },
      "meta": {
        "request_id": "req_..."
      }
    }

The API must not expose internal stack traces in production.

---

## 7. Resource Model

Primary resources:

- Command
- Execution Run
- Connector
- Connector Test
- Audit Event

Conceptual relationships:

    Command
      └── Execution Run
            └── Connector Actions
                  └── Verification
                        └── Audit Events

---

# 8. POST /v1/commands

## Purpose

Submit a human command to KAEVOS.

Example request:

    POST /v1/commands

    {
      "input": {
        "type": "text",
        "text": "KAEVOS, cek revenue KAEVAX hari ini."
      },
      "context": {
        "scope": "KAEVAX"
      },
      "execution": {
        "mode": "auto"
      }
    }

### Input schema

    {
      "input": {
        "type": "text | voice_transcript",
        "text": "string"
      },
      "context": {
        "scope": "string?",
        "session_id": "string?",
        "locale": "string?"
      },
      "execution": {
        "mode": "auto | confirm | plan_only"
      }
    }

### Rules

- input.type is required.
- input.text is required and must be non-empty.
- maximum command size must be enforced.
- context is optional.
- execution.mode defaults to the safest applicable mode.
- caller cannot bypass permission policy by setting mode to auto.
- consequential actions may still transition to AWAITING_CONFIRMATION.

### Success response

HTTP 202 is preferred when execution is asynchronous.

    {
      "success": true,
      "data": {
        "command": {
          "id": "cmd_01...",
          "state": "RECEIVED",
          "input_type": "text"
        }
      },
      "meta": {
        "request_id": "req_01..."
      }
    }

### Why 202

The command may require:
- LLM processing
- context retrieval
- connector calls
- external APIs
- verification

The API must not assume all commands finish within one HTTP request.

---

# 9. GET /v1/commands/:id

## Purpose

Retrieve command state and result.

Example:

    GET /v1/commands/cmd_01...

Response:

    {
      "success": true,
      "data": {
        "command": {
          "id": "cmd_01...",
          "state": "COMPLETED",
          "intent": {
            "name": "RETRIEVE_REVENUE",
            "scope": "KAEVAX"
          },
          "result": {
            "status": "verified",
            "summary": "..."
          },
          "created_at": "...",
          "updated_at": "..."
        }
      },
      "meta": {
        "request_id": "req_..."
      }
    }

Sensitive provider prompts, credentials, tokens, and raw private connector payloads must not be returned by default.

---

# 10. POST /v1/commands/:id/confirm

## Purpose

Confirm a command that is waiting for human approval.

Example:

    POST /v1/commands/cmd_01.../confirm

    {
      "confirmation": true
    }

The confirmation must apply to the exact pending plan/version.

If the plan changes materially after confirmation, the confirmation becomes invalid and a new confirmation is required.

Success:

    {
      "success": true,
      "data": {
        "command_id": "cmd_01...",
        "state": "EXECUTING"
      },
      "meta": {
        "request_id": "req_..."
      }
    }

---

# 11. POST /v1/commands/:id/cancel

## Purpose

Request cancellation of a command.

Example:

    POST /v1/commands/cmd_01.../cancel

    {
      "reason": "User requested cancellation"
    }

Cancellation is best-effort once external execution has started.

KAEVOS must report whether cancellation was:

- accepted before execution
- cancelled successfully
- too late to prevent external execution
- unsupported by the external system

---

# 12. GET /v1/connectors

## Purpose

Discover available KAEVOS connector capabilities.

Example response:

    {
      "success": true,
      "data": {
        "connectors": [
          {
            "id": "github",
            "name": "GitHub",
            "status": "active",
            "capabilities": [
              "repository.read",
              "file.create"
            ]
          },
          {
            "id": "duitku",
            "name": "Duitku",
            "status": "pending_configuration",
            "capabilities": [
              "transactions.read"
            ]
          }
        ]
      },
      "meta": {
        "request_id": "req_..."
      }
    }

Possible connector states:

- active
- degraded
- unavailable
- pending_configuration
- disabled

Do not expose credentials or secret metadata.

---

# 13. GET /v1/connectors/:id

## Purpose

Retrieve one connector's operational metadata.

Example:

    GET /v1/connectors/duitku

Response should include:

- connector ID
- display name
- version
- state
- capabilities
- last health status
- supported operation classes

Do not expose:
- API keys
- tokens
- secret values
- internal credential locations

---

# 14. POST /v1/connectors/:id/test

## Purpose

Perform a controlled connector health/test operation.

Example:

    POST /v1/connectors/duitku/test

    {
      "operation": "health_check"
    }

Response:

    {
      "success": true,
      "data": {
        "connector_id": "duitku",
        "status": "healthy",
        "verified": true
      },
      "meta": {
        "request_id": "req_..."
      }
    }

Connector tests must be read-only unless a connector explicitly defines a safe test operation.

---

# 15. GET /v1/health

## Purpose

Return service health.

Example:

    GET /v1/health

Response:

    {
      "success": true,
      "data": {
        "status": "healthy",
        "service": "kaevos-api",
        "version": "0.1.0"
      },
      "meta": {
        "request_id": "req_..."
      }
    }

Health must not disclose secrets, environment values, or infrastructure internals.

---

# 16. GET /v1/audit

## Purpose

Retrieve authorized audit events.

Query parameters:

    ?command_id=cmd_...
    ?connector_id=duitku
    ?state=COMPLETED
    ?from=...
    ?to=...
    ?limit=50
    ?cursor=...

Example response:

    {
      "success": true,
      "data": {
        "events": [
          {
            "id": "aud_...",
            "command_id": "cmd_...",
            "connector_id": "duitku",
            "action": "transactions.read",
            "status": "completed",
            "verification": "verified",
            "created_at": "..."
          }
        ]
      },
      "meta": {
        "request_id": "req_...",
        "next_cursor": "..."
      }
    }

Audit responses must respect authorization and data-retention policies.

---

# 17. Command Object

Canonical command shape:

    {
      "id": "cmd_...",
      "state": "RECEIVED",
      "input": {
        "type": "text",
        "text": "..."
      },
      "intent": null,
      "plan": null,
      "execution": null,
      "result": null,
      "created_at": "...",
      "updated_at": "..."
    }

Intent is populated after understanding.

Plan is populated after planning.

Execution is populated after an execution run exists.

Result is populated after completion or failure.

Raw sensitive data should not be persisted automatically.

---

# 18. Intent Contract

Canonical intent shape:

    {
      "name": "RETRIEVE_REVENUE",
      "scope": "KAEVAX",
      "entities": {},
      "parameters": {},
      "confidence": 0.0,
      "requires_clarification": false
    }

Important:

LLM confidence is an internal signal, not authorization.

A high confidence score must never bypass permission controls.

---

# 19. Plan Contract

Canonical plan shape:

    {
      "plan_id": "plan_...",
      "version": 1,
      "steps": [
        {
          "step_id": "step_01",
          "capability": "duitku.transactions.read",
          "connector": "duitku",
          "operation": "transactions.read",
          "risk": "read_only"
        }
      ],
      "permission": {
        "required": false,
        "reason": null
      }
    }

The plan must be deterministic enough to audit.

Material plan changes require a new plan version.

---

# 20. Execution Contract

Canonical execution shape:

    {
      "run_id": "run_...",
      "state": "EXECUTING",
      "started_at": "...",
      "completed_at": null,
      "steps": [
        {
          "step_id": "step_01",
          "state": "COMPLETED",
          "external_reference": "..."
        }
      ]
    }

External references may be returned only when safe.

---

# 21. Verification Contract

Canonical result:

    {
      "status": "completed",
      "verification": {
        "status": "verified",
        "method": "follow_up_read",
        "checked_at": "..."
      }
    }

Allowed verification states:

- verified
- partially_verified
- unverified
- verification_failed
- not_applicable

The API must distinguish:

**COMPLETED ≠ VERIFIED**

---

# 22. Confirmation Contract

For consequential actions:

    {
      "confirmation_required": true,
      "confirmation": {
        "plan_id": "plan_...",
        "plan_version": 2,
        "expires_at": "...",
        "summary": "Publish the prepared product content to TikTok."
      }
    }

Confirmation must bind to the exact plan version.

A stale confirmation must not authorize a changed action.

---

# 23. Error Contract

Standard error codes:

- INVALID_REQUEST
- VALIDATION_ERROR
- AUTHENTICATION_ERROR
- AUTHORIZATION_ERROR
- NOT_FOUND
- CONFLICT
- IDEMPOTENCY_CONFLICT
- RATE_LIMITED
- COMMAND_INVALID
- COMMAND_AMBIGUOUS
- PLAN_FAILED
- PERMISSION_REQUIRED
- CONNECTOR_UNAVAILABLE
- CONNECTOR_AUTH_ERROR
- CONNECTOR_RATE_LIMITED
- CONNECTOR_ERROR
- EXECUTION_FAILED
- VERIFICATION_FAILED
- TIMEOUT
- INTERNAL_ERROR

Example:

    {
      "success": false,
      "error": {
        "code": "PERMISSION_REQUIRED",
        "message": "This action requires confirmation.",
        "details": {
          "command_id": "cmd_...",
          "plan_id": "plan_...",
          "plan_version": 1
        }
      },
      "meta": {
        "request_id": "req_..."
      }
    }

Error messages should be useful without revealing sensitive internals.

---

# 24. HTTP Status Mapping

Recommended mapping:

| HTTP | Usage |
|---|---|
| 200 | Successful read/result |
| 201 | Resource synchronously created |
| 202 | Command accepted for processing |
| 204 | Successful action with no response body |
| 400 | Invalid request |
| 401 | Authentication failure |
| 403 | Authorization failure |
| 404 | Resource not found |
| 409 | State/idempotency conflict |
| 422 | Semantically invalid request |
| 429 | Rate limited |
| 500 | Unexpected internal error |
| 502 | External dependency failure |
| 503 | Service/connector unavailable |
| 504 | External timeout |

The exact mapping can be refined during implementation tests.

---

# 25. Idempotency

Consequential command submission should support:

    Idempotency-Key: <unique-key>

If the same key is retried with the same request:

- return the original command/result where possible.

If the same key is reused with a materially different request:

- return IDEMPOTENCY_CONFLICT.

This protects against:
- browser retries
- network retries
- voice client retries
- duplicated frontend submissions
- transient gateway failures

Idempotency records must have a defined retention period.

---

# 26. Request Correlation

Every request receives:

    X-Request-ID

Every command receives:

    command_id

Every execution receives:

    run_id

Every plan receives:

    plan_id

Every audit event receives:

    audit_event_id

Traceability:

    request_id
        ↓
    command_id
        ↓
    plan_id
        ↓
    run_id
        ↓
    connector action
        ↓
    verification
        ↓
    audit event

---

# 27. Pagination

Collection endpoints use cursor pagination.

Example:

    GET /v1/audit?limit=50&cursor=...

Response:

    {
      "data": {
        "events": []
      },
      "meta": {
        "next_cursor": "..."
      }
    }

Maximum page size must be enforced server-side.

Clients must not rely on offset pagination for large operational histories.

---

# 28. Validation

Use runtime schemas at the API boundary.

Recommended implementation direction:

- Zod or an equivalent TypeScript schema validator

Validation must occur before:
- database writes
- LLM calls
- connector execution

Invalid external connector responses must also be validated before entering trusted internal state.

---

# 29. Authentication Boundary

V0 may begin with a controlled founder-only authentication mechanism.

The architecture must leave room for:

- API keys
- OAuth
- session tokens
- service-to-service authentication

Authentication identifies the caller.

Authorization determines what that caller may do.

These are separate concerns.

---

# 30. Permission Model

Authorization should evaluate at least:

    actor
    resource
    action
    connector
    risk_class
    policy
    confirmation

Example:

    actor: founder
    resource: duitku
    action: transactions.read
    connector: duitku
    risk_class: read_only
    policy: allowed
    confirmation: not_required

For:

    action: payment.create

the policy may require explicit confirmation or a preconfigured automation policy.

---

# 31. Rate Limiting

Rate limits should exist at:

- API caller
- command endpoint
- connector
- external provider

External provider limits must never be hidden from the orchestrator.

When rate limited:

- preserve command state;
- do not blindly retry dangerous actions;
- use bounded retry policy;
- return actionable status.

---

# 32. Timeouts and Retries

Every external call must have:

- timeout
- retry policy
- retry limit
- idempotency strategy where applicable
- failure classification

Do not automatically retry non-idempotent financial or destructive actions without an explicit safety strategy.

---

# 33. Async Execution

Commands that may exceed normal request duration should execute asynchronously.

Initial conceptual model:

    POST /v1/commands
           ↓
       202 Accepted
           ↓
       command_id
           ↓
       background execution
           ↓
       GET /v1/commands/:id

Cloudflare Queues may be introduced when V0 execution requirements justify asynchronous background processing.

V0 may use a simpler execution path for short, safe operations.

---

# 34. Voice Compatibility

Voice clients must submit normalized commands through the same endpoint:

    POST /v1/commands

Example:

    {
      "input": {
        "type": "voice_transcript",
        "text": "KAEVOS, cek Duitku hari ini."
      }
    }

This guarantees:

**Text and voice use the same intent, planning, permission, connector, execution, verification, and audit layers.**

---

# 35. Connector Capability Naming

Capabilities should use stable domain-style names.

Examples:

- github.repository.read
- github.file.create
- cloudflare.deployment.read
- duitku.transactions.read
- duitku.transaction.read
- tiktok.content.publish
- shopee.product.read

Vendor-specific operation details stay inside the connector.

The orchestrator selects capabilities, not raw URLs.

---

# 36. Connector Result Normalization

External systems may return different structures.

KAEVOS should normalize results into internal types.

Example normalized transaction:

    {
      "id": "external_...",
      "status": "PAID",
      "amount": 100000,
      "currency": "IDR",
      "occurred_at": "...",
      "source": "duitku"
    }

Connector-specific raw responses should remain isolated from the core domain model.

---

# 37. Security Rules for API Responses

Never return:

- API keys
- access tokens
- refresh tokens
- webhook secrets
- private credentials
- internal secret references
- raw authentication headers

Avoid returning unnecessary:
- personal data
- payment metadata
- private prompts
- internal infrastructure details

Sensitive information must be minimized according to the purpose of the request.

---

# 38. Audit Requirements

At minimum, audit:

- command submitted
- intent resolved
- plan created
- permission decision
- confirmation
- connector invocation
- external result classification
- verification
- final command result

Audit records should answer:

> Who asked?  
> What was understood?  
> What was planned?  
> What was allowed?  
> What was executed?  
> What happened?  
> What was verified?

---

# 39. Example End-to-End Flow

User:

> “KAEVOS, cek revenue KAEVAX hari ini.”

### Request

    POST /v1/commands

### Intent

    RETRIEVE_REVENUE

### Plan

    duitku.transactions.read

### Permission

    read_only → allowed

### Execution

    Duitku connector retrieves authorized transaction records.

### Verification

    Response validated and transaction data normalized.

### Result

    “Revenue KAEVAX hari ini: RpX.XXX.XXX dari Y transaksi.”

### Audit

    Full trace stored without storing secrets.

This is the first practical expression of the KAEVOS operating gateway.

---

# 40. V0 API Implementation Checklist

- [ ] Hono application initialized
- [ ] /v1 route group
- [ ] request ID middleware
- [ ] authentication middleware
- [ ] schema validation
- [ ] POST /v1/commands
- [ ] GET /v1/commands/:id
- [ ] POST /v1/commands/:id/confirm
- [ ] POST /v1/commands/:id/cancel
- [ ] GET /v1/connectors
- [ ] GET /v1/connectors/:id
- [ ] POST /v1/connectors/:id/test
- [ ] GET /v1/health
- [ ] GET /v1/audit
- [ ] standardized response envelope
- [ ] standardized error envelope
- [ ] idempotency support
- [ ] D1 persistence
- [ ] audit persistence
- [ ] mock connector
- [ ] Gemini provider adapter
- [ ] integration tests
- [ ] security tests

---

# 41. API Contract Invariants

1. Breaking changes require a new API version.
2. All command execution passes through the orchestrator.
3. No endpoint may directly bypass permission policy.
4. Connector credentials never enter API responses.
5. LLM providers are hidden behind provider contracts.
6. Connector implementations are hidden behind connector contracts.
7. Consequential actions remain auditable.
8. Confirmation binds to an exact plan version.
9. Idempotency protects retry-sensitive commands.
10. Completed and verified remain distinct states.
11. Voice uses the same command API.
12. KAEVOS remains the single operating gateway.

---

# 42. Definition of Done

This API contract is implementation-ready when:

- [x] API versioning defined
- [x] response envelope defined
- [x] command resource defined
- [x] command lifecycle endpoints defined
- [x] connector endpoints defined
- [x] health endpoint defined
- [x] audit endpoint defined
- [x] intent contract defined
- [x] plan contract defined
- [x] execution contract defined
- [x] verification contract defined
- [x] confirmation contract defined
- [x] error taxonomy defined
- [x] HTTP status mapping defined
- [x] idempotency defined
- [x] request correlation defined
- [x] pagination defined
- [x] authentication/authorization boundary defined
- [x] security response rules defined
- [x] voice compatibility defined
- [ ] concrete D1 schema
- [ ] connector TypeScript interfaces
- [ ] automated contract tests
- [ ] deployment configuration

---

# 43. Next Documents

After this API contract:

1. **36_KAEVOS_DATA_MODEL_AND_D1_SCHEMA.md**
2. **37_KAEVOS_CONNECTOR_FABRIC_SPECIFICATION.md**
3. **38_KAEVOS_SECURITY_SECRETS_AND_PERMISSION_ARCHITECTURE.md**
4. **39_KAEVOS_EXECUTION_VERIFICATION_AND_AUDIT_SPEC.md**
5. **40_KAEVOS_TESTING_AND_VALIDATION_SPEC.md**
6. **41_KAEVOS_CLOUDFLARE_DEPLOYMENT_AND_ENV_SPEC.md**
7. **42_KAEVOS_EXTERNAL_PROVIDER_STACK_MATRIX.md**
8. **43_KAEVOS_GENSPARK_IMPLEMENTATION_PROMPT.md**

---

## Final Contract Principle

The KAEVOS API should make this possible:

> **“KAEVOS, do this.”**

without requiring the caller to know:
- which LLM is active;
- which connector is used;
- where the external API lives;
- how the vendor authentication works;
- how execution is orchestrated.

The caller expresses intent.

KAEVOS handles coordination.

External platforms handle domain execution.

Verification establishes what actually happened.

Audit preserves the operational history.

> **One command surface. Many capabilities. Explicit permission. Verified execution.**

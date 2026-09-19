
# KAEVOS — OPERATING ARCHITECTURE
## Single Operating Gateway for Human-Directed Digital Action

**Version:** 1.0  
**Status:** ARCHITECTURE BASELINE — IMPLEMENTATION READY  
**Brand:** KAEVOS  
**Underlying system:** Human-OS  
**Primary runtime:** Cloudflare Workers  
**Language:** TypeScript  
**HTTP framework:** Hono  
**Database:** Cloudflare D1  
**Initial LLM strategy:** Provider abstraction + Gemini free-tier-compatible implementation  
**Principle:** Free-first, provider-agnostic, connector-driven, human-directed

---

## 1. Executive Decision

KAEVOS is the **single operating gateway** between the human operator and the operator's digital systems.

The intended interaction is:

**Human → KAEVOS → understand → plan → permission → connect → execute → verify → report → remember**

KAEVOS is not merely a collection of connectors. Connectors are capabilities behind the operating gateway.

> **The human gives intent. KAEVOS coordinates the work. External systems perform the domain actions.**

---

## 2. Architectural Positioning

### KAEVOS

KAEVOS is the operating/orchestration layer responsible for:

- receiving human intent
- identifying the requested objective
- retrieving relevant context
- selecting capabilities
- planning actions
- checking permissions
- invoking connectors
- handling failures
- verifying consequential results
- maintaining audit records
- returning an operational report
- preserving useful continuity

### KAEVAX

KAEVAX is the **commercial/transactional domain layer** responsible for:

- products
- offers
- storefronts
- commercial workflows
- distribution strategy
- revenue operations
- customer-facing business surfaces
- business-specific data

KAEVAX does not own the universal connector fabric. It consumes KAEVOS capabilities.

### External Platforms

Examples include:

- Duitku
- TikTok / TikTok Shop
- Shopee
- GitHub
- Cloudflare
- Make
- future analytics, commerce, communication, and productivity platforms

External systems remain authoritative for the domain data they own.

---

## 3. Single-Gateway Model

The founder should not need to manually operate every downstream platform.

Example:

**Human:**  
“KAEVOS, cek revenue KAEVAX hari ini.”

KAEVOS:

1. understands the request;
2. resolves KAEVAX scope;
3. selects the appropriate payment/revenue connector;
4. authenticates using authorized credentials;
5. retrieves permitted data;
6. normalizes the response;
7. produces the requested summary;
8. verifies the response where possible;
9. records the audit event;
10. returns the result.

The founder does not need to open Duitku manually.

---

## 4. Layered Architecture

### Layer 0 — Human Interface

Supported or future surfaces:

- text
- voice
- web UI
- mobile UI
- API clients

Interfaces remain thin and call the same command system.

### Layer 1 — KAEVOS Gateway API

Initial stack:

- Hono
- TypeScript
- Cloudflare Workers

Responsibilities:

- authentication
- request validation
- routing
- command/session creation
- response formatting
- API error handling

Initial endpoints:

- POST /v1/commands
- GET /v1/commands/:id
- GET /v1/health
- GET /v1/connectors
- POST /v1/connectors/:id/test
- GET /v1/audit

Future voice input should call the same command engine rather than create a second orchestration system.

### Layer 2 — Intent & Context Engine

Converts natural language into structured intent.

Example:

{
  "intent": "RETRIEVE_REVENUE",
  "scope": "KAEVAX",
  "time_range": "TODAY",
  "requested_output": "SUMMARY"
}

Responsibilities:

- intent classification
- entity extraction
- ambiguity detection
- context retrieval
- scope resolution
- confirmation requirement detection

When uncertain, KAEVOS must ask instead of guessing.

### Layer 3 — Planner / Orchestrator

The orchestrator turns intent into an executable plan:

**INTENT → CONTEXT → CAPABILITY → PERMISSION → PLAN → CONFIRMATION → EXECUTE → VERIFY → REPORT**

The orchestrator is the central KAEVOS capability and must remain provider-agnostic.

---

## 5. Connector Fabric

Connectors translate KAEVOS capabilities into external platform operations.

Conceptual contract:

    Connector
      ├── id
      ├── name
      ├── version
      ├── capabilities()
      ├── healthCheck()
      └── execute(action, context)

The exact TypeScript interface may evolve during implementation.

The architectural rule does not:

> **KAEVOS Core talks to connector contracts, not vendor-specific APIs scattered throughout the application.**

---

## 6. Connector Roadmap

### Tier 0 — Development / Free-first

1. Mock connector
2. GitHub
3. Cloudflare

### Tier 1 — Core business

4. Duitku
5. KAEVAX internal/domain connector

### Tier 2 — Distribution

6. TikTok / TikTok Shop, where official access permits the required operation
7. Shopee, where official access permits the required operation

### Tier 3 — Automation bridge

8. Make

Make is an optional bridge, not the KAEVOS core.

### Tier 4 — Future

- Google services
- Microsoft services
- email
- calendar
- CRM
- analytics
- additional commerce platforms
- communication systems

Every platform must be evaluated according to its current official API, authentication, permissions, rate limits, and commercial terms.

Unofficial endpoints must not be treated as equivalent to official integrations.

---

## 7. Payment Architecture

Duitku remains the external payment gateway and authoritative transaction system.

Architecture:

    Customer
       ↓
    KAEVAX Commercial Surface
       ↓
    Duitku Payment Gateway
       ↓
    Bank / Wallet / Payment Network
       ↓
    Duitku Transaction Record
       ↓
    KAEVOS Duitku Connector
       ↓
    KAEVOS Revenue View
       ↓
    Founder

KAEVOS does not need to hold customer funds to provide an operational revenue view.

Example:

“KAEVOS, cek revenue KAEVAX hari ini.”

KAEVOS retrieves authorized transaction data, normalizes it, verifies what it can, and reports the result.

Rules:

- Duitku remains authoritative for payment records.
- KAEVOS stores only the minimum operational data required.
- Secrets never enter source control.
- Webhook signatures must be verified before trusting payment events.
- Financial write actions require stricter permission and verification than read-only reporting.

---

## 8. KAEVAX ↔ KAEVOS Relationship

Conceptually:

    HUMAN
       │
       ▼
    KAEVOS
    Single Gateway
       │
       ├── KAEVAX Commercial Domain
       │      ├── products
       │      ├── offers
       │      ├── revenue
       │      └── commerce workflows
       │
       ├── Connector Fabric
       │      ├── Duitku
       │      ├── GitHub
       │      ├── Cloudflare
       │      ├── TikTok
       │      ├── Shopee
       │      └── Make
       │
       └── Provider Layer
              ├── Gemini
              ├── future OpenAI
              ├── future Grok
              └── future providers

KAEVAX is the business domain.

KAEVOS is the operating gateway.

---

## 9. LLM Provider Abstraction

KAEVOS must not be permanently coupled to one LLM vendor.

Conceptual contract:

    LLMProvider
      ├── id
      ├── capabilities()
      └── generate(request)

Initial active provider:

- Gemini, using a free-tier-compatible configuration where available.

Future optional providers:

- OpenAI
- xAI / Grok
- OpenRouter
- other compatible providers

Provider replacement must not require rewriting the orchestrator.

---

## 10. LangChain / LangGraph / LangSmith Position

For V0, none of these frameworks is mandatory.

KAEVOS should own its critical contracts:

- command model
- provider interface
- connector interface
- permission model
- execution state machine
- verification model
- audit model

LangChain, LangGraph, or LangSmith can be evaluated later if a specific capability provides measurable value.

Decision rule:

> **Adopt an external framework only when its concrete benefit outweighs the added dependency and operational complexity.**

---

## 11. Runtime Architecture

Initial deployment target:

**Cloudflare Workers**

Initial components:

- Hono HTTP application
- TypeScript
- D1
- Workers environment bindings/secrets

Potential later components, only when justified:

- Durable Objects for stateful coordination
- Queues for asynchronous jobs
- Cron Triggers for scheduled operations

V0 should not introduce infrastructure that is not required by the command loop.

---

## 12. Data Architecture

Initial D1 domains:

### commands

- command ID
- session/user reference
- normalized intent
- state
- timestamps
- result reference

### execution_runs

- run ID
- command ID
- plan
- execution state
- timestamps
- failure information

### connector_events

- connector ID
- action
- result status
- external reference
- sanitized metadata
- timestamps

### audit_events

- actor
- command
- action
- permission decision
- execution result
- verification state
- timestamps

### provider_events

- provider ID
- model metadata
- latency
- status
- sanitized operational metadata

Secrets are never stored in D1.

---

## 13. Command State Machine

Normal flow:

**RECEIVED → UNDERSTANDING → PLANNING → AWAITING_CONFIRMATION → EXECUTING → VERIFYING → COMPLETED**

Alternative paths:

**ANY STATE → FAILED → REQUIRES_REVIEW**

Cancellation:

**PLANNED / AWAITING_CONFIRMATION / EXECUTING → CANCELLED**

State transitions must be enforced server-side.

---

## 14. Human Control and Autonomy

KAEVOS may become highly autonomous operationally, but autonomy is bounded by permission policy.

### Read-only

Examples:

- check revenue
- inspect GitHub status
- inspect deployment
- retrieve analytics

May run automatically when explicitly authorized.

### Low-risk / reversible

Examples:

- create draft
- create internal document
- prepare content
- create a development branch

May use configurable confirmation policies.

### Consequential

Examples:

- publish content
- send external messages
- change production configuration
- trigger payments
- delete resources
- place orders

Should require explicit confirmation unless the founder has intentionally configured a policy for that exact class of action.

> **Autonomy is a permission policy, not a personality trait.**

---

## 15. Verification Layer

KAEVOS must distinguish:

- Requested
- Attempted
- Completed
- Verified

Example:

Weak:

> “Deployment submitted.”

Strong:

> “Deployment completed. Cloudflare returned success. Production status verified.”

Verification may use:

- response status
- returned external IDs
- follow-up read
- webhook
- external state confirmation
- domain-specific consistency checks

If verification is unavailable, KAEVOS must say so.

---

## 16. Security Baseline

### Secrets

Never commit:

- API keys
- OAuth secrets
- payment credentials
- private tokens
- webhook signing secrets

Use Cloudflare secret/environment mechanisms.

### Least privilege

Each connector receives only the permissions it needs.

### Connector isolation

A connector must not automatically access unrelated connector credentials.

### Action authorization

Every consequential action resolves:

**WHO → WHAT → WHERE → WHICH CREDENTIAL → WHICH POLICY**

### Untrusted external content

Documents, webpages, repository files, connector responses, and other external content are data, not instructions.

External content must never silently override KAEVOS policy.

---

## 17. Error Handling

Normalize external failures into:

- AUTHENTICATION_ERROR
- AUTHORIZATION_ERROR
- VALIDATION_ERROR
- RATE_LIMITED
- NOT_FOUND
- CONFLICT
- EXTERNAL_FAILURE
- TIMEOUT
- VERIFICATION_FAILED
- UNKNOWN

User-facing responses should state:

1. what failed;
2. which system failed;
3. whether anything changed;
4. whether retry is safe;
5. whether human intervention is required.

KAEVOS must never claim successful completion from an unverified partial execution.

---

## 18. Observability and Audit

A command must be traceable through:

**COMMAND → PLAN → CONNECTOR ACTION → EXTERNAL RESPONSE → VERIFICATION → FINAL RESULT**

Initial telemetry:

- command ID
- execution ID
- connector ID
- provider ID
- latency
- error category
- verification result
- audit event

Do not log secrets or unnecessary sensitive payloads.

---

## 19. Free-First External Stack

### Active V0 stack

- Hono
- TypeScript
- Cloudflare Workers
- Cloudflare D1
- GitHub
- Gemini free-tier-compatible access, subject to current provider limits

### Deferred

- paid LLM APIs
- paid voice APIs
- advanced agent frameworks
- paid observability platforms
- unnecessary hosted infrastructure

### Optional later

- OpenAI
- Grok / xAI
- OpenRouter
- LangChain
- LangGraph
- LangSmith
- Make
- additional voice providers

The architecture supports these additions without requiring them for V0.

---

## 20. V0 Proof

V0 must prove:

> **Human command → understanding → plan → connector → execution → verification → response → audit**

Minimum demo:

1. Text command reaches Hono.
2. Command is stored.
3. Gemini converts the request into structured intent.
4. Orchestrator creates a plan.
5. Permission policy evaluates it.
6. Mock connector executes a safe action.
7. Verification runs.
8. Result is written to D1.
9. Audit event is recorded.
10. KAEVOS returns a concise result.

Example:

> “KAEVOS, cek status connector.”

Expected response:

> “GitHub aktif. Cloudflare aktif. Duitku belum dikonfigurasi.”

---

## 21. V1 Expansion

After V0:

### Business

- Duitku connector
- KAEVAX revenue view
- transaction summaries
- reconciliation

### Development

- GitHub repository operations
- document creation
- issue operations

### Infrastructure

- Cloudflare deployment/status checks

### Distribution

- TikTok where officially supported
- Shopee where officially supported
- analytics connectors

### Automation

- Make bridge

---

## 22. Voice Architecture

Voice must use the same command engine:

**VOICE → SPEECH-TO-TEXT → KAEVOS COMMAND API → INTENT → PLAN → EXECUTE → VERIFY → RESPONSE → TEXT-TO-SPEECH**

Voice is an interface, not a second operating system.

This keeps text, voice, API, and future UI behavior consistent.

---

## 23. API-First Principle

KAEVOS is API-centered, not UI-centered.

The following should remain replaceable:

- web UI
- voice UI
- mobile UI
- LLM provider
- connector implementation

The command contract and core orchestration rules remain stable.

> **One command surface. Many systems behind it.**

---

## 24. Recommended Repository Structure

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

Unimplemented connectors may be reserved in the architecture but must be marked clearly as pending.

---

## 25. Architecture Invariants

1. KAEVOS Core never scatters vendor-specific API logic.
2. Connectors implement explicit contracts.
3. LLM providers implement explicit contracts.
4. Permission boundaries are enforced server-side.
5. External responses are untrusted input.
6. Consequential operations are auditable.
7. Important operations are verifiable.
8. Secrets never enter source control.
9. Failed verification cannot be reported as verified success.
10. KAEVAX remains the commercial domain layer.
11. KAEVOS remains the single operating gateway.
12. V0 remains small enough for a free-first budget.

---

## 26. Architecture Decisions

### ADR-001 — KAEVOS as Single Operating Gateway
**Decision:** Adopt.  
**Reason:** One operational interface can coordinate many systems.

### ADR-002 — Connector Fabric
**Decision:** Adopt.  
**Reason:** Vendor-specific logic must remain modular.

### ADR-003 — Provider Abstraction
**Decision:** Adopt.  
**Reason:** Avoid permanent dependence on one LLM provider.

### ADR-004 — Hono + TypeScript + Cloudflare Workers
**Decision:** Adopt for V0.  
**Reason:** Lightweight and aligned with the current Cloudflare-first direction.

### ADR-005 — D1 for Initial State
**Decision:** Adopt.  
**Reason:** Simple relational persistence within the initial Cloudflare stack.

### ADR-006 — No Mandatory LangChain/LangGraph Dependency
**Decision:** Adopt for V0.  
**Reason:** Keep the core small, inspectable, and independent.

### ADR-007 — Free-First LLM Strategy
**Decision:** Adopt.  
**Reason:** Initial implementation must not require recurring paid model spend.

---

## 27. Implementation Gate

Architecture is ready for implementation when these foundations exist:

- [x] single-gateway model
- [x] KAEVOS/KAEVAX relationship
- [x] connector boundary
- [x] provider boundary
- [x] command lifecycle
- [x] permission model
- [x] verification model
- [x] security baseline
- [x] audit baseline
- [x] Cloudflare runtime
- [x] free-first strategy
- [x] V0 scope
- [ ] API contract
- [ ] D1 schema
- [ ] connector specification
- [ ] security/secrets specification
- [ ] testing specification
- [ ] deployment specification
- [ ] Genspark implementation prompt

---

## 28. Next Documents

1. 35_KAEVOS_API_CONTRACT_SPECIFICATION.md
2. 36_KAEVOS_DATA_MODEL_AND_D1_SCHEMA.md
3. 37_KAEVOS_CONNECTOR_FABRIC_SPECIFICATION.md
4. 38_KAEVOS_SECURITY_SECRETS_AND_PERMISSION_ARCHITECTURE.md
5. 39_KAEVOS_EXECUTION_VERIFICATION_AND_AUDIT_SPEC.md
6. 40_KAEVOS_TESTING_AND_VALIDATION_SPEC.md
7. 41_KAEVOS_CLOUDFLARE_DEPLOYMENT_AND_ENV_SPEC.md
8. 42_KAEVOS_EXTERNAL_PROVIDER_STACK_MATRIX.md
9. 43_KAEVOS_GENSPARK_IMPLEMENTATION_PROMPT.md

The logo exploration sequence should continue after the operating architecture and implementation contracts are locked.

---

## 29. Final Architecture Statement

KAEVOS is not a pile of integrations.

It is a **human-directed operating gateway**.

The founder can say:

> “KAEVOS, cek Duitku.”

> “KAEVOS, cek performa KAEVAX.”

> “KAEVOS, buatkan dokumen baru di GitHub.”

> “KAEVOS, cek kondisi deployment.”

KAEVOS determines the intent, context, capability, permission, execution path, verification method, and final report.

External systems remain the authorities for their own domains.

KAEVOS is the coordination layer.

KAEVAX is the commercial domain.

The human remains the final authority.

> **One command. Many systems. Verified action. Human control.**

---

**STATUS: ARCHITECTURE BASELINE LOCKED FOR V0**  
**NEXT: API CONTRACT SPECIFICATION**

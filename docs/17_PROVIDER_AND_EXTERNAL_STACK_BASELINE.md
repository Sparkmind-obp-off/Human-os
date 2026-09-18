# Human OS — Provider, Connector & Free Stack Baseline

Status: **MVP baseline — Cloudflare-first / cost-minimized**
Date: 2026-09-18

## 1. Decision

Human OS will use a **Cloudflare-first free stack** as its infrastructure foundation.

The core rule is:

> Use the strongest genuinely usable free capability first, keep every external dependency behind a connector/provider contract, and never allow an external provider to silently create paid usage.

This document replaces the previous broad multi-provider baseline.

### Important terminology

When this document says **Cloudflare-first**, it means Cloudflare is the default infrastructure layer.

It does **not** mean every capability must come from Cloudflare.

For capabilities that Cloudflare Free does not natively provide at the required quality — especially realtime multimodal AI/voice and user productivity integrations — Human OS uses an external official API through the connector layer.

---

## 2. Target free stack

| Layer | Primary | Free posture | Role |
|---|---|---|---|
| Web / frontend | Cloudflare Pages / Workers Static Assets | Free | Human OS web UI |
| API / backend | Cloudflare Workers | Free | API, orchestration, auth boundary |
| Relational database | Cloudflare D1 | Free | Core application state |
| Stateful realtime coordination | Cloudflare Durable Objects | Free tier | Sessions, coordination, realtime state when needed |
| Object storage | Cloudflare R2 | Free allowance | Files, artifacts, audio and exports |
| Fast cache/config | Cloudflare KV | Free allowance | Cache, lightweight configuration |
| Edge AI | Cloudflare Workers AI | Free allocation | Classification, lightweight inference, fallback |
| AI routing/observability | Cloudflare AI Gateway | Free core features | Routing, analytics, caching and controls |
| Background execution | Cloudflare Workflows | Free allowance | Durable multi-step jobs where required |
| Realtime AI voice | Google Gemini Live API | **Free Tier for selected Live models; quota/terms must be verified** | Primary realtime voice/AI |
| Productivity connectors | Google Workspace APIs | Standard API quotas | Calendar, Gmail, Drive, Sheets, Docs, Tasks |
| Source/control connector | GitHub API | API access subject to GitHub limits | Repository and development actions |
| Interoperability | MCP | Open protocol | Standard connector interface |

Cloudflare Free limits are real limits, not unlimited service. Current official documentation lists Workers Free at 100,000 requests/day, D1 at 5 million row reads/day and 100,000 row writes/day, KV at 100,000 reads/day and 1,000 writes/day, R2 at 10 GB-month plus request allowances, and Durable Objects at 100,000 requests/day with SQLite-backed storage on Free.

---

## 3. Architecture

Human OS is divided into three layers:

```
┌─────────────────────────────────────────────┐
│                 HUMAN OS CORE               │
│ Sense → Understand → Plan → Act → Verify   │
│                 → Remember → Reflect        │
└──────────────────────┬──────────────────────┘
                       │
              Provider / Connector Contract
                       │
        ┌──────────────┼────────────────┐
        │              │                │
   Cloudflare      External APIs       MCP
   Services        / Services          Servers
        │              │                │
   Workers/D1/     Gemini/Google      Tools/
   R2/KV/DO/AI     Workspace/GitHub   Resources
   Gateway/AI
```

The core must never directly depend on a provider SDK.

---

## 4. Cloudflare-first infrastructure

### 4.1 Cloudflare Workers — backend

Use Workers as the default backend/runtime.

Free baseline:

- 100,000 requests/day
- 10 ms CPU time/invocation
- 128 MB memory
- 50 subrequests/request
- 64 environment variables/secrets per Worker

The system must treat the daily request quota as a hard operational boundary.

### 4.2 Cloudflare Pages / Static Assets — frontend

Use Cloudflare for the frontend and static delivery.

Pages Functions are treated as Workers for billing/quota purposes, so the architecture should avoid unnecessarily moving frontend work into server-side Functions.

### 4.3 Cloudflare D1 — primary database

D1 is the default relational store for MVP.

Free baseline:

- 5 million rows read/day
- 100,000 rows written/day
- 5 GB stored data

Since September 1, 2026, Free-plan D1 queries fail after the daily row-read or row-write limit is exceeded until reset. Human OS therefore requires indexes, bounded queries, pagination and quota-aware error handling.

Primary data:

- users
- sessions
- conversations
- tasks
- memories
- connector accounts
- connector permissions
- actions
- approvals
- executions
- audit events
- provider usage records

### 4.4 Cloudflare Durable Objects — stateful sessions

Use Durable Objects only when Human OS needs strong per-session coordination or realtime state.

Free currently supports SQLite-backed Durable Objects. Do not introduce Durable Objects merely because they exist.

### 4.5 Cloudflare R2 — artifacts

Use R2 for:

- uploaded files
- generated documents
- audio artifacts
- exports
- large binary objects

### 4.6 Cloudflare KV — cache/config

Use KV for:

- short-lived cache
- feature flags
- non-critical configuration
- provider metadata cache

Do not use KV as the primary relational database.

### 4.7 Cloudflare Workers AI — optional edge model

Workers AI is an **optional supporting model layer**, not the primary realtime voice engine.

Use it for lightweight/fallback workloads where the selected model and workload fit the Free allocation.

Do not assume Workers AI replaces Gemini Live for Human OS realtime voice.

### 4.8 Cloudflare AI Gateway

Use AI Gateway as the common AI traffic observability/routing boundary where supported.

Responsibilities:

- model request visibility
- caching where appropriate
- rate control
- provider routing
- usage visibility

---

## 5. AI and voice strategy

### 5.1 Primary realtime voice: Gemini Live

Gemini Live is the first external realtime AI/voice provider.

Current Google documentation lists selected Gemini Live models in the Free Tier, with free input/output for the listed Live models. The Live API supports low-latency audio-to-audio interaction.

This makes Gemini Live the correct **MVP voice experiment** for Human OS under the current cost-first strategy.

However, Free Tier does **not** mean unlimited or permanently free production capacity. Before production, Human OS must verify:

- exact model and current model status
- account/project eligibility
- current RPM/TPM/session quotas
- current data-use terms
- commercial/product-use terms
- whether the intended workload remains inside Free Tier
- verification date

Google also documents that Live sessions are billed based on token usage on paid usage tiers and that accumulated session context can compound usage. Therefore Human OS must cap session duration/context and enforce quota-aware shutdown/fallback.

### 5.2 Why ElevenLabs is NOT the primary MVP voice provider

ElevenLabs remains an **optional future voice provider**, not the baseline.

Reason:

- ElevenLabs currently has a Free plan with 10,000 credits/month.
- The current pricing page lists **Commercial License under the Starter paid plan**, not the Free plan.
- Therefore the Free plan is useful for experimentation, but it is not the clean default for a production/commercial Human OS deployment.

So:

```
MVP / validation
    ↓
Gemini Live Free Tier
    ↓
verify quota + terms
    ↓
production decision

Optional later:
ElevenLabs / other voice provider
    ↓
only when commercial license,
quality, latency, or product requirements justify it
```

If ElevenLabs is ever introduced, it must sit behind the same `VoiceProvider` contract:

```
VoiceProvider
├── GeminiLiveProvider
├── ElevenLabsProvider (optional)
├── OptionalFallbackProvider
└── FutureProvider
```

The Human OS core sees only:

```
startSession()
sendInput()
receiveEvent()
interrupt()
endSession()
```

No Gemini- or ElevenLabs-specific objects may leak into the core domain.

### 5.3 Voice architecture decision

Human OS does **not** need ElevenLabs to start.

The MVP voice path is:

```
User microphone
      ↓
Human OS voice session
      ↓
Gemini Live connector
      ↓
Realtime model
      ↓
Audio response
      ↓
User
```

Cloudflare remains the application/infrastructure layer around that voice session:

```
Cloudflare Workers
      ↓
Human OS Core
      ↓
VoiceProvider Contract
      ↓
Gemini Live
```

If Gemini Live later becomes unsuitable because of quota, commercial terms, quality, latency, regional availability, or cost, the provider can be swapped without redesigning Human OS Core.

---

## 6. Connector catalog

Human OS will start with a small connector catalog instead of building dozens of integrations.

### Tier A — MVP connectors

#### 1. Google Calendar

Capabilities:

- list calendars
- read events
- create event
- update event
- delete/cancel event

Auth:

- Google OAuth 2.0

Contract:

```
CalendarConnector
├── listCalendars()
├── listEvents()
├── createEvent()
├── updateEvent()
└── deleteEvent()
```

#### 2. Gmail

Capabilities:

- search mail
- read message/thread
- send mail
- archive/label where permitted

Auth:

- Google OAuth 2.0

Contract:

```
MailConnector
├── search()
├── getThread()
├── send()
├── archive()
└── label()
```

#### 3. Google Drive

Capabilities:

- search files
- read metadata
- download/read supported files
- create/upload files
- organize files

Contract:

```
FileConnector
├── search()
├── get()
├── read()
├── create()
└── move()
```

#### 4. Google Sheets

Capabilities:

- read ranges
- write ranges
- append rows
- update cells

Contract:

```
TableConnector
├── readRange()
├── writeRange()
├── appendRows()
└── updateCells()
```

#### 5. Google Docs

Capabilities:

- create document
- read document
- append/update content
- generate structured documents

Contract:

```
DocumentConnector
├── create()
├── read()
├── append()
└── update()
```

#### 6. Google Tasks

Capabilities:

- list tasks
- create task
- update task
- complete task

Contract:

```
TaskConnector
├── list()
├── create()
├── update()
└── complete()
```

#### 7. GitHub

Capabilities:

- inspect repositories
- read files
- create/update files
- create issues/PRs where authorized
- inspect workflow state

Contract:

```
CodeConnector
├── repositories()
├── readFile()
├── writeFile()
├── createIssue()
├── createPullRequest()
└── workflowStatus()
```

---

## 7. MCP connector layer

MCP is the standard interoperability boundary.

Human OS should expose a normalized internal connector contract and optionally map it to MCP.

```
Human OS Action
      ↓
Connector Contract
      ↓
MCP Adapter
      ↓
MCP Server
      ↓
External Service
```

MCP must not become a hard dependency for every operation.

Preferred order:

1. Official direct API
2. Official MCP
3. Trusted MCP server
4. Webhook/automation
5. Browser automation only when necessary

Direct API is preferred when it gives better control over:

- permissions
- quotas
- error handling
- auditability
- cost protection

---

## 8. Connector security contract

Every connector must declare:

```
ConnectorManifest
├── id
├── provider
├── capabilities[]
├── authType
├── requiredScopes[]
├── dataClasses[]
├── readActions[]
├── writeActions[]
├── destructiveActions[]
├── quota
├── billingRisk
├── fallback
└── lastVerifiedAt
```

Rules:

1. Least-privilege scopes.
2. Credentials never enter source code.
3. Secrets stay in Cloudflare secrets/environment bindings.
4. Connector tokens are encrypted/secured at rest.
5. Destructive actions require explicit authorization where appropriate.
6. Every external write produces an audit event.
7. Every provider reports quota/billing state when available.
8. Provider failure must not corrupt Human OS state.
9. No connector may silently upgrade a user into paid usage.
10. Provider-specific SDK types stay inside the adapter boundary.

---

## 9. Cost guardrail

The default state is:

> **No unexpected billing.**

Each provider record must contain:

- provider
- capability
- plan
- free allocation
- usage
- remaining allocation
- rate limit
- billing trigger
- billing risk
- auth method
- fallback
- last verified date

When a free quota is exhausted:

```
Detect quota risk
      ↓
Stop risky operation
      ↓
Return safe failure
      ↓
Ask for authorization OR use approved fallback
```

Do not automatically upgrade plans.

---

## 10. Free-stack boundaries

"Free stack" means:

**Use only documented free allocations for MVP.**

It does not mean:

- unlimited traffic
- unlimited AI
- unlimited storage
- unlimited connector calls
- guaranteed permanent free pricing
- unrestricted commercial rights

The application must therefore be designed to degrade gracefully.

---

## 11. What is NOT in the MVP

Do not add these merely for completeness:

- OpenAI API
- Anthropic API
- multiple paid TTS providers
- Neon/Postgres
- Redis
- Supabase
- Firebase
- large automation platforms
- dozens of MCP servers
- browser automation as a default transport
- multiple cloud providers

ElevenLabs is intentionally **not** an MVP dependency. It remains an optional adapter.

Neon may be introduced later if D1 becomes a concrete technical constraint. A second cloud provider may be introduced only when a measurable requirement justifies it.

---

## 12. Recommended MVP topology

```
                        ┌─────────────────────┐
                        │      Human OS UI    │
                        │ Cloudflare Pages    │
                        └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │ Cloudflare Workers  │
                        │ API / Core / Auth   │
                        └───────┬─────┬───────┘
                                │     │
                 ┌──────────────┘     └─────────────────┐
                 ▼                                        ▼
        ┌─────────────────┐                    ┌─────────────────┐
        │ D1              │                    │ Connector Layer │
        │ Core State      │                    │ API / MCP       │
        └─────────────────┘                    └───────┬─────────┘
                                                       │
                       ┌────────────────────────────────┼────────────────┐
                       ▼                ▼               ▼                ▼
                  Gemini Live       Google          GitHub          Future
                                    Workspace                         adapters

                 Optional Cloudflare services:
                 R2 / KV / Durable Objects / Workers AI
                 / AI Gateway / Workflows
```

---

## 13. Implementation order

### Phase 0 — External stack validation

Validate only the components that can block the MVP:

1. Cloudflare account
2. Worker deployment
3. D1 database
4. R2 bucket
5. KV namespace
6. Durable Object only if session coordination requires it
7. Workers AI availability
8. AI Gateway
9. **Gemini Live access + actual Free Tier voice test**
10. Google OAuth
11. Calendar read
12. Gmail read
13. Drive read
14. GitHub read
15. **Commercial/data-use/terms check for Gemini Live**
16. **Record actual quotas and observed limits**

ElevenLabs is **not a Phase 0 blocker**. It is only validated later if Gemini Live fails the MVP acceptance criteria.

Record actual results in the repository.

### Phase 1 — Core vertical slice

Build:

```
Voice
  ↓
Gemini Live
  ↓
Human OS Core
  ↓
Intent
  ↓
Plan
  ↓
Connector
  ↓
Action
  ↓
Verify
  ↓
Remember
```

Initial action examples:

- "Buat task untuk besok."
- "Cari email dari X."
- "Buat event Calendar."
- "Cari file di Drive."
- "Buat issue GitHub."

### Phase 2 — Connector expansion

Add:

- Sheets
- Docs
- Tasks
- more GitHub actions
- MCP transport
- event-driven Workspace integrations
- optional alternative voice provider if justified

### Phase 3 — Reliability

Add:

- retries
- idempotency
- action approvals
- quota enforcement
- provider health
- audit trail
- recovery workflows
- connector fallback

---

## 14. Acceptance criteria

The baseline is accepted only when:

- [ ] Cloudflare Free deployment works.
- [ ] Worker API works without paid plan.
- [ ] D1 read/write works within Free quota.
- [ ] R2 artifact flow works within Free allowance.
- [ ] KV cache flow works within Free allowance.
- [ ] Gemini Live voice session works under the verified account/model quota.
- [ ] Gemini Live intended use is documented against current data-use/commercial terms.
- [ ] Google OAuth works with least-privilege scopes.
- [ ] Calendar connector can read events.
- [ ] Gmail connector can read/search mail.
- [ ] Drive connector can search/read metadata.
- [ ] GitHub connector can read repository data.
- [ ] Connector failures are isolated from core state.
- [ ] Quota exhaustion produces safe failure.
- [ ] No paid upgrade happens automatically.
- [ ] Provider-specific SDK types do not leak into the core.
- [ ] Audit events exist for external writes.
- [ ] ElevenLabs is not required for MVP acceptance.

---

## 15. Final architecture decision

Human OS is now defined as:

> **A Cloudflare-first, provider-neutral human operating layer.**

The infrastructure default is:

```
Cloudflare Pages / Static Assets
        +
Cloudflare Workers
        +
Cloudflare D1
        +
Cloudflare R2
        +
Cloudflare KV
        +
Cloudflare Durable Objects (when needed)
        +
Cloudflare Workers AI (when useful)
        +
Cloudflare AI Gateway
        +
Cloudflare Workflows (when needed)
```

External capabilities are connected through:

```
Connector Contract
       ↓
Official API / Official MCP
       ↓
Gemini Live / Google Workspace / GitHub / Future providers
```

The product is therefore **not** "a Gemini app" or "a Cloudflare app".

It is:

> **Human OS Core + Connector Contract + replaceable providers, running on the lowest-cost viable infrastructure.**

This document is the external-stack freeze for the MVP. Any new provider must justify its inclusion with a concrete capability, free-cost path, security model, quota model, and fallback.

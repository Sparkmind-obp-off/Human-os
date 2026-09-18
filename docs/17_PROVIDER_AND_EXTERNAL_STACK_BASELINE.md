# Human OS — Provider & External Stack Baseline

Status: **Proposed baseline for MVP**
Date: 2026-09-18

## 1. Decision principle

Human OS does **not** start from a paid AI provider and then design the product around that provider.

The MVP starts from external services that provide a usable **free tier / no-additional-cost quota / free developer allocation**, while keeping provider interfaces replaceable.

Priority order:

1. Free / no-additional-cost official service
2. Official API or official MCP
3. Low operational complexity
4. Easy credential isolation
5. Replaceable adapter
6. Paid upgrade only when actual usage justifies it

"Free" means free within the provider's current documented quota/terms. It does not mean unlimited.

---

## 2. Recommended MVP baseline

| Layer | Primary | Cost posture | Why |
|---|---|---|---|
| Frontend / hosting | Cloudflare Pages | Free plan | Existing Cloudflare direction; static assets are free |
| Backend | Cloudflare Workers | Free plan | 100k requests/day on Free |
| Database | Cloudflare D1 | Free plan | Native SQLite, 5M rows read/day, 100k rows written/day, 5 GB total free storage |
| AI + realtime voice | Google Gemini API / Live API via Google AI Studio | Free tier | Can cover audio-to-audio realtime interaction and reasoning without starting from a paid OpenAI dependency |
| Voice fallback / voice specialization | ElevenLabs API | Free plan | 10k credits/month; API available on free plan, but free output is non-commercial with attribution |
| Calendar | Google Calendar API / official Calendar MCP | No additional cost within standard quota | First-class user productivity connector |
| Email | Gmail API / official Workspace tooling | No additional cost within standard quota | Useful for real operator workflows |
| Connector protocol | MCP | Open protocol | Keeps Human OS independent from individual providers |
| AI observability / routing | Cloudflare AI Gateway | Free core features | Analytics, caching and rate limiting without requiring a paid gateway |
| Optional model fallback | Cloudflare Workers AI | Free allocation | 10k Neurons/day; useful as an additional local-to-Cloudflare model path |

---

## 3. Voice decision

### Primary experiment: Google Gemini Live

Use Google AI Studio / Gemini API as the first realtime voice experiment.

Reason:

- Gemini's current Live models support low-latency audio-to-audio interaction.
- The current Gemini API pricing documentation lists a Free Tier for the Live models.
- This lets Human OS test the core voice loop without making a paid provider the architectural foundation.

Architecture:

```
Microphone
   ↓
Human OS Voice Session
   ↓
Gemini Live adapter
   ↓
Reasoning + audio response
   ↓
Human
```

The adapter must be provider-neutral:

```VoiceProvider
  ├── GeminiLiveProvider
  ├── ElevenLabsProvider (optional)
  └── FutureProvider
```

### Secondary experiment: ElevenLabs

ElevenLabs is useful for high-quality TTS/STT and voice specialization.

The current free plan is $0/month with 10k credits/month, and most API endpoints are available on the free plan. However, ElevenLabs documents that free-plan generated content is non-commercial and requires attribution. Therefore:

**ElevenLabs Free = development / prototype voice option, not the default commercial production voice assumption.**

Do not build Human OS around ElevenLabs-specific APIs.

---

## 4. AI reasoning decision

### Primary: Gemini API Free Tier

Human OS should initially use Gemini through an adapter rather than embedding a provider SDK throughout the codebase.

```
ReasoningProvider
  ├── GeminiProvider
  ├── CloudflareWorkersAIProvider
  └── FutureProvider
```

The product must not assume that Gemini remains free forever.

The free tier is a launch/validation strategy, not a permanent business-cost guarantee.

### Secondary: Cloudflare Workers AI

Cloudflare Workers AI is already aligned with the selected hosting platform.

Current Free allocation: 10,000 Neurons/day. Some resource-intensive models require Workers Paid, while several other models remain available on Free.

Use it as:

- fallback model
- lightweight classification
- local/edge inference where appropriate
- experimentation

Do not assume it can replace the full realtime voice stack.

---

## 5. Database decision

### Primary: Cloudflare D1

For MVP, choose **D1 first**.

Current Free limits include:

- 5 million rows read/day
- 100,000 rows written/day
- 5 GB total stored data
- 10 databases on Free
- SQLite

This is sufficient for the initial Human OS control plane: users, sessions, tasks, memories, connector records, actions, approvals and audit events.

Important:

As of September 1, 2026, Cloudflare enforces D1 Free daily row-read and row-write limits. When the daily limit is exceeded, queries fail until the limit resets.

Therefore Human OS must implement:

- efficient indexes
- bounded queries
- pagination
- usage monitoring
- graceful quota errors

### Neon: optional, not baseline

Neon remains a valid fallback if Human OS later needs PostgreSQL-specific capabilities, more complex relational workloads, or an ecosystem that benefits materially from Postgres.

Current Neon Free includes 10 projects, 50 CU-hours/month per project, 0.5 GB storage/project, and 5 GB total across 10 projects.

Do not add Neon merely because it is popular.

Decision:

**D1 first → Neon only when a concrete requirement appears.**

---

## 6. Google Workspace connectors

### Google Calendar

Use the official Google Calendar API first.

Google currently documents standard Calendar API usage as available at no additional cost, within the documented quota model. The current quota for projects created from May 1, 2026 includes 10,000 requests/minute/project and 600 requests/minute/user/project, with a documented daily billing threshold.

Official Calendar MCP can be evaluated alongside the direct API.

Recommendation:

**Calendar adapter → official API first; official MCP as an alternative transport.**

### Gmail

Use the official Gmail API first.

Google currently documents standard Gmail API usage as available at no additional cost within its quota model. Current documented quotas include 1,200,000 quota units/minute/project and 6,000 quota units/minute/user/project, with a documented daily billing threshold.

Recommendation:

**Gmail adapter → official API first; official Workspace/MCP tooling can be added when it simplifies orchestration.**

---

## 7. Connector strategy

Human OS should not hard-code external services into the core.

Use:

```
Human OS Core
    ↓
Provider / Connector Contract
    ↓
Official API / Official MCP
    ↓
External Service
```

Fallback order:

1. Official API
2. Official MCP
3. Trusted third-party MCP
4. Webhook / automation provider
5. Browser automation only when necessary

MCP is an interoperability layer, not a replacement for the underlying service.

---

## 8. Cloudflare baseline

Cloudflare should be the default infrastructure platform for MVP:

- Pages → frontend
- Workers → backend/API
- D1 → database
- AI Gateway → model routing/observability
- Workers AI → optional model fallback
- Secrets / environment bindings → credentials

Current Workers Free provides 100,000 requests/day.

Current Pages static asset requests are free and unlimited; Pages Functions count against Workers quotas.

This creates a coherent low-cost deployment path without adding another infrastructure vendor prematurely.

---

## 9. Initial external accounts to prepare

Only create/configure these first:

### Required

1. Google Cloud / Google AI Studio
   - Gemini API access
   - Google OAuth client for Calendar/Gmail
2. Cloudflare
   - Workers
   - Pages
   - D1
   - AI Gateway
3. GitHub
   - source control and CI

### Optional

4. ElevenLabs
   - only if Gemini voice quality/controls are insufficient
5. Neon
   - only if D1 becomes a concrete constraint

### Not required for MVP

Do not yet create or depend on:

- OpenAI API
- Anthropic API
- multiple TTS providers
- multiple database vendors
- large automation stacks
- dozens of MCP servers

They can be added through adapters after validation.

---

## 10. MVP external-stack freeze

For the first Human OS implementation, the stack is frozen as:

```
Frontend:
  Cloudflare Pages

Backend:
  Cloudflare Workers

Database:
  Cloudflare D1

AI / Realtime Voice:
  Google Gemini API / Live API (Free Tier)

Voice Alternative:
  ElevenLabs (Free Tier, development/non-commercial constraints)

Productivity:
  Google Calendar API
  Gmail API

Connector Protocol:
  MCP-compatible adapter layer

AI Gateway:
  Cloudflare AI Gateway

Optional Edge AI:
  Cloudflare Workers AI

Optional Database Escape Hatch:
  Neon
```

This is the **cost-minimized validation stack**, not the final production stack.

---

## 11. Cost guardrail

Human OS must expose provider usage and quota state internally.

Each provider adapter should report:

- provider
- capability
- current plan/tier
- free quota if known
- usage if available
- remaining quota if available
- billing risk
- authentication method
- fallback provider
- last verified date

No provider should silently create paid usage.

For any provider with potential overage:

**default = fail safely / ask for authorization / switch to an approved fallback.**

---

## 12. Next implementation gate

Before Phase 1 coding:

1. Create Google Cloud project.
2. Enable Gemini API / AI Studio access.
3. Verify current Free Tier access for the selected Gemini Live model.
4. Create OAuth credentials for Calendar/Gmail.
5. Create Cloudflare Worker + D1 database.
6. Create a minimal provider configuration contract.
7. Test one voice session.
8. Test one Calendar read.
9. Test one Gmail read.
10. Test one D1 write/read.
11. Record actual quotas and limitations in the repository.

Only after these checks should Genspark implement the Phase 1 vertical slice.

---

## 13. Important distinction

Human OS is **not**:

> "an OpenAI app with some connectors."

Human OS is:

> "a provider-neutral human operating layer that uses the cheapest reliable external capabilities available, while keeping providers replaceable."

The business value is the orchestration, context, memory, action safety, verification and user experience — not ownership of a particular model API.

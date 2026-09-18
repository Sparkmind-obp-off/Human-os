# Human OS — Phase 0 External Stack Validation

Status: READY FOR LIVE VALIDATION — not yet runtime-verified
Date: 2026-09-18

## 1. Purpose

Phase 0 answers one question before Genspark receives a Phase 1 implementation green light:

> Does the minimum Human OS stack actually work end-to-end under the user's real accounts and current free/usable limits?

Minimum stack: Cloudflare + Gemini Live + Google OAuth + Calendar + Gmail + Drive + GitHub + Connector Layer.

A component is PASS only after a real runtime test succeeds. Documentation or pricing availability alone is not enough.

## 2. Current verification state

| Component | Architecture fit | Official availability checked | Real runtime test | Status |
|---|---|---|---|---|
| Cloudflare Workers | Yes | Yes | Not yet | PENDING LIVE |
| Cloudflare D1 | Yes | Yes | Not yet | PENDING LIVE |
| Cloudflare R2 | Yes | Yes | Not yet | PENDING LIVE |
| Cloudflare KV | Yes | Yes | Not yet | PENDING LIVE |
| Gemini Live | Yes | Yes | Not yet | PENDING LIVE |
| Google OAuth | Yes | Yes | Not yet | PENDING LIVE |
| Google Calendar | Yes | Yes | Not yet | PENDING LIVE |
| Gmail | Yes | Yes | Not yet | PENDING LIVE |
| Google Drive | Yes | Yes | Not yet | PENDING LIVE |
| GitHub | Yes | Yes | Connector can access Human OS repo | PASS — connector path verified |
| Connector Layer | Yes | Contract defined | Not yet end-to-end | PENDING LIVE |

Important: this does not claim the whole stack is already proven. The remaining unknown is account-level runtime behavior.

## 3. Official baseline

Cloudflare Workers Free currently provides 100,000 requests/day, 10 ms CPU per invocation, 128 MB memory and 50 subrequests/invocation. D1 Free provides 5 million rows read/day and 100,000 rows written/day. KV Free provides 100,000 reads/day and 1,000 writes/day. D1 Free queries can fail after daily row limits are exceeded. These are hard operational boundaries.

Google currently lists Gemini 3.8 Live, Gemini 3.8 Live Extended Thinking and Gemini 3.1 Flash Live Preview with Free Tier input/output pricing. Free pricing is not unlimited production capacity; actual model access, quota, rate limits and data-use/commercial terms must be tested on the real project.

Google OAuth 2.0 supports web-server authorization-code flows. Required APIs must be enabled and scopes kept least-privilege. Calendar and Gmail have documented quotas.

GitHub API access is already demonstrably reachable through the connected GitHub integration because the Human OS repository is accessible and files can be fetched. The application still needs its own connector test.

## 4. Runtime test sequence

1. Cloudflare: deploy minimal Worker and confirm HTTPS response without paid plan.
2. D1: create database, INSERT, SELECT, UPDATE, DELETE, and record observed limits.
3. R2: create bucket, upload/read/delete a small artifact.
4. KV: create namespace, PUT/GET/DELETE a test key.
5. Gemini Live: open realtime session using a current Free-Tier Live model, send microphone audio, receive model audio, run a short command, record model/quota/errors, confirm no billing requirement.
6. Google OAuth: configure consent screen, enable APIs, complete authorization, exchange code for tokens, and store tokens securely.
7. Calendar: list calendars, read events, create disposable test event, verify, delete.
8. Gmail: search known test email and read message/thread; send only with explicit authorization.
9. Drive: create/find test folder, upload small file, search, read metadata/content, clean up.
10. GitHub: list authorized repo, read known file, optionally create disposable test issue, verify and clean up.
11. Connector Layer: prove Core → normalized contract → provider adapter → official API, with provider SDK types excluded from Core.

## 5. No-billing guardrail

- Do not attach a paid Cloudflare plan unless explicitly approved.
- Do not link Gemini billing merely to obtain higher limits.
- Do not enable paid Google Cloud usage for Phase 0 unless explicitly approved.
- Do not use paid fallback providers.
- If a required capability needs payment, mark it BLOCKED — PAID REQUIREMENT instead of silently upgrading.

## 6. Green-light rule

Genspark gets the Phase 1 green light only when Cloudflare, D1, R2, KV, Gemini Live, Google OAuth, Calendar, Gmail, Drive, GitHub and the provider-neutral Connector Layer all pass runtime validation; Gemini quota and data-use/commercial terms are recorded; quota failures are safe; and no unexpected paid upgrade occurred.

If any required item fails: STOP → record blocker → evaluate alternative → update provider baseline → retest.

## 7. Evidence record

Every PASS/FAIL records component, date/time, non-secret account/project identifier, plan/tier, model/API version, exact test, result, observed quota, errors, billing risk and next action.

Never commit API keys, OAuth client secrets, access tokens or refresh tokens.

## 8. Final decision

The minimum stack is architecturally valid and currently supported, but it is not yet fully proven alive on the user's actual accounts.

> No Genspark Phase 1 green light yet.

The next move is a short evidence-based Phase 0 runtime validation, then freeze the stack and hand Genspark the implementation prompt only after all required checks pass.
# Human OS — Voice & Presence Specification

## Objective
Make voice a primary control surface without making the system dependent on a single speech provider.

## Flow
Microphone → Speech-to-text → Intent/Context → Planner → Tool/Response → Text-to-speech → User

For live voice:
Audio session → realtime model/session → tool orchestration → streamed response.

## Presence
Presence means continuity of service, not pretending to be a human being.

Human OS may:
- remember authorized context
- maintain an ongoing task
- proactively notify on user-approved triggers
- summarize what happened while the user was away

Human OS must not:
- claim consciousness
- claim a personal relationship
- impersonate a real individual
- manufacture emotional dependency

## Voice UX Requirements
- Interruptible
- Low latency where possible
- Clear indication when tools are executing
- Explicit confirmation for consequential actions
- Fallback to text
- Session recovery after network interruption

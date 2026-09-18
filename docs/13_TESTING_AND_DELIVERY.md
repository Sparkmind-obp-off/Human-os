# Human OS — Testing & Delivery

## Test Layers
- Unit: policies, risk classification, memory rules
- Integration: connectors and action contracts
- End-to-end: voice/text → plan → approval → action → verification
- Security: auth, scopes, secret exposure, tenant isolation
- Recovery: network failure, tool timeout, duplicate action
- UX: approval clarity and activity visibility

## Critical Invariants
1. Unauthorized action cannot execute.
2. Denied action cannot execute.
3. Consequential action cannot bypass required approval.
4. Connector secret cannot be returned to the model/user through normal output.
5. Duplicate requests do not cause unintended duplicate side effects where idempotency is possible.
6. Audit record exists for every executed action.

## Delivery Checklist
- tests passing
- no secrets committed
- environment contract documented
- README updated
- architecture decisions recorded
- acceptance criteria verified
- deployment rollback path documented

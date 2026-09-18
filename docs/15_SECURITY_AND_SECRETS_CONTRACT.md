# Human OS — Security & Secrets Contract

## Secrets
Never commit:
- API keys
- OAuth client secrets
- refresh tokens
- database credentials
- signing keys
- encryption keys

Use environment/secret-management infrastructure.

## Identity
- Authenticate users.
- Authorize every connector and action.
- Keep user/workspace data isolated.
- Log security-relevant events without logging raw secrets.

## Model Boundary
The model receives only the minimum data required for the task. Secrets should be held by the connector/tool layer and exchanged through controlled operations.

## External APIs
Use official authorization mechanisms and documented scopes. Never ask users to paste provider credentials into ordinary chat when an OAuth/secure authorization flow is available.

## Incident Response
Support:
- credential revocation
- connector disable
- session invalidation
- action pause
- audit review

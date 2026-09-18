# Human OS — Connector & Action Contract

## Connector Contract
Each connector exposes:
- identity
- capabilities
- required scopes
- authentication method
- read operations
- write operations
- risk class
- rate limits
- failure semantics
- audit metadata

## Action Contract
Every action should carry:
- action_id
- user/session id
- intent
- tool
- inputs
- authorization source
- risk level
- approval requirement
- execution status
- verification result
- timestamp
- rollback/recovery information when available

## Example
A Strava connector may expose read activities, read profile, and authorized write operations. Human OS should never require a user's private API credential to be shared with another user. OAuth or the provider's supported authorization model should be used where applicable.

## Integration Principle
Connectors are replaceable. Core Human OS should not hard-code business logic for one provider.

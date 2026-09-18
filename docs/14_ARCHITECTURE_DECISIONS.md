# Human OS — Architecture Decision Record Index

## ADR-001: Standalone Project
Decision: Human OS is a separate repository.
Reason: Its scope is human-centered orchestration rather than running, business, or demand-specific operations.

## ADR-002: Neutral Core Identity
Decision: Core Human OS has no required gender.
Reason: The product's identity is functional and user-centered; persona options, if ever introduced, remain configurable and must not impersonate real people.

## ADR-003: Voice-First
Decision: Voice is a first-class interface.
Reason: Delegation should feel natural and reduce typing/context-switching friction.

## ADR-004: Connector-Based Architecture
Decision: External services are accessed through explicit connectors.
Reason: Provider credentials, scopes, APIs, and failure behavior must remain isolated.

## ADR-005: Human-Controlled Autonomy
Decision: Autonomy is bounded by risk and authorization.
Reason: A powerful operator still needs clear accountability and recovery.

# Human OS — Data Model

## Core Entities
User
- id
- preferences
- timezone
- consent policies

Session
- id
- user_id
- channel
- started_at
- ended_at

Task
- id
- intent
- status
- priority
- owner
- context_refs

Memory
- id
- type
- content
- provenance
- sensitivity
- retention
- permissions

Connector
- id
- provider
- capabilities
- scopes
- status

Action
- id
- task_id
- connector_id
- risk
- approval
- status
- verification

Event
- id
- type
- timestamp
- actor
- metadata

## Storage Rule
Separate secrets from application data. Encrypt sensitive data at rest and in transit. Minimize retention.

# Human OS — Memory & Context Specification

## Memory Classes
- Working: current conversation/task
- Episodic: completed interactions/events
- Semantic: stable user-provided facts/preferences
- Procedural: approved workflow instructions
- Sensitive: restricted data requiring stronger controls

## Memory Lifecycle
Capture → Classify → Permission check → Store → Retrieve → Use → Review → Delete/Expire

## Rules
- Do not store everything by default.
- Memory must have provenance.
- User can inspect, correct, and delete memory.
- Sensitive memory requires explicit policy.
- Retrieved memory must not silently override current user instructions.
- Conflicting memories require clarification.

## Context Priority
Current explicit instruction > current verified system state > approved task context > durable preference > inferred pattern.

Inference must never be presented as a fact.

---
title: alerts: Events & Commands Augmentation
status: proposed
date: 2025-07-24
deciders: Event-Storming Panel ()
---

## ADR-024: alerts: Events & Commands Augmentation

### Status
Proposed

### Context
A collaborative Event Storming session for **alerts** surfaced behavioural gaps between the existing domain model and real-world processes.  Specifically, the following domain events and commands were missing or ambiguous and are now required for an accurate Ubiquitous Language and clear integration contracts.

### Decision
Adopt the following additions to the alerts bounded context.

#### New Domain Events
- ReturnInitiated
- ReturnCompleted
- ReturnRequested
- ReturnDenied
- ReturnProcessed
- ReturnCancelled
- ReturnReopened
- ReturnEscalated

#### New Application Commands
- InitiateReturn
- CompleteReturn
- RequestReturn
- DenyReturn
- ProcessReturn
- CancelReturn
- ReopenReturn
- EscalateReturn

### Rationale
1. **Expressive Domain Behaviour** – Each event captures a significant state change, enabling ubiquitous language alignment (Evans) and explicit bounded-context contracts (Vernon).
2. **Decoupled Integrations** – Downstream contexts subscribe to these events rather than private state, supporting Hexagonal architecture and Event-Driven communication (see ADR-008).
3. **Traceability** – Commands map 1-to-1 with intent; linking the task list in implementation-plan Phase E keeps execution transparent.

### Alternatives Considered
- _Ignore gaps_ – would perpetuate implicit behaviour and hinder future refactors.
- _Collapse into existing events_ – rejected; would overload semantics and violate Single Responsibility.

### Consequences
+ Clearer context boundaries and integration contracts.
+ Enables granular audit/observability of alerts workflows.
− Additional implementation effort (estimated in implementation-plan.md).

### References
- **PRD**: docs/prd/alerts.md
- **Integration Session**: DDD_Artefacts/integration-sessions/alerts-integration-session.md
- **Implementation Plan Update**: implementation-plan.md (Phase E)

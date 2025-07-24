---
title: ratings: Events & Commands Augmentation
status: proposed
date: 2025-07-24
deciders: Event-Storming Panel ()
---

## ADR-026: ratings: Events & Commands Augmentation

### Status
Proposed

### Context
A collaborative Event Storming session for **ratings** surfaced behavioural gaps between the existing domain model and real-world processes.  Specifically, the following domain events and commands were missing or ambiguous and are now required for an accurate Ubiquitous Language and clear integration contracts.

### Decision
Adopt the following additions to the ratings bounded context.

#### New Domain Events
- SubscriptionActivated
- SubscriptionCancelled
- SubscriptionRenewed
- SubscriptionPaused
- SubscriptionUpgraded
- SubscriptionDowngraded
- SubscriptionResumed
- SubscriptionSuspended

#### New Application Commands
- ActivateSubscription
- CancelSubscription
- RenewSubscription
- PauseSubscription
- UpgradeSubscription
- DowngradeSubscription
- ResumeSubscription
- SuspendSubscription

### Rationale
1. **Expressive Domain Behaviour** – Each event captures a significant state change, enabling ubiquitous language alignment (Evans) and explicit bounded-context contracts (Vernon).
2. **Decoupled Integrations** – Downstream contexts subscribe to these events rather than private state, supporting Hexagonal architecture and Event-Driven communication (see ADR-008).
3. **Traceability** – Commands map 1-to-1 with intent; linking the task list in implementation-plan Phase E keeps execution transparent.

### Alternatives Considered
- _Ignore gaps_ – would perpetuate implicit behaviour and hinder future refactors.
- _Collapse into existing events_ – rejected; would overload semantics and violate Single Responsibility.

### Consequences
+ Clearer context boundaries and integration contracts.
+ Enables granular audit/observability of ratings workflows.
− Additional implementation effort (estimated in implementation-plan.md).

### References
- **PRD**: docs/prd/ratings.md
- **Integration Session**: DDD_Artefacts/integration-sessions/ratings-integration-session.md
- **Implementation Plan Update**: implementation-plan.md (Phase E)

# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the Elias Food Imports domain model.

## What is an ADR?

An Architecture Decision Record is a document that captures an important architectural decision, including:
- The context (why we needed to make a decision)
- The decision itself (what we decided)
- The consequences (what happens as a result)
- Status (proposed, accepted, superseded, etc.)

## ADR Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| [ADR-001](./001-clock-abstraction.md) | Clock Abstraction for Temporal Logic | Accepted | 2025-05-10 |
| [ADR-002](./002-domain-event-design.md) | Domain Event Design Patterns | Accepted | 2025-05-15 |
| [ADR-003](./003-value-object-validation.md) | Value Object Validation Approach | Accepted | 2025-05-20 |
| [ADR-004](./004-cqrs-implementation.md) | CQRS Implementation Strategy | Proposed | 2025-06-01 |
| [ADR-005](./005-distributed-transactions-strategy.md) | Distributed Transaction Strategy | Accepted | 2025-06-03 |
| [ADR-006](./006-shared-kernel-design.md) | Shared Kernel Design | Accepted | 2025-06-05 |
| [ADR-007](./007-hexagonal-modular-monolith.md) | Hexagonal Modular Monolith Architecture | Accepted | 2025-06-06 |
| [ADR-008](./008-event-driven-communication.md) | Event-Driven Communication Between Bounded Contexts | Accepted | 2025-06-06 |
| [ADR-009](./009-data-protection-strategy.md) | Data Protection Strategy | Accepted | 2025-06-06 |
| [ADR-010](./010-observability-monitoring-strategy.md) | Observability & Monitoring Strategy | Accepted | 2025-06-06 |
| [ADR-011](./011-multi-layered-caching-strategy.md) | Multi-Layered Caching Strategy | Accepted | 2025-06-06 |
| [ADR-012](./012-cicd-pipeline-strategy.md) | CI/CD Pipeline Strategy | Accepted | 2025-06-06 |

## Creating a New ADR

Use the template below when creating a new ADR:

```markdown
# ADR-XXX: Title

## Status
Proposed | Accepted | Rejected | Deprecated | Superseded by [ADR-XXX](./XXX-filename.md)

## Context
[Describe the forces at play, including technological, business, social, and project constraints]

## Decision
[Describe the decision in detail]

## Consequences
[Describe the resulting context after applying the decision]

## References
[List any relevant references]
```

---
title: "ADR-008: Event-Driven Communication Between Bounded Contexts"
version: "1.0"
last_updated: "2025-06-06"
status: "Accepted"
---

# ADR-008: Event-Driven Communication Between Bounded Contexts

## Status
Accepted

## Context
As Elias Food Imports adopts a Hexagonal Modular Monolith architecture with distinct bounded contexts, we need to address how these contexts should communicate with each other while:

- Maintaining loose coupling between bounded contexts
- Ensuring consistency across domain models where necessary
- Supporting eventual consistency where appropriate
- Enabling future extraction of contexts into separate services
- Providing auditability and traceability of system behaviors
- Supporting business analytics and monitoring requirements

Traditional approaches like direct method calls or shared repositories risk creating tight coupling between contexts and eroding their boundaries.

## Decision
We will implement an **Event-Driven Communication Approach** for interactions between bounded contexts with the following characteristics:

1. **Domain Events as Primary Integration Mechanism**:
   - Bounded contexts publish domain events when significant state changes occur
   - Events follow the entity-first, past-tense naming convention (e.g., `OrderPlaced`, `PaymentProcessed`)
   - Events carry all necessary data for subscribers to act upon

2. **Event Bus Implementation**:
   - In-process event bus for the initial modular monolith phase
   - Abstraction layer to allow future replacement with distributed message broker
   - Support for both synchronous and asynchronous event handling

3. **Event Ownership**:
   - Each event is owned by a single bounded context (the publisher)
   - Event schema changes follow strict versioning rules
   - Publishers document events in a central Domain Event Catalog

4. **Subscription Patterns**:
   - Contexts explicitly subscribe to events from other contexts
   - Subscriber contexts translate external events to their internal domain model
   - Anti-corruption layers protect domain model integrity

5. **Consistency Requirements**:
   - Transactional outbox pattern for reliable event publishing
   - Idempotent event handlers for reliable processing
   - Event sourcing for critical aggregates when appropriate

## Consequences

### Positive
- **Loose Coupling**: Bounded contexts are isolated from implementation details of other contexts
- **Independent Evolution**: Contexts can evolve independently with minimal coordination
- **Extensibility**: New behaviors can be added by subscribing to existing events
- **Auditability**: Event streams provide a complete history of system behavior
- **Scalability**: Naturally supports extraction to microservices in the future
- **Resilience**: Asynchronous processing enables graceful degradation during partial outages

### Negative
- **Eventual Consistency**: Some use cases may require adjusting to eventual consistency
- **Complexity**: Event-driven systems can be harder to debug and reason about
- **Event Versioning**: Requires careful management of event schemas and versions
- **Idempotency**: Event handlers must be designed to handle duplicate events
- **Ordering Challenges**: May need to address event ordering requirements

### Mitigations
- Comprehensive documentation in the Domain Event Catalog
- Clear ownership of events to manage schema evolution
- Monitoring and tools to trace event flows through the system
- Testing frameworks for event-driven flows
- Training for teams on event-driven architecture patterns

## References
1. **Domain-Driven Design**: Eric Evans, *Domain-Driven Design* (2003)
2. **Domain Events**: Vaughn Vernon, *Implementing Domain-Driven Design* (2013)
3. **Transactional Outbox Pattern**: Chris Richardson, *Microservice Patterns* (2018)
4. **Domain Event Catalog**: As documented in Elias Food Imports Domain Event Catalog

# Elias Food Imports - Domain Model Directory Structure

This document provides a comprehensive view of the project's directory structure, highlighting the Domain-Driven Design (DDD) architecture implementation.

## Project Structure Overview

```
DDD_Artefacts/
├── code/                        # Source code for the domain model
│   ├── catalog/                 # Catalog bounded context
│   │   ├── domain/              # Domain layer
│   │   │   ├── aggregates/      # Aggregate roots
│   │   │   ├── events/          # Domain events
│   │   │   ├── repositories/    # Repository interfaces
│   │   │   └── value-objects/   # Value objects
│   │   └── tests/               # Tests for catalog domain
│   ├── customers/               # Customer bounded context
│   │   ├── application/         # Application services
│   │   │   └── event-handlers/  # Event handlers
│   │   └── domain/              # Domain layer
│   │       ├── aggregates/      # Aggregate roots
│   │       ├── events/          # Domain events
│   │       ├── repositories/    # Repository interfaces
│   │       ├── services/        # Domain services
│   │       └── value-objects/   # Value objects
│   ├── ordering/                # Ordering bounded context
│   │   ├── domain/              # Domain layer
│   │   │   ├── aggregates/      # Aggregate roots (Order)
│   │   │   ├── events/          # Domain events (OrderCreated, OrderPaid, OrderFulfilled)
│   │   │   ├── repositories/    # Repository interfaces
│   │   │   ├── services/        # Domain services
│   │   │   └── value-objects/   # Value objects (OrderStatus, OrderItem)
│   │   └── tests/               # Tests for ordering domain
│   ├── pricing/                 # Pricing bounded context
│   │   ├── application/         # Application services
│   │   │   └── services/        # Application services
│   │   └── domain/              # Domain layer
│   │       ├── aggregates/      # Aggregate roots
│   │       ├── entities/        # Domain entities
│   │       ├── events/          # Domain events
│   │       ├── repositories/    # Repository interfaces
│   │       ├── services/        # Domain services
│   │       ├── strategies/      # Pricing strategies
│   │       └── value-objects/   # Value objects
│   ├── shared/                  # Shared kernel
│   │   ├── core/                # Core DDD building blocks
│   │   ├── domain/              # Shared domain elements
│   │   │   ├── base/            # Base classes (Entity, AggregateRoot)
│   │   │   ├── events/          # Domain event infrastructure
│   │   │   └── value-objects/   # Shared value objects (Money, DateRange, TimeSlot)
│   │   └── tests/               # Tests for shared kernel
│   │       └── helpers/         # Test helpers (EventSpy)
│   └── subscriptions/           # Subscription bounded context
│       ├── domain/              # Domain layer
│       │   ├── aggregates/      # Aggregate roots (Subscription)
│       │   ├── events/          # Domain events (SubscriptionRenewed)
│       │   ├── repositories/    # Repository interfaces
│       │   └── value-objects/   # Value objects
│       └── tests/               # Tests for subscription domain
├── docs/                        # Documentation
│   ├── core-contexts/           # Documentation for core bounded contexts
│   ├── diagrams/                # Architectural diagrams
│   └── glossary/                # Domain glossary
├── tests/                       # Integration and other tests
│   ├── catalog/                 # Catalog tests
│   ├── customers/               # Customer tests
│   ├── integration/             # Integration tests
│   │   ├── domain-events/       # Domain event integration tests
│   │   └── workflows/           # Business workflow tests
│   ├── ordering/                # Ordering tests
│   ├── pricing/                 # Pricing tests
│   ├── shared/                  # Shared kernel tests
│   └── subscriptions/           # Subscription tests
└── final-ddd-readiness.md       # DDD readiness report
```

## Key Architectural Components

### Bounded Contexts
The codebase is organized around clearly defined bounded contexts, each representing a distinct business capability:
- **Catalog**: Product management
- **Customers**: Customer information and accounts
- **Ordering**: Order processing and fulfillment
- **Pricing**: Pricing rules and calculations
- **Subscriptions**: Subscription management and renewal

### Domain Layer Structure
Each bounded context follows a consistent internal structure:
- **Aggregates**: Core business entities that enforce invariants
- **Value Objects**: Immutable objects that represent concepts with no identity
- **Domain Events**: Notifications of important occurrences within the domain
- **Repositories**: Interfaces for data access abstraction
- **Services**: Domain operations that don't naturally fit in entities

### Shared Kernel
The `shared` directory contains common components used across bounded contexts:
- **Core DDD building blocks**: Result, Guard, etc.
- **Base classes**: Entity, AggregateRoot, etc.
- **Domain event infrastructure**: Event dispatching and handling
- **Common value objects**: Money, DateRange, TimeSlot

### Testing Strategy
Tests are organized into:
- **Unit tests**: Located alongside each bounded context
- **Integration tests**: Testing interactions between bounded contexts
  - **Domain event tests**: Verifying event chains
  - **Workflow tests**: End-to-end business processes

## Notable Implementations

1. **Clock Interface**: Implemented in `/code/shared/domain/Clock.ts` for time-dependent operations
2. **EventSpy**: Located in `/code/shared/tests/helpers/EventSpy.ts` for testing domain events
3. **Domain Events**: Properly implemented event classes in each bounded context
4. **Result Pattern**: Used throughout the codebase for error handling

---

Generated on: May 30, 2025

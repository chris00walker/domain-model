# Shared Kernel

## Overview

The Shared Kernel represents the common foundation used across all bounded contexts in the Elias Food Imports (EFI) system. It contains essential building blocks, base classes, and utilities that support the entire domain model.

## Key Components

### Base Classes

#### AggregateRoot

The base class for all aggregate roots, providing common functionality for domain entities that ensure consistency boundaries.

```typescript
abstract class AggregateRoot<T> {
  protected readonly _id: UniqueEntityID;
  protected props: T;
  private _domainEvents: DomainEvent[] = [];
  
  // Manages domain events and entity identity
}
```

Key functionality:
- Domain event management
- Identity management
- Equality comparison

#### ValueObject

The base class for all value objects, providing immutability and value equality semantics.

```typescript
abstract class ValueObject<T> {
  protected readonly props: T;
  
  // Value equality semantics
}
```

Key functionality:
- Value comparison
- Immutability enforcement

#### UniqueEntityID

Generates and wraps unique identifiers for entities.

```typescript
class UniqueEntityID {
  private value: string;
  
  // Handles ID generation and comparison
}
```

### Value Objects

#### Money

Represents monetary values with currency information and provides operations for financial calculations.

```typescript
class Money extends ValueObject<MoneyProps> {
  // Money implementation
}
```

Key features:
- Currency specification
- Mathematical operations (add, subtract, multiply, divide)
- Comparison operations
- Input validation

#### Address

Represents a physical address for shipping, billing, or general contact purposes.

```typescript
class Address extends ValueObject<AddressProps> {
  // Address implementation
}
```

Components:
- Street address
- City
- State/Province
- Postal/ZIP code
- Country
- Format validation

### Core Utilities

#### Result

Encapsulates the outcome of an operation, which can be either a success or a failure.

```typescript
class Result<T, E = string> {
  // Result pattern implementation
}
```

Key features:
- Success/failure indicators
- Value/error access
- Monadic operations (map, flatMap)
- Error handling utilities

#### Guard

Provides validation utilities to enforce preconditions and invariants.

```typescript
class Guard {
  // Validation methods
}
```

Key validators:
- `againstNullOrUndefined`: Ensures a value is provided
- `againstNullOrEmptyString`: Ensures a string has content
- `againstNullOrUndefinedBulk`: Validates multiple values at once
- `againstInvalidEmail`: Validates email format

### Domain Events

#### DomainEvent

Base class for all domain events that represent significant occurrences within the system.

```typescript
abstract class DomainEvent {
  public readonly aggregateId: string;
  public readonly eventId: string;
  public readonly occurredOn: Date;
  
  // Common domain event properties and methods
}
```

Key features:
- Timestamp tracking
- Aggregate reference
- Event identity
- Serialization support

## Design Principles

1. **Immutability**: Value objects are immutable, protecting against unexpected state changes
2. **Explicit Error Handling**: The Result pattern makes errors explicit and ensures they're handled
3. **Self-Validation**: Objects validate their own creation to maintain invariants
4. **Minimal Dependencies**: The shared kernel minimizes external dependencies
5. **Explicit Boundaries**: Clear separation between the shared kernel and bounded contexts

## Usage Guidelines

1. **Minimalism**: Only add to the shared kernel what is truly common across contexts
2. **Stability**: Changes to the shared kernel should be rare and carefully considered
3. **Dependency Direction**: Bounded contexts depend on the shared kernel, not vice versa
4. **Evolution**: Changes must be backward compatible or coordinated across all bounded contexts
5. **Documentation**: All shared kernel components should be well-documented

## Anti-Patterns

1. **Shared Kernel Bloat**: Adding context-specific code to the shared kernel
2. **Leaky Abstractions**: Exposing implementation details that should be hidden
3. **Tight Coupling**: Creating unnecessary dependencies between contexts through the shared kernel
4. **Domain Logic in Utilities**: Mixing domain rules with general-purpose utilities

---
title: Shared Kernel Design
status: accepted
date: 2025-06-06
deciders: DDD Implementation Team, Architecture Team
---

# ADR-006: Shared Kernel Design

## Context

In a domain-driven design architecture with multiple bounded contexts, there are certain components, patterns, and utilities that need to be shared across contexts. Creating duplicate implementations in each context would lead to inconsistency and maintenance challenges. However, sharing too much across contexts can lead to inappropriate coupling.

Elias Food Imports (EFI) requires a carefully designed shared kernel that provides common foundational elements while respecting bounded context autonomy. The shared kernel must be:

1. Minimal yet complete for core DDD building blocks
2. Stable to minimize disruption to bounded contexts
3. Well-defined to avoid becoming a catch-all for shared code
4. Usable across all bounded contexts regardless of their specific domain needs

## Decision

We will implement a Shared Kernel that provides essential building blocks for all bounded contexts while strictly limiting its scope to truly cross-cutting concerns. The Shared Kernel will follow a modular design with clear boundaries and minimal external dependencies.

### Key Components

#### Base Classes

1. **AggregateRoot**: Base class for all aggregate roots
   ```typescript
   abstract class AggregateRoot<T> {
     protected readonly _id: UniqueEntityID;
     protected props: T;
     private _domainEvents: DomainEvent[] = [];
     
     // Domain event and identity management methods
     addDomainEvent(event: DomainEvent): void {
       this._domainEvents.push(event);
     }
     
     clearEvents(): void {
       this._domainEvents = [];
     }
     
     get id(): UniqueEntityID {
       return this._id;
     }
     
     get domainEvents(): DomainEvent[] {
       return [...this._domainEvents];
     }
     
     equals(entity?: AggregateRoot<T>): boolean {
       if (entity === null || entity === undefined) {
         return false;
       }
       
       return this._id.equals(entity._id);
     }
   }
   ```

2. **ValueObject**: Base class for immutable value objects
   ```typescript
   abstract class ValueObject<T> {
     protected readonly props: T;
     
     constructor(props: T) {
       this.props = Object.freeze(props);
     }
     
     equals(vo?: ValueObject<T>): boolean {
       if (vo === null || vo === undefined) {
         return false;
       }
       
       return JSON.stringify(this.props) === JSON.stringify(vo.props);
     }
   }
   ```

3. **Entity**: Base class for entities that are not aggregate roots
   ```typescript
   abstract class Entity<T> {
     protected readonly _id: UniqueEntityID;
     protected props: T;
     
     equals(entity?: Entity<T>): boolean {
       if (entity === null || entity === undefined) {
         return false;
       }
       
       return this._id.equals(entity._id);
     }
   }
   ```

#### Value Objects

1. **Money**: For handling currency and financial calculations
2. **Address**: For representing physical locations
3. **DateRange**: For representing time periods
4. **UniqueEntityID**: For generating and managing entity identifiers

#### Core Utilities

1. **Result**: For explicit error handling
   ```typescript
   class Result<T, E = string> {
     private readonly _value?: T;
     private readonly _error?: E;
     private readonly _isSuccess: boolean;
     
     private constructor(isSuccess: boolean, value?: T, error?: E) {
       this._isSuccess = isSuccess;
       this._value = value;
       this._error = error;
     }
     
     public static ok<T, E = string>(value?: T): Result<T, E> {
       return new Result<T, E>(true, value);
     }
     
     public static fail<T, E = string>(error: E): Result<T, E> {
       return new Result<T, E>(false, undefined, error);
     }
     
     public isSuccess(): boolean {
       return this._isSuccess;
     }
     
     public isFailure(): boolean {
       return !this._isSuccess;
     }
     
     public getValue(): T {
       if (!this.isSuccess()) {
         throw new Error("Cannot get value from a failure result");
       }
       
       return this._value as T;
     }
     
     public getError(): E {
       if (this.isSuccess()) {
         throw new Error("Cannot get error from a success result");
       }
       
       return this._error as E;
     }
   }
   ```

2. **Guard**: For validation and invariant checking
3. **Clock**: For testable time-dependent operations

#### Domain Events Infrastructure

1. **DomainEvent**: Base class for all domain events
2. **DomainEvents**: Static class for registering and dispatching events

## Consequences

### Positive

1. **Consistency**: Common patterns and utilities are implemented consistently across bounded contexts
2. **Reduced Duplication**: Core building blocks are implemented once and reused
3. **Simplified Testing**: Standardized base classes make unit testing more straightforward
4. **Enforced Practices**: The shared kernel guides developers toward correct DDD implementation patterns
5. **Cleaner Boundaries**: Explicit shared kernel makes dependencies between contexts clear

### Negative

1. **Potential Coupling**: If not carefully managed, the shared kernel could introduce coupling between contexts
2. **Change Management**: Changes to shared kernel require careful coordination across all contexts
3. **Learning Curve**: Developers must understand the shared kernel components and patterns
4. **Versioning Challenges**: Evolving the shared kernel while maintaining backward compatibility can be difficult
5. **Risk of Bloat**: Without discipline, the shared kernel could grow unnecessarily large

## Design Principles

1. **Immutability**: Value objects are immutable to prevent unexpected state changes
2. **Explicit Error Handling**: The Result pattern makes errors explicit and ensures proper handling
3. **Self-Validation**: Objects validate their own creation to maintain invariants
4. **Minimal Dependencies**: The shared kernel minimizes external dependencies
5. **Explicit Boundaries**: Clear separation between the shared kernel and bounded contexts

## Usage Guidelines

1. **Minimalism**: Only add to the shared kernel what is truly common across all bounded contexts
2. **Stability**: Changes to the shared kernel should be rare and carefully considered
3. **Dependency Direction**: Bounded contexts depend on the shared kernel, not vice versa
4. **Evolution**: Changes must be backward compatible or coordinated across all bounded contexts
5. **Documentation**: All shared kernel components must be well-documented

## Implementation Plan

1. **Phase 1: Core Building Blocks (Immediate)**
   - Base classes (AggregateRoot, Entity, ValueObject)
   - UniqueEntityID
   - Result pattern
   - Guard clauses

2. **Phase 2: Common Value Objects (1 month)**
   - Money
   - Address
   - DateRange
   - Email

3. **Phase 3: Domain Events Infrastructure (1 month)**
   - Domain event classes
   - Event dispatching mechanism
   - Integration with bounded contexts

4. **Phase 4: Advanced Utilities (2 months)**
   - Clock abstraction
   - Serialization utilities
   - Cross-context reference objects

## Monitoring and Governance

1. Create a Shared Kernel Working Group with representatives from each context team
2. Require pull request reviews from at least two different context teams for changes
3. Maintain comprehensive test coverage (minimum 95%)
4. Document all breaking changes and provide migration guides
5. Schedule quarterly reviews of the shared kernel to identify bloat or missing functionality

## References

- Evans, Eric. "Domain-Driven Design: Tackling Complexity in the Heart of Software"
- Vernon, Vaughn. "Implementing Domain-Driven Design"
- [Ubiquitous Language Guidelines](../ubiquitous-language/ubiquitous_language_guidelines.md)
- [Domain Model Gap Analysis](../implementation/domain_model_gap_analysis.md)

---

*This ADR establishes our approach to designing and maintaining the Shared Kernel across bounded contexts. It provides guidelines for what belongs in the shared kernel and how it should evolve over time.*

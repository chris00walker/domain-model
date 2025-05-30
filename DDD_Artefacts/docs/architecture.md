# Elias Food Imports: Domain-Driven Design Architecture

## Overview

This document describes the architecture of the Elias Food Imports (EFI) application following Domain-Driven Design (DDD) principles. The codebase has been structured into bounded contexts, each representing a distinct business domain with its own ubiquitous language and well-defined interfaces.

## Bounded Contexts

The application is divided into the following bounded contexts:

### 1. Customers

Responsible for managing all customer-related concepts and operations.

- **Domain Objects**:
  - **Aggregates**: `Customer` (abstract), `ExpatCustomer`, `DiasporaCustomer`, `TouristCustomer`, etc.
  - **Value Objects**: `CustomerId`, `CustomerType`, `ContactInfo`
  - **Events**: `CustomerCreated`
  - **Services**: `CustomerFactory`

- **Key Concepts**:
  - Customer segmentation by type (B2C, B2B)
  - Customer preferences and delivery options
  - Contact information management

### 2. Catalog

Manages the product catalog and inventory information.

- **Domain Objects**:
  - **Value Objects**: `ProductId`
  - **Future Additions**: `Product`, `Category`, `Inventory`

### 3. Ordering

Handles the creation, processing, and fulfillment of orders.

- **Domain Objects**:
  - **Aggregates**: `Order`
  - **Value Objects**: `OrderItem`, `OrderStatus`
  - **Events**: `OrderCreated`

- **Key Concepts**:
  - Order lifecycle management
  - Order item management
  - Total price calculation

### 4. Subscriptions

Manages recurring orders and subscription plans.

- **Domain Objects**: (To be implemented)
  - **Aggregates**: `Subscription`, `SubscriptionPlan`
  - **Value Objects**: `BillingFrequency`, `SubscriptionStatus`

### 5. Payments

Handles payment processing and financial transactions.

- **Domain Objects**: (To be implemented)
  - **Aggregates**: `Payment`, `Invoice`
  - **Value Objects**: `PaymentMethod`, `TransactionId`

## Shared Kernel

The shared kernel contains components used across multiple bounded contexts:

- **Base Classes**:
  - `AggregateRoot`: Base class for all aggregate roots
  - `ValueObject`: Base class for all value objects
  - `UniqueEntityID`: Identifier generator
  
- **Value Objects**:
  - `Money`: Representation of monetary values
  - `Address`: Representation of physical addresses

- **Core Utilities**:
  - `Guard`: Validation utilities
  - `Result`: Error handling pattern

## Architectural Patterns

### Aggregate Roots

Aggregate roots are entities that ensure the consistency of a cluster of domain objects. They are the only objects that can be directly referenced from outside the aggregate.

Example: The `Customer` aggregate root manages its contact information and address details.

### Value Objects

Value objects are immutable objects that have no identity. They are defined by their attributes.

Example: `Money` represents a monetary amount with a specific currency.

### Domain Events

Domain events represent significant occurrences within the domain. They are used to communicate between bounded contexts.

Example: `CustomerCreated` event is triggered when a new customer is created.

### Repositories

Repositories provide the abstraction for data persistence and retrieval of aggregate roots.

### Services

Domain services contain domain logic that doesn't naturally fit within an entity or value object.

Example: `CustomerFactory` creates specific types of customers based on given parameters.

## Layer Architecture

Each bounded context follows a layered architecture:

1. **Domain Layer**: Contains the core business logic, entities, value objects, and domain services.
2. **Application Layer**: Orchestrates the domain objects to perform specific use cases.
3. **Infrastructure Layer**: Provides technical capabilities to support the upper layers.
4. **Interfaces Layer**: Contains adapters to various user interfaces or external systems.

## Directory Structure

```
/code
  /shared            # Shared kernel
    /core            # Core utilities
    /domain          # Domain components
      /base          # Base classes
      /events        # Domain events
      /value-objects # Shared value objects
  
  /customers         # Customers bounded context
    /domain
      /aggregates    # Customer aggregates
      /value-objects # Customer-specific value objects
      /events        # Customer-related events
      /services      # Customer-related services
  
  /catalog           # Catalog bounded context
    /domain
      /value-objects # Catalog-specific value objects
  
  /ordering          # Ordering bounded context
    /domain
      /aggregates    # Order aggregates
      /value-objects # Order-specific value objects
      /events        # Order-related events
  
  /subscriptions     # Subscriptions bounded context (to be implemented)
  
  /payments          # Payments bounded context (to be implemented)
```

## Dependency Rules

1. Bounded contexts should minimize dependencies on each other.
2. When bounded contexts need to interact, they should do so via well-defined interfaces or domain events.
3. The shared kernel should be kept minimal and stable.
4. Infrastructure concerns should not leak into domain logic.

## Implementation Notes

- Path aliases are used to simplify imports (`@shared/*`, `@customers/*`, etc.).
- Barrel files (index.ts) are used to simplify exports from directories.

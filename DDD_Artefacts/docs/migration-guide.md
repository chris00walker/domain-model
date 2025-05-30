# DDD Migration Guide

## Introduction

This guide explains how to migrate existing code to the new Domain-Driven Design (DDD) structure in the Elias Food Imports (EFI) codebase. Following these guidelines will ensure consistency and proper integration with the refactored domain model.

## Directory Structure Changes

### Previous Structure

```
/code
  /shared
    /domain
    /core
  /domain
    /Order
    /Customer
    /Catalog
  /app
```

### New Structure

```
/code
  /shared
    /core
    /domain
      /base
      /events
      /value-objects
  /customers
    /domain
      /aggregates
      /value-objects
      /events
      /services
  /catalog
    /domain
      /value-objects
      /aggregates
  /ordering
    /domain
      /aggregates
      /value-objects
      /events
  /app
```

## Import Path Changes

### Path Aliases

The TypeScript configuration now includes path aliases for each bounded context:

```json
"paths": {
  "@app/*": ["code/app/*"],
  "@domain/*": ["code/domain/*"],
  "@infra/*": ["code/infra/*"],
  "@shared/*": ["code/shared/*"],
  "@customers/*": ["code/customers/*"],
  "@catalog/*": ["code/catalog/*"],
  "@ordering/*": ["code/ordering/*"],
  "@subscriptions/*": ["code/subscriptions/*"],
  "@payments/*": ["code/payments/*"]
}
```

### Examples of Import Changes

Old format:
```typescript
import { Customer } from '../../domain/Customer/Customer';
import { OrderItem } from '../../domain/Order/OrderItem';
```

New format with path aliases:
```typescript
import { Customer } from '@customers/domain/aggregates/Customer';
import { OrderItem } from '@ordering/domain/value-objects/OrderItem';
```

Alternative format with relative paths:
```typescript
import { Customer } from '../../customers/domain/aggregates/Customer';
import { OrderItem } from '../../ordering/domain/value-objects/OrderItem';
```

## Migration Steps

### Step 1: Update Import Paths

Update all import statements to use the new directory structure:

1. Replace imports from `'../../shared/domain/AggregateRoot'` with `'@shared/domain/base/AggregateRoot'`
2. Replace imports from `'../../shared/domain/ValueObject'` with `'@shared/domain/base/ValueObject'`
3. Replace imports from `'../../shared/domain/UniqueEntityID'` with `'@shared/domain/base/UniqueEntityID'`
4. Replace imports from `'../../customers/domain/CustomerId'` with `'@customers/domain/value-objects/CustomerId'`
5. Replace imports from `'../../domain/Order/Order'` with `'@ordering/domain/aggregates/Order'`

### Step 2: Update Cross-Context References

If a bounded context needs to reference another bounded context, do so through:

1. Value Objects (preferred)
2. Identifiers
3. Domain Events
4. Well-defined interfaces

Example: The Order aggregate references the Customer only through CustomerId.

### Step 3: Adapt to Result Pattern

The codebase now consistently uses the Result pattern for error handling:

```typescript
// Old approach
createCustomer(): Customer {
  if (!isValid) throw new Error('Invalid customer');
  return new Customer();
}

// New approach
createCustomer(): Result<Customer, string> {
  if (!isValid) return failure('Invalid customer');
  return success(new Customer());
}
```

### Step 4: Use Guard Clauses

Utilize the Guard utility for input validation:

```typescript
// Old approach
if (!name) throw new Error('Name is required');
if (!email) throw new Error('Email is required');

// New approach
const guardResult = Guard.againstNullOrUndefinedBulk([
  { argument: name, argumentName: 'name' },
  { argument: email, argumentName: 'email' }
]);

if (!guardResult.succeeded) {
  return failure(guardResult.message!);
}
```

### Step 5: Domain Events

Update domain event creation and handling:

```typescript
// Creating an event
this.addDomainEvent(new CustomerCreated(this));

// Handling events
class CustomerCreatedHandler implements IDomainEventHandler<CustomerCreated> {
  handle(event: CustomerCreated): void {
    // Handle the event
  }
}
```

## Testing the Migration

1. Compile the project: `npm run build`
2. Run tests: `npm run test`
3. Run linting: `npm run lint`

## Troubleshooting

### Common Issues

1. **Module Not Found Errors**
   - Check that the import path is correct
   - Verify that the TypeScript path aliases are properly configured

2. **Type Incompatibility Issues**
   - Check that you're using the updated types from the new structures
   - Be aware of potential type differences between different versions of the same class

3. **Result Pattern Errors**
   - Remember to unwrap Result objects: `if (result.isSuccess()) { const value = result.value; }`
   - Check that functions return and handle Result objects correctly

### Help and Support

For questions or issues related to the DDD migration, contact:
- Chris (Project Lead): chris@eliasfoodimports.com
- DDD Working Group: ddd-team@eliasfoodimports.com

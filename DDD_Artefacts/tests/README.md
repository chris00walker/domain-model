# Testing Strategy for Domain-Driven Design

This project follows a structured approach to testing based on DDD principles, ensuring that all bounded contexts and their components are properly tested at various levels.

## Test Organization

Tests are organized by bounded context and test type:

```
tests/
├── catalog/               # Catalog bounded context tests
│   ├── domain/           # Domain model tests (entities, value objects, aggregates)
│   ├── application/      # Application services tests
│   └── integration/      # Integration tests within the bounded context
├── customers/             # Customer bounded context tests
│   ├── domain/
│   ├── application/
│   └── integration/
├── ordering/              # Ordering bounded context tests
│   ├── domain/
│   ├── application/
│   └── integration/
├── subscriptions/         # Subscription bounded context tests
│   ├── domain/
│   ├── application/
│   └── integration/
├── shared/                # Shared kernel tests
│   └── domain/
└── invariant/             # Legacy location - tests being migrated
```

## Testing Layers

### 1. Domain Layer Tests

Focus on testing the internal consistency of the domain model:
- Value Objects: Immutability, validation, equality
- Entities: Identity, behavior
- Aggregates: Business invariants, state transitions
- Domain Services: Complex operations involving multiple aggregates
- Domain Events: Event handling and propagation

### 2. Application Layer Tests

Verify use cases and application services:
- Command Handling
- Query Handling
- Application Services
- Event Handlers

### 3. Integration Tests

Test interactions between components within a bounded context.

## Best Practices

1. **Test Domain Invariants**: Verify that business rules are enforced
2. **Isolate Bounded Contexts**: Tests should not cross bounded context boundaries except through well-defined interfaces
3. **Mock External Dependencies**: Use mocks for infrastructure concerns (repositories, etc.)
4. **Test State Changes**: Verify that operations result in expected state changes
5. **Test Domain Events**: Ensure that appropriate domain events are raised

## Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific bounded context
npm test -- --testPathPattern=tests/ordering

# Run only domain tests
npm test -- --testPathPattern=domain

# Run with coverage report
npm run test:coverage
```

Coverage thresholds are set high (80%) for domain components to ensure critical business logic is well-tested.

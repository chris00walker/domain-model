---
title: Testing Strategy for Elias Food Imports
status: approved
owner: @domain-team
reviewers: @tech-lead, @domain-expert
last_updated: 2025-06-08
---

# Testing Strategy for Elias Food Imports

> **CHANGELOG**: Moved business examples, coverage requirements, test data factories, and review processes to [APPENDIX.md](./APPENDIX.md) for a more concise domain-first guide.

> **Domain-first** testing approach: validate the domain model before implementation to ensure business requirements are met through rigorous testing practices.

## Table of Contents
1. [Testing Philosophy](#testing-philosophy)
2. [Test Organization](#test-organization)
3. [Domain-First Validation](#domain-first-validation)
4. [CI Enforcement Strategy](#ci-enforcement-strategy)
5. [Key Takeaways](#key-takeaways)

## Testing Philosophy

### Definition
Elias Food Imports follows a **domain-first** testing approach where domain model validation precedes implementation code.

### Rationale
This approach catches missing contexts, entities, and business rules *before* coding begins, reducing rework and ensuring alignment with business strategy.

### Steps
1. **Domain model is validated** before implementation code
2. **Business rules are verified** through explicit tests
3. **Single source of truth** is maintained between documentation and tests
4. **Automation** ensures completeness of the domain model

### Outcome
Validated domain models that accurately reflect business requirements, leading to higher-quality implementations with fewer defects.

## Test Organization

### Definition
Tests are organized by testing phase and bounded context to support the domain-first approach.

### Rationale
This structure ensures that domain tests are run first and separates concerns across testing phases and bounded contexts.

### Steps
```
tests/
├── domain/              # Domain model completeness & invariants (pre-implementation)
│   ├── catalog/         # Product, QualityCheck, AuthenticationResult
│   ├── ordering/        # Order, OrderLine, ShippingInfo
│   ├── subscriptions/   # SubscriptionPlan, Subscription
│   └── inventory/       # InventoryItem, StockLevel
├── unit/                # TDD unit tests (post-domain validation)
│   ├── catalog/
│   ├── ordering/
│   └── ...
├── acceptance/          # BDD feature files with Gherkin syntax
│   ├── product_authentication/
│   ├── subscription_management/
│   └── order_fulfillment/
├── integration/         # Cross-context workflows
│   ├── order_processing/
│   ├── subscription_renewal/
│   └── ...
├── invariant/           # Domain invariant tests
│   ├── catalog/
│   ├── subscription/
│   └── ...
└── shared/              # Shared domain concepts
    └── domain/          # Money, Address, Quantity
```

### Outcome
A clear separation of test types that follows the domain-first testing philosophy and makes it easy to locate and run specific categories of tests.

## Domain-First Validation

### Domain Model Completeness Tests

#### Definition
Tests that verify the existence and completeness of required domain elements based on domain documentation metadata.

#### Rationale
This ensures alignment between documentation and implementation and prevents domain knowledge loss.

#### Steps
1. **Define** domain concepts in documentation with front-matter metadata:

```yaml
---
context: Order
aggregates: [Order]
subAggregates: [Cart]
commands: [AddItem, Checkout]
events: [OrderPlaced]
valueObjects: [CartItem]
---
```

2. **Generate** completeness tests:

```bash
npm run generate:domain-tests
```

3. **Validate** domain model completeness with automatically generated tests:

```typescript
// Generated test from domain metadata
describe('Order Domain Completeness', () => {
  it('has Order aggregate defined', () => {
    expect(domainModel.hasAggregate('Order')).toBe(true);
  });
  
  it('has OrderPlaced event defined', () => {
    expect(domainModel.hasEvent('OrderPlaced')).toBe(true);
  });
});
```

4. **Iterate** on domain model documentation until tests pass

#### Outcome
A complete domain model with all required elements present and aligned with documentation.

### Business Invariant Tests

#### Definition
Tests that explicitly verify business invariants derived from acceptance criteria.

#### Rationale
Ensures that business rules are enforced and measurable against specific success criteria.

#### Steps
Write tests that explicitly verify business invariants from acceptance criteria:

```typescript
describe('Order Business Rules', () => {
  it('maintains order accuracy ≥ 99.9% by validating all line items', () => {
    const order = new Order();
    expect(() => order.addInvalidItem(invalidItem)).toThrow();
  });
});
```

#### Outcome
Domain models that enforce critical business rules and directly support business metrics and success criteria.

## CI Enforcement Strategy

### Definition
A CI/CD pipeline structure that enforces the domain-first testing approach through a gated workflow.

### Rationale
Automated enforcement of the domain-first testing philosophy prevents shortcuts and ensures consistency.

### Steps
Our CI pipeline enforces the domain-first approach through a gated workflow:

```yaml
name: EFI Testing Pipeline
on: [push, pull_request]

jobs:
  domain-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:domain
      
  unit-tests:
    needs: domain-validation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:unit
      
  acceptance-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:acceptance
      
  integration-tests:
    needs: acceptance-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:integration
```

### Outcome
Automated enforcement of the testing sequence, ensuring that domain tests must pass before any implementation testing can proceed.

## Key Takeaways

1. **Domain-First Validation**: Test domain models before implementing them.
2. **Business Rule Enforcement**: Tests enforce business rules and invariants explicitly.
3. **Automated Verification**: Domain model completeness is checked automatically.
4. **CI/CD Integration**: Pipeline enforces the domain-first approach.
5. **Single Source of Truth**: Documentation and tests align to form a cohesive domain model.

For more advanced testing topics, including business examples, coverage requirements, test data management, and review processes, see the [Testing Strategy Appendix](./APPENDIX.md).

---

*"First, solve the problem. Then, write the code." — John Johnson*

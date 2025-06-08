---
title: Testing Strategy for Elias Food Imports
status: approved
owner: @domain-team
reviewers: @tech-lead, @domain-expert
last_updated: 2025-06-08
---

# Testing Strategy for Elias Food Imports

> **Domain-first** testing approach: validate the domain model before implementation to ensure business requirements are met through rigorous testing practices.

## Table of Contents
1. [Testing Philosophy](#testing-philosophy)
2. [Test Organization](#test-organization)
3. [Domain-First Validation](#domain-first-validation)
4. [Testing Methodologies](#testing-methodologies)
5. [Testing Layers](#testing-layers)
6. [Business-Focused Examples](#business-focused-examples)
7. [Running Tests](#running-tests)
8. [Coverage Requirements](#coverage-requirements)
9. [Test Data Management](#test-data-management)
10. [CI/CD Integration](#cicd-integration)
11. [Review Process](#review-process)

## Testing Philosophy

Elias Food Imports follows a **domain-first** testing approach where:

1. **Domain model is validated** before implementation code
2. **Business rules are verified** through explicit tests
3. **Single source of truth** is maintained between documentation and tests
4. **Automation** ensures completeness of the domain model

This approach catches missing contexts, entities, and business rules *before* coding begins, reducing rework and ensuring alignment with business strategy.

## Test Organization

Tests are organized by testing phase and bounded context:

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
└── shared/              # Shared domain concepts
    └── domain/          # Money, Address, Quantity
```

## Domain-First Validation

### Domain Model Completeness Tests

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

### Business Invariant Tests

Write tests that explicitly verify business invariants from acceptance criteria:

```typescript
describe('Order Business Rules', () => {
  it('maintains order accuracy ≥ 99.9% by validating all line items', () => {
    const order = new Order();
    expect(() => order.addInvalidItem(invalidItem)).toThrow();
  });
});
```

## Testing Methodologies

### Test-Driven Development (TDD) for Domain Logic

We use TDD to ensure our domain models correctly implement complex business rules:

1. **Red-Green-Refactor Cycle** for domain logic
2. **Domain-First Approach**: Start with core domain models before infrastructure
3. **Focus on Business Invariants**: Test business rules from requirements

### Behavior-Driven Development (BDD) for Features

BDD scenarios define acceptance criteria for business features:

1. **Feature Files** in Gherkin format
2. **Collaborative** scenario writing with domain experts
3. **Executable Specifications** that verify business requirements

## Testing Layers

### 1. Domain Layer Tests (Pre-Implementation)

These tests verify the domain model's completeness and business invariants before code is written:

- **Domain Completeness Tests**: Verify all required domain elements exist
- **Value Object Invariants**: Immutability, validation, equality semantics
- **Entity Identity Rules**: Entity identification and equality
- **Aggregate Invariants**: Business rules and constraints
- **Domain Events**: Event structure and properties

### 2. Unit Tests (TDD Focus)

These tests drive the implementation of domain objects and services:

- **Product Authentication**:
  - Counterfeit detection logic
  - Quality verification workflows
  - Provenance validation

- **Pricing**:
  - Volume discount calculations
  - Customer-specific pricing
  - Currency conversion rules

- **Subscriptions**:
  - Renewal logic
  - Pause/resume behavior
  - Delivery scheduling

### 3. Acceptance Tests (BDD Focus)

These tests validate end-user features and business processes:

- Order processing workflows
- Subscription management
- Inventory reconciliation
- Quality control processes

### 4. Integration Tests

These tests verify interactions between bounded contexts:

- End-to-end order fulfillment
- Subscription renewal flows
- Inventory updates from orders
- Quality check integrations

## Business-Focused Examples

### TDD Example: Product Authentication

```typescript
describe('Product Authentication', () => {
  test('authenticating a product with valid certificate marks it as genuine', () => {
    // Arrange
    const product = Product.create({
      id: 'PROD-123',
      name: 'Aged Balsamic Vinegar',
      origin: 'Italy',
      certificateNumber: 'CERT-ABC-123',
      authenticationStatus: AuthenticationStatus.PENDING
    });
    
    const certificate = new Certificate('CERT-ABC-123', 'DOP', new Date('2025-12-31'));
    
    // Act
    product.authenticate(certificate);
    
    // Assert
    expect(product.authenticationStatus).toBe(AuthenticationStatus.AUTHENTICATED);
    expect(product.domainEvents).toContainEqual(
      expect.objectContaining({
        type: 'ProductAuthenticated',
        productId: 'PROD-123',
        certificateType: 'DOP'
      })
    );
  });

  test('authentication fails with expired certificate', () => {
    const product = Product.create({
      id: 'PROD-124',
      name: 'Truffle Oil',
      origin: 'France',
      certificateNumber: 'CERT-EXP-001',
      authenticationStatus: AuthenticationStatus.PENDING
    });
    
    const expiredCertificate = new Certificate(
      'CERT-EXP-001', 
      'AOC', 
      new Date('2020-12-31')
    );
    
    expect(() => product.authenticate(expiredCertificate))
      .toThrow('Certificate has expired');
    
    expect(product.authenticationStatus).toBe(AuthenticationStatus.FAILED);
  });
});
```

### BDD Example: Subscription Renewal

```gherkin
# features/subscriptions/subscription_renewal.feature
Feature: Subscription Renewal
  As a premium customer
  I want my subscription to renew automatically
  So that I don't experience any disruption in service

  Background:
    Given I have an active premium subscription for "Monthly Cheese Selection"
    And my payment method is valid
    And my subscription is due for renewal in 3 days

  Scenario: Successful automatic renewal
    When the subscription renewal job runs
    Then my subscription should be renewed for another month
    And a payment of $89.99 should be processed
    And I should receive a renewal confirmation email
    And my next delivery should be scheduled

  Scenario: Renewal with expired payment method
    Given my payment method is expired
    When the subscription renewal job runs
    Then the system should notify me to update my payment method
    And my subscription should be marked as "Payment Required"
    And no payment should be processed
```

### Quality Verification Rules

```typescript
describe('Quality Verification', () => {
  test('product failing quality check is quarantined', () => {
    const product = new Product(/* ... */);
    const qualityCheck = new QualityCheck({
      productId: product.id,
      checkerId: 'QA-001',
      passed: false,
      reason: 'Mold detected',
      checkDate: new Date()
    });
    
    product.recordQualityCheck(qualityCheck);
    
    expect(product.quarantineStatus).toBe(QuarantineStatus.QUARANTINED);
    expect(product.domainEvents).toContainEqual(
      expect.objectContaining({
        type: 'ProductQuarantined',
        productId: product.id,
        reason: 'Mold detected'
      })
    );
  });
});
```

## Running Tests

### Domain Tests (Pre-Implementation)

```bash
# Run domain completeness tests
npm run test:domain

# Generate domain tests from documentation
npm run generate:domain-tests
```

### TDD Workflow

```bash
# Run unit tests in watch mode (ideal for TDD)
npm test -- --watch --testPathPattern=unit

# Run tests for a specific aggregate
npm test -- --testPathPattern=Product.test.ts
```

### BDD Workflow

```bash
# Run all BDD features
npm test -- --testPathPattern=acceptance

# Run specific feature
npm test -- features/subscriptions/subscription_renewal.feature
```

### Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run with specific focus
npm run test:integration -- --testPathPattern=order_processing
```

## Coverage Requirements

Test coverage thresholds are defined to align with business metrics in our acceptance criteria:

| Bounded Context | Coverage Requirement | Related Business Metrics |
|-----------------|----------------------|-------------------------|
| Catalog Authentication | 95% | Authentication scan success rate ≥ 99.5%, counterfeit detection rate ≥ 98% |
| Pricing | 100% | Price calculation accuracy = 100%, weighted gross margin ≥ 35% |
| Subscription | 90% | Churn rate ≤ 5%, MRR growth ≥ 10% |
| Inventory | 95% | Inventory accuracy ≥ 99.9%, forecast accuracy ≥ 85%, cold chain compliance ≥ 99.9% |
| Order | 95% | Order accuracy ≥ 99.9%, on-time delivery ≥ 95%, order processing time ≤ 5 seconds |
| Catalog | 85% | Data completeness ≥ 98%, search response time ≤ 500ms |
| Customer | 90% | Segmentation accuracy ≥ 90%, churn reduction ≥ 30% |
| Marketing | 80% | Campaign ROI improved by ≥ 25%, content engagement improved by ≥ 30% |
| Payment | 95% | Payment success rate ≥ 99.5%, reconciliation accuracy = 100% |

### Critical Paths

The following paths require 100% test coverage:

1. **Quality Verification Workflow**: Critical for food safety and product integrity
2. **Authentication Process**: Essential for counterfeit prevention
3. **Price Calculation Logic**: Must be 100% accurate for pricing integrity
4. **Payment Processing**: Critical financial transaction paths

## Test Data Management

### Domain-Specific Test Factories

```typescript
// tests/factories/ProductFactory.ts
export class ProductFactory {
  static createAuthenticatedProduct(overrides: Partial<ProductProps> = {}) {
    return Product.create({
      id: `PROD-${Math.floor(Math.random() * 10000)}`,
      name: 'Aged Balsamic Vinegar',
      origin: 'Italy',
      certificateNumber: `CERT-${Math.random().toString(36).substr(2, 8)}`,
      authenticationStatus: AuthenticationStatus.AUTHENTICATED,
      ...overrides
    });
  }
  
  static createQuarantinedProduct(overrides: Partial<ProductProps> = {}) {
    const product = this.createAuthenticatedProduct(overrides);
    const qualityCheck = new QualityCheck({
      productId: product.id,
      checkerId: 'QA-001',
      passed: false,
      reason: 'Quality standards not met',
      checkDate: new Date()
    });
    product.recordQualityCheck(qualityCheck);
    return product;
  }
}
```

### Test Data Organization

Test data is organized to match our prioritized implementation plan:

1. **Priority 1**: Core domain events and value objects test data
   - Quality verification scenarios
   - Customer segment test data

2. **Priority 2**: High-value business services test data
   - Provenance verification scenarios
   - Inventory management test cases
   - Shipment scenarios

3. **Priority 3**: Integration components test data
   - Supplier integration mock data
   - Content service test scenarios
   - Reporting service test metrics

## CI/CD Integration

### Pipeline Structure

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

### Quality Gates

1. **Domain Model Gate**: Domain completeness tests must pass
2. **Unit Test Gate**: Core business logic tests must pass
3. **Acceptance Test Gate**: Business features must meet criteria
4. **Integration Test Gate**: End-to-end flows must function
5. **Coverage Gate**: Coverage thresholds must be met

## Review Process

### Test Review Workflow

1. **Domain Expert Review**: Verify business rules are correctly tested
2. **Technical Review**: Verify test quality and coverage
3. **Ubiquitous Language Check**: Ensure tests use correct terminology
4. **Metrics Validation**: Validate business metrics are testable

### Documentation Integration

Tests serve as living documentation that align with:

1. **Domain Knowledge Repository**: Tests verify documented domain rules
2. **Ubiquitous Language Framework**: Tests use consistent terminology
3. **Domain Event Catalog**: Tests verify correct event structures
4. **Business Metrics**: Tests validate measurable success metrics

> **Related Document**: For detailed guidance on using ubiquitous language in tests, see the [Ubiquitous Language in Testing](/DDD_Artefacts/docs/v2/ubiquitous-language/implementation-guides/testing.md) guide.

## Conclusion

This testing strategy ensures that Elias Food Imports' domain model is validated before implementation and that all business rules are properly enforced. By following this domain-first, test-driven approach, we maintain the integrity of our domain model while delivering high-quality software that meets our business requirements.

---

*"First, solve the problem. Then, write the code." — John Johnson*

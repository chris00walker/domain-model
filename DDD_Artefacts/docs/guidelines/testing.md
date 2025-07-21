---
title: "Ubiquitous Language in Testing"
version: "2.0"
status: "Final"
owner: "Domain Team"
reviewers: "@domain-experts"
last_updated: "2025-06-06"
---

# Ubiquitous Language in Testing

## Overview

This guide provides comprehensive direction on integrating the ubiquitous language into testing practices for Elias Food Imports. Consistent terminology between tests and the domain model ensures that tests accurately verify domain concepts and behavior while serving as living documentation of business rules.

## Strategic Importance

Incorporating ubiquitous language into testing has several strategic benefits:

1. **Validation of Domain Model**: Tests verify that the domain model correctly implements business rules
2. **Documentation of Business Rules**: Tests serve as executable specifications of business requirements
3. **Knowledge Preservation**: Tests capture domain knowledge in executable form
4. **Communication Bridge**: Tests provide a common language between technical and business stakeholders
5. **Quality Assurance**: Tests validate that the system behaves according to business expectations

## Key Principles

1. **Test Names Should Reflect Domain Concepts**: Name tests using domain terminology and business scenarios
2. **Test Data Should Use Domain Examples**: Create test data that represents real business scenarios
3. **Test Assertions Should Verify Domain Rules**: Assert based on domain invariants and business rules
4. **Test Documentation Should Use Domain Language**: Document tests using ubiquitous language

## Test Naming Guidelines

| Pattern | Example | Notes |
|---------|---------|-------|
| `test[Domain*Operation]*[Scenario]*[Expected*Result]` | `testPlaceOrder*WithValidItems*OrderCreated` | For unit tests |
| `[Feature]*[Scenario]*[Expected*Result]` | `OrderPlacement*WithInvalidPayment_ReturnsError` | For feature/integration tests |
| `[Business*Rule]*[Condition]` | `MinimumOrderAmount_EnforcedForWholesaleCustomers` | For business rule verification |

## Test Structure Best Practices

### Arrange-Act-Assert with Domain Focus

```typescript
// GOOD: Using domain terminology in test
test("testCalculatePrice*WithVolumeDiscount*AppliesCorrectDiscount", () => {
  // Arrange: Set up using domain concepts
  const wholesaleCustomer = new Customer("ABC Corp", CustomerType.WHOLESALE);
  const Product = new Product("Parmigiano Reggiano", ProductCategory.CHEESE);
  const quantity = 10;
  // Act: Perform domain operation
  const price = pricingService.calculatePrice(Product, quantity, wholesaleCustomer);
  // Assert: Verify using domain rules
  expect(price.hasDiscount()).toBe(true);
  expect(price.discountType).toBe(DiscountType.VOLUME);
  expect(price.finalAmount).toBe(Money.euros(450));
});
// BAD: Using technical/generic terminology
test("testCalc*10Items*GetsDiscount", () => {
  const c = new Customer("ABC Corp", 2);
  const p = new Product("Cheese", 1);
  const q = 10;
  const result = service.calc(p, q, c);
  expect(result.d).toBe(true);
  expect(result.dt).toBe(1);
  expect(result.fa).toBe(450);
});
```

## Testing Domain Rules

Ensure tests verify the business rules and metrics defined in acceptance criteria:
| Business Metric | Test Approach | Example Test |
|-----------------|---------------|-------------|
| Price calculation accuracy = 100% | Test all Pricing scenarios | `testCalculatePrice*WithAllFactors*MatchesExpectedTotal` |
| Authentication scan success rate ≥ 99.5% | Test edge cases and error handling | `testAuthenticateProduct*WithValidCode*ReturnsAuthenticated` |
| Order accuracy ≥ 99.9% | Verify Order processing workflow | `testProcessOrder*WithValidInput*CreatesCorrectLineItems` |

## Test Data Guidelines

1. **Use Domain-Meaningful Values**: Create test data that represents real business scenarios
2. **Name Test Data Using Domain Terms**: Use domain terminology in test data variable names
3. **Group Related Test Data**: Organize test data by domain concept
4. **Document Test Data Significance**: Explain why specific test values were chosen

```typescript
// GOOD: Domain-meaningful test data
const testProducts = {
  premiumCheese: new Product(
```

"Parmigiano Reggiano",
ProductCategory.CHEESE,
ProductOrigin.ITALY,
Money.euros(45.00)

```
  ),
  standardOliveOil: new Product(
```

"Extra Virgin Olive Oil",
ProductCategory.OIL,
ProductOrigin.GREECE,
Money.euros(12.50)

```
  )
};
// BAD: Generic test data
const p1 = new Product("Product1", 1, 2, 45.00);
const p2 = new Product("Product2", 3, 4, 12.50);
```

## Test Fixtures and Factories

Create test fixtures and factories that use domain terminology:

```typescript
// Domain-aligned test factory
class OrderTestFactory {
  static createRetailOrder(Customer: Customer): Order {
    return new Order(
      Customer,
      OrderType.RETAIL,
      DeliveryMethod.STANDARD
    );
  }
  static createWholesaleOrder(Customer: Customer): Order {
    return new Order(
      Customer,
      OrderType.WHOLESALE,
      DeliveryMethod.BULK
    );
  }
  static addStandardLineItems(Order: Order): Order {
    Order.addLineItem(new LineItem(testProducts.premiumCheese, 2));
    Order.addLineItem(new LineItem(testProducts.standardOliveOil, 1));
    return Order;
  }
}
```

## BDD-Style Testing

For behavior-driven development, use domain scenarios in Gherkin syntax:

```gherkin
Feature: Subscription Management
  Scenario: Pausing an active Subscription
    Given a Customer has an active Subscription
    And the Subscription contains premium cheese products
    When the Customer pauses their Subscription
    Then the Subscription status should be "paused"
    And no deliveries should be scheduled
    And the Customer should be notified about the pause
```

### Example Step Definitions (TypeScript + Jest + Cucumber)

```typescript
import { defineFeature, loadFeature } from 'jest-cucumber';
import { SubscriptionService } from '../../src/subscriptions/SubscriptionService';
import { CustomerTestFactory } from '../factories/CustomerTestFactory';
import { ProductTestFactory } from '../factories/ProductTestFactory';

const feature = loadFeature('./SubscriptionManagement.feature');

defineFeature(feature, test => {
  let subscriptionService: SubscriptionService;
  let customer: Customer;
  let subscriptionId: string;

  beforeEach(() => {
    subscriptionService = new SubscriptionService();
    customer = CustomerTestFactory.createRetailCustomer();
  });

  test('Pausing an active Subscription', ({ given, and, when, then }) => {
    given(/^a Customer has an active Subscription$/, () => {
      const cheeseBundle = ProductTestFactory.createCheeseBundle();
      subscriptionId = subscriptionService.createSubscription(customer.id, cheeseBundle);
    });

    and(/^the Subscription contains premium cheese products$/, () => {
      const subscription = subscriptionService.getSubscription(subscriptionId);
      expect(subscription.containsProductCategory('CHEESE')).toBe(true);
    });

    when(/^the Customer pauses their Subscription$/, () => {
      subscriptionService.pauseSubscription(subscriptionId);
    });

    then(/^the Subscription status should be "paused"$/, () => {
      const subscription = subscriptionService.getSubscription(subscriptionId);
      expect(subscription.status).toBe('PAUSED');
    });

    and(/^no deliveries should be scheduled$/, () => {
      const deliveries = subscriptionService.getScheduledDeliveries(subscriptionId);
      expect(deliveries.length).toBe(0);
    });

    and(/^the Customer should be notified about the pause$/, () => {
      const notifications = subscriptionService.getNotificationsFor(customer.id);
      expect(notifications).toContainEqual(
        expect.objectContaining({
          type: 'SubscriptionPaused',
          subscriptionId,
        }),
      );
    });
  });
});
```

## Test Documentation

Document tests using domain terminology:

```typescript
/**
 - Tests the Subscription renewal process.
 *
 - Business rule: Subscriptions are automatically renewed based on their
 - delivery frequency unless the Customer has opted out or the Subscription
 - is paused/cancelled.
 *
 - Related metrics: Subscription renewal rate ≥ 95%
 */
test("testRenewSubscription*WithActiveStatus*SchedulesNextDelivery", () => {
  // Test implementation
});
```

## Integration with Business Metrics and Acceptance Criteria

Link tests directly to business metrics from acceptance criteria:
| Bounded Context | Business Metric | Test Coverage |
|----------------|-----------------|--------------|
| Pricing | Price calculation accuracy = 100% | `PricingServiceTests` |
| Pricing | Weighted gross margin ≥ 35% | `MarginCalculationTests` |
| Subscription | Churn rate ≤ 5% | `SubscriptionCancellationTests` |
| Order | Order accuracy ≥ 99.9% | `OrderProcessingTests` |
| Inventory | Inventory accuracy ≥ 99.9% | `InventoryReconciliationTests` |
| Catalog Authentication | Counterfeit detection rate ≥ 98% | `AuthenticationValidationTests` |
| Customer | Segmentation accuracy ≥ 90% | `CustomerSegmentationTests` |
| Marketing | Campaign ROI metrics | `CampaignEffectivenessTests` |
| Payment | Reconciliation accuracy = 100% | `PaymentReconciliationTests` |

## Testing Across Bounded Contexts

When testing interactions between bounded contexts, follow these principles:

1. **Focus on Domain Events**: Test the publishing and handling of domain events
2. **Use Real Names from Domain Event Catalog**: Reference event names from the Domain Event Catalog
3. **Test Context Translations**: Verify that context translations maintain semantic integrity
4. **Test Anti-Corruption Layers**: Ensure external models are properly translated to internal models
Example of testing a domain event:

```typescript
test("testOrderPlaced_PublishesOrderPlacedEvent_WithCorrectData", () => {
  // Arrange
  const customer = CustomerTestFactory.createRetailCustomer();
  const order = OrderTestFactory.createStandardOrder(customer);
  OrderTestFactory.addStandardLineItems(order);
  
  // Act
  orderService.placeOrder(order);
  
  // Assert
  expect(eventBus.published).toContainEqual({
    type: "OrderPlaced", // Entity-first, past-tense naming convention
    payload: {
      orderId: expect.any(String),
      customerId: customer.id.value,
      orderTotal: expect.any(Number),
      lineItems: expect.arrayContaining([
        expect.objectContaining({
          productId: expect.any(String),
          quantity: expect.any(Number),
          price: expect.any(Number)
        })
      ])
    }
  });
});
```

## Common Anti-patterns

1. **Technical Test Names**: `testMethod1*Case2` instead of `testCalculatePrice*WithVolumeDiscount`
2. **Generic Assertions**: `expect(result).toBeTruthy()` instead of `expect(Order.isValid()).toBe(true)`
3. **Meaningless Test Data**: Using `"test"`, `123` instead of domain-meaningful values
4. **Missing Domain Context**: Not explaining the business rule being tested
5. **Testing Implementation Details**: Testing how something works rather than what behavior it exhibits
6. **Ignoring Value Objects**: Not testing value object invariants or equality semantics
7. **Missing Business Metric Validation**: Not aligning tests with business metrics from acceptance criteria

## Implementation Checklist

- [ ] Review test names for alignment with domain terminology
- [ ] Ensure test data represents real business scenarios
- [ ] Verify that assertions check domain rules and invariants
- [ ] Document tests using domain language
- [ ] Link tests to business metrics from acceptance criteria
- [ ] Test domain events according to the Domain Event Catalog
- [ ] Validate that tests enforce business rules from domain documentation

## Integration with Other Ubiquitous Language Documents

This testing guide complements other Ubiquitous Language documents:
| Document | Relationship to Testing |
|----------|-------------------------|
| Domain Event Naming Analysis | Ensures tests use correct event names and structures |
| API Design Guidelines | Informs API testing approaches and terminology |
| Database Design Guidelines | Guides persistence testing terminology |
| UI Design Guidelines | Informs UI testing terminology and scenarios |
| Value Objects Analysis | Informs testing of value object semantics |
| Business Metrics Domain Mapping | Guides selection of test scenarios based on metrics |

## Conclusion

Aligning tests with the ubiquitous language creates a powerful feedback loop that validates both the code and the domain model. By following these guidelines, tests become living documentation that verifies business rules while reinforcing domain concepts.
*This document should be reviewed and updated as testing practices evolve. Last updated: 2025-06-06*

---

⚑ Related

- [Domain Glossary](../glossary.md)
- [Ubiquitous Language Evolution Process](./ubiquitous_language_evolution.md)

↩ [Back to Framework TOC](../README.md)

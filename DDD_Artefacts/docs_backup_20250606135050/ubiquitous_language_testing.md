# Ubiquitous Language in Testing

## Purpose

This document provides concise guidance on integrating the ubiquitous language into testing practices for Elias Food Imports. Consistent terminology between tests and the domain model ensures that tests accurately verify domain concepts and behavior.

## Key Principles

1. **Test Names Should Reflect Domain Concepts**: Name tests using domain terminology and business scenarios
2. **Test Data Should Use Domain Examples**: Create test data that represents real business scenarios
3. **Test Assertions Should Verify Domain Rules**: Assert based on domain invariants and business rules
4. **Test Documentation Should Use Domain Language**: Document tests using ubiquitous language

## Test Naming Guidelines

| Pattern | Example | Notes |
|---------|---------|-------|
| `test[Domain_Operation]_[Scenario]_[Expected_Result]` | `testPlaceOrder_WithValidItems_OrderCreated` | For unit tests |
| `[Feature]_[Scenario]_[Expected_Result]` | `OrderPlacement_WithInvalidPayment_ReturnsError` | For feature/integration tests |
| `[Business_Rule]_[Condition]` | `MinimumOrderAmount_EnforcedForWholesaleCustomers` | For business rule verification |

## Test Structure Best Practices

### Arrange-Act-Assert with Domain Focus

```typescript
// GOOD: Using domain terminology in test
test("testCalculatePrice_WithVolumeDiscount_AppliesCorrectDiscount", () => {
  // Arrange: Set up using domain concepts
  const wholesaleCustomer = new Customer("ABC Corp", CustomerType.WHOLESALE);
  const product = new Product("Parmigiano Reggiano", ProductCategory.CHEESE);
  const quantity = 10;
  
  // Act: Perform domain operation
  const price = pricingService.calculatePrice(product, quantity, wholesaleCustomer);
  
  // Assert: Verify using domain rules
  expect(price.hasDiscount()).toBe(true);
  expect(price.discountType).toBe(DiscountType.VOLUME);
  expect(price.finalAmount).toBe(Money.euros(450));
});

// BAD: Using technical/generic terminology
test("testCalc_10Items_GetsDiscount", () => {
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
| Price calculation accuracy = 100% | Test all pricing scenarios | `testCalculatePrice_WithAllFactors_MatchesExpectedTotal` |
| Authentication scan success rate ≥ 99.5% | Test edge cases and error handling | `testAuthenticateProduct_WithValidCode_ReturnsAuthenticated` |
| Order accuracy ≥ 99.9% | Verify order processing workflow | `testProcessOrder_WithValidInput_CreatesCorrectLineItems` |

## Test Data Guidelines

1. **Use Domain-Meaningful Values**: Create test data that represents real business scenarios
2. **Name Test Data Using Domain Terms**: Use domain terminology in test data variable names
3. **Group Related Test Data**: Organize test data by domain concept
4. **Document Test Data Significance**: Explain why specific test values were chosen

```typescript
// GOOD: Domain-meaningful test data
const testProducts = {
  premiumCheese: new Product(
    "Parmigiano Reggiano", 
    ProductCategory.CHEESE,
    ProductOrigin.ITALY,
    Money.euros(45.00)
  ),
  standardOliveOil: new Product(
    "Extra Virgin Olive Oil",
    ProductCategory.OIL,
    ProductOrigin.GREECE,
    Money.euros(12.50)
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
  static createRetailOrder(customer: Customer): Order {
    return new Order(
      customer,
      OrderType.RETAIL,
      DeliveryMethod.STANDARD
    );
  }
  
  static createWholesaleOrder(customer: Customer): Order {
    return new Order(
      customer,
      OrderType.WHOLESALE,
      DeliveryMethod.BULK
    );
  }
  
  static addStandardLineItems(order: Order): Order {
    order.addLineItem(new LineItem(testProducts.premiumCheese, 2));
    order.addLineItem(new LineItem(testProducts.standardOliveOil, 1));
    return order;
  }
}
```

## BDD-Style Testing

For behavior-driven development, use domain scenarios in Gherkin syntax:

```gherkin
Feature: Subscription Management
  
  Scenario: Pausing an active subscription
    Given a customer has an active subscription
    And the subscription contains premium cheese products
    When the customer pauses their subscription
    Then the subscription status should be "paused"
    And no deliveries should be scheduled
    And the customer should be notified about the pause
```

## Test Documentation

Document tests using domain terminology:

```typescript
/**
 * Tests the subscription renewal process.
 * 
 * Business rule: Subscriptions are automatically renewed based on their
 * delivery frequency unless the customer has opted out or the subscription
 * is paused/cancelled.
 * 
 * Related metrics: Subscription renewal rate ≥ 95%
 */
test("testRenewSubscription_WithActiveStatus_SchedulesNextDelivery", () => {
  // Test implementation
});
```

## Integration with Acceptance Criteria

Link tests directly to business metrics from acceptance criteria:

| Bounded Context | Business Metric | Test Coverage |
|----------------|-----------------|--------------|
| Pricing | Price calculation accuracy = 100% | `PricingServiceTests` |
| Pricing | Weighted gross margin ≥ 35% | `MarginCalculationTests` |
| Subscription | Churn rate ≤ 5% | `SubscriptionCancellationTests` |
| Order | Order accuracy ≥ 99.9% | `OrderProcessingTests` |

## Common Anti-patterns

1. **Technical Test Names**: `testMethod1_Case2` instead of `testCalculatePrice_WithVolumeDiscount`
2. **Generic Assertions**: `expect(result).toBeTruthy()` instead of `expect(order.isValid()).toBe(true)`
3. **Meaningless Test Data**: Using `"test"`, `123` instead of domain-meaningful values
4. **Missing Domain Context**: Not explaining the business rule being tested

## Implementation Checklist

- [ ] Review test names for alignment with domain terminology
- [ ] Ensure test data represents real business scenarios
- [ ] Verify that assertions check domain rules and invariants
- [ ] Document tests using domain language
- [ ] Link tests to business metrics from acceptance criteria

## Conclusion

Aligning tests with the ubiquitous language creates a powerful feedback loop that validates both the code and the domain model. By following these guidelines, tests become living documentation that verifies business rules while reinforcing domain concepts.

---
*This document should be reviewed and updated as testing practices evolve. Last updated: 2025-06-04*

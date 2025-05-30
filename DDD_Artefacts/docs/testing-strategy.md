# Domain-Driven Design Testing Strategy

## Overview

This document outlines the testing strategy for the Elias Food Imports (EFI) domain model, focusing on how to effectively test Domain-Driven Design (DDD) components, enforce invariants, and validate domain behavior across bounded contexts.

## Testing Pyramid

Our testing approach follows a modified testing pyramid tailored for DDD:

```
          ▲
         ╱ ╲  End-to-End Tests (10%)
        ╱───╲
       ╱     ╲ Integration Tests (20%)
      ╱───────╲
     ╱         ╲ Domain Tests (30%)
    ╱───────────╲
   ╱             ╲ Unit Tests (40%)
  ╱───────────────╲
 ╱                 ╲
╱───────────────────╲
```

## Test Categories

### 1. Unit Tests

Purpose: Test individual components in isolation.

#### 1.1 Value Object Tests

```typescript
describe('Money Value Object', () => {
  it('should create a valid Money object', () => {
    const moneyResult = Money.create(100, 'BBD');
    expect(moneyResult.isSuccess()).toBe(true);
    expect(moneyResult.value.amount).toBe(100);
    expect(moneyResult.value.currency).toBe('BBD');
  });

  it('should reject invalid currency', () => {
    const moneyResult = Money.create(100, 'INVALID');
    expect(moneyResult.isFailure()).toBe(true);
  });

  it('should be immutable', () => {
    const moneyResult = Money.create(100, 'BBD');
    const money = moneyResult.value;
    
    // Try to modify and verify it creates a new instance
    const addResult = money.add(Money.create(50, 'BBD').value);
    expect(money.amount).toBe(100); // Original unchanged
    expect(addResult.value.amount).toBe(150); // New instance created
  });
});
```

#### 1.2 Entity Tests

```typescript
describe('Customer Entity', () => {
  it('should create valid Customer', () => {
    // Arrange
    const customerProps = {
      name: 'Test Customer',
      type: CustomerType.create(CustomerTypeEnum.DIASPORA).value,
      contactInfo: ContactInfo.create({
        email: 'test@example.com',
        phone: '+1234567890'
      }).value,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Act
    const result = DiasporaCustomer.create({
      ...customerProps,
      culturalBackground: 'Lebanese',
      preferredCuisines: ['Lebanese', 'Mediterranean']
    });
    
    // Assert
    expect(result.isSuccess()).toBe(true);
  });
  
  it('should reject invalid properties', () => {
    // Test with missing required properties
    const result = DiasporaCustomer.create({
      name: '',
      type: CustomerType.create(CustomerTypeEnum.DIASPORA).value,
      culturalBackground: '',
      preferredCuisines: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    expect(result.isFailure()).toBe(true);
  });
});
```

### 2. Domain Tests

Purpose: Test aggregate behavior and invariants.

#### 2.1 Aggregate Tests

```typescript
describe('Order Aggregate', () => {
  it('should enforce minimum order amount', () => {
    // Arrange
    const item = OrderItem.create({
      productId: ProductId.create('123').value,
      quantity: 1,
      unitPrice: Money.create(5, 'BBD').value
    }).value;
    
    // Act & Assert
    const orderResult = Order.create({
      customerId: CustomerId.create('123').value,
      items: [item], // Total order value is only BBD 5
      status: OrderStatus.create('Created').value,
      shippingAddress: 'Test Address',
      billingAddress: 'Test Address',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Assuming there's a minimum order amount invariant of BBD 10
    expect(orderResult.isFailure()).toBe(true);
    expect(orderResult.error).toContain('minimum order amount');
  });
  
  it('should calculate total correctly', () => {
    // Arrange
    const items = [
      OrderItem.create({
        productId: ProductId.create('123').value,
        quantity: 2,
        unitPrice: Money.create(10, 'BBD').value
      }).value,
      OrderItem.create({
        productId: ProductId.create('456').value,
        quantity: 1,
        unitPrice: Money.create(15, 'BBD').value
      }).value
    ];
    
    // Act
    const order = Order.create({
      customerId: CustomerId.create('123').value,
      items: items,
      status: OrderStatus.create('Created').value,
      shippingAddress: 'Test Address',
      billingAddress: 'Test Address',
      createdAt: new Date(),
      updatedAt: new Date()
    }).value;
    
    const total = order.calculateTotal();
    
    // Assert
    expect(total.value.amount).toBe(35); // (2 * 10) + (1 * 15)
  });
  
  it('should enforce state transition rules', () => {
    // Arrange
    const order = createTestOrder(); // Helper to create a valid order
    
    // Act & Assert
    
    // Valid transition: Created -> Paid
    const confirmResult = order.confirmPayment();
    expect(confirmResult.isSuccess()).toBe(true);
    expect(order.status.value).toBe('Paid');
    
    // Invalid transition: Paid -> Created (can't go backwards)
    const invalidTransition = Order.create({
      ...order.props,
      status: OrderStatus.create('Created').value
    });
    expect(invalidTransition.isFailure()).toBe(true);
    
    // Valid transition: Paid -> Fulfilled
    const fulfillResult = order.fulfill();
    expect(fulfillResult.isSuccess()).toBe(true);
    expect(order.status.value).toBe('Fulfilled');
    
    // Invalid operation: Can't cancel a fulfilled order
    const cancelResult = order.cancel('No longer needed');
    expect(cancelResult.isFailure()).toBe(true);
  });
});
```

#### 2.2 Domain Service Tests

```typescript
describe('CustomerFactory Domain Service', () => {
  it('should create appropriate customer type based on parameters', () => {
    // Arrange
    const factory = new CustomerFactory();
    const diasporaParams = {
      name: 'Lebanese Family',
      email: 'family@example.com',
      culturalBackground: 'Lebanese',
      preferredCuisines: ['Lebanese', 'Mediterranean']
    };
    
    // Act
    const customer = factory.createCustomer(diasporaParams);
    
    // Assert
    expect(customer).toBeInstanceOf(DiasporaCustomer);
    expect(customer.type.value).toBe('DIASPORA');
  });
});
```

### 3. Integration Tests

Purpose: Test interactions between bounded contexts.

#### 3.1 Cross-Context Integration

```typescript
describe('Order and Inventory Integration', () => {
  it('should decrease inventory when order is placed', async () => {
    // Arrange
    const productId = 'product-123';
    const catalogService = new CatalogService(/* dependencies */);
    const orderingService = new OrderingService(/* dependencies */);
    
    // Get initial inventory
    const initialInventory = await catalogService.getProductInventory(productId);
    
    // Act - Create an order
    await orderingService.createOrder({
      customerId: 'customer-123',
      items: [{
        productId: productId,
        quantity: 2
      }],
      shippingAddress: 'Test Address',
      billingAddress: 'Test Billing'
    });
    
    // Assert - Verify inventory decreased
    const updatedInventory = await catalogService.getProductInventory(productId);
    expect(updatedInventory).toBe(initialInventory - 2);
  });
});
```

#### 3.2 Domain Event Tests

```typescript
describe('Domain Event Integration', () => {
  it('should propagate OrderCreated event to Catalog context', async () => {
    // Arrange
    const eventBus = new DomainEventBus();
    const orderAggregate = createTestOrder();
    const mockCatalogEventHandler = jest.fn();
    
    // Register mock handler
    eventBus.registerHandler('OrderCreated', mockCatalogEventHandler);
    
    // Act
    DomainEvents.dispatchEventsForAggregate(orderAggregate.id);
    
    // Assert
    expect(mockCatalogEventHandler).toHaveBeenCalled();
    const eventArg = mockCatalogEventHandler.mock.calls[0][0];
    expect(eventArg).toBeInstanceOf(OrderCreated);
    expect(eventArg.aggregateId).toBe(orderAggregate.id);
  });
  
  it('should handle InventoryAdjusted event from Catalog context', async () => {
    // Arrange
    const catalogService = new CatalogService(/* dependencies */);
    const mockOrderingEventHandler = jest.fn();
    const eventBus = new DomainEventBus();
    
    // Register mock handler
    eventBus.registerHandler('InventoryAdjusted', mockOrderingEventHandler);
    
    // Act - Adjust inventory which should publish an event
    await catalogService.adjustInventory('product-123', -5);
    
    // Assert
    expect(mockOrderingEventHandler).toHaveBeenCalled();
    const eventArg = mockOrderingEventHandler.mock.calls[0][0];
    expect(eventArg).toBeInstanceOf(InventoryAdjusted);
    expect(eventArg.delta).toBe(-5);
  });
});
```

### 4. End-to-End Tests

Purpose: Test complete business flows.

```typescript
describe('Subscription Order Flow', () => {
  it('should successfully process a subscription order', async () => {
    // Arrange
    const customer = await createTestCustomer();
    const product = await createTestProduct();
    
    // Act - Create subscription
    const subscription = await subscriptionService.createSubscription({
      customerId: customer.id,
      items: [{
        productId: product.id,
        quantity: 1
      }],
      frequency: 'MONTHLY',
      autoRenew: true
    });
    
    // Process first delivery
    await orderingService.processSubscriptionDelivery(subscription.id);
    
    // Assert
    const orders = await orderingService.getOrdersByCustomerId(customer.id);
    expect(orders.length).toBe(1);
    
    const updatedSubscription = await subscriptionService.getSubscription(subscription.id);
    expect(updatedSubscription.remainingDeliveries).toBe(subscription.totalDeliveries - 1);
    
    const updatedProduct = await catalogService.getProduct(product.id);
    expect(updatedProduct.inventoryCount).toBe(product.inventoryCount - 1);
  });
});
```

## Testing Domain Invariants

### 1. Explicit Invariant Testing

For each aggregate, create a set of tests that explicitly verify all documented invariants:

```typescript
describe('Product Invariants', () => {
  it('should enforce non-negative inventory', () => {
    // Arrange
    const product = createValidProduct();
    
    // Act
    const result = product.adjustInventory(-product.inventoryCount - 1);
    
    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.error).toContain('negative inventory');
  });
  
  it('should enforce positive price', () => {
    // Arrange
    const product = createValidProduct();
    const zeroPrice = Money.create(0, 'BBD').value;
    const negativePrice = Money.create(-10, 'BBD').value;
    
    // Act & Assert
    expect(product.changePrice(zeroPrice).isFailure()).toBe(true);
    expect(product.changePrice(negativePrice).isFailure()).toBe(true);
  });
  
  // Test other invariants...
});
```

### 2. Property-Based Testing

For complex invariants, use property-based testing to generate many test cases:

```typescript
import * as fc from 'fast-check';

describe('Order Invariants with Property Testing', () => {
  it('should always have total equal to sum of items', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            productId: fc.string(),
            quantity: fc.integer(1, 100),
            unitPrice: fc.integer(1, 1000)
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (itemsData) => {
          // Create OrderItems from generated data
          const items = itemsData.map(data => 
            OrderItem.create({
              productId: ProductId.create(data.productId).value,
              quantity: data.quantity,
              unitPrice: Money.create(data.unitPrice, 'BBD').value
            }).value
          );
          
          // Create order
          const order = createOrderWithItems(items);
          
          // Calculate expected total
          const expectedTotal = itemsData.reduce(
            (sum, item) => sum + (item.quantity * item.unitPrice), 
            0
          );
          
          // Verify total matches expected
          const actualTotal = order.calculateTotal().value.amount;
          return actualTotal === expectedTotal;
        }
      )
    );
  });
});
```

## Testing Domain Events

### 1. Event Publication Testing

Verify that appropriate domain events are published:

```typescript
describe('Domain Event Publication', () => {
  it('should publish ProductCreated event when new product is created', () => {
    // Arrange
    const productProps = {
      name: 'Test Product',
      description: 'Test Description',
      price: Money.create(100, 'BBD').value,
      inventoryCount: 10,
      isDiscontinued: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Act
    const product = Product.create(productProps).value;
    
    // Assert
    const events = product.domainEvents;
    expect(events.length).toBe(1);
    expect(events[0]).toBeInstanceOf(ProductCreated);
  });
});
```

### 2. Event Handler Testing

Test that event handlers correctly respond to domain events:

```typescript
describe('Inventory Event Handler', () => {
  it('should update inventory when OrderCreated event is received', async () => {
    // Arrange
    const handler = new InventoryEventHandler(/* dependencies */);
    const orderCreatedEvent = new OrderCreated(/* order with items */);
    
    // Mock the catalog repository
    const mockCatalogRepo = {
      findById: jest.fn().mockResolvedValue(createTestProduct()),
      save: jest.fn().mockResolvedValue(undefined)
    };
    
    // Act
    await handler.handle(orderCreatedEvent);
    
    // Assert
    expect(mockCatalogRepo.findById).toHaveBeenCalled();
    expect(mockCatalogRepo.save).toHaveBeenCalled();
    
    // Verify the product inventory was adjusted
    const savedProduct = mockCatalogRepo.save.mock.calls[0][0];
    expect(savedProduct.inventoryCount).toBeLessThan(initialInventory);
  });
});
```

## Testing Tools and Frameworks

1. **Jest**: Primary testing framework
2. **fast-check**: Property-based testing library
3. **mongodb-memory-server**: In-memory MongoDB for tests
4. **supertest**: HTTP assertions for API tests
5. **ts-mockito**: Mocking library for TypeScript

## Test Data Management

### 1. Factory Methods

Create factory functions for test data:

```typescript
// factories/product.factory.ts
export function createTestProduct(overrides = {}): Product {
  return Product.create({
    name: 'Test Product',
    description: 'Test Description',
    price: Money.create(100, 'BBD').value,
    inventoryCount: 100,
    isDiscontinued: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }).value;
}
```

### 2. Test Database Seeding

For integration tests:

```typescript
async function seedTestDatabase() {
  // Connect to test database (in-memory or dedicated test DB)
  const db = await connectToTestDb();
  
  // Clear existing data
  await db.collection('products').deleteMany({});
  await db.collection('customers').deleteMany({});
  
  // Seed with test data
  await db.collection('products').insertMany([
    // Test products
  ]);
  
  await db.collection('customers').insertMany([
    // Test customers
  ]);
  
  return db;
}
```

## CI/CD Integration

1. **Pre-commit Hooks**: Run unit tests and linting
2. **CI Pipeline Stages**:
   - Unit tests run on every commit
   - Integration tests run on PRs and main branch
   - End-to-end tests run before deployment

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on state from other tests
2. **Fast Feedback**: Unit and domain tests should run quickly
3. **Test Readability**: Use descriptive test names and follow the Arrange-Act-Assert pattern
4. **Test Coverage**: Aim for high coverage of domain logic, especially invariants
5. **Mocking Boundaries**: Mock at bounded context boundaries, not within them

## Test Doubles & Dependency Injection

### 1. Injectable Clock for Time-Dependent Logic (**CRITICAL**)

To make time-dependent domain logic testable and deterministic, we use an injectable Clock interface:

```typescript
// Clock.ts
export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class TestClock implements Clock {
  private currentTime: Date;

  constructor(initialTime?: Date) {
    this.currentTime = initialTime || new Date();
  }

  now(): Date {
    return new Date(this.currentTime);
  }

  advanceTimeByMinutes(minutes: number): void {
    this.currentTime = new Date(this.currentTime.getTime() + minutes * 60 * 1000);
  }

  // Additional helper methods...
}
```

#### Clock Injection Pattern

Inject the Clock interface in domain classes that need to access the current time:

```typescript
// Example of Clock usage in TimeSlot value object
export class TimeSlot extends ValueObject<TimeSlotProps> {
  // ...
  
  public static create(
    startTime: Date,
    endTime: Date,
    validateStartTimeInFuture: boolean = true,
    clock: Clock = new SystemClock()
  ): Result<TimeSlot, string> {
    // ...
    
    if (validateStartTimeInFuture) {
      const now = clock.now();
      if (startTime < now) {
        return failure('Start time cannot be in the past');
      }
    }
    
    // ...
  }
  
  public isActive(clock: Clock = new SystemClock()): boolean {
    const now = clock.now();
    return this.startTime <= now && this.endTime > now;
  }
  
  // ...
}
```

#### Testing with TestClock

In tests, use the TestClock to control time and create deterministic scenarios:

```typescript
describe('TimeSlot', () => {
  let testClock: TestClock;

  beforeEach(() => {
    testClock = new TestClock(new Date('2025-01-01T10:00:00Z'));
  });

  it('should correctly transition states as time advances', () => {
    // Create a timeslot in the future
    const startTime = new Date(testClock.now().getTime() + 60 * 60 * 1000); // 1hr from now
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1hr duration
    
    const result = TimeSlot.create(startTime, endTime, true, testClock);
    expect(result.isSuccess()).toBe(true);
    
    const timeSlot = result.value;
    
    // Initially pending
    expect(timeSlot.isPending(testClock)).toBe(true);
    
    // Advance time to when the slot is active
    testClock.advanceTimeByMinutes(90);
    expect(timeSlot.isActive(testClock)).toBe(true);
    
    // Advance time further to when the slot is expired
    testClock.advanceTimeByMinutes(90);
    expect(timeSlot.isExpired(testClock)).toBe(true);
  });
});
```

### 2. Domain Event Testing with EventSpy (**CRITICAL**)

For testing domain events, we use spy objects to capture and verify events:

```typescript
// EventSpy.ts
export class EventSpy {
  private events: DomainEvent[] = [];
  
  capture(event: DomainEvent): void {
    this.events.push(event);
  }
  
  getEvents<T extends DomainEvent>(eventType: new (...args: any[]) => T): T[] {
    return this.events.filter(event => event instanceof eventType) as T[];
  }
  
  // Additional helper methods...
}
```

#### Testing Event Publication

Test that domain events are properly created and have the expected payload:

```typescript
describe('DateRange domain events', () => {
  it('should raise DateRangeCreated event when created', () => {
    // Setup event capturing
    const consoleSpy = jest.spyOn(console, 'log');
    
    // Create the date range
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-10');
    const result = DateRange.create(start, end);
    
    // Verify event was published
    expect(result.isSuccess()).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith('Domain event created: DateRangeCreated');
    
    // Verify event payload
    const dateRange = result.value;
    const event = new DateRangeCreated(dateRange);
    const payload = event.toPrimitives();
    
    expect(payload.dateRange.start).toBe(start.toISOString());
    expect(payload.dateRange.end).toBe(end.toISOString());
  });
});
```

## Future Enhancements

### 1. Property-Based Testing for Invariants

For testing complex invariants across many combinations of inputs, we use property-based testing with fast-check:

```typescript
import * as fc from 'fast-check';

describe('DateRange Property Tests', () => {
  // Define generators for valid date ranges
  const validDateRangeGen = fc.tuple(
    fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }),
    fc.nat(365 * 5) // max days to add (5 years)
  ).map(([start, daysToAdd]) => {
    const end = new Date(start.getTime());
    end.setDate(end.getDate() + daysToAdd);
    return { start, end };
  });

  it('should always satisfy start ≤ end', () => {
    fc.assert(
      fc.property(validDateRangeGen, ({ start, end }) => {
        const result = DateRange.create(start, end);
        
        if (result.isSuccess()) {
          const dateRange = result.value;
          return dateRange.start.getTime() <= dateRange.end.getTime();
        }
        
        // If creation failed, it should be because start > end
        return start.getTime() > end.getTime();
      })
    );
  });

  it('should have consistent contains() and overlaps() behavior', () => {
    fc.assert(
      fc.property(
        validDateRangeGen,
        fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }),
        ({ start, end }, testDate) => {
          const result = DateRange.create(start, end);
          if (result.isFailure()) return true; // Skip invalid cases
          
          const dateRange = result.value;
          const pointDateRange = DateRange.create(testDate, testDate).value;
          
          // If date is contained, then the point range must overlap
          if (dateRange.contains(testDate)) {
            return dateRange.overlaps(pointDateRange);
          }
          
          return true;
        }
      )
    );
  });
});
```

## Best Practices for Domain Tests

1. **Inject Dependencies**: Use interfaces for all external dependencies in domain objects
2. **Control Time**: Use Clock interface for all time-dependent logic
3. **Verify Events**: Test both the trigger conditions and payload contents of domain events
4. **Deterministic Tests**: Avoid reliance on system time or other non-deterministic factors
5. **Independent Tests**: Each test should be independent and not rely on state from other tests

### Future Enhancements (continued)

2. **Universal Event Spying**

Implement a global event spying system to verify all domain events across aggregates:

```typescript
// Register the spy once in a central test setup
beforeAll(() => {
  DomainEvents.registerGlobalHandler(globalEventSpy.capture.bind(globalEventSpy));
});

// Use in any test that needs to verify domain events
it('should verify events across aggregates', () => {
  // Perform some domain operation
  customer.placeOrder(items);
  
  // Verify events across aggregates were fired
  expect(globalEventSpy.countEvents(CustomerOrderPlaced)).toBe(1);
  expect(globalEventSpy.countEvents(InventoryAdjusted)).toBe(items.length);
});
```

3. **Full Property-Based Tests for Non-Time Value Objects**

Extend property-based testing to all non-time-dependent value objects:

```typescript
describe('PostalCode Property Tests', () => {
  it('should validate postal code format for all countries', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constantFrom(...supportedCountries),
          fc.string().filter(s => !supportedCountries.includes(s))
        ),
        fc.string(),
        (country, postalCode) => {
          const result = PostalCode.create(postalCode, country);
          if (supportedCountries.includes(country)) {
            // Should validate format for supported countries
            return result.isSuccess() === validateFormat(postalCode, country);
          } else {
            // Should reject unsupported countries
            return result.isFailure();
          }
        }
      )
    );
  });
});
```

4. **Full CQRS Read-Model Projections**

Implement and test read-model projections that consume domain events:

```typescript
describe('CustomerOrderHistory Projection', () => {
  it('should build read model from domain events', () => {
    // Arrange - Create events
    const events = [
      new CustomerCreated(customer),
      new OrderPlaced(order1),
      new OrderPlaced(order2),
      new OrderFulfilled(order1)
    ];
    
    // Act - Feed events to projection
    const projection = new CustomerOrderHistoryProjection();
    events.forEach(event => projection.handle(event));
    
    // Assert - Verify read model state
    const readModel = projection.getReadModel(customer.id);
    expect(readModel.totalOrders).toBe(2);
    expect(readModel.fulfilledOrders).toBe(1);
  });
});
```

## Conclusion

This testing strategy ensures that our domain model correctly implements business rules, maintains invariants, and handles cross-context communication properly. By focusing on testing at multiple levels and using techniques like dependency injection, clock abstraction, and event spying, we can have confidence in both the individual components and their interactions.

The **critical** components of this strategy are the Clock interface for deterministic time-based testing and the EventSpy for verifying domain events. These tools are essential for creating reliable tests that validate the core domain logic.

_Last Updated: 2025-06-01_

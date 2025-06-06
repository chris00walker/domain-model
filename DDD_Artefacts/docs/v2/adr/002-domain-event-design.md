---
title: Domain Event Design Patterns
status: accepted
date: 2025-05-15
deciders: Core Architecture Team, Integration Team
---

# ADR-002: Domain Event Design Patterns

## Status
Accepted

## Context
Domain events are essential to the Elias Food Imports system, enabling loose coupling between bounded contexts while maintaining business process integrity. According to the Domain Event Catalog, there are 60+ domain events across 13 bounded contexts. As the system has evolved, several challenges emerged:

1. Inconsistent event handling and publishing
2. Difficulty verifying events in tests
3. Lack of standardized event payload structure
4. Challenges in tracking event flows across bounded contexts
5. Unclear delivery guarantees for different event types

These issues led to difficulties in ensuring business workflows worked correctly across context boundaries and problems debugging complex event chains.

## Decision
We will implement a comprehensive Domain Event system with the following components:

1. **Standardized Event Base Class**:
   ```typescript
   abstract class DomainEvent {
     public readonly eventId: string;
     public readonly timestamp: Date;
     public readonly eventType: string;
     public readonly aggregateId: string;
     public readonly version: number;
     
     constructor(aggregateId: string) {
       this.eventId = uuidv4();
       this.timestamp = new Date();
       this.eventType = this.constructor.name;
       this.aggregateId = aggregateId;
       this.version = 1;
     }
     
     abstract toJSON(): Record<string, unknown>;
   }
   ```

2. **Domain Event Publisher Interface**:
   ```typescript
   interface DomainEventPublisher {
     publish(event: DomainEvent): Promise<void>;
     publishAll(events: DomainEvent[]): Promise<void>;
   }
   ```

3. **Event Spy for Testing**:
   ```typescript
   class EventSpy implements DomainEventPublisher {
     private events: DomainEvent[] = [];
     
     publish(event: DomainEvent): Promise<void> {
       this.events.push(event);
       return Promise.resolve();
     }
     
     publishAll(events: DomainEvent[]): Promise<void> {
       this.events.push(...events);
       return Promise.resolve();
     }
     
     getEvents<T extends DomainEvent>(eventType: new (...args: any[]) => T): T[] {
       return this.events.filter(e => e instanceof eventType) as T[];
     }
     
     clear(): void {
       this.events = [];
     }
   }
   ```

4. **Event-based Tests**:
   ```typescript
   it('should publish OrderConfirmed when payment is processed', async () => {
     // Arrange
     const eventSpy = new EventSpy();
     const orderService = new OrderService(eventSpy);
     
     // Act
     await orderService.confirmPayment(orderId);
     
     // Assert
     const orderConfirmedEvents = eventSpy.getEvents(OrderConfirmed);
     expect(orderConfirmedEvents).toHaveLength(1);
     expect(orderConfirmedEvents[0].orderId).toBe(orderId);
   });
   ```

5. **Clear Event Naming Conventions**:
   - Entity-first, past-tense naming
   - Examples: `OrderPlaced`, `PaymentProcessed`, `InventoryAdjusted`

6. **Delivery Guarantees Based on Event Criticality**:
   - At-least-once: Critical business events
   - At-most-once: Events where duplicates would cause issues
   - Best-effort: Analytics and reporting events

## Consequences

### Positive
- Consistent event structure across all bounded contexts
- Easy testing of event publication and handling
- Clear audit trail and event flow visibility
- Improved debugging capabilities
- Centralized event handling infrastructure

### Negative
- Additional overhead for serialization/deserialization
- Need for versioning strategy as events evolve
- Potential performance impact for high-volume events
- Learning curve for developers to understand event patterns

## Implementation Examples

### Event Implementation
```typescript
class OrderPlaced extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly orderItems: Array<{
      productId: string;
      quantity: number;
      price: Money;
    }>,
    public readonly totalAmount: Money
  ) {
    super(orderId); // aggregateId is orderId
  }
  
  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      timestamp: this.timestamp,
      aggregateId: this.aggregateId,
      version: this.version,
      orderId: this.orderId,
      customerId: this.customerId,
      orderItems: this.orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toJSON()
      })),
      totalAmount: this.totalAmount.toJSON()
    };
  }
}
```

### Event Publishing in an Aggregate
```typescript
class Order extends Aggregate {
  private events: DomainEvent[] = [];
  
  place(customer: Customer, items: OrderItem[]): void {
    // Business logic
    
    // Publish event
    const event = new OrderPlaced(
      this.id,
      customer.id,
      items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      this.calculateTotal()
    );
    
    this.events.push(event);
  }
  
  getUncommittedEvents(): DomainEvent[] {
    return [...this.events];
  }
  
  clearUncommittedEvents(): void {
    this.events = [];
  }
}
```

### Event Flow Testing
```typescript
it('should complete the order payment flow', async () => {
  // Arrange
  const eventSpy = new EventSpy();
  const orderService = new OrderService(eventSpy);
  const paymentService = new PaymentService(eventSpy);
  const order = await createTestOrder();
  
  // Act - Place order
  await orderService.placeOrder(order);
  
  // Assert - OrderPlaced event published
  const orderPlacedEvents = eventSpy.getEvents(OrderPlaced);
  expect(orderPlacedEvents).toHaveLength(1);
  
  // Act - Process payment
  await paymentService.processOrderPayment(order.id);
  
  // Assert - PaymentProcessed event published
  const paymentProcessedEvents = eventSpy.getEvents(PaymentProcessed);
  expect(paymentProcessedEvents).toHaveLength(1);
  
  // Assert - OrderConfirmed event published as a result
  const orderConfirmedEvents = eventSpy.getEvents(OrderConfirmed);
  expect(orderConfirmedEvents).toHaveLength(1);
});
```

## References
- [Domain-Driven Design by Eric Evans](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)
- [Implementing Domain-Driven Design by Vaughn Vernon](https://www.amazon.com/Implementing-Domain-Driven-Design-Vaughn-Vernon/dp/0321834577)
- [Domain Event Catalog](../domain-knowledge/integrations/events.md)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)

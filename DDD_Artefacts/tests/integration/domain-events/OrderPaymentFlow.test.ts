import { Order } from '../../../code/ordering/domain/aggregates/Order';
import { OrderItem } from '../../../code/ordering/domain/value-objects/OrderItem';
import { OrderStatus } from '../../../code/ordering/domain/value-objects/OrderStatus';
import { CustomerId } from '../../../code/customers/domain/value-objects/CustomerId';
import { ProductId } from '../../../code/catalog/domain/value-objects/ProductId';
import { Money } from '../../../code/shared/domain/value-objects/Money';
import { TestClock } from '../../../code/shared/domain/Clock';
import { OrderCreated } from '../../../code/ordering/domain/events/OrderCreated';
import { OrderPaid } from '../../../code/ordering/domain/events/OrderPaid';
import { EventSpy } from '../../../code/shared/tests/helpers/EventSpy';
import { DomainEvents } from '../../../code/shared/domain/events/DomainEvents';

/**
 * Domain Event Smoke Test - Order Payment Flow
 * 
 * This test verifies the critical event chain:
 * OrderCreated → OrderPaid (Payment Captured)
 */
describe('Domain Event Smoke Tests - Order Payment Flow', () => {
  // Setup test date and clock
  const testDate = new Date('2025-06-01T10:00:00Z');
  const testClock = new TestClock(testDate);
  
  // Setup event spy
  let eventSpy: EventSpy;
  
  beforeEach(() => {
    // Create a fresh event spy for each test
    eventSpy = new EventSpy();
    
    // Register the spy to capture all events
    DomainEvents.register(eventSpy.capture.bind(eventSpy));
  });
  
  afterEach(() => {
    // Unregister the spy after each test
    DomainEvents.clearHandlers();
  });
  
  // Helper functions
  const createCustomerId = () => {
    const result = CustomerId.create('customer-123');
    expect(result.isSuccess()).toBeTruthy();
    return result.isSuccess() ? result.value : null!;
  };
  
  const createProductId = (id: string) => {
    const result = ProductId.create(id);
    expect(result.isSuccess()).toBeTruthy();
    return result.isSuccess() ? result.value : null!;
  };
  
  const createOrderItem = (productId: ProductId, name: string, price: number, quantity: number = 1) => {
    const priceResult = Money.create(price, 'BBD');
    expect(priceResult.isSuccess()).toBeTruthy();
    const itemPrice = priceResult.isSuccess() ? priceResult.value : null!;
    
    return new OrderItem({
      productId,
      name,
      price: itemPrice,
      quantity,
      sku: `SKU-${productId.value.substring(0, 5)}`,
      imageUrl: `https://example.com/images/${productId.value}.jpg`
    });
  };
  
  const createOrderProps = () => {
    const customerId = createCustomerId();
    const productId1 = createProductId('prod-123');
    const productId2 = createProductId('prod-456');
    
    return {
      customerId,
      items: [
        createOrderItem(productId1, 'Italian Olive Oil', 15.99, 2),
        createOrderItem(productId2, 'Spanish Chorizo', 12.50, 1)
      ],
      status: OrderStatus.Created,
      shippingAddress: '123 Test Street, Bridgetown, Barbados',
      billingAddress: '123 Test Street, Bridgetown, Barbados',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };
  
  it('should emit OrderCreated and OrderPaid events in sequence', () => {
    // Arrange
    const orderProps = createOrderProps();
    
    // Act 1: Create the order
    const orderResult = Order.create(orderProps, undefined, testClock);
    expect(orderResult.isSuccess()).toBeTruthy();
    if (!orderResult.isSuccess()) return;
    const order = orderResult.value;
    
    // Dispatch events for the aggregate
    DomainEvents.dispatchEventsForAggregate(order.id);
    
    // Assert 1: OrderCreated event should be emitted
    expect(eventSpy.countEvents(OrderCreated)).toBe(1);
    const createdEvent = eventSpy.getLastEvent(OrderCreated);
    expect(createdEvent).toBeDefined();
    expect(createdEvent?.aggregateId.toString()).toBe(order.getId().toString());
    
    // Reset the spy to track only the next events
    eventSpy.reset();
    
    // Clear existing events from the order to avoid duplicates
    order.clearEvents();
    
    // Re-register the spy after reset
    DomainEvents.register(eventSpy.capture.bind(eventSpy));
    
    // Advance the clock to simulate time passing
    testClock.advanceTimeByHours(1);
    
    // Act 2: Confirm payment
    const paymentResult = order.confirmPayment(testClock);
    expect(paymentResult.isSuccess()).toBeTruthy();
    
    // Dispatch events for the aggregate
    DomainEvents.dispatchEventsForAggregate(order.id);
    
    // Assert 2: OrderPaid event should be emitted
    expect(eventSpy.countEvents(OrderPaid)).toBeGreaterThan(0);
    const paidEvent = eventSpy.getLastEvent(OrderPaid);
    expect(paidEvent).toBeDefined();
    expect(paidEvent?.aggregateId.toString()).toBe(order.getId().toString());
    
    // Verify the order status has been updated
    expect(order.status).toBe(OrderStatus.Paid);
    expect(order.updatedAt.getTime()).toBe(testClock.now().getTime());
  });
});

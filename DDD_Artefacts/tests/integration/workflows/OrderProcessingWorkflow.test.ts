import { Order } from '@ordering/domain/aggregates/Order';
import { OrderItem } from '@ordering/domain/value-objects/OrderItem';
import { OrderStatus } from '@ordering/domain/value-objects/OrderStatus';
import { CustomerId } from '@customers/domain/value-objects/CustomerId';
import { ProductId } from '@catalog/domain/value-objects/ProductId';
import { Money } from '@shared/domain/value-objects/Money';
import { Product } from '@catalog/domain/aggregates/Product';
import { TestClock } from '@shared/domain/Clock';
import { OrderCreated } from '@ordering/domain/events/OrderCreated';
import { OrderPaid } from '@ordering/domain/events/OrderPaid';
import { OrderFulfilled } from '@ordering/domain/events/OrderFulfilled';
import { EventSpy } from '@shared/tests/helpers/EventSpy';
import { DomainEvents } from '@shared/domain/events/DomainEvents';

/**
 * Integration Smoke Test - Order Processing Workflow
 * 
 * This test verifies the end-to-end flow of placing an order through fulfillment:
 * - Order creation
 * - Payment confirmation
 * - Order fulfillment
 */
describe('Integration Smoke Test - Order Processing Workflow', () => {
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
  const createProduct = (id: string, name: string, price: number) => {
    const priceResult = Money.create(price, 'BBD');
    expect(priceResult.isSuccess()).toBeTruthy();
    if (!priceResult.isSuccess()) return null;
    
    const productResult = Product.create({
      name,
      description: `Description for ${name}`,
      price: priceResult.value,
      inventoryCount: 100,
      isDiscontinued: false,
      categoryIds: ['imported-foods']
    }, undefined, testClock);
    
    expect(productResult.isSuccess()).toBeTruthy();
    return productResult.isSuccess() ? productResult.value : null;
  };
  
  const createOrderItem = (product: Product, quantity: number = 1) => {
    // Create order item from product
    const productIdResult = ProductId.create(product.id.toString());
    expect(productIdResult.isSuccess()).toBeTruthy();
    const productId = productIdResult.isSuccess() ? productIdResult.value : null!;
    
    return new OrderItem({
      productId,
      name: product.name,
      price: product.price,
      quantity,
      sku: `SKU-${product.id.toString().substring(0, 5)}`,
      imageUrl: `https://example.com/images/${product.id.toString()}.jpg`
    });
  };
  
  it('should process an order from creation through fulfillment', () => {
    // Arrange - Create customer and products
    const customerIdResult = CustomerId.create('customer-123');
    expect(customerIdResult.isSuccess()).toBeTruthy();
    if (!customerIdResult.isSuccess()) return;
    const customerId = customerIdResult.value;
    
    const oliveOil = createProduct('prod-123', 'Premium Olive Oil', 19.99);
    const chorizo = createProduct('prod-456', 'Spanish Chorizo', 12.50);
    const jamónIbérico = createProduct('prod-789', 'Jamón Ibérico', 34.99);
    
    expect(oliveOil).not.toBeNull();
    expect(chorizo).not.toBeNull();
    expect(jamónIbérico).not.toBeNull();
    if (!oliveOil || !chorizo || !jamónIbérico) return;
    
    // Act 1: Create the order
    const orderResult = Order.create({
      customerId,
      items: [
        createOrderItem(oliveOil, 2),
        createOrderItem(chorizo, 1),
        createOrderItem(jamónIbérico, 1)
      ],
      status: OrderStatus.Created,
      shippingAddress: '123 Test Street, Bridgetown, Barbados',
      billingAddress: '123 Test Street, Bridgetown, Barbados',
      createdAt: new Date(),
      updatedAt: new Date()
    }, undefined, testClock);
    
    expect(orderResult.isSuccess()).toBeTruthy();
    if (!orderResult.isSuccess()) return;
    const order = orderResult.value;
    
    // Assert 1: Verify order created successfully
    expect(order.status).toBe(OrderStatus.Created);
    expect(order.items.length).toBe(3);
    
    // Dispatch events for the aggregate
    DomainEvents.dispatchEventsForAggregate(order.id);
    
    // Check OrderCreated event
    expect(eventSpy.countEvents(OrderCreated)).toBe(1);
    const createdEvent = eventSpy.getLastEvent(OrderCreated);
    expect(createdEvent?.aggregateId.toString()).toBe(order.id.toString());
    
    // Reset the spy to track only the next events
    eventSpy.reset();
    // Re-register the spy after reset
    DomainEvents.register(eventSpy.capture.bind(eventSpy));
    
    // Clear existing events from the order
    order.clearEvents();
    
    // Advance the clock to simulate time passing
    testClock.advanceTimeByHours(1);
    
    // Act 2: Process payment
    const paymentResult = order.confirmPayment(testClock);
    expect(paymentResult.isSuccess()).toBeTruthy();
    
    // Dispatch events for the aggregate
    DomainEvents.dispatchEventsForAggregate(order.id);
    
    // Assert 2: Verify payment processed successfully
    expect(order.status).toBe(OrderStatus.Paid);
    expect(order.updatedAt.getTime()).toBe(testClock.now().getTime());
    
    // Check OrderPaid event
    expect(eventSpy.countEvents(OrderPaid)).toBeGreaterThan(0);
    const paidEvent = eventSpy.getLastEvent(OrderPaid);
    expect(paidEvent?.aggregateId.toString()).toBe(order.id.toString());
    
    // Reset the spy to track only the next events
    eventSpy.reset();
    // Re-register the spy after reset
    DomainEvents.register(eventSpy.capture.bind(eventSpy));
    
    // Clear existing events from the order
    order.clearEvents();
    
    // Advance the clock to simulate time passing for fulfillment
    testClock.advanceTimeByHours(24);
    
    // Act 3: Fulfill the order
    const fulfillResult = order.fulfill(testClock);
    expect(fulfillResult.isSuccess()).toBeTruthy();
    
    // Dispatch events for the aggregate
    DomainEvents.dispatchEventsForAggregate(order.id);
    
    // Assert 3: Verify order fulfilled successfully
    expect(order.status).toBe(OrderStatus.Fulfilled);
    expect(order.updatedAt.getTime()).toBe(testClock.now().getTime());
    
    // Check OrderFulfilled event
    expect(eventSpy.countEvents(OrderFulfilled)).toBeGreaterThan(0);
    const fulfilledEvent = eventSpy.getLastEvent(OrderFulfilled);
    expect(fulfilledEvent?.aggregateId.toString()).toBe(order.id.toString());
    
    // Verify the complete flow and order state at the end
    expect(order.items.length).toBe(3);
    expect(order.items[0].name).toBe('Premium Olive Oil');
    expect(order.items[0].quantity).toBe(2);
  });
});

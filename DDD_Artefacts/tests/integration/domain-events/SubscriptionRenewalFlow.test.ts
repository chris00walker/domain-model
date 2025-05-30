import { Subscription } from '../../../code/subscriptions/domain/aggregates/Subscription';
import { SubscriptionItem } from '../../../code/subscriptions/domain/value-objects/SubscriptionItem';
import { SubscriptionStatus, SubscriptionStatusType } from '../../../code/subscriptions/domain/value-objects/SubscriptionStatus';
import { SubscriptionFrequency, FrequencyType } from '../../../code/subscriptions/domain/value-objects/SubscriptionFrequency';
import { CustomerId } from '../../../code/customers/domain/value-objects/CustomerId';
import { ProductId } from '../../../code/catalog/domain/value-objects/ProductId';
import { Money } from '../../../code/shared/domain/value-objects/Money';
import { TestClock } from '../../../code/shared/domain/Clock';
import { EventSpy } from '../../../code/shared/tests/helpers/EventSpy';
import { DomainEvents } from '../../../code/shared/domain/events/DomainEvents';
import { SubscriptionRenewed } from '../../../code/subscriptions/domain/events/SubscriptionRenewed';

/**
 * Domain Event Smoke Test - Subscription Renewal Flow
 * 
 * This test verifies the critical event chain:
 * SubscriptionRenewed → Next Delivery Date Scheduled
 */
describe('Domain Event Smoke Tests - Subscription Renewal Flow', () => {
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
  
  const createMoney = (amount: number) => {
    const result = Money.create(amount, 'BBD');
    expect(result.isSuccess()).toBeTruthy();
    return result.isSuccess() ? result.value : null!;
  };
  
  const createSubscriptionItem = (productId: ProductId, quantity: number = 1) => {
    const result = SubscriptionItem.create({
      productId,
      quantity,
      price: createMoney(15.99),
      name: 'Test Product',
      sku: `SKU-${productId.value.substring(0, 5)}`,
      isSubstitutable: false
    });
    expect(result.isSuccess()).toBeTruthy();
    return result.isSuccess() ? result.value : null!;
  };
  
  const createSubscriptionFrequency = () => {
    const result = SubscriptionFrequency.create(FrequencyType.WEEKLY);
    expect(result.isSuccess()).toBeTruthy();
    return result.isSuccess() ? result.value : null!;
  };
  
  const createSubscriptionStatus = (type: SubscriptionStatusType) => {
    const result = SubscriptionStatus.create(type);
    expect(result.isSuccess()).toBeTruthy();
    return result.isSuccess() ? result.value : null!;
  };
  
  const createSubscriptionProps = (isExpired: boolean = false) => {
    const customerIdObj = createCustomerId();
    const productId1 = createProductId('prod-123');
    const productId2 = createProductId('prod-456');
    
    return {
      customerId: customerIdObj.value,
      status: createSubscriptionStatus(isExpired ? SubscriptionStatusType.EXPIRED : SubscriptionStatusType.ACTIVE),
      items: [
        createSubscriptionItem(productId1, 2),
        createSubscriptionItem(productId2, 1)
      ],
      frequency: createSubscriptionFrequency(),
      deliveryAddress: '123 Test Street, Bridgetown, Barbados',
      deliveryDay: 'MONDAY' as const,
      startDate: new Date(testDate.getTime() - (isExpired ? 60 : 1) * 24 * 60 * 60 * 1000), // 60 days ago if expired, yesterday if active
      endDate: isExpired ? new Date(testDate.getTime() - 1 * 24 * 60 * 60 * 1000) : undefined, // yesterday if expired
      nextDeliveryDate: isExpired ? undefined : new Date(testDate.getTime() + 7 * 24 * 60 * 60 * 1000), // a week from now if active
      totalDeliveries: 12,
      remainingDeliveries: isExpired ? 0 : 11,
      autoRenew: true,
      isPrepaid: false,
      skipsRemaining: 2,
      substitutionsRemaining: 3,
      createdAt: new Date(testDate.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      updatedAt: new Date(testDate.getTime() - (isExpired ? 1 : 7) * 24 * 60 * 60 * 1000) // yesterday if expired, a week ago if active
    };
  };
  
  it('should emit SubscriptionRenewed event and schedule the next delivery', () => {
    // Arrange - Create an expired subscription
    const subscriptionProps = createSubscriptionProps(true); // true = expired
    const subscriptionResult = Subscription.create(subscriptionProps);
    expect(subscriptionResult.isSuccess()).toBeTruthy();
    if (!subscriptionResult.isSuccess()) return;
    const subscription = subscriptionResult.value;
    
    // Clear any initial events
    subscription.clearEvents();
    
    // Act - Renew the subscription
    const renewResult = subscription.renew(false, testClock); // false = don't force renew
    
    // Assert - Verify renewal was successful
    expect(renewResult.isSuccess()).toBeTruthy();
    
    // Dispatch events for the aggregate
    DomainEvents.dispatchEventsForAggregate(subscription.id);
    
    // Verify SubscriptionRenewed event was emitted
    expect(eventSpy.countEvents(SubscriptionRenewed)).toBe(1);
    const renewedEvent = eventSpy.getLastEvent(SubscriptionRenewed);
    expect(renewedEvent).toBeDefined();
    expect(renewedEvent?.aggregateId.toString()).toBe(subscription.id.toString());
    
    // Verify subscription is now active
    expect(subscription.status.isActive()).toBeTruthy();
    
    // Verify remaining deliveries were reset
    expect(subscription.remainingDeliveries).toBe(subscription.totalDeliveries);
    
    // Verify next delivery date was calculated
    expect(subscription.nextDeliveryDate).toBeDefined();
    
    // Since we're using a weekly frequency, verify the next delivery date was set
    // and is within a reasonable time frame (between 1-7 days from now)
    if (subscription.nextDeliveryDate) {
      const now = testClock.now().getTime();
      const nextDelivery = subscription.nextDeliveryDate.getTime();
      
      // The next delivery should be at least the current time
      expect(nextDelivery).toBeGreaterThanOrEqual(now);
      
      // The next delivery should be within 7 days (weekly frequency)
      // Adding a 1 hour buffer for any time zone / calculation differences
      const oneHourInMs = 60 * 60 * 1000;
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      expect(nextDelivery).toBeLessThanOrEqual(now + sevenDaysInMs + oneHourInMs);
      
      // Log the actual delivery date for debugging
      console.log(`Next delivery date: ${new Date(nextDelivery).toISOString()}`);
      console.log(`Day of week: ${new Date(nextDelivery).getDay()}`); // 0 = Sunday, 1 = Monday, etc.
      
      // We're just verifying that a delivery date was set, actual day calculation
      // might vary based on implementation details in the Subscription aggregate
    }
  });
});

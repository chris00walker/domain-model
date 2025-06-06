import { CustomerId } from '@customers/domain/value-objects/CustomerId';
import { ProductId } from '@catalog/domain/value-objects/ProductId';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';
import { Money } from '@shared/domain/value-objects/Money';
import { TestClock } from '@shared/domain/Clock';

import { Subscription } from '@subscriptions/domain/aggregates/Subscription';
import { SubscriptionStatus, SubscriptionStatusType } from '@subscriptions/domain/value-objects/SubscriptionStatus';
import { SubscriptionItem } from '@subscriptions/domain/value-objects/SubscriptionItem';
import { SubscriptionFrequency, FrequencyType } from '@subscriptions/domain/value-objects/SubscriptionFrequency';

import { 
  SubscriptionCreated,
  SubscriptionCancelled,
  SubscriptionPaused,
  SubscriptionResumed,
  SubscriptionEdited,
  SubscriptionRenewed 
} from '@subscriptions/domain/events';

describe('Subscriptions Domain - Subscription', () => {
  // Helper functions to create test objects
  const createFrequency = (frequency: FrequencyType) => {
    const result = SubscriptionFrequency.create(frequency);
    if (result.isFailure()) {
      throw new Error('Failed to create frequency: ' + result.error);
    }
    return result.value;
  };

  const createStatus = (status: SubscriptionStatusType) => {
    const result = SubscriptionStatus.create(status);
    if (result.isFailure()) {
      throw new Error('Failed to create status: ' + result.error);
    }
    return result.value;
  };

  const createSubscriptionItem = (productId: string, price: number, quantity: number) => {
    // Create Money value object
    const moneyResult = Money.create(price, 'USD');
    if (moneyResult.isFailure()) {
      throw new Error('Failed to create money: ' + moneyResult.error);
    }

    // Create ProductId value object
    const productIdResult = ProductId.create(productId);
    if (productIdResult.isFailure()) {
      throw new Error('Failed to create product ID: ' + productIdResult.error);
    }

    const itemResult = SubscriptionItem.create({
      productId: productIdResult.value,
      price: moneyResult.value,
      quantity,
      name: 'Test Product',
      sku: `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      isSubstitutable: true,
      substitutionPreferences: ['Any similar product']
    });

    if (itemResult.isFailure()) {
      throw new Error('Failed to create subscription item: ' + itemResult.error);
    }

    return itemResult.value;
  };

  // Test data setup
  const customerId = 'customer-123';
  const testItem = createSubscriptionItem('product-123', 29.99, 1);
  const testItem2 = createSubscriptionItem('product-456', 19.99, 2);
  const activeStatus = createStatus(SubscriptionStatusType.ACTIVE);
  const pausedStatus = createStatus(SubscriptionStatusType.PAUSED);
  const weeklyFrequency = createFrequency(FrequencyType.WEEKLY);
  const monthlyFrequency = createFrequency(FrequencyType.MONTHLY);
  const startDate = new Date();

  const createValidSubscription = (items = [testItem], id?: string) => {
    const subscriptionResult = Subscription.create({
      customerId,
      status: activeStatus,
      items,
      startDate,
      totalDeliveries: 12,
      remainingDeliveries: 12,
      frequency: weeklyFrequency,
      isPrepaid: false,
      autoRenew: true,
      skipsRemaining: 2,
      substitutionsRemaining: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }, id ? new UniqueEntityID(id) : undefined);

    if (subscriptionResult.isFailure()) {
      throw new Error('Failed to create subscription: ' + subscriptionResult.error);
    }

    return subscriptionResult.value;
  };

  describe('Subscription Value Objects', () => {
    describe('SubscriptionFrequency', () => {
      it('should create valid weekly frequency', () => {
        const result = SubscriptionFrequency.create(FrequencyType.WEEKLY);
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          expect(result.value.value).toBe('WEEKLY');
        }
      });

      it('should create valid monthly frequency', () => {
        const result = SubscriptionFrequency.create(FrequencyType.MONTHLY);
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          expect(result.value.value).toBe('MONTHLY');
        }
      });

      it('should reject invalid frequency', () => {
        const result = SubscriptionFrequency.create('INVALID' as unknown as FrequencyType);
        expect(result.isFailure()).toBe(true);
      });
    });
    
    describe('SubscriptionStatus', () => {
      it('should create active status', () => {
        const result = SubscriptionStatus.create(SubscriptionStatusType.ACTIVE);
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          expect(result.value.value).toBe(SubscriptionStatusType.ACTIVE);
          expect(result.value.isActive()).toBe(true);
        }
      });

      it('should create paused status', () => {
        const result = SubscriptionStatus.create(SubscriptionStatusType.PAUSED);
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          expect(result.value.isPaused()).toBe(true);
        }
      });

      it('should create cancelled status', () => {
        const result = SubscriptionStatus.create(SubscriptionStatusType.CANCELLED);
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          expect(result.value.isCancelled()).toBe(true);
        }
      });
    });
    
    describe('SubscriptionItem', () => {
      it('should create valid subscription item', () => {
        const moneyResult = Money.create(29.99, 'USD');
        const productIdResult = ProductId.create('prod-123');
        
        expect(moneyResult.isSuccess() && productIdResult.isSuccess()).toBe(true);
        
        if (moneyResult.isSuccess() && productIdResult.isSuccess()) {
          const result = SubscriptionItem.create({
            productId: productIdResult.value,
            price: moneyResult.value,
            quantity: 2,
            name: 'Test Product',
            sku: `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            isSubstitutable: false
          });
          
          expect(result.isSuccess()).toBe(true);
          if (result.isSuccess()) {
            const item = result.value;
            expect(item.quantity).toBe(2);
            expect(item.name).toBe('Test Product');
          }
        }
      });

      it('should calculate item subtotal', () => {
        const item = createSubscriptionItem('prod-123', 29.99, 3);
        const total = item.calculateTotal();
        expect(total.amount).toBe(89.97); // 29.99 * 3
      });
    });
  });
  
  describe('Subscription Aggregate', () => {
    describe('creation', () => {
      it('should create a subscription with valid properties', () => {
        const subscription = createValidSubscription();
        expect(subscription).toBeDefined();
        expect(subscription.customerId).toBe(customerId);
        expect(subscription.status.isActive()).toBe(true);
        expect(subscription.items).toHaveLength(1);
        expect(subscription.totalDeliveries).toBe(12);
      });

      it('should generate a unique ID if not provided', () => {
        const subscription = createValidSubscription();
        expect(subscription.subscriptionId).toBeDefined();
      });

      it('should use provided ID when specified', () => {
        const customId = 'subscription-123';
        const subscription = createValidSubscription([testItem], customId);
        expect(subscription.subscriptionId).toBe(customId);
      });

      it('should add SubscriptionCreated domain event', () => {
        const subscription = createValidSubscription();
        const events = subscription.domainEvents;
        
        expect(events.length).toBeGreaterThan(0);
        expect(events.some(e => e instanceof SubscriptionCreated)).toBe(true);
      });

      it('should validate minimum requirements', () => {
        // Test required fields validation
        const result = Subscription.create({
          customerId: '',
          status: activeStatus,
          items: [],
          startDate: new Date(),
          totalDeliveries: 0, // Invalid: must be > 0
          remainingDeliveries: 0,
          frequency: weeklyFrequency,
          isPrepaid: false,
          autoRenew: true,
          skipsRemaining: 2,
          substitutionsRemaining: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        expect(result.isFailure()).toBe(true);
      });
    });

    describe('subscription item management', () => {
      it('should add an item to the subscription', () => {
        const subscription = createValidSubscription();
        const newItem = createSubscriptionItem('new-product', 14.99, 1);
        
        const result = subscription.addItem(newItem);
        
        expect(result.isSuccess()).toBe(true);
        expect(subscription.items).toHaveLength(2);
        expect(subscription.items.some(i => i.productId.value === 'new-product')).toBe(true);
      });

      it('should not add duplicate items', () => {
        const subscription = createValidSubscription([testItem]);
        const duplicateItem = createSubscriptionItem('product-123', 29.99, 1); // Same product ID
        
        const result = subscription.addItem(duplicateItem);
        
        expect(result.isFailure()).toBe(true);
        expect(subscription.items).toHaveLength(1);
      });

      it('should remove an item from the subscription', () => {
        // Create test items with explicit IDs for testing
        const productId1 = ProductId.create('test-product-1');
        const productId2 = ProductId.create('test-product-2');
        
        if (productId1.isSuccess() && productId2.isSuccess()) {
          const money = Money.create(10, 'USD');
          if (money.isSuccess()) {
            const item1Result = SubscriptionItem.create({
              productId: productId1.value,
              name: 'Test Product 1',
              price: money.value,
              quantity: 1,
              sku: 'SKU-TEST1',
              isSubstitutable: false
            });
            
            const item2Result = SubscriptionItem.create({
              productId: productId2.value,
              name: 'Test Product 2',
              price: money.value,
              quantity: 1,
              sku: 'SKU-TEST2',
              isSubstitutable: false
            });
            
            if (item1Result.isSuccess() && item2Result.isSuccess()) {
              const subscription = createValidSubscription([item1Result.value, item2Result.value]);
              
              // Now with improved ID handling, we directly use the productId value
              // instead of toString() for comparison
              const result = subscription.removeItem('test-product-1');
              
              expect(result.isSuccess()).toBe(true);
              expect(subscription.items).toHaveLength(1);
              expect(subscription.items[0].productId.value).toBe('test-product-2');
            }
          }
        }
      });

      it('should update item quantity', () => {
        // Create test item with explicit ID for testing
        const productId = ProductId.create('test-product-update');
        
        if (productId.isSuccess()) {
          const money = Money.create(10, 'USD');
          if (money.isSuccess()) {
            const itemResult = SubscriptionItem.create({
              productId: productId.value,
              name: 'Test Product for Update',
              price: money.value,
              quantity: 1,
              sku: 'SKU-UPDATE',
              isSubstitutable: false
            });
            
            if (itemResult.isSuccess()) {
              const subscription = createValidSubscription([itemResult.value]);
              
              // Now update the item using its known ID
              // With improved ID handling, we directly use the productId value
              const result = subscription.updateItemQuantity('test-product-update', 5);
              
              expect(result.isSuccess()).toBe(true);
              expect(subscription.items[0].quantity).toBe(5);
            }
          }
        }
      });
    });

    describe('lifecycle management', () => {
      it('should cancel an active subscription', () => {
        const subscription = createValidSubscription();
        
        const testClock = new TestClock(new Date());
        const result = subscription.cancel('Customer requested cancellation', testClock);
        
        expect(result.isSuccess()).toBe(true);
        expect(subscription.status.isCancelled()).toBe(true);
        expect(subscription.remainingDeliveries).toBe(0); // Should zero out remaining deliveries
        
        // Should add domain event
        expect(subscription.domainEvents.some(e => e instanceof SubscriptionCancelled)).toBe(true);
      });

      it('should pause an active subscription', () => {
        const subscription = createValidSubscription();
        
        const testClock = new TestClock(new Date());
        const result = subscription.pause('Temporary pause requested by customer', testClock);
        
        expect(result.isSuccess()).toBe(true);
        expect(subscription.status.isPaused()).toBe(true);
        
        // Should add domain event
        expect(subscription.domainEvents.some(e => e instanceof SubscriptionPaused)).toBe(true);
      });

      it('should resume a paused subscription', () => {
        const subscription = createValidSubscription();
        const testClock = new TestClock(new Date());
        subscription.pause('Temporary pause for test', testClock); // First pause it
        
        const result = subscription.resume();
        
        expect(result.isSuccess()).toBe(true);
        expect(subscription.status.isActive()).toBe(true);
        
        // Should add domain event
        expect(subscription.domainEvents.some(e => e instanceof SubscriptionResumed)).toBe(true);
      });

      it('should not allow invalid state transitions', () => {
        const subscription = createValidSubscription();
        const testClock = new TestClock(new Date());
        subscription.cancel('Cancellation for test', testClock); // Cancel the subscription
        
        const pauseResult = subscription.pause('Attempted pause after cancellation', testClock); // Attempt to pause a cancelled subscription
        
        expect(pauseResult.isFailure()).toBe(true);
        expect(subscription.status.isCancelled()).toBe(true); // Status should remain cancelled
      });
    });

    describe('delivery management', () => {
      it('should record a delivery and update remaining deliveries', () => {
        const subscription = createValidSubscription();
        const deliveryDate = new Date();
        
        const result = subscription.recordDelivery(deliveryDate);
        
        expect(result.isSuccess()).toBe(true);
        expect(subscription.remainingDeliveries).toBe(11); // 12 - 1
        expect(subscription.lastDeliveryDate).toEqual(deliveryDate);
        expect(subscription.nextDeliveryDate).toBeDefined(); // Should calculate next delivery date
      });

      it('should expire subscription when deliveries are exhausted and autoRenew is false', () => {
        // Create subscription with only 1 delivery remaining and autoRenew = false
        const subscriptionResult = Subscription.create({
          customerId,
          status: activeStatus,
          items: [testItem],
          startDate,
          totalDeliveries: 1,
          remainingDeliveries: 1,
          frequency: weeklyFrequency,
          isPrepaid: false,
          autoRenew: false, // Critical for this test
          skipsRemaining: 0,
          substitutionsRemaining: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        if (subscriptionResult.isFailure()) {
          throw new Error('Test setup failed: ' + subscriptionResult.error);
        }
        
        const subscription = subscriptionResult.value;
        const result = subscription.recordDelivery(new Date());
        
        expect(result.isSuccess()).toBe(true);
        expect(subscription.remainingDeliveries).toBe(0);
        expect(subscription.status.isExpired()).toBe(true);
      });

      it('should renew an expired subscription', () => {
        // Create an expired subscription
        const expiredStatus = createStatus(SubscriptionStatusType.EXPIRED);
        const subscriptionResult = Subscription.create({
          customerId,
          status: expiredStatus,
          items: [testItem],
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          endDate: new Date(),
          totalDeliveries: 4,
          remainingDeliveries: 0,
          frequency: weeklyFrequency,
          isPrepaid: false,
          autoRenew: true,
          skipsRemaining: 0,
          substitutionsRemaining: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        if (subscriptionResult.isFailure()) {
          throw new Error('Test setup failed: ' + subscriptionResult.error);
        }
        
        const subscription = subscriptionResult.value;
        const result = subscription.renew();
        
        expect(result.isSuccess()).toBe(true);
        expect(subscription.status.isActive()).toBe(true);
        expect(subscription.remainingDeliveries).toBe(4); // Reset to totalDeliveries
        expect(subscription.endDate).toBeUndefined(); // End date should be cleared
        
        // Should add domain event
        expect(subscription.domainEvents.some(e => e instanceof SubscriptionRenewed)).toBe(true);
      });
    });

    describe('business rules and invariants', () => {
      it('should calculate the total cost of all subscription items', () => {
        // Create subscription with multiple items
        const subscription = createValidSubscription([testItem, testItem2]);
        
        const total = subscription.calculateTotal();
        
        // testItem: $29.99 x 1 = $29.99
        // testItem2: $19.99 x 2 = $39.98
        // Total: $69.97
        expect(total.amount).toBe(69.97);
        expect(total.currency).toBe('USD');
      });

      it('should maintain subscription status consistency', () => {
        const subscription = createValidSubscription();
        
        // Active status checks
        expect(subscription.isActive()).toBe(true);
        expect(subscription.isPaused()).toBe(false);
        expect(subscription.isCancelled()).toBe(false);
        
        // Change status to paused
        const testClock = new TestClock(new Date());
        subscription.pause('Temporary pause for test', testClock);
        expect(subscription.isActive()).toBe(false);
        expect(subscription.isPaused()).toBe(true);
        
        // Change status to cancelled
        subscription.cancel('Cancellation for test', testClock);
        expect(subscription.isPaused()).toBe(false);
        expect(subscription.isCancelled()).toBe(true);
      });
    });
  });
});

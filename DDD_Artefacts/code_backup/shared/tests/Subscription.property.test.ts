import * as fc from 'fast-check';
import { Result } from '@shared/core/Result';
import { TestClock } from '@shared/domain/Clock';
import { SubscriptionStatus, SubscriptionStatusType } from '../../subscriptions/domain/value-objects/SubscriptionStatus';
import { SubscriptionItem } from '../../subscriptions/domain/value-objects/SubscriptionItem';
import { SubscriptionFrequency } from '../../subscriptions/domain/value-objects/SubscriptionFrequency';
import { ProductId } from '../../catalog/domain/value-objects/ProductId';
import { Subscription } from '../../subscriptions/domain/aggregates/Subscription';
import { Money } from '@shared/domain/value-objects/Money';

describe('Subscription Property Tests', () => {
  // Define generators for test data
  
  // Generate valid subscription frequencies
  const frequencyGen = fc.constantFrom('WEEKLY', 'BIWEEKLY', 'MONTHLY');
  
  // Generate valid subscription status
  const statusTypeGen = fc.constantFrom(
    SubscriptionStatusType.ACTIVE,
    SubscriptionStatusType.PAUSED,
    SubscriptionStatusType.CANCELLED,
    SubscriptionStatusType.EXPIRED
  );
  
  // Generate valid product IDs
  const productIdGen = fc.uuid().map(id => {
    const result = ProductId.create(id);
    return result.isSuccess() ? result.value : undefined;
  }).filter((id): id is ProductId => id !== undefined);
  
  // Generate valid subscription items
  const subscriptionItemGen = fc.record({
    productId: productIdGen,
    quantity: fc.integer({ min: 1, max: 10 }),
    price: fc.integer({ min: 100, max: 10000 }).map(amount => {
      const result = Money.create(amount, 'BBD');
      return result.isSuccess() ? result.value : undefined;
    }).filter((money): money is Money => money !== undefined),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    sku: fc.string({ minLength: 3, maxLength: 20 }),
    isSubstitutable: fc.boolean()
  }).map(props => {
    const result = SubscriptionItem.create({
      productId: props.productId,
      quantity: props.quantity,
      price: props.price,
      name: props.name,
      sku: props.sku,
      isSubstitutable: props.isSubstitutable
    });
    return result.isSuccess() ? result.value : undefined;
  }).filter((item): item is SubscriptionItem => item !== undefined);
  
  // Generate arrays of subscription items (1 to 5 items)
  const subscriptionItemsGen = fc.array(subscriptionItemGen, { minLength: 1, maxLength: 5 });
  
  // Generate subscription properties
  interface SubscriptionTestProps {
    customerId: string;
    status: SubscriptionStatusType;
    items: SubscriptionItem[];
    frequency: string;
    totalDeliveries: number;
    isPrepaid: boolean;
    autoRenew: boolean;
  }
  
  const subscriptionPropsGen = fc.record({
    customerId: fc.uuid(),
    status: statusTypeGen,
    items: subscriptionItemsGen,
    frequency: frequencyGen,
    totalDeliveries: fc.integer({ min: 1, max: 24 }),
    isPrepaid: fc.boolean(),
    autoRenew: fc.boolean()
  });
  
  // Helper to create a valid subscription from test properties
  const createSubscription = (props: SubscriptionTestProps, clock: TestClock) => {
    const statusResult = SubscriptionStatus.create(props.status);
    const frequencyResult = SubscriptionFrequency.create(props.frequency as any);
    
    if (statusResult.isFailure() || frequencyResult.isFailure()) {
      throw new Error('Failed to create test status or frequency');
    }
    
    return Subscription.create({
      customerId: props.customerId,
      status: statusResult.value,
      items: props.items,
      startDate: clock.now(),
      totalDeliveries: props.totalDeliveries,
      remainingDeliveries: props.totalDeliveries,
      frequency: frequencyResult.value,
      isPrepaid: props.isPrepaid,
      autoRenew: props.autoRenew,
      skipsRemaining: 0,
      substitutionsRemaining: 0,
      createdAt: clock.now(),
      updatedAt: clock.now()
    }, undefined, clock);
  };
  
  describe('Invariants', () => {
    it('should maintain status transition rules', () => {
      fc.assert(
        fc.property(subscriptionPropsGen, fc.context(), (props, ctx) => {
          const clock = new TestClock(new Date('2025-01-01T10:00:00Z'));
          
          // Force status to be ACTIVE for this test
          props.status = SubscriptionStatusType.ACTIVE;
          
          const result = createSubscription(props, clock);
          if (result.isFailure()) return true; // Skip invalid subscriptions
          
          const subscription = result.value;
          
          // Valid transitions: ACTIVE -> PAUSED -> ACTIVE -> CANCELLED
          
          // Test ACTIVE -> PAUSED
          const pauseResult = subscription.pause('Test pause', clock);
          ctx.log(`Pause result: ${pauseResult.isSuccess() ? 'Success' : pauseResult.error}`);
          if (pauseResult.isFailure()) return false;
          
          // Test PAUSED -> ACTIVE
          const resumeResult = subscription.resume(clock);
          ctx.log(`Resume result: ${resumeResult.isSuccess() ? 'Success' : resumeResult.error}`);
          if (resumeResult.isFailure()) return false;
          
          // Test ACTIVE -> CANCELLED
          const cancelResult = subscription.cancel('Test cancellation', clock);
          ctx.log(`Cancel result: ${cancelResult.isSuccess() ? 'Success' : cancelResult.error}`);
          if (cancelResult.isFailure()) return false;
          
          // Test that once CANCELLED, it cannot be PAUSED or RESUMED
          return (
            subscription.pause('Try after cancel', clock).isFailure() &&
            subscription.resume(clock).isFailure()
          );
        })
      );
    });
    
    it('should correctly calculate next delivery date based on frequency', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('WEEKLY', 'BIWEEKLY', 'MONTHLY'),
          fc.date({ min: new Date('2025-01-01'), max: new Date('2025-12-31') }),
          (frequency, initialDate) => {
            const clock = new TestClock(initialDate);
            
            // Create subscription with the test frequency
            const props: SubscriptionTestProps = {
              customerId: 'test-customer-id',
              status: SubscriptionStatusType.ACTIVE,
              items: [
                (() => {
                  const productIdResult = ProductId.create('test-product-id');
                  if (productIdResult.isFailure()) throw new Error('Failed to create ProductId');
                  
                  const moneyResult = Money.create(1000, 'BBD');
                  if (moneyResult.isFailure()) throw new Error('Failed to create Money');
                  
                  const itemResult = SubscriptionItem.create({
                    productId: productIdResult.value,
                    quantity: 1,
                    price: moneyResult.value,
                    name: 'Test Product',
                    sku: 'TEST-SKU-123',
                    isSubstitutable: false
                  });
                  if (itemResult.isFailure()) throw new Error('Failed to create SubscriptionItem');
                  
                  return itemResult.value;
                })()
              ],
              frequency: frequency,
              totalDeliveries: 10,
              isPrepaid: false,
              autoRenew: true
            };
            
            const result = createSubscription(props, clock);
            if (result.isFailure()) return true; // Skip invalid subscriptions
            
            const subscription = result.value;
            
            // Record a delivery to trigger next delivery date calculation
            const deliveryResult = subscription.recordDelivery(clock.now(), clock);
            if (deliveryResult.isFailure()) return false;
            
            // Verify that next delivery date is calculated correctly based on frequency
            const nextDeliveryDate = subscription.nextDeliveryDate;
            
            if (!nextDeliveryDate) return false;
            
            const initialTime = clock.now().getTime();
            const nextTime = nextDeliveryDate.getTime();
            const diff = nextTime - initialTime;
            const daysDiff = diff / (1000 * 60 * 60 * 24);
            
            switch (frequency) {
              case 'WEEKLY':
                return Math.abs(daysDiff - 7) < 0.01; // Account for floating point imprecision
              case 'BIWEEKLY':
                return Math.abs(daysDiff - 14) < 0.01;
              case 'MONTHLY':
                // For monthly, we check if it's roughly 28-31 days
                return daysDiff >= 28 && daysDiff <= 31;
              default:
                return false;
            }
          }
        )
      );
    });
    
    it('should handle expiration and renewal correctly', () => {
      fc.assert(
        fc.property(
          subscriptionPropsGen,
          fc.integer({ min: 1, max: 5 }), // number of deliveries to record
          (props, deliveriesToRecord) => {
            const clock = new TestClock(new Date('2025-01-01T10:00:00Z'));
            
            // Force subscription to be active and auto-renew enabled for this test
            props.status = SubscriptionStatusType.ACTIVE;
            props.autoRenew = true;
            // Limit total deliveries to a small number for test efficiency
            props.totalDeliveries = Math.min(props.totalDeliveries, 5);
            
            const result = createSubscription(props, clock);
            if (result.isFailure()) return true; // Skip invalid subscriptions
            
            const subscription = result.value;
            const totalDeliveries = subscription.totalDeliveries;
            
            // Record deliveries up to one less than the total
            for (let i = 0; i < Math.min(deliveriesToRecord, totalDeliveries - 1); i++) {
              // Advance time for each delivery
              clock.advanceTimeByDays(7);
              const deliveryResult = subscription.recordDelivery(clock.now(), clock);
              if (deliveryResult.isFailure()) return false;
            }
            
            // At this point, we should have remainingDeliveries > 0
            // Let's verify that the subscription is still active
            if (!subscription.isActive) return false;
            
            // Now record the final delivery to trigger potential expiration or renewal
            clock.advanceTimeByDays(7);
            const finalDeliveryResult = subscription.recordDelivery(clock.now(), clock);
            if (finalDeliveryResult.isFailure()) return false;
            
            // If auto-renew is enabled, the subscription should still be active
            // and remainingDeliveries should be reset to totalDeliveries
            if (subscription.autoRenew) {
              // Fix: explicitly cast to primitive types to avoid TypeScript errors
              const remainingDeliveries = Number(subscription.remainingDeliveries);
              const totalDeliveries = Number(subscription.totalDeliveries);
              return (
                subscription.isActive &&
                remainingDeliveries === totalDeliveries
              );
            } else {
              // If auto-renew is disabled, subscription should be expired with 0 remaining deliveries
              if (!subscription.isActive) {
                // Fix: explicitly cast to primitive type
                const remainingDeliveries = Number(subscription.remainingDeliveries);
                return remainingDeliveries === 0;
              }
              return false;
            }
          }
        )
      );
    });
  });
});

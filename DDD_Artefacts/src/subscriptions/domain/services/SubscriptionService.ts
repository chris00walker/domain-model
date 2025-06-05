import { Result, success, failure } from '../../../shared/core/Result';
import { IDomainEventPublisher } from '../../../shared/domain/events/IDomainEventPublisher';
import { SubscriptionAggregate } from '../aggregates/SubscriptionAggregate';
import { ISubscriptionRepository } from '../repositories/ISubscriptionRepository';
import { SubscriptionRenewed } from '../events/SubscriptionRenewed';
import { SubscriptionCancelled } from '../events/SubscriptionCancelled';
import { SubscriptionPaused } from '../events/SubscriptionPaused';
import { SubscriptionResumed } from '../events/SubscriptionResumed';
import { Clock, SystemClock } from '../../../shared/domain/Clock';
import { Money } from '../../../shared/domain/value-objects/Money';

/**
 * SubscriptionService handles complex subscription operations that may involve
 * multiple aggregates or external services.
 */
export class SubscriptionService {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private eventPublisher: IDomainEventPublisher,
    private clock: Clock = new SystemClock()
  ) {}

  /**
   * Process subscription renewals that are due
   * @returns Result with number of renewals processed
   */
  public async processRenewals(): Promise<Result<number, string>> {
    try {
      // Get subscriptions due for renewal
      const dueForRenewalResult = await this.subscriptionRepository.findDueForRenewal(this.clock.now());
      
      if (dueForRenewalResult.isFailure()) {
        return failure(`Failed to fetch subscriptions due for renewal: ${dueForRenewalResult.error}`);
      }
      
      const subscriptions = dueForRenewalResult.value;
      let renewedCount = 0;
      
      for (const subscription of subscriptions) {
        const renewalResult = await this.renewSubscription(subscription.id.toString());
        
        if (renewalResult.isSuccess()) {
          renewedCount++;
        }
      }
      
      return success(renewedCount);
    } catch (error) {
      return failure(`Error processing renewals: ${error.message}`);
    }
  }

  /**
   * Renew a specific subscription
   * @param subscriptionId The ID of the subscription to renew
   * @returns Result indicating success or failure
   */
  public async renewSubscription(subscriptionId: string): Promise<Result<void, string>> {
    try {
      // Get the subscription
      const subscriptionResult = await this.subscriptionRepository.findById(subscriptionId);
      
      if (subscriptionResult.isFailure()) {
        return failure(`Subscription not found: ${subscriptionResult.error}`);
      }
      
      const subscription = subscriptionResult.value;
      
      // Check if subscription can be renewed
      if (!subscription.canBeRenewed()) {
        return failure(`Subscription ${subscriptionId} cannot be renewed in its current state`);
      }
      
      // Perform the renewal
      const renewalResult = subscription.renew(this.clock);
      
      if (renewalResult.isFailure()) {
        return failure(`Failed to renew subscription: ${renewalResult.error}`);
      }
      
      // Save the updated subscription
      const saveResult = await this.subscriptionRepository.save(subscription);
      
      if (saveResult.isFailure()) {
        return failure(`Failed to save renewed subscription: ${saveResult.error}`);
      }
      
      return success(undefined);
    } catch (error) {
      return failure(`Error renewing subscription: ${error.message}`);
    }
  }

  /**
   * Generate the next subscription box based on customer preferences and subscription plan
   * @param subscriptionId The ID of the subscription
   * @returns Result with the generated box contents
   */
  public async generateNextBox(subscriptionId: string): Promise<Result<any, string>> {
    try {
      // Get the subscription
      const subscriptionResult = await this.subscriptionRepository.findById(subscriptionId);
      
      if (subscriptionResult.isFailure()) {
        return failure(`Subscription not found: ${subscriptionResult.error}`);
      }
      
      const subscription = subscriptionResult.value;
      
      // Check if subscription is active
      if (!subscription.isActive()) {
        return failure(`Cannot generate box for inactive subscription ${subscriptionId}`);
      }
      
      // This would typically involve complex business logic to select products
      // based on customer preferences, previous orders, and subscription plan
      // For now, we'll return a simplified implementation
      
      const boxContents = {
        subscriptionId: subscriptionId,
        customerId: subscription.customerId,
        generatedDate: this.clock.now(),
        items: [
          // This would be dynamically generated based on customer preferences
          // and subscription plan in a real implementation
          { productId: 'sample-product-1', quantity: 1 },
          { productId: 'sample-product-2', quantity: 2 }
        ],
        totalValue: 50.00, // This would be calculated based on actual products
        shippingDate: new Date(this.clock.now().getTime() + 24 * 60 * 60 * 1000) // Next day
      };
      
      return success(boxContents);
    } catch (error) {
      return failure(`Error generating subscription box: ${error.message}`);
    }
  }

  /**
   * Calculate the lifetime value of a customer's subscriptions
   * @param customerId The customer ID
   * @returns Result with the calculated lifetime value
   */
  public async calculateCustomerLifetimeValue(customerId: string): Promise<Result<Money, string>> {
    try {
      // Get all customer subscriptions
      const subscriptionsResult = await this.subscriptionRepository.findByCustomerId(customerId);
      
      if (subscriptionsResult.isFailure()) {
        return failure(`Failed to fetch customer subscriptions: ${subscriptionsResult.error}`);
      }
      
      const subscriptions = subscriptionsResult.value;
      
      if (subscriptions.length === 0) {
        // Return zero value if no subscriptions
        return success(Money.create(0, 'BBD').value);
      }
      
      // Calculate total value across all subscriptions
      let totalValue = 0;
      let currency = 'BBD'; // Default currency
      
      for (const subscription of subscriptions) {
        // Get subscription metrics
        const metrics = subscription.getMetrics();
        
        // Add historical value
        totalValue += metrics.totalPaid;
        
        // If subscription is active, add projected future value
        if (subscription.isActive()) {
          const monthlyValue = metrics.averageMonthlyValue;
          const projectedMonths = 12; // Project for next year
          totalValue += monthlyValue * projectedMonths;
        }
        
        // Use the currency from the first subscription
        if (subscriptions.indexOf(subscription) === 0) {
          currency = metrics.currency;
        }
      }
      
      // Create money value object
      const moneyResult = Money.create(totalValue, currency);
      
      if (moneyResult.isFailure()) {
        return failure(`Failed to create money object: ${moneyResult.error}`);
      }
      
      return success(moneyResult.value);
    } catch (error) {
      return failure(`Error calculating customer lifetime value: ${error.message}`);
    }
  }

  /**
   * Analyze subscription churn risk for a customer
   * @param customerId The customer ID
   * @returns Result with churn risk score (0-100) and factors
   */
  public async analyzeChurnRisk(customerId: string): Promise<Result<{ score: number, factors: string[] }, string>> {
    try {
      // Get all customer subscriptions
      const subscriptionsResult = await this.subscriptionRepository.findByCustomerId(customerId);
      
      if (subscriptionsResult.isFailure()) {
        return failure(`Failed to fetch customer subscriptions: ${subscriptionsResult.error}`);
      }
      
      const subscriptions = subscriptionsResult.value;
      
      if (subscriptions.length === 0) {
        return failure(`Customer ${customerId} has no subscriptions`);
      }
      
      // This would involve complex analysis in a real system
      // For now, we'll return a simplified implementation
      
      // Get the active subscription (or most recent if none active)
      const activeSubscriptions = subscriptions.filter(s => s.isActive());
      const subscription = activeSubscriptions.length > 0 ? 
        activeSubscriptions[0] : 
        subscriptions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
      
      // Calculate risk factors
      const factors: string[] = [];
      let riskScore = 0;
      
      // Example risk factors
      if (subscription.getPauseCount() > 0) {
        factors.push('Previous subscription pauses');
        riskScore += 20;
      }
      
      if (subscription.getDaysSinceLastInteraction(this.clock.now()) > 30) {
        factors.push('Low engagement (30+ days without interaction)');
        riskScore += 25;
      }
      
      if (subscription.hasRecentPriceIncrease()) {
        factors.push('Recent price increase');
        riskScore += 15;
      }
      
      // Cap risk score at 100
      riskScore = Math.min(riskScore, 100);
      
      return success({
        score: riskScore,
        factors: factors
      });
    } catch (error) {
      return failure(`Error analyzing churn risk: ${error.message}`);
    }
  }
}

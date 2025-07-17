import { SubscriptionAggregate } from '../aggregates/SubscriptionAggregate';
import { Result } from '../../../shared/core/Result';

export interface ISubscriptionRepository {
  /**
   * Find a subscription by its ID
   * @param id The subscription ID
   */
  findById(id: string): Promise<Result<SubscriptionAggregate, string>>;

  /**
   * Find subscriptions by customer ID
   * @param customerId The customer ID
   * @param limit Optional limit on number of results
   * @param offset Optional offset for pagination
   */
  findByCustomerId(customerId: string, limit?: number, offset?: number): Promise<Result<SubscriptionAggregate[], string>>;

  /**
   * Find subscriptions due for renewal
   * @param date The date to check against
   * @param limit Optional limit on number of results
   */
  findDueForRenewal(date: Date, limit?: number): Promise<Result<SubscriptionAggregate[], string>>;

  /**
   * Find subscriptions by status
   * @param status The subscription status
   * @param limit Optional limit on number of results
   * @param offset Optional offset for pagination
   */
  findByStatus(status: string, limit?: number, offset?: number): Promise<Result<SubscriptionAggregate[], string>>;

  /**
   * Save a subscription
   * @param subscription The subscription to save
   */
  save(subscription: SubscriptionAggregate): Promise<Result<void, string>>;

  /**
   * Delete a subscription
   * @param subscription The subscription to delete
   */
  delete(subscription: SubscriptionAggregate): Promise<Result<void, string>>;
}

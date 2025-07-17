import { Subscription } from '../aggregates/Subscription';
import { SubscriptionStatus } from '../value-objects/SubscriptionStatus';
import { SubscriptionFrequency } from '../value-objects/SubscriptionFrequency';

/**
 * Repository interface for the Subscription aggregate
 * 
 * Following DDD principles, this repository provides an abstraction for
 * persisting and retrieving Subscription aggregates. It encapsulates the
 * storage mechanism and provides a collection-like interface.
 */
export interface SubscriptionRepository {
  /**
   * Find a subscription by its ID
   */
  findById(id: string): Promise<Subscription | null>;

  /**
   * Find subscriptions by customer ID
   */
  findByCustomerId(customerId: string): Promise<Subscription[]>;

  /**
   * Find subscriptions by status
   */
  findByStatus(status: SubscriptionStatus): Promise<Subscription[]>;

  /**
   * Find subscriptions by frequency
   */
  findByFrequency(frequency: SubscriptionFrequency): Promise<Subscription[]>;

  /**
   * Find subscriptions with upcoming deliveries within a date range
   */
  findWithNextDeliveryInRange(startDate: Date, endDate: Date): Promise<Subscription[]>;

  /**
   * Find subscriptions eligible for renewal (expired or with 0 remaining deliveries)
   */
  findEligibleForRenewal(): Promise<Subscription[]>;

  /**
   * Find subscriptions with auto-renew enabled
   */
  findWithAutoRenew(): Promise<Subscription[]>;

  /**
   * Save a subscription (create or update)
   */
  save(subscription: Subscription): Promise<void>;

  /**
   * Remove a subscription
   */
  remove(subscription: Subscription): Promise<void>;

  /**
   * Get all subscriptions with pagination
   */
  findAll(page: number, limit: number): Promise<Subscription[]>;

  /**
   * Count subscriptions by status
   */
  countByStatus(status: SubscriptionStatus): Promise<number>;

  /**
   * Count subscriptions by frequency
   */
  countByFrequency(frequency: SubscriptionFrequency): Promise<number>;
}

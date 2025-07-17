import { SubscriptionBundle } from '../aggregates/SubscriptionBundle';

/**
 * Repository interface for the SubscriptionBundle aggregate
 * 
 * Following DDD principles, this repository provides an abstraction for
 * persisting and retrieving SubscriptionBundle aggregates. It encapsulates the
 * storage mechanism and provides a collection-like interface.
 */
export interface SubscriptionBundleRepository {
  /**
   * Find a subscription bundle by its ID
   */
  findById(id: string): Promise<SubscriptionBundle | null>;

  /**
   * Find subscription bundles by name (partial match)
   */
  findByName(name: string): Promise<SubscriptionBundle[]>;

  /**
   * Find active subscription bundles
   */
  findActive(): Promise<SubscriptionBundle[]>;

  /**
   * Find subscription bundles by category
   */
  findByCategory(category: string): Promise<SubscriptionBundle[]>;

  /**
   * Find subscription bundles by popularity (most subscribed)
   */
  findByPopularity(limit: number): Promise<SubscriptionBundle[]>;

  /**
   * Find subscription bundles that contain a specific product
   */
  findByProduct(productId: string): Promise<SubscriptionBundle[]>;

  /**
   * Save a subscription bundle (create or update)
   */
  save(bundle: SubscriptionBundle): Promise<void>;

  /**
   * Delete a subscription bundle
   */
  delete(bundle: SubscriptionBundle): Promise<void>;

  /**
   * Get all subscription bundles
   */
  findAll(): Promise<SubscriptionBundle[]>;
}

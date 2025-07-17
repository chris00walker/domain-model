import { PricingStrategy } from '../strategies/PricingStrategy';

/**
 * Repository interface for persisting and retrieving pricing strategies
 */
export interface IPricingStrategyRepository {
  /**
   * Save a pricing strategy
   * @param id Unique identifier for the strategy
   * @param strategy The pricing strategy to save
   */
  save(id: string, strategy: PricingStrategy): Promise<void>;

  /**
   * Find a pricing strategy by its ID
   * @param id The strategy ID
   * @returns The pricing strategy or null if not found
   */
  findById(id: string): Promise<PricingStrategy | null>;

  /**
   * Find all pricing strategies
   * @returns Array of all pricing strategies
   */
  findAll(): Promise<Map<string, PricingStrategy>>;

  /**
   * Delete a pricing strategy
   * @param id The strategy ID
   * @returns True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Find pricing strategies by type
   * @param type The strategy type to filter by
   * @returns Map of strategy IDs to strategies of the specified type
   */
  findByType(type: string): Promise<Map<string, PricingStrategy>>;
}

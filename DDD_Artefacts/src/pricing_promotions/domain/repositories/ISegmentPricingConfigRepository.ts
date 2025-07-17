import { SegmentPricingConfig } from '../aggregates/SegmentPricingConfig';
import { PricingTier, PricingTierType } from '../value-objects/PricingTier';

/**
 * Repository interface for persisting and retrieving segment pricing configurations
 */
export interface ISegmentPricingConfigRepository {
  /**
   * Save a segment pricing configuration
   * @param config The configuration to save
   */
  save(config: SegmentPricingConfig): Promise<void>;

  /**
   * Find a segment pricing configuration by its ID
   * @param id The configuration ID
   * @returns The segment pricing configuration or null if not found
   */
  findById(id: string): Promise<SegmentPricingConfig | null>;

  /**
   * Find a segment pricing configuration by pricing tier type
   * @param tierType The pricing tier type
   * @returns The segment pricing configuration or null if not found
   */
  findByTierType(tierType: PricingTierType): Promise<SegmentPricingConfig | null>;

  /**
   * Find all segment pricing configurations
   * @returns Array of all segment pricing configurations
   */
  findAll(): Promise<SegmentPricingConfig[]>;

  /**
   * Find all active segment pricing configurations
   * @returns Array of all active segment pricing configurations
   */
  findAllActive(): Promise<SegmentPricingConfig[]>;

  /**
   * Delete a segment pricing configuration
   * @param id The configuration ID
   * @returns True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a configuration exists for a pricing tier
   * @param tierType The pricing tier type
   * @returns True if a configuration exists, false otherwise
   */
  existsForTier(tierType: PricingTierType): Promise<boolean>;

  /**
   * Find a pricing tier by its ID
   * @param id The pricing tier ID
   * @returns The pricing tier or null if not found
   */
  findPricingTierById(id: string): Promise<PricingTier | null>;
  
  /**
   * Find a segment pricing configuration by pricing tier
   * @param pricingTier The pricing tier
   * @returns The segment pricing configuration or null if not found
   */
  findByPricingTier(pricingTier: PricingTier): Promise<SegmentPricingConfig | null>;
  
  /**
   * Check if a segment pricing configuration exists by ID
   * @param id The configuration ID
   * @returns True if exists, false otherwise
   */
  exists(id: string): Promise<boolean>;
}

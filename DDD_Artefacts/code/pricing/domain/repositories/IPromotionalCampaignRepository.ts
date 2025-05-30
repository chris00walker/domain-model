import { PromotionalCampaign, CampaignType, CampaignStatus } from '../aggregates/PromotionalCampaign';
import { PricingTier, PricingTierType } from '../value-objects/PricingTier';

/**
 * Repository interface for persisting and retrieving promotional campaigns
 */
export interface IPromotionalCampaignRepository {
  /**
   * Save a promotional campaign
   * @param campaign The campaign to save
   */
  save(campaign: PromotionalCampaign): Promise<void>;

  /**
   * Find a promotional campaign by its ID
   * @param id The campaign ID
   * @returns The promotional campaign or null if not found
   */
  findById(id: string): Promise<PromotionalCampaign | null>;

  /**
   * Find a promotional campaign by code
   * @param code The campaign code
   * @returns The promotional campaign or null if not found
   */
  findByCode(code: string): Promise<PromotionalCampaign | null>;

  /**
   * Find all promotional campaigns
   * @returns Array of all promotional campaigns
   */
  findAll(): Promise<PromotionalCampaign[]>;

  /**
   * Find campaigns by status
   * @param status The campaign status
   * @returns Array of campaigns with the specified status
   */
  findByStatus(status: CampaignStatus): Promise<PromotionalCampaign[]>;

  /**
   * Find campaigns by type
   * @param type The campaign type
   * @returns Array of campaigns with the specified type
   */
  findByType(type: CampaignType): Promise<PromotionalCampaign[]>;

  /**
   * Find active campaigns applicable to a pricing tier
   * @param tierType The pricing tier type
   * @returns Array of active campaigns applicable to the specified tier
   */
  findActiveByTier(tierType: PricingTierType): Promise<PromotionalCampaign[]>;

  /**
   * Find active campaigns applicable to a product
   * @param productId The product ID
   * @returns Array of active campaigns applicable to the specified product
   */
  findActiveByProductId(productId: string): Promise<PromotionalCampaign[]>;

  /**
   * Find active campaigns applicable to a category
   * @param categoryId The category ID
   * @returns Array of active campaigns applicable to the specified category
   */
  findActiveByCategoryId(categoryId: string): Promise<PromotionalCampaign[]>;

  /**
   * Find campaigns that are currently active (based on status and date range)
   * @returns Array of currently active campaigns
   */
  findCurrentlyActive(): Promise<PromotionalCampaign[]>;

  /**
   * Delete a promotional campaign
   * @param id The campaign ID
   * @returns True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
  
  /**
   * Find all active promotional campaigns
   * @returns Array of all active promotional campaigns
   */
  findActive(): Promise<PromotionalCampaign[]>;
  
  /**
   * Check if a promotional campaign exists by ID
   * @param id The campaign ID
   * @returns True if exists, false otherwise
   */
  exists(id: string): Promise<boolean>;
}

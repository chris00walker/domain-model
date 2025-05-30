import { Result, success, failure } from '@shared/core/Result';
import { MarginGuardRailService } from './MarginGuardRailService';
import { PromotionStackingService } from './PromotionStackingService';
import { PricingTier, PricingTierType } from '../value-objects/PricingTier';
import { IDomainEventPublisher } from '@shared/domain/events/IDomainEventPublisher';

/**
 * Service that monitors and enforces pricing policies as defined in the business model
 */
export class PricingGovernanceService {
  private marginGuardRailService: MarginGuardRailService;
  private promotionStackingService: PromotionStackingService;
  private dynamicPricingFrozen: Map<string, boolean>; // Map of tier ID to frozen status
  private lastReviewDates: Map<string, Date>; // Map of tier ID to last review date
  private eventPublisher?: IDomainEventPublisher;

  constructor(
    marginGuardRailService: MarginGuardRailService,
    promotionStackingService: PromotionStackingService,
    eventPublisher?: IDomainEventPublisher
  ) {
    this.marginGuardRailService = marginGuardRailService;
    this.promotionStackingService = promotionStackingService;
    this.dynamicPricingFrozen = new Map<string, boolean>();
    this.lastReviewDates = new Map<string, Date>();
    this.eventPublisher = eventPublisher;

    // Initialize frozen status for all pricing tiers
    Object.values(PricingTierType).forEach(tierType => {
      this.dynamicPricingFrozen.set(tierType, false);
    });
  }

  /**
   * Check if dynamic pricing is frozen for a specific pricing tier
   * @param tierType The pricing tier type
   * @returns True if dynamic pricing is frozen, false otherwise
   */
  public isDynamicPricingFrozen(tierType: string): boolean {
    return this.dynamicPricingFrozen.get(tierType) || false;
  }

  /**
   * Get the date of the last pricing review for a tier
   * @param tierType The pricing tier type
   * @returns The date of the last review or undefined if no review has occurred
   */
  public getLastReviewDate(tierType: string): Date | undefined {
    return this.lastReviewDates.get(tierType);
  }

  /**
   * Freeze dynamic pricing for a specific pricing tier
   * This implements the business rule that the dynamic-pricing engine should be frozen
   * if Pocket GM falls below floor for two consecutive weeks
   * @param tierType The pricing tier type
   * @param reason The reason for freezing pricing
   */
  public freezeDynamicPricing(tierType: string, reason: string): void {
    this.dynamicPricingFrozen.set(tierType, true);
    
    // Log the freeze action (in a real implementation, this would use a proper logging system)
    console.log(`[${new Date().toISOString()}] Dynamic pricing frozen for tier ${tierType}: ${reason}`);
  }

  /**
   * Unfreeze dynamic pricing for a specific pricing tier after a formal CFO-approved review
   * @param tierType The pricing tier type
   * @param reviewerId The ID of the reviewer (typically the CFO)
   * @param notes Notes from the review
   * @returns Success if unfrozen, failure if there's an issue
   */
  public unfreezeDynamicPricing(
    tierType: string,
    reviewerId: string,
    notes: string
  ): Result<void, string> {
    if (!this.dynamicPricingFrozen.get(tierType)) {
      return failure(`Dynamic pricing is not frozen for tier ${tierType}`);
    }
    
    // Reset frozen status
    this.dynamicPricingFrozen.set(tierType, false);
    
    // Clear violation history
    this.marginGuardRailService.clearViolationHistory(tierType);
    
    // Update last review date
    this.lastReviewDates.set(tierType, new Date());
    
    // Log the unfreeze action
    console.log(`[${new Date().toISOString()}] Dynamic pricing unfrozen for tier ${tierType} by ${reviewerId}: ${notes}`);
    
    return success(undefined);
  }

  /**
   * Check margin trends and automatically freeze pricing if margin floor is breached
   * for two consecutive weeks
   * @param tierType The pricing tier type
   * @returns True if pricing was frozen, false otherwise
   */
  public checkAndUpdateFreezeStatus(tierType: string): boolean {
    // If already frozen, nothing to do
    if (this.dynamicPricingFrozen.get(tierType)) {
      return false;
    }
    
    // Check if the tier has exceeded the violation threshold
    if (this.marginGuardRailService.hasTierExceededViolationThreshold(tierType)) {
      this.freezeDynamicPricing(
        tierType,
        'Margin floor breached for two consecutive weeks'
      );
      return true;
    }
    
    return false;
  }

  /**
   * Validate pricing governance rules for an order
   * @param order The order object containing pricing information
   * @returns Success if all rules pass, failure if any rule is violated
   */
  public validateOrder(order: any): Result<void, string> {
    // Check if there are multiple promotions
    if (order.promotions && order.promotions.length > 1) {
      return this.promotionStackingService.validateModifiers(
        order.promotions,
        order.id
      );
    }
    
    return success(undefined);
  }

  /**
   * Run a regular governance check (should be scheduled to run regularly)
   * This checks all tiers for margin violations and updates freeze status as needed
   * @returns Summary of check results
   */
  public runGovernanceCheck(): Record<string, boolean> {
    const results: Record<string, boolean> = {};
    
    Object.values(PricingTierType).forEach(tierType => {
      results[tierType] = this.checkAndUpdateFreezeStatus(tierType);
    });
    
    return results;
  }
}

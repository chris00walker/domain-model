import { Result, success, failure } from '@shared/core/Result';
import { PriceModifier } from '../value-objects/PriceModifier';
import { PricingRule } from '../entities/PricingRule';
import { PromotionalCampaign } from '../aggregates/PromotionalCampaign';
import { PricingRuleViolated } from '../events/PricingRuleViolated';
import { IDomainEventPublisher } from '@shared/domain/events/IDomainEventPublisher';

/**
 * Service that enforces the one-promo-per-order rule as defined in the business model
 */
export class PromotionStackingService {
  private eventPublisher?: IDomainEventPublisher;

  constructor(eventPublisher?: IDomainEventPublisher) {
    this.eventPublisher = eventPublisher;
  }

  /**
   * Validate that a set of price modifiers adheres to the one-promo-per-order rule
   * @param modifiers Array of price modifiers to validate
   * @param orderId Optional order ID for context
   * @returns Success if valid, failure if the rule is violated
   */
  public validateModifiers(
    modifiers: PriceModifier[],
    orderId?: string
  ): Result<void, string> {
    if (!modifiers || modifiers.length <= 1) {
      return success(undefined);
    }

    // Count promotional discounts (excluding non-promotional adjustments like tax, shipping, etc.)
    const promotionalDiscounts = modifiers.filter(
      m => m.isDiscount() && m.name.toLowerCase().includes('promo')
    );

    if (promotionalDiscounts.length > 1) {
      return failure('Only one promotional discount can be applied per order (one-promo-per-order rule)');
    }

    return success(undefined);
  }

  /**
   * Validate that a set of promotional campaigns adheres to the one-promo-per-order rule
   * @param campaigns Array of promotional campaigns to validate
   * @param orderId Optional order ID for context
   * @returns Success if valid, failure if the rule is violated
   */
  public validateCampaigns(
    campaigns: PromotionalCampaign[],
    orderId?: string
  ): Result<void, string> {
    if (!campaigns || campaigns.length <= 1) {
      return success(undefined);
    }

    // Check if there are multiple active discount campaigns
    const activeDiscountCampaigns = campaigns.filter(
      c => c.isCurrentlyActive() && !c.hasReachedUsageLimit() && c.priceModifier.isDiscount()
    );

    if (activeDiscountCampaigns.length > 1) {
      // If there are multiple events, publish a rule violation event
      if (this.eventPublisher) {
        // Use the first rule as the representative rule for the event
        const rule = activeDiscountCampaigns[0].pricingRules[0];
        
        this.eventPublisher.publish(
          new PricingRuleViolated(
            rule,
            { campaigns: activeDiscountCampaigns.map(c => c.id.toString()) },
            'Multiple promotional campaigns applied to the same order',
            'WARNING',
            orderId
          )
        );
      }
      
      return failure('Only one promotional campaign can be applied per order (one-promo-per-order rule)');
    }

    return success(undefined);
  }

  /**
   * Determine the best promotion to apply from a set of eligible promotions
   * @param eligiblePromotions Array of eligible price modifiers
   * @returns The best promotion to apply (typically the one with the highest discount value)
   */
  public determineBestPromotion(eligiblePromotions: PriceModifier[]): PriceModifier | undefined {
    if (!eligiblePromotions || eligiblePromotions.length === 0) {
      return undefined;
    }

    if (eligiblePromotions.length === 1) {
      return eligiblePromotions[0];
    }

    // Sort promotions by their value (for simplicity, assuming higher value means better discount)
    // In a real implementation, this would need more sophisticated logic based on promotion types
    return [...eligiblePromotions].sort((a, b) => b.value - a.value)[0];
  }

  /**
   * Determine the best campaign to apply from a set of eligible campaigns
   * @param eligibleCampaigns Array of eligible promotional campaigns
   * @returns The best campaign to apply
   */
  public determineBestCampaign(eligibleCampaigns: PromotionalCampaign[]): PromotionalCampaign | undefined {
    if (!eligibleCampaigns || eligibleCampaigns.length === 0) {
      return undefined;
    }

    if (eligibleCampaigns.length === 1) {
      return eligibleCampaigns[0];
    }

    // Sort campaigns by their discount value (assuming higher value means better discount)
    return [...eligibleCampaigns].sort((a, b) => {
      // First sort by percentage discount value if both are percentage discounts
      if (a.priceModifier.isPercentage() && b.priceModifier.isPercentage()) {
        return b.priceModifier.value - a.priceModifier.value;
      }
      
      // If mixed types, prefer percentage discounts for simplicity
      if (a.priceModifier.isPercentage()) {
        return -1;
      }
      
      if (b.priceModifier.isPercentage()) {
        return 1;
      }
      
      // If both are fixed discounts, compare values
      return b.priceModifier.value - a.priceModifier.value;
    })[0];
  }
}

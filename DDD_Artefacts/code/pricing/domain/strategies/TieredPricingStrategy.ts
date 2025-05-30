import { Money } from '@shared/domain/value-objects/Money';
import { Result, success, failure } from '@shared/core/Result';
import { PricingStrategy, PricingContext } from './PricingStrategy';
import { DiscountPercentage } from '../value-objects/DiscountPercentage';

/**
 * Enum for subscription tiers as defined in the business model
 */
export enum SubscriptionTierType {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  VIP = 'VIP'
}

/**
 * Structure to define a pricing tier configuration
 */
export interface TierConfiguration {
  type: SubscriptionTierType;
  monthlyFee: number;
  basketCredit: number;
  storeWideDiscountPercentage: number;
  targetGrossMarginPercentage: number;
  additionalBenefits: string[];
}

/**
 * Extended context for tiered pricing strategy
 */
interface TieredPricingContext extends PricingContext {
  subscriptionTier: SubscriptionTierType;
  isRecurringFee?: boolean; // Whether this is the subscription fee or a product purchase
  applyStoreWideDiscount?: boolean; // Whether to apply the tier's store-wide discount
}

/**
 * Tiered pricing strategy for subscription-based pricing
 * Used primarily for B2C Subscriptions
 */
export class TieredPricingStrategy extends PricingStrategy {
  private tierConfigurations: Map<SubscriptionTierType, TierConfiguration>;

  constructor(tierConfigurations?: TierConfiguration[]) {
    super(
      'Tiered Pricing Strategy',
      'Applies pricing based on subscription tiers with different benefits and pricing levels'
    );

    this.tierConfigurations = new Map<SubscriptionTierType, TierConfiguration>();
    
    // Initialize with default tier configurations from the business model if not provided
    const configs = tierConfigurations || [
      {
        type: SubscriptionTierType.BASIC,
        monthlyFee: 60, // BBD
        basketCredit: 60, // BBD
        storeWideDiscountPercentage: 5,
        targetGrossMarginPercentage: 40,
        additionalBenefits: ['Recipe pack']
      },
      {
        type: SubscriptionTierType.PREMIUM,
        monthlyFee: 90, // BBD
        basketCredit: 95, // BBD
        storeWideDiscountPercentage: 8,
        targetGrossMarginPercentage: 42,
        additionalBenefits: ['Recipe pack', 'Discovery bundle']
      },
      {
        type: SubscriptionTierType.VIP,
        monthlyFee: 180, // BBD
        basketCredit: 200, // BBD
        storeWideDiscountPercentage: 10,
        targetGrossMarginPercentage: 45,
        additionalBenefits: ['Recipe pack', 'Discovery bundle', 'Free delivery', 'Early access']
      }
    ];

    // Store configurations
    for (const config of configs) {
      this.tierConfigurations.set(config.type, config);
    }
  }

  /**
   * Calculate price based on subscription tier
   * @param context Pricing context with tiered pricing specific fields
   * @returns The calculated price or an error
   */
  calculatePrice(context: TieredPricingContext): Result<Money, string> {
    const { 
      baseCost, 
      quantity, 
      pricingTier, 
      subscriptionTier, 
      isRecurringFee = false, 
      applyStoreWideDiscount = false 
    } = context;

    // Get tier configuration
    const tierConfig = this.tierConfigurations.get(subscriptionTier);
    if (!tierConfig) {
      return failure(`No configuration found for subscription tier: ${subscriptionTier}`);
    }

    let resultPrice: Money;

    // Handle differently based on whether this is for the subscription fee or a product purchase
    if (isRecurringFee) {
      // This is for the subscription monthly fee itself
      const monthlyFeeResult = Money.create(tierConfig.monthlyFee, baseCost.currency);
      if (monthlyFeeResult.isFailure()) {
        return failure(`Failed to create money object for monthly fee: ${monthlyFeeResult.error}`);
      }
      resultPrice = monthlyFeeResult.value;
    } else {
      // This is for a product purchase by a subscriber
      // Start with the base cost
      let currentPrice = baseCost;

      // Apply store-wide discount if applicable
      if (applyStoreWideDiscount) {
        const discountResult = DiscountPercentage.create(tierConfig.storeWideDiscountPercentage);
        if (discountResult.isFailure()) {
          return failure(`Failed to create discount percentage: ${discountResult.error}`);
        }

        const discount = discountResult.value;
        const discountedPriceAmount = discount.applyToAmount(currentPrice.amount);
        const discountedPriceResult = Money.create(discountedPriceAmount, currentPrice.currency);
        
        if (discountedPriceResult.isFailure()) {
          return failure(`Failed to apply store-wide discount: ${discountedPriceResult.error}`);
        }
        
        currentPrice = discountedPriceResult.value;
      }

      // Apply quantity if needed
      if (quantity > 1) {
        const totalPriceResult = currentPrice.multiply(quantity);
        if (totalPriceResult.isFailure()) {
          return failure(`Failed to multiply by quantity: ${totalPriceResult.error}`);
        }
        currentPrice = totalPriceResult.value;
      }

      resultPrice = currentPrice;
    }

    // For non-fee purchases, verify margin floor
    if (!isRecurringFee) {
      const totalBaseCost = quantity > 1 ? 
        baseCost.multiply(quantity).value : 
        baseCost;
        
      // Verify the target gross margin is achievable
      const marginResult = this.calculateMarginPercentage(resultPrice, totalBaseCost);
      if (marginResult.isFailure()) {
        return failure(`Failed to calculate margin: ${marginResult.error}`);
      }
      
      const calculatedMargin = marginResult.value;
      if (calculatedMargin < tierConfig.targetGrossMarginPercentage) {
        return failure(`Calculated margin (${calculatedMargin.toFixed(2)}%) is below target margin (${tierConfig.targetGrossMarginPercentage}%) for tier ${subscriptionTier}`);
      }
    }

    return success(resultPrice);
  }

  /**
   * Get available subscription tiers
   * @returns Array of available tier types
   */
  getAvailableTiers(): SubscriptionTierType[] {
    return Array.from(this.tierConfigurations.keys());
  }

  /**
   * Get configuration for a specific tier
   * @param tierType The tier type to get configuration for
   * @returns The tier configuration or undefined if not found
   */
  getTierConfiguration(tierType: SubscriptionTierType): TierConfiguration | undefined {
    return this.tierConfigurations.get(tierType);
  }

  /**
   * Update configuration for a specific tier
   * @param config The new tier configuration
   */
  updateTierConfiguration(config: TierConfiguration): void {
    this.tierConfigurations.set(config.type, config);
  }
}

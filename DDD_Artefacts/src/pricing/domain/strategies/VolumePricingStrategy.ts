import { Money } from '@shared/domain/value-objects/Money';
import { Result, success, failure } from '@shared/core/Result';
import { PricingStrategy, PricingContext } from './PricingStrategy';
import { MarkupPercentage } from '../value-objects/MarkupPercentage';
import { DiscountPercentage } from '../value-objects/DiscountPercentage';

/**
 * Volume discount tier definition
 */
export interface VolumeDiscountTier {
  minQuantity: number;
  discountPercentage: number;
}

/**
 * Extended context for volume pricing strategy
 */
interface VolumePricingContext extends PricingContext {
  volumeDiscountTiers?: VolumeDiscountTier[];
  useCustomMarkup?: boolean;
  customMarkupPercentage?: number;
}

/**
 * Volume pricing strategy for quantity-based discounts
 * Used primarily for Commercial Orders in the business model
 */
export class VolumePricingStrategy extends PricingStrategy {
  private defaultVolumeTiers: VolumeDiscountTier[];

  constructor(defaultVolumeTiers?: VolumeDiscountTier[]) {
    super(
      'Volume Pricing Strategy',
      'Applies pricing based on order quantity with volume-based discounts'
    );

    // Initialize with default volume tiers if not provided
    this.defaultVolumeTiers = defaultVolumeTiers || [
      { minQuantity: 1, discountPercentage: 0 },
      { minQuantity: 5, discountPercentage: 5 },
      { minQuantity: 10, discountPercentage: 8 },
      { minQuantity: 20, discountPercentage: 12 },
      { minQuantity: 50, discountPercentage: 15 },
      { minQuantity: 100, discountPercentage: 20 }
    ];
  }

  /**
   * Calculate price based on order quantity and applicable volume discounts
   * @param context Pricing context with volume pricing specific fields
   * @returns The calculated selling price or an error
   */
  calculatePrice(context: VolumePricingContext): Result<Money, string> {
    const { 
      baseCost, 
      quantity, 
      pricingTier, 
      volumeDiscountTiers,
      useCustomMarkup,
      customMarkupPercentage
    } = context;

    // Use provided volume tiers or default to instance defaults
    const tiers = volumeDiscountTiers || this.defaultVolumeTiers;

    // Find applicable volume discount tier
    let applicableTier: VolumeDiscountTier | undefined;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (quantity >= tiers[i].minQuantity) {
        applicableTier = tiers[i];
        break;
      }
    }

    if (!applicableTier) {
      // Should never happen as long as there's a tier with minQuantity = 1
      applicableTier = { minQuantity: 1, discountPercentage: 0 };
    }

    // Determine markup percentage to use
    let markupPercentage: number;
    if (useCustomMarkup && customMarkupPercentage !== undefined) {
      markupPercentage = customMarkupPercentage;
    } else {
      markupPercentage = pricingTier.getBaseMarkupPercentage();
    }

    // Create markup percentage value object
    const markupResult = MarkupPercentage.create(markupPercentage);
    if (markupResult.isFailure()) {
      return failure(markupResult.error);
    }
    
    // Apply markup to get base unit price
    const markup = markupResult.value;
    const unitPriceWithMarkup = markup.applyToAmount(baseCost.amount);
    
    // Create Money object for the unit price
    const unitPriceResult = Money.create(unitPriceWithMarkup, baseCost.currency);
    if (unitPriceResult.isFailure()) {
      return failure(`Failed to create unit price: ${unitPriceResult.error}`);
    }
    
    let unitPrice = unitPriceResult.value;

    // Apply volume discount to unit price if applicable
    if (applicableTier.discountPercentage > 0) {
      // Validate discount doesn't exceed maximum for tier
      const tierMaxDiscount = pricingTier.getMaxDiscountPercentage();
      const finalDiscountPercentage = Math.min(applicableTier.discountPercentage, tierMaxDiscount);
      
      // Create discount percentage value object
      const discountResult = DiscountPercentage.create(finalDiscountPercentage);
      if (discountResult.isFailure()) {
        return failure(`Failed to create discount: ${discountResult.error}`);
      }
      
      const discount = discountResult.value;
      const discountedPriceAmount = discount.applyToAmount(unitPrice.amount);
      const discountedPriceResult = Money.create(discountedPriceAmount, unitPrice.currency);
      
      if (discountedPriceResult.isFailure()) {
        return failure(`Failed to apply volume discount: ${discountedPriceResult.error}`);
      }
      
      unitPrice = discountedPriceResult.value;
    }

    // Calculate total price for the quantity
    const totalPriceResult = unitPrice.multiply(quantity);
    if (totalPriceResult.isFailure()) {
      return failure(`Failed to calculate total price: ${totalPriceResult.error}`);
    }
    const totalPrice = totalPriceResult.value;

    // Verify the calculated price meets margin floor requirements
    const totalBaseCost = baseCost.multiply(quantity).value;
    if (!this.verifyMarginFloor(totalPrice, totalBaseCost, pricingTier)) {
      return failure(`Calculated price violates margin floor requirements for tier ${pricingTier.toString()}`);
    }

    return success(totalPrice);
  }

  /**
   * Get the applicable discount percentage for a given quantity
   * @param quantity The order quantity
   * @param tiers Optional custom volume tiers to use
   * @returns The applicable discount percentage
   */
  getApplicableDiscountPercentage(quantity: number, tiers?: VolumeDiscountTier[]): number {
    const volumeTiers = tiers || this.defaultVolumeTiers;
    
    // Find applicable volume discount tier
    for (let i = volumeTiers.length - 1; i >= 0; i--) {
      if (quantity >= volumeTiers[i].minQuantity) {
        return volumeTiers[i].discountPercentage;
      }
    }
    
    return 0; // Default to no discount if no tier applies
  }

  /**
   * Set new default volume discount tiers
   * @param tiers The new default volume discount tiers
   */
  setDefaultVolumeTiers(tiers: VolumeDiscountTier[]): void {
    // Validate tiers are sorted by minQuantity
    for (let i = 1; i < tiers.length; i++) {
      if (tiers[i].minQuantity <= tiers[i-1].minQuantity) {
        throw new Error('Volume discount tiers must be sorted by minQuantity in ascending order');
      }
    }
    
    // Validate at least one tier exists with minQuantity = 1
    if (!tiers.some(tier => tier.minQuantity === 1)) {
      throw new Error('Volume discount tiers must include a tier with minQuantity = 1');
    }
    
    this.defaultVolumeTiers = [...tiers];
  }
}

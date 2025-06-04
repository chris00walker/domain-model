import { Money } from '@shared/domain/value-objects/Money';
import { Result, success, failure } from '@shared/core/Result';
import { PricingStrategy, PricingContext } from './PricingStrategy';
import { MarkupPercentage } from '../value-objects/MarkupPercentage';
import { PriceModifier } from '../value-objects/PriceModifier';

/**
 * Extended context for fixed pricing strategy
 */
interface FixedPricingContext extends PricingContext {
  priceModifiers?: PriceModifier[]; // Optional price modifiers (e.g., promotions)
  useCustomMarkup?: boolean; // Flag to use provided markup instead of tier's default markup
  customMarkupPercentage?: number; // Custom markup percentage if useCustomMarkup is true
}

/**
 * Fixed pricing strategy with optional promotional adjustments
 * Primarily used for Guest One-Off Orders
 */
export class FixedPricingStrategy extends PricingStrategy {
  constructor() {
    super(
      'Fixed Pricing Strategy',
      'Applies a fixed markup to the base cost with optional promotional adjustments'
    );
  }

  /**
   * Calculate price based on fixed markup and optional modifiers
   * @param context Pricing context with optional fixed pricing specific fields
   * @returns The calculated selling price or an error
   */
  calculatePrice(context: FixedPricingContext): Result<Money, string> {
    const { baseCost, quantity, pricingTier, useCustomMarkup, customMarkupPercentage, priceModifiers } = context;

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
    
    // Calculate unit price with markup
    const markup = markupResult.value;
    const unitPriceWithMarkup = markup.applyToAmount(baseCost.amount);
    
    // Create Money object for the unit price
    const unitPriceResult = Money.create(unitPriceWithMarkup, baseCost.currency);
    if (unitPriceResult.isFailure()) {
      return failure(`Failed to create unit price: ${unitPriceResult.error}`);
    }
    
    // Calculate total price for the quantity
    let totalPrice = unitPriceResult.value;
    if (quantity > 1) {
      const quantityMultiplyResult = totalPrice.multiply(quantity);
      if (quantityMultiplyResult.isFailure()) {
        return failure(`Failed to multiply by quantity: ${quantityMultiplyResult.error}`);
      }
      totalPrice = quantityMultiplyResult.value;
    }

    // Apply price modifiers if any
    if (priceModifiers && priceModifiers.length > 0) {
      let currentPrice = totalPrice;
      
      // Sort modifiers by priority (higher priority applied first)
      const sortedModifiers = [...priceModifiers].sort((a, b) => b.priority - a.priority);
      
      for (const modifier of sortedModifiers) {
        const modifiedPriceResult = modifier.applyToPrice(currentPrice);
        if (modifiedPriceResult.isFailure()) {
          return failure(`Failed to apply price modifier (${modifier.name}): ${modifiedPriceResult.error}`);
        }
        currentPrice = modifiedPriceResult.value;
      }
      
      totalPrice = currentPrice;
    }

    // Verify the calculated price meets margin floor requirements
    const unitBaseCost = quantity > 1 ? 
      baseCost.multiply(quantity).value : 
      baseCost;
      
    if (!this.verifyMarginFloor(totalPrice, unitBaseCost, pricingTier)) {
      return failure(`Calculated price violates margin floor requirements for tier ${pricingTier.toString()}`);
    }

    return success(totalPrice);
  }
}

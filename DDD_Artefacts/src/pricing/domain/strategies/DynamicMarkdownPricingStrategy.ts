import { Money } from '@shared/domain/value-objects/Money';
import { Result, success, failure } from '@shared/core/Result';
import { PricingStrategy, PricingContext } from './PricingStrategy';
import { DynamicPricingFormula } from '../value-objects/DynamicPricingFormula';
import { DiscountPercentage } from '../value-objects/DiscountPercentage';
import { MarkupPercentage } from '../value-objects/MarkupPercentage';

/**
 * Extended context for dynamic markdown pricing strategy
 */
interface DynamicMarkdownPricingContext extends PricingContext {
  daysRemaining: number;             // Days remaining before expiry (t)
  demandFactor: number;              // Demand factor (d) between 0-1, higher means higher demand
  profitabilityFactor: number;       // Profitability factor (p) between 0-1, higher means higher profit margin
  customFormula?: DynamicPricingFormula; // Optional custom formula to use
}

/**
 * Dynamic Markdown Pricing Strategy for time-sensitive inventory
 * Implements the D(t,d,p) formula from the business model
 * Used primarily for Near-Expiry Flash Sales
 */
export class DynamicMarkdownPricingStrategy extends PricingStrategy {
  private defaultFormula: DynamicPricingFormula;

  constructor() {
    super(
      'Dynamic Markdown Pricing Strategy',
      'Applies time-based dynamic pricing for inventory management using the D(t,d,p) formula'
    );

    // Initialize with default formula parameters from the business model
    const formulaResult = DynamicPricingFormula.create();
    if (formulaResult.isFailure()) {
      throw new Error(`Failed to initialize default formula: ${formulaResult.error}`);
    }
    
    this.defaultFormula = formulaResult.value;
  }

  /**
   * Calculate price based on dynamic markdown formula
   * @param context Pricing context with dynamic markdown specific fields
   * @returns The calculated selling price or an error
   */
  calculatePrice(context: DynamicMarkdownPricingContext): Result<Money, string> {
    const { 
      baseCost, 
      quantity, 
      pricingTier, 
      daysRemaining, 
      demandFactor, 
      profitabilityFactor,
      customFormula
    } = context;

    // Use custom formula if provided, otherwise use default
    const formula = customFormula || this.defaultFormula;

    // Calculate the discount percentage using the formula
    const discountResult = formula.calculatePercentageDiscount(
      daysRemaining,
      demandFactor,
      profitabilityFactor
    );

    if (discountResult.isFailure()) {
      return failure(`Failed to calculate discount: ${discountResult.error}`);
    }

    // Get the calculated discount percentage
    let discountPercentage = discountResult.value;

    // Ensure discount doesn't exceed maximum for the pricing tier
    const maxDiscount = pricingTier.getMaxDiscountPercentage();
    if (discountPercentage > maxDiscount) {
      discountPercentage = maxDiscount;
    }

    // Start with base price including markup
    const markup = pricingTier.getBaseMarkupPercentage();
    const markupResult = MarkupPercentage.create(markup);
    if (markupResult.isFailure()) {
      return failure(`Invalid markup from pricing tier: ${markupResult.error}`);
    }
    
    // Apply markup to base cost
    const baseMarkupPrice = markupResult.value.applyToAmount(baseCost.amount);
    const baseUnitPriceResult = Money.create(baseMarkupPrice, baseCost.currency);
    
    if (baseUnitPriceResult.isFailure()) {
      return failure(`Failed to create base unit price: ${baseUnitPriceResult.error}`);
    }
    
    let unitPrice = baseUnitPriceResult.value;

    // Apply calculated discount
    if (discountPercentage > 0) {
      const discountResult = DiscountPercentage.create(discountPercentage);
      if (discountResult.isFailure()) {
        return failure(`Failed to create discount: ${discountResult.error}`);
      }
      
      const discount = discountResult.value;
      const discountedPrice = discount.applyToAmount(unitPrice.amount);
      const discountedPriceResult = Money.create(discountedPrice, unitPrice.currency);
      
      if (discountedPriceResult.isFailure()) {
        return failure(`Failed to apply discount: ${discountedPriceResult.error}`);
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
      // If margin floor is violated, recalculate price at the floor margin
      const floorMargin = pricingTier.getFloorGrossMarginPercentage() / 100;
      const floorPrice = totalBaseCost.amount / (1 - floorMargin);
      const floorPriceResult = Money.create(floorPrice, totalBaseCost.currency);
      
      if (floorPriceResult.isFailure()) {
        return failure(`Failed to create floor price: ${floorPriceResult.error}`);
      }
      
      return success(floorPriceResult.value);
    }

    return success(totalPrice);
  }

  /**
   * Set a new default formula with custom parameters
   * @param beta Beta parameter (default 0.4)
   * @param gamma Gamma parameter (default 0.5)
   * @param maxDays Max days parameter (default 45)
   */
  setDefaultFormula(beta?: number, gamma?: number, maxDays?: number): Result<void, string> {
    const formulaResult = DynamicPricingFormula.create(beta, gamma, maxDays);
    if (formulaResult.isFailure()) {
      return failure(`Failed to create formula: ${formulaResult.error}`);
    }
    
    this.defaultFormula = formulaResult.value;
    return success(undefined);
  }

  /**
   * Preview discount percentage that would be applied
   * @param daysRemaining Days remaining before expiry
   * @param demandFactor Demand factor (0-1)
   * @param profitabilityFactor Profitability factor (0-1)
   * @param maxDiscount Optional maximum discount to cap at
   * @returns The calculated discount percentage or an error
   */
  previewDiscountPercentage(
    daysRemaining: number,
    demandFactor: number,
    profitabilityFactor: number,
    maxDiscount?: number
  ): Result<number, string> {
    const discountResult = this.defaultFormula.calculatePercentageDiscount(
      daysRemaining,
      demandFactor,
      profitabilityFactor
    );

    if (discountResult.isFailure()) {
      return failure(`Failed to calculate discount: ${discountResult.error}`);
    }

    let discount = discountResult.value;
    
    if (maxDiscount !== undefined && discount > maxDiscount) {
      discount = maxDiscount;
    }
    
    return success(discount);
  }
}

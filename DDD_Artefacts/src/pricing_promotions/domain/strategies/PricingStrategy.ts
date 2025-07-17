import { Money } from '@shared/domain/value-objects/Money';
import { Result, success, failure } from '@shared/core/Result';
import { PricingTier } from '../value-objects/PricingTier';

/**
 * Base interface for pricing context data needed by strategies
 */
export interface PricingContext {
  baseCost: Money;
  quantity: number;
  pricingTier: PricingTier;
  [key: string]: any; // Additional strategy-specific context data
}

/**
 * Abstract base class for all pricing strategies
 */
export abstract class PricingStrategy {
  protected name: string;
  protected description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  /**
   * Calculate the selling price based on the pricing context
   * @param context The pricing context containing necessary information
   * @returns The calculated selling price or an error
   */
  abstract calculatePrice(context: PricingContext): Result<Money, string>;

  /**
   * Calculate the gross margin percentage based on the selling price and base cost
   * @param sellingPrice The calculated selling price
   * @param baseCost The base cost of the item
   * @returns The gross margin percentage or an error
   */
  protected calculateMarginPercentage(sellingPrice: Money, baseCost: Money): Result<number, string> {
    const result = sellingPrice.subtract(baseCost);
    if (result.isFailure()) {
      return failure(result.error);
    }

    const grossProfit = result.value;

    if (sellingPrice.amount === 0) {
      return failure('Cannot calculate margin percentage with zero selling price');
    }

    const marginPercentage = (grossProfit.amount / sellingPrice.amount) * 100;
    return success(marginPercentage);
  }

  /**
   * Verify that calculated price meets margin floor requirements for the pricing tier
   * @param sellingPrice The calculated selling price
   * @param baseCost The base cost
   * @param pricingTier The applicable pricing tier
   * @returns True if margin is acceptable, false otherwise
   */
  protected verifyMarginFloor(sellingPrice: Money, baseCost: Money, pricingTier: PricingTier): boolean {
    const marginResult = this.calculateMarginPercentage(sellingPrice, baseCost);
    
    if (marginResult.isFailure()) {
      return false;
    }
    
    const marginPercentage = marginResult.value;
    const floorMargin = pricingTier.getFloorGrossMarginPercentage();
    
    return marginPercentage >= floorMargin;
  }
}

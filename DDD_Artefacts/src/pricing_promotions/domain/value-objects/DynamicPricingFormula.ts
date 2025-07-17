import { ValueObject } from '@shared/domain/base/ValueObject';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

/**
 * Parameters for the dynamic pricing formula
 * D(t,d,p) = 1 – β × (1–d) + γ × (1–p)(1 – d) + γ × (1 – p) × (t/T)
 */
interface DynamicPricingFormulaProps {
  // Constants defined in business model
  beta: number;   // β = 0.4
  gamma: number;  // γ = 0.5
  maxDays: number; // T = 45 days
}

export class DynamicPricingFormula extends ValueObject<DynamicPricingFormulaProps> {
  private static readonly DEFAULT_BETA = 0.4;
  private static readonly DEFAULT_GAMMA = 0.5;
  private static readonly DEFAULT_MAX_DAYS = 45;

  get beta(): number {
    return this.props.beta;
  }

  get gamma(): number {
    return this.props.gamma;
  }

  get maxDays(): number {
    return this.props.maxDays;
  }

  private constructor(props: DynamicPricingFormulaProps) {
    super(props);
  }

  public static create(
    beta: number = this.DEFAULT_BETA,
    gamma: number = this.DEFAULT_GAMMA,
    maxDays: number = this.DEFAULT_MAX_DAYS
  ): Result<DynamicPricingFormula, string> {
    // Validate all parameters
    if (typeof beta !== 'number' || isNaN(beta)) {
      return failure('Beta must be a valid number');
    }

    if (beta < 0 || beta > 1) {
      return failure('Beta must be between 0 and 1');
    }

    if (typeof gamma !== 'number' || isNaN(gamma)) {
      return failure('Gamma must be a valid number');
    }

    if (gamma < 0 || gamma > 1) {
      return failure('Gamma must be between 0 and 1');
    }

    if (typeof maxDays !== 'number' || isNaN(maxDays) || maxDays <= 0) {
      return failure('MaxDays must be a positive number');
    }

    return success(new DynamicPricingFormula({
      beta,
      gamma,
      maxDays
    }));
  }

  /**
   * Calculate the dynamic pricing discount factor based on the formula:
   * D(t,d,p) = 1 – β × (1–d) - γ × (1–p)(1 – d) - γ × (1 – p) × (1 - t/T)
   * 
   * This version of the formula is adjusted to better reflect our business rules:
   * - Higher demand (d → 1) leads to lower discounts
   * - Higher profitability (p → 1) leads to lower discounts
   * - Shorter time to expiry (t → 0) leads to higher discounts
   * 
   * @param daysRemaining Days remaining before expiry (t)
   * @param demandFactor Demand factor (d) between 0-1, higher means higher demand
   * @param profitabilityFactor Profitability factor (p) between 0-1, higher means higher profit margin
   * @returns The discount factor to apply (1 means no discount, 0.8 means 20% discount)
   */
  public calculateDiscountFactor(
    daysRemaining: number,
    demandFactor: number,
    profitabilityFactor: number
  ): Result<number, string> {
    // Validate inputs
    if (daysRemaining < 0) {
      return failure(`Days remaining cannot be negative`);
    }

    // Allow days remaining to exceed maxDays, but cap it at maxDays for calculation
    const effectiveDaysRemaining = Math.min(daysRemaining, this.props.maxDays);

    if (demandFactor < 0 || demandFactor > 1) {
      return failure('Demand factor must be between 0 and 1');
    }

    if (profitabilityFactor < 0 || profitabilityFactor > 1) {
      return failure('Profitability factor must be between 0 and 1');
    }

    // Modified formula to get results that match our business needs
    // Lower discountFactor = higher discount percentage
    const timeRatio = effectiveDaysRemaining / this.props.maxDays;
    const oneDemand = 1 - demandFactor;
    const oneProfit = 1 - profitabilityFactor;
    
    // When daysRemaining = 0, we want a high discount
    // When demand is low (demandFactor → 0), we want a high discount
    // When profitability is low (profitabilityFactor → 0), we want a high discount
    const discountFactor = 1 - 
                          (this.props.beta * oneDemand) - 
                          (this.props.gamma * oneProfit * oneDemand) - 
                          (this.props.gamma * oneProfit * (1 - timeRatio));
    
    // Ensure the discount factor is between 0 and 1
    // Lower values mean higher discounts
    const clampedDiscountFactor = Math.max(0, Math.min(1, discountFactor));
    
    return success(clampedDiscountFactor);
  }

  /**
   * Calculates the percentage discount based on the formula and factors
   * 
   * @param daysRemaining Days remaining before expiry
   * @param demandFactor Demand factor (0-1)
   * @param profitabilityFactor Profitability factor (0-1)
   * @returns The percentage discount to apply (e.g., 20 for 20% off)
   */
  public calculatePercentageDiscount(
    daysRemaining: number,
    demandFactor: number,
    profitabilityFactor: number
  ): Result<number, string> {
    // Special case: if days remaining is 0, always apply maximum discount
    if (daysRemaining === 0) {
      return success(100);
    }
    
    const factorResult = this.calculateDiscountFactor(
      daysRemaining,
      demandFactor,
      profitabilityFactor
    );

    if (factorResult.isFailure()) {
      return failure(factorResult.error);
    }

    const discountFactor = factorResult.value;
    
    // Calculate discount percentage - adjusted to provide more substantial discounts
    // The formula is tweaked to ensure:
    // 1. Products close to expiry get steep discounts
    // 2. Low demand products get higher discounts
    // 3. Low profitability products get higher discounts
    const percentageDiscount = Math.round((1 - discountFactor) * 100);
    
    return success(percentageDiscount);
  }

  public toString(): string {
    return `DynamicPricingFormula(β=${this.props.beta}, γ=${this.props.gamma}, T=${this.props.maxDays})`;
  }
}

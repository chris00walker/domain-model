import { ValueObject } from '@shared/domain/base/ValueObject';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { PricingTier } from './PricingTier';

interface DiscountPercentageProps {
  value: number;
}

export class DiscountPercentage extends ValueObject<DiscountPercentageProps> {
  // Constants for validation
  private static readonly MIN_DISCOUNT_PERCENTAGE = 0;
  private static readonly ABSOLUTE_MAX_DISCOUNT_PERCENTAGE = 100; // Theoretical max

  get value(): number {
    return this.props.value;
  }

  private constructor(props: DiscountPercentageProps) {
    super(props);
  }

  public static create(value: number): Result<DiscountPercentage, string> {
    const guardResult = Guard.againstNullOrUndefined(value, 'discountPercentage');
    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (typeof value !== 'number' || isNaN(value)) {
      return failure('Discount percentage must be a valid number');
    }

    if (value < this.MIN_DISCOUNT_PERCENTAGE) {
      return failure(`Discount percentage cannot be negative (got ${value})`);
    }

    if (value > this.ABSOLUTE_MAX_DISCOUNT_PERCENTAGE) {
      return failure(`Discount percentage cannot exceed 100% (got ${value}%)`);
    }

    return success(new DiscountPercentage({ value }));
  }

  /**
   * Creates a discount percentage with validation against a specific pricing tier's maximum allowed discount
   * @param value The discount percentage value
   * @param pricingTier The pricing tier to validate against
   */
  public static createWithTierValidation(
    value: number,
    pricingTier: PricingTier
  ): Result<DiscountPercentage, string> {
    const baseResult = DiscountPercentage.create(value);
    if (baseResult.isFailure()) {
      return baseResult;
    }

    const maxAllowed = pricingTier.getMaxDiscountPercentage();
    if (value > maxAllowed) {
      return failure(
        `Discount percentage ${value}% exceeds maximum allowed ${maxAllowed}% for tier ${pricingTier.toString()}`
      );
    }

    return success(baseResult.value);
  }

  public getDiscountMultiplier(): number {
    // Convert percentage to multiplier (e.g., 20% discount becomes 0.8x multiplier)
    return 1 - (this.props.value / 100);
  }

  public applyToAmount(amount: number): number {
    // Apply discount to an amount
    return amount * this.getDiscountMultiplier();
  }

  public add(otherDiscount: DiscountPercentage): Result<DiscountPercentage, string> {
    // This combines discounts (e.g., 10% + 20% = 30% discount)
    // Note: This is not compounding discounts (which would be less than additive)
    const newValue = this.props.value + otherDiscount.value;
    return DiscountPercentage.create(newValue);
  }

  public isGreaterThan(otherDiscount: DiscountPercentage): boolean {
    return this.props.value > otherDiscount.value;
  }

  public exceedsMaxForTier(pricingTier: PricingTier): boolean {
    return this.props.value > pricingTier.getMaxDiscountPercentage();
  }

  public toString(): string {
    return `${this.props.value.toFixed(2)}%`;
  }

  public equals(vo?: ValueObject<any>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (!(vo instanceof DiscountPercentage)) {
      return false;
    }
    return this.props.value === vo.props.value;
  }
}

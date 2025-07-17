import { ValueObject } from '@shared/domain/base/ValueObject';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

interface MarkupPercentageProps {
  value: number;
}

export class MarkupPercentage extends ValueObject<MarkupPercentageProps> {
  // Constants for validation
  private static readonly MIN_MARKUP_PERCENTAGE = 0;
  private static readonly MAX_MARKUP_PERCENTAGE = 500; // 500% as an upper bound for safety

  get value(): number {
    return this.props.value;
  }

  private constructor(props: MarkupPercentageProps) {
    super(props);
  }

  public static create(value: number): Result<MarkupPercentage, string> {
    const guardResult = Guard.againstNullOrUndefined(value, 'markupPercentage');
    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (typeof value !== 'number' || isNaN(value)) {
      return failure('Markup percentage must be a valid number');
    }

    if (value < this.MIN_MARKUP_PERCENTAGE) {
      return failure(`Markup percentage cannot be negative (got ${value})`);
    }

    if (value > this.MAX_MARKUP_PERCENTAGE) {
      return failure(`Markup percentage exceeds maximum allowed value of ${this.MAX_MARKUP_PERCENTAGE}% (got ${value}%)`);
    }

    return success(new MarkupPercentage({ value }));
  }

  public getMarkupMultiplier(): number {
    // Convert percentage to multiplier (e.g., 150% markup becomes 2.5x multiplier)
    return 1 + (this.props.value / 100);
  }

  public applyToAmount(amount: number): number {
    // Apply markup to an amount
    return amount * this.getMarkupMultiplier();
  }

  public add(otherMarkup: MarkupPercentage): Result<MarkupPercentage, string> {
    const newValue = this.props.value + otherMarkup.value;
    return MarkupPercentage.create(newValue);
  }

  public subtract(otherMarkup: MarkupPercentage): Result<MarkupPercentage, string> {
    const newValue = this.props.value - otherMarkup.value;
    return MarkupPercentage.create(newValue);
  }

  public toString(): string {
    return `${this.props.value.toFixed(2)}%`;
  }

  public equals(vo?: ValueObject<any>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (!(vo instanceof MarkupPercentage)) {
      return false;
    }
    return this.props.value === vo.props.value;
  }
}

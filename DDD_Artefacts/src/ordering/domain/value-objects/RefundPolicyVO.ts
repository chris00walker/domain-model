import { ValueObject } from '../../../shared/domain/base/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';

export interface RefundPolicyProps {
  refundableWindowDays: number;
  restockingFeePercentage: number;
  requiresOriginalPackaging: boolean;
  requiresReceipt: boolean;
  exchangeOnly: boolean;
  notes: string;
}

/**
 * RefundPolicyVO represents the refund policy for products or orders
 * It encapsulates the rules and conditions for processing refunds
 */
export class RefundPolicyVO extends ValueObject<RefundPolicyProps> {
  readonly props: RefundPolicyProps;
  private constructor(props: RefundPolicyProps) {
    super(props);
  }

  public static create(props: RefundPolicyProps): Result<RefundPolicyVO, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.refundableWindowDays, argumentName: 'refundableWindowDays' },
      { argument: props.restockingFeePercentage, argumentName: 'restockingFeePercentage' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.refundableWindowDays < 0) {
      return failure('Refundable window days must be non-negative');
    }

    if (props.restockingFeePercentage < 0 || props.restockingFeePercentage > 100) {
      return failure('Restocking fee percentage must be between 0 and 100');
    }

    return success(new RefundPolicyVO({
      refundableWindowDays: props.refundableWindowDays,
      restockingFeePercentage: props.restockingFeePercentage,
      requiresOriginalPackaging: props.requiresOriginalPackaging ?? true,
      requiresReceipt: props.requiresReceipt ?? true,
      exchangeOnly: props.exchangeOnly ?? false,
      notes: props.notes ?? ''
    }));
  }

  /**
   * Check if a refund is allowed based on the days since purchase
   * @param daysSincePurchase Number of days since the purchase was made
   * @returns True if refund is allowed, false otherwise
   */
  public isRefundAllowed(daysSincePurchase: number): boolean {
    return daysSincePurchase <= this.props.refundableWindowDays;
  }

  /**
   * Calculate the refund amount based on the original price
   * @param originalPrice The original price paid
   * @returns The refund amount after applying restocking fee
   */
  public calculateRefundAmount(originalPrice: number): number {
    const restockingFee = originalPrice * (this.props.restockingFeePercentage / 100);
    return Math.max(0, originalPrice - restockingFee);
  }

  /**
   * Check if the refund policy allows exchanges only (no cash refunds)
   * @returns True if only exchanges are allowed, false if cash refunds are allowed
   */
  public isExchangeOnly(): boolean {
    return this.props.exchangeOnly;
  }

  /**
   * Get the refundable window in days
   */
  get refundableWindowDays(): number {
    return this.props.refundableWindowDays;
  }

  /**
   * Get the restocking fee percentage
   */
  get restockingFeePercentage(): number {
    return this.props.restockingFeePercentage;
  }

  /**
   * Check if original packaging is required for refunds
   */
  get requiresOriginalPackaging(): boolean {
    return this.props.requiresOriginalPackaging;
  }

  /**
   * Check if receipt is required for refunds
   */
  get requiresReceipt(): boolean {
    return this.props.requiresReceipt;
  }

  /**
   * Get additional notes about the refund policy
   */
  get notes(): string {
    return this.props.notes;
  }
}

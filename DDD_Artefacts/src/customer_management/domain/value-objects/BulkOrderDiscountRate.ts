import { ValueObject } from '../../../shared/domain/base/ValueObject';
import { Guard } from '../../../shared/core/Guard';
import { Result, success, failure } from '../../../shared/core/Result';

export interface BulkOrderDiscountRateProps {
  minimumQuantity: number;
  discountPercentage: number;
  customerSegmentId?: string;
  minimumOrderValue?: number;
  maxDiscountAmount?: number;
  startDate?: Date;
  endDate?: Date;
  isStackable?: boolean;
}

/**
 * BulkOrderDiscountRate value object represents the discount rate applicable 
 * to bulk orders for specific customer segments
 */
export class BulkOrderDiscountRate extends ValueObject<BulkOrderDiscountRateProps> {
  
  get minimumQuantity(): number {
    return this.props.minimumQuantity;
  }

  get discountPercentage(): number {
    return this.props.discountPercentage;
  }

  get customerSegmentId(): string | undefined {
    return this.props.customerSegmentId;
  }

  get minimumOrderValue(): number | undefined {
    return this.props.minimumOrderValue;
  }

  get maxDiscountAmount(): number | undefined {
    return this.props.maxDiscountAmount;
  }

  get startDate(): Date | undefined {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  get isStackable(): boolean {
    return this.props.isStackable ?? false;
  }

  get isActive(): boolean {
    const now = new Date();
    
    // If no dates are specified, it's always active
    if (!this.startDate && !this.endDate) {
      return true;
    }

    // Check start date if specified
    if (this.startDate && this.startDate > now) {
      return false;
    }

    // Check end date if specified
    if (this.endDate && this.endDate < now) {
      return false;
    }

    return true;
  }

  private constructor(props: BulkOrderDiscountRateProps) {
    super(props);
  }

  public static create(props: BulkOrderDiscountRateProps): Result<BulkOrderDiscountRate> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.minimumQuantity, argumentName: 'minimumQuantity' },
      { argument: props.discountPercentage, argumentName: 'discountPercentage' }
    ]);

    if (!guardResult.succeeded) {
      return failure<BulkOrderDiscountRate>(new Error(guardResult.message || 'Validation failed'));
    }

    if (props.minimumQuantity <= 0) {
      return failure<BulkOrderDiscountRate>(new Error('Minimum quantity must be greater than zero'));
    }

    if (props.discountPercentage < 0) {
      return failure<BulkOrderDiscountRate>(new Error('Discount percentage cannot be negative'));
    }

    if (props.discountPercentage > 100) {
      return failure<BulkOrderDiscountRate>(new Error('Discount percentage cannot be greater than 100'));
    }

    if (props.minimumOrderValue !== undefined && props.minimumOrderValue < 0) {
      return failure<BulkOrderDiscountRate>(new Error('Minimum order value cannot be negative'));
    }

    if (props.maxDiscountAmount !== undefined && props.maxDiscountAmount < 0) {
      return failure<BulkOrderDiscountRate>(new Error('Maximum discount amount cannot be negative'));
    }

    if (props.startDate && props.endDate && props.startDate > props.endDate) {
      return failure<BulkOrderDiscountRate>(new Error('Start date cannot be after end date'));
    }

    if (props.customerSegmentId !== undefined && props.customerSegmentId.trim() === '') {
      return failure<BulkOrderDiscountRate>(new Error('Customer segment ID cannot be empty'));
    }

    return success<BulkOrderDiscountRate>(new BulkOrderDiscountRate(props));
  }

  /**
   * Calculates the discount amount for a given order quantity and unit price
   */
  public calculateDiscount(quantity: number, unitPrice: number): number {
    if (quantity < this.minimumQuantity) {
      return 0;
    }

    if (this.minimumOrderValue && quantity * unitPrice < this.minimumOrderValue) {
      return 0;
    }

    const rawDiscountAmount = quantity * unitPrice * (this.discountPercentage / 100);
    
    if (this.maxDiscountAmount && rawDiscountAmount > this.maxDiscountAmount) {
      return this.maxDiscountAmount;
    }

    return rawDiscountAmount;
  }

  /**
   * Creates a new instance with an updated discount percentage
   */
  public updateDiscountPercentage(percentage: number): Result<BulkOrderDiscountRate> {
    return BulkOrderDiscountRate.create({
      ...this.props,
      discountPercentage: percentage
    });
  }

  /**
   * Creates a new instance with an updated minimum quantity
   */
  public updateMinimumQuantity(quantity: number): Result<BulkOrderDiscountRate> {
    return BulkOrderDiscountRate.create({
      ...this.props,
      minimumQuantity: quantity
    });
  }

  /**
   * Creates a new instance with updated validity period
   */
  public updateValidityPeriod(startDate?: Date, endDate?: Date): Result<BulkOrderDiscountRate> {
    return BulkOrderDiscountRate.create({
      ...this.props,
      startDate,
      endDate
    });
  }

  /**
   * Creates a new instance with an updated maximum discount amount
   */
  public updateMaxDiscountAmount(amount?: number): Result<BulkOrderDiscountRate> {
    return BulkOrderDiscountRate.create({
      ...this.props,
      maxDiscountAmount: amount
    });
  }
}

import { ValueObject } from '../../../shared/domain/base/ValueObject';
import { Guard } from '../../../shared/domain/base/Guard';
import { Result } from '../../../shared/domain/base/Result';
import { CustomerSegmentType } from './CustomerSegmentType';

/**
 * Represents the benefits associated with a subscription tier
 */
export interface TierBenefits {
  discountPercentage: number;
  freeShipping: boolean;
  prioritySupport: boolean;
  exclusiveAccess: boolean;
  earlyAccess: boolean;
  maxMonthlyBoxes?: number;
  extraProductsPerBox?: number;
  customizationOptions?: string[];
  loyaltyPointsMultiplier?: number;
}

export interface SubscriptionTierProps {
  name: string;
  level: number;
  monthlyPrice: number;
  compatibleSegments: CustomerSegmentType[];
  benefits: TierBenefits;
  description?: string;
  minSubscriptionMonths?: number;
  autoRenewal?: boolean;
  tierCode?: string;
}

/**
 * SubscriptionTier value object represents the different subscription levels 
 * available to customers, with associated pricing and benefits
 */
export class SubscriptionTier extends ValueObject<SubscriptionTierProps> {
  
  get name(): string {
    return this.props.name;
  }

  get level(): number {
    return this.props.level;
  }

  get monthlyPrice(): number {
    return this.props.monthlyPrice;
  }

  get compatibleSegments(): CustomerSegmentType[] {
    return [...this.props.compatibleSegments];
  }

  get benefits(): TierBenefits {
    return { ...this.props.benefits };
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get minSubscriptionMonths(): number {
    return this.props.minSubscriptionMonths ?? 1;
  }

  get autoRenewal(): boolean {
    return this.props.autoRenewal ?? true;
  }

  get tierCode(): string {
    return this.props.tierCode ?? this.props.name.toUpperCase().replace(/\s+/g, '_');
  }

  /**
   * Calculates the annual price based on monthly price
   */
  get annualPrice(): number {
    return this.monthlyPrice * 12;
  }

  /**
   * Calculates the subscription minimum commitment value
   */
  get minimumCommitmentValue(): number {
    return this.monthlyPrice * this.minSubscriptionMonths;
  }

  private constructor(props: SubscriptionTierProps) {
    super(props);
  }

  /**
   * Creates a new SubscriptionTier instance
   */
  public static create(props: SubscriptionTierProps): Result<SubscriptionTier> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.level, argumentName: 'level' },
      { argument: props.monthlyPrice, argumentName: 'monthlyPrice' },
      { argument: props.compatibleSegments, argumentName: 'compatibleSegments' },
      { argument: props.benefits, argumentName: 'benefits' }
    ]);

    if (!guardResult.succeeded) {
      return Result.fail<SubscriptionTier>(guardResult.message);
    }

    if (props.name.trim().length === 0) {
      return Result.fail<SubscriptionTier>('Subscription tier name cannot be empty');
    }

    if (props.level < 0) {
      return Result.fail<SubscriptionTier>('Subscription tier level cannot be negative');
    }

    if (props.monthlyPrice < 0) {
      return Result.fail<SubscriptionTier>('Monthly price cannot be negative');
    }

    if (props.compatibleSegments.length === 0) {
      return Result.fail<SubscriptionTier>('At least one compatible customer segment must be specified');
    }

    // Validate tier benefits
    const benefitsGuardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.benefits.discountPercentage, argumentName: 'benefits.discountPercentage' },
      { argument: props.benefits.freeShipping, argumentName: 'benefits.freeShipping' },
      { argument: props.benefits.prioritySupport, argumentName: 'benefits.prioritySupport' },
      { argument: props.benefits.exclusiveAccess, argumentName: 'benefits.exclusiveAccess' },
      { argument: props.benefits.earlyAccess, argumentName: 'benefits.earlyAccess' }
    ]);

    if (!benefitsGuardResult.succeeded) {
      return Result.fail<SubscriptionTier>(benefitsGuardResult.message);
    }

    if (props.benefits.discountPercentage < 0 || props.benefits.discountPercentage > 100) {
      return Result.fail<SubscriptionTier>('Discount percentage must be between 0 and 100');
    }

    if (props.minSubscriptionMonths !== undefined && props.minSubscriptionMonths <= 0) {
      return Result.fail<SubscriptionTier>('Minimum subscription months must be greater than zero');
    }

    if (props.benefits.loyaltyPointsMultiplier !== undefined && props.benefits.loyaltyPointsMultiplier < 1) {
      return Result.fail<SubscriptionTier>('Loyalty points multiplier must be at least 1');
    }

    if (props.benefits.maxMonthlyBoxes !== undefined && props.benefits.maxMonthlyBoxes <= 0) {
      return Result.fail<SubscriptionTier>('Maximum monthly boxes must be greater than zero');
    }
    
    if (props.benefits.extraProductsPerBox !== undefined && props.benefits.extraProductsPerBox < 0) {
      return Result.fail<SubscriptionTier>('Extra products per box cannot be negative');
    }

    return Result.ok<SubscriptionTier>(new SubscriptionTier(props));
  }

  /**
   * Checks if a specific customer segment is compatible with this subscription tier
   */
  public isCompatibleWithSegment(segmentType: CustomerSegmentType): boolean {
    return this.compatibleSegments.includes(segmentType);
  }

  /**
   * Creates a new instance with an updated price
   */
  public updateMonthlyPrice(price: number): Result<SubscriptionTier> {
    return SubscriptionTier.create({
      ...this.props,
      monthlyPrice: price
    });
  }

  /**
   * Creates a new instance with updated benefits
   */
  public updateBenefits(benefits: Partial<TierBenefits>): Result<SubscriptionTier> {
    return SubscriptionTier.create({
      ...this.props,
      benefits: {
        ...this.props.benefits,
        ...benefits
      }
    });
  }

  /**
   * Creates a new instance with updated compatible segments
   */
  public updateCompatibleSegments(segments: CustomerSegmentType[]): Result<SubscriptionTier> {
    return SubscriptionTier.create({
      ...this.props,
      compatibleSegments: segments
    });
  }

  /**
   * Creates a new instance with updated minimum subscription months
   */
  public updateMinimumSubscriptionMonths(months: number): Result<SubscriptionTier> {
    return SubscriptionTier.create({
      ...this.props,
      minSubscriptionMonths: months
    });
  }

  /**
   * Compares this tier with another tier and returns true if this tier is better
   */
  public isBetterThan(other: SubscriptionTier): boolean {
    return this.level > other.level;
  }
}

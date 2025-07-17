import { ValueObject } from '@shared/domain/base/ValueObject';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

/**
 * Enum representing the subscription tier types as defined in the business model
 */
export enum SubscriptionTierType {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  VIP = 'VIP'
}

interface SubscriptionTierProps {
  type: SubscriptionTierType;
}

/**
 * Value object representing a subscription tier
 */
export class SubscriptionTier extends ValueObject<SubscriptionTierProps> {
  get type(): SubscriptionTierType {
    return this.props.type;
  }

  private constructor(props: SubscriptionTierProps) {
    super(props);
  }

  public static create(type: SubscriptionTierType): Result<SubscriptionTier, string> {
    const guardResult = Guard.againstNullOrUndefined(type, 'subscriptionTierType');
    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    // Verify the type is a valid SubscriptionTierType
    if (!Object.values(SubscriptionTierType).includes(type)) {
      return failure(`Invalid subscription tier type: ${type}`);
    }

    return success(new SubscriptionTier({ type }));
  }

  /**
   * Get the monthly fee for this subscription tier in BBD
   */
  public getMonthlyFee(): number {
    switch (this.props.type) {
      case SubscriptionTierType.BASIC:
        return 60;
      case SubscriptionTierType.PREMIUM:
        return 90;
      case SubscriptionTierType.VIP:
        return 180;
      default:
        throw new Error(`Unknown subscription tier type: ${this.props.type}`);
    }
  }

  /**
   * Get the basket credit amount for this subscription tier in BBD
   */
  public getBasketCredit(): number {
    switch (this.props.type) {
      case SubscriptionTierType.BASIC:
        return 60;
      case SubscriptionTierType.PREMIUM:
        return 95;
      case SubscriptionTierType.VIP:
        return 200;
      default:
        throw new Error(`Unknown subscription tier type: ${this.props.type}`);
    }
  }

  /**
   * Get the store-wide discount percentage for this subscription tier
   */
  public getStoreWideDiscountPercentage(): number {
    switch (this.props.type) {
      case SubscriptionTierType.BASIC:
        return 5;
      case SubscriptionTierType.PREMIUM:
        return 8;
      case SubscriptionTierType.VIP:
        return 10;
      default:
        throw new Error(`Unknown subscription tier type: ${this.props.type}`);
    }
  }

  /**
   * Get the target gross margin percentage for this subscription tier
   */
  public getTargetGrossMarginPercentage(): number {
    switch (this.props.type) {
      case SubscriptionTierType.BASIC:
        return 40;
      case SubscriptionTierType.PREMIUM:
        return 42;
      case SubscriptionTierType.VIP:
        return 45;
      default:
        throw new Error(`Unknown subscription tier type: ${this.props.type}`);
    }
  }

  /**
   * Get the additional benefits for this subscription tier
   */
  public getAdditionalBenefits(): string[] {
    switch (this.props.type) {
      case SubscriptionTierType.BASIC:
        return ['Recipe pack'];
      case SubscriptionTierType.PREMIUM:
        return ['Recipe pack', 'Discovery bundle'];
      case SubscriptionTierType.VIP:
        return ['Recipe pack', 'Discovery bundle', 'Free delivery', 'Early access'];
      default:
        throw new Error(`Unknown subscription tier type: ${this.props.type}`);
    }
  }

  public isBasic(): boolean {
    return this.props.type === SubscriptionTierType.BASIC;
  }

  public isPremium(): boolean {
    return this.props.type === SubscriptionTierType.PREMIUM;
  }

  public isVIP(): boolean {
    return this.props.type === SubscriptionTierType.VIP;
  }

  public toString(): string {
    return this.props.type;
  }
}

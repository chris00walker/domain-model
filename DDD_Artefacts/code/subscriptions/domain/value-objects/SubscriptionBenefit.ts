import { ValueObject } from '@shared/domain/base/ValueObject';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

/**
 * Enum representing types of subscription benefits
 */
export enum BenefitType {
  DISCOUNT = 'DISCOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  EARLY_ACCESS = 'EARLY_ACCESS',
  INCLUDED_PRODUCT = 'INCLUDED_PRODUCT',
  STORE_CREDIT = 'STORE_CREDIT',
  SPECIAL_SERVICE = 'SPECIAL_SERVICE'
}

interface SubscriptionBenefitProps {
  name: string;
  description: string;
  type: BenefitType;
  value?: number; // Optional numeric value (e.g., discount percentage, credit amount)
  productId?: string; // Optional reference to a product (for included products)
}

/**
 * Value object representing a benefit included in a subscription tier
 */
export class SubscriptionBenefit extends ValueObject<SubscriptionBenefitProps> {
  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get type(): BenefitType {
    return this.props.type;
  }

  get value(): number | undefined {
    return this.props.value;
  }

  get productId(): string | undefined {
    return this.props.productId;
  }

  private constructor(props: SubscriptionBenefitProps) {
    super(props);
  }

  public static create(props: SubscriptionBenefitProps): Result<SubscriptionBenefit, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.description, argumentName: 'description' },
      { argument: props.type, argumentName: 'type' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    // Additional validation based on benefit type
    if (props.type === BenefitType.DISCOUNT && (props.value === undefined || props.value <= 0 || props.value > 100)) {
      return failure('Discount benefit must have a percentage value between 0 and 100');
    }

    if (props.type === BenefitType.STORE_CREDIT && (props.value === undefined || props.value <= 0)) {
      return failure('Store credit benefit must have a positive value');
    }

    if (props.type === BenefitType.INCLUDED_PRODUCT && !props.productId) {
      return failure('Included product benefit must reference a product ID');
    }

    return success(new SubscriptionBenefit(props));
  }

  /**
   * Create a store-wide discount benefit
   */
  public static createStoreWideDiscount(percentage: number): Result<SubscriptionBenefit, string> {
    return SubscriptionBenefit.create({
      name: 'Store-wide Discount',
      description: `${percentage}% discount on all store products`,
      type: BenefitType.DISCOUNT,
      value: percentage
    });
  }

  /**
   * Create a free shipping benefit
   */
  public static createFreeShipping(): Result<SubscriptionBenefit, string> {
    return SubscriptionBenefit.create({
      name: 'Free Shipping',
      description: 'Free shipping on all orders',
      type: BenefitType.FREE_SHIPPING
    });
  }

  /**
   * Create an early access benefit
   */
  public static createEarlyAccess(): Result<SubscriptionBenefit, string> {
    return SubscriptionBenefit.create({
      name: 'Early Access',
      description: 'Early access to new products and limited releases',
      type: BenefitType.EARLY_ACCESS
    });
  }

  /**
   * Create an included product benefit
   */
  public static createIncludedProduct(
    productId: string,
    productName: string
  ): Result<SubscriptionBenefit, string> {
    return SubscriptionBenefit.create({
      name: `Included ${productName}`,
      description: `${productName} included with your subscription`,
      type: BenefitType.INCLUDED_PRODUCT,
      productId
    });
  }

  /**
   * Create a store credit benefit
   */
  public static createStoreCredit(amount: number): Result<SubscriptionBenefit, string> {
    return SubscriptionBenefit.create({
      name: 'Store Credit',
      description: `BBD ${amount} store credit each month`,
      type: BenefitType.STORE_CREDIT,
      value: amount
    });
  }

  /**
   * Check if this is a discount benefit
   */
  public isDiscount(): boolean {
    return this.props.type === BenefitType.DISCOUNT;
  }

  /**
   * Check if this is a free shipping benefit
   */
  public isFreeShipping(): boolean {
    return this.props.type === BenefitType.FREE_SHIPPING;
  }

  /**
   * Check if this is an early access benefit
   */
  public isEarlyAccess(): boolean {
    return this.props.type === BenefitType.EARLY_ACCESS;
  }

  /**
   * Check if this is an included product benefit
   */
  public isIncludedProduct(): boolean {
    return this.props.type === BenefitType.INCLUDED_PRODUCT;
  }

  /**
   * Check if this is a store credit benefit
   */
  public isStoreCredit(): boolean {
    return this.props.type === BenefitType.STORE_CREDIT;
  }

  /**
   * Get a user-friendly description of this benefit
   */
  public toString(): string {
    switch (this.props.type) {
      case BenefitType.DISCOUNT:
        return `${this.props.value}% store-wide discount`;
      case BenefitType.FREE_SHIPPING:
        return 'Free shipping on all orders';
      case BenefitType.EARLY_ACCESS:
        return 'Early access to new products';
      case BenefitType.INCLUDED_PRODUCT:
        return `Included product: ${this.props.name}`;
      case BenefitType.STORE_CREDIT:
        return `BBD ${this.props.value} monthly store credit`;
      case BenefitType.SPECIAL_SERVICE:
        return this.props.description;
      default:
        return this.props.name;
    }
  }
  
  /**
   * Compare this benefit with another value object
   * @param vo The value object to compare with
   * @returns True if the objects are equal, false otherwise
   */
  public equals(vo?: ValueObject<any>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    
    if (!(vo instanceof SubscriptionBenefit)) {
      return false;
    }
    
    // Check equality based on type and value/productId
    if (this.props.type !== vo.props.type) {
      return false;
    }
    
    // For benefits with value, check the value
    if (this.props.value !== undefined && vo.props.value !== undefined) {
      return this.props.value === vo.props.value;
    }
    
    // For included product benefits, check the product ID
    if (this.props.productId !== undefined && vo.props.productId !== undefined) {
      return this.props.productId === vo.props.productId;
    }
    
    // For other benefits, compare by name
    return this.props.name === vo.props.name;
  }
}

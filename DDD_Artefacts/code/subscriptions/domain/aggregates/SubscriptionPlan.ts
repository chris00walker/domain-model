import { AggregateRoot } from '../../../shared/domain/base/AggregateRoot';
import { UniqueEntityID } from '../../../shared/domain/base/UniqueEntityID';
import { Result, success, failure } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';
import { Money } from '../../../shared/domain/value-objects/Money';
import { SubscriptionFrequency, FrequencyType } from '../value-objects/SubscriptionFrequency';
import { SubscriptionTier, SubscriptionTierType } from '../value-objects/SubscriptionTier';
import { SubscriptionBenefit, BenefitType } from '../value-objects/SubscriptionBenefit';
import { Clock, SystemClock } from '../../../shared/domain/Clock';

interface SubscriptionPlanProps {
  name: string;
  description: string;
  frequency: SubscriptionFrequency;
  durationMonths: number;
  price: Money;
  discountPercentage: number;
  isActive: boolean;
  productIds: string[];
  availableFrom: Date;
  availableUntil?: Date;
  maxSkipsAllowed: number;
  maxSubstitutionsAllowed: number;
  autoRenew: boolean;
  tier: SubscriptionTier; // New property for tier information
  benefits: SubscriptionBenefit[]; // New property for tier-specific benefits
  basketCredit: Money; // New property for tier-specific basket credit
  createdAt: Date;
  updatedAt: Date;
}

export class SubscriptionPlan extends AggregateRoot<SubscriptionPlanProps> {
  private constructor(props: SubscriptionPlanProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: SubscriptionPlanProps,
    id?: UniqueEntityID,
    clock: Clock = new SystemClock()
  ): Result<SubscriptionPlan, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.description, argumentName: 'description' },
      { argument: props.frequency, argumentName: 'frequency' },
      { argument: props.durationMonths, argumentName: 'durationMonths' },
      { argument: props.price, argumentName: 'price' },
      { argument: props.discountPercentage, argumentName: 'discountPercentage' },
      { argument: props.isActive, argumentName: 'isActive' },
      { argument: props.productIds, argumentName: 'productIds' },
      { argument: props.availableFrom, argumentName: 'availableFrom' },
      { argument: props.maxSkipsAllowed, argumentName: 'maxSkipsAllowed' },
      { argument: props.maxSubstitutionsAllowed, argumentName: 'maxSubstitutionsAllowed' },
      { argument: props.autoRenew, argumentName: 'autoRenew' },
      { argument: props.tier, argumentName: 'tier' },
      { argument: props.benefits, argumentName: 'benefits' },
      { argument: props.basketCredit, argumentName: 'basketCredit' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.productIds.length === 0) {
      return failure('Subscription plan must include at least one product');
    }

    if (props.durationMonths <= 0) {
      return failure('Duration must be greater than 0 months');
    }

    if (props.discountPercentage < 0 || props.discountPercentage > 100) {
      return failure('Discount percentage must be between 0 and 100');
    }

    if (props.availableUntil && props.availableFrom > props.availableUntil) {
      return failure('Available from date must be before available until date');
    }

    if (props.maxSkipsAllowed < 0) {
      return failure('Maximum skips allowed cannot be negative');
    }

    if (props.maxSubstitutionsAllowed < 0) {
      return failure('Maximum substitutions allowed cannot be negative');
    }

    // Validate that basket credit aligns with tier
    const expectedBasketCredit = props.tier.getBasketCredit();
    if (props.basketCredit.amount !== expectedBasketCredit) {
      return failure(`Basket credit amount ${props.basketCredit.amount} does not match the expected amount ${expectedBasketCredit} for tier ${props.tier.type}`);
    }

    return success(new SubscriptionPlan(props, id));
  }

  get planId(): string {
    return this._id.toString();
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get frequency(): SubscriptionFrequency {
    return this.props.frequency;
  }

  get durationMonths(): number {
    return this.props.durationMonths;
  }

  get price(): Money {
    return this.props.price;
  }

  get discountPercentage(): number {
    return this.props.discountPercentage;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get productIds(): string[] {
    return [...this.props.productIds];
  }

  get availableFrom(): Date {
    return this.props.availableFrom;
  }

  get availableUntil(): Date | undefined {
    return this.props.availableUntil;
  }

  get maxSkipsAllowed(): number {
    return this.props.maxSkipsAllowed;
  }

  get maxSubstitutionsAllowed(): number {
    return this.props.maxSubstitutionsAllowed;
  }

  get autoRenew(): boolean {
    return this.props.autoRenew;
  }

  get tier(): SubscriptionTier {
    return this.props.tier;
  }

  get benefits(): SubscriptionBenefit[] {
    return [...this.props.benefits];
  }

  get basketCredit(): Money {
    return this.props.basketCredit;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public getDiscountedPrice(): Money {
    if (this.props.discountPercentage === 0) {
      return this.props.price;
    }
    const discountMultiplier = 1 - (this.props.discountPercentage / 100);
    const multiplyResult = this.props.price.multiply(discountMultiplier);
    
    if (multiplyResult.isFailure()) {
      throw new Error(`Failed to calculate discounted price: ${multiplyResult.error}`);
    }
    
    return multiplyResult.value;
  }

  public isCurrentlyAvailable(): boolean {
    const now = new Date();
    const isAfterAvailableFrom = now >= this.props.availableFrom;
    const isBeforeAvailableUntil = !this.props.availableUntil || now <= this.props.availableUntil;
    
    return this.props.isActive && isAfterAvailableFrom && isBeforeAvailableUntil;
  }

  public updateAvailability(
    isActive: boolean,
    availableFrom?: Date,
    availableUntil?: Date,
    clock: Clock = new SystemClock()
  ): Result<void, string> {
    if (availableFrom && availableUntil && availableFrom > availableUntil) {
      return failure('Available from date must be before available until date');
    }

    this.props.isActive = isActive;
    
    if (availableFrom) {
      this.props.availableFrom = availableFrom;
    }
    
    this.props.availableUntil = availableUntil;
    this.props.updatedAt = clock.now();
    
    return success(undefined);
  }

  public updatePricing(
    price: Money,
    discountPercentage: number,
    clock: Clock = new SystemClock()
  ): Result<void, string> {
    if (discountPercentage < 0 || discountPercentage > 100) {
      return failure('Discount percentage must be between 0 and 100');
    }

    this.props.price = price;
    this.props.discountPercentage = discountPercentage;
    this.props.updatedAt = clock.now();
    
    return success(undefined);
  }

  /**
   * Update the subscription tier and associated benefits
   * @param tier The new subscription tier
   * @param basketCredit The basket credit amount (should match tier's expected amount)
   * @param benefits Optional array of benefits (if not provided, default benefits for tier will be used)
   */
  public updateTier(
    tier: SubscriptionTier,
    basketCredit: Money,
    benefits?: SubscriptionBenefit[],
    clock: Clock = new SystemClock()
  ): Result<void, string> {
    // Validate that basket credit matches tier's expected amount
    const expectedBasketCredit = tier.getBasketCredit();
    if (basketCredit.amount !== expectedBasketCredit) {
      return failure(`Basket credit amount ${basketCredit.amount} does not match the expected amount ${expectedBasketCredit} for tier ${tier.type}`);
    }

    // If benefits not provided, generate default ones based on tier
    if (!benefits) {
      benefits = [];
      
      // Add store-wide discount benefit
      const discountPercentage = tier.getStoreWideDiscountPercentage();
      const discountResult = SubscriptionBenefit.createStoreWideDiscount(discountPercentage);
      if (discountResult.isSuccess()) {
        benefits.push(discountResult.value);
      }
      
      // Add tier-specific benefits
      if (tier.isVIP()) {
        const freeShippingResult = SubscriptionBenefit.createFreeShipping();
        if (freeShippingResult.isSuccess()) {
          benefits.push(freeShippingResult.value);
        }
        
        const earlyAccessResult = SubscriptionBenefit.createEarlyAccess();
        if (earlyAccessResult.isSuccess()) {
          benefits.push(earlyAccessResult.value);
        }
      }
    }

    this.props.tier = tier;
    this.props.basketCredit = basketCredit;
    this.props.benefits = benefits;
    this.props.updatedAt = clock.now();
    
    return success(undefined);
  }

  /**
   * Add a benefit to this subscription plan
   * @param benefit The benefit to add
   * @param clock Clock implementation for time-dependent operations
   */
  public addBenefit(benefit: SubscriptionBenefit, clock: Clock = new SystemClock()): void {
    // Add benefit to list if not already present
    const hasBenefit = this.props.benefits.some(b => b.equals(benefit));
    if (!hasBenefit) {
      this.props.benefits.push(benefit);
      this.props.updatedAt = clock.now();
    }
  }

  /**
   * Remove a benefit from this subscription plan
   * @param benefitToRemove The benefit to remove
   * @param clock Clock implementation for time-dependent operations
   * @returns True if the benefit was removed, false if it wasn't found
   */
  public removeBenefit(benefitToRemove: SubscriptionBenefit, clock: Clock = new SystemClock()): boolean {
    const initialLength = this.props.benefits.length;
    
    // Remove benefit from list if present
    this.props.benefits = this.props.benefits.filter(
      benefit => !benefit.equals(benefitToRemove)
    );
    
    if (this.props.benefits.length !== initialLength) {
      this.props.updatedAt = clock.now();
      return true;
    }
    
    return false;
  }

  /**
   * Check if this subscription plan has a specific benefit type
   * @param benefitType The benefit type to check for
   * @returns True if the plan has a benefit of the specified type
   */
  public hasBenefitOfType(benefitType: BenefitType): boolean {
    return this.props.benefits.some(benefit => benefit.type === benefitType);
  }

  /**
   * Create a subscription plan with default values for a specific tier
   * @param tierType The subscription tier type
   * @param name The plan name
   * @param description The plan description
   * @param frequency The subscription frequency
   * @param productIds Array of product IDs included in the plan
   * @param currency The currency code (defaults to BBD)
   * @param id Optional ID for the new plan
   */
  public static createForTier(
    tierType: SubscriptionTierType,
    name: string,
    description: string,
    frequency: SubscriptionFrequency,
    productIds: string[],
    currency: string = 'BBD',
    id?: UniqueEntityID,
    clock: Clock = new SystemClock()
  ): Result<SubscriptionPlan, string> {
    // Create tier
    const tierResult = SubscriptionTier.create(tierType);
    if (tierResult.isFailure()) {
      return failure(tierResult.error);
    }
    const tier = tierResult.value;
    
    // Get tier-specific values
    const monthlyFee = tier.getMonthlyFee();
    const basketCreditAmount = tier.getBasketCredit();
    const discountPercentage = tier.getStoreWideDiscountPercentage();
    
    // Create Money objects
    const priceResult = Money.create(monthlyFee, currency);
    if (priceResult.isFailure()) {
      return failure(`Failed to create price: ${priceResult.error}`);
    }
    
    const basketCreditResult = Money.create(basketCreditAmount, currency);
    if (basketCreditResult.isFailure()) {
      return failure(`Failed to create basket credit: ${basketCreditResult.error}`);
    }
    
    // Create benefits
    const benefits: SubscriptionBenefit[] = [];
    
    // Add store-wide discount benefit
    const discountResult = SubscriptionBenefit.createStoreWideDiscount(discountPercentage);
    if (discountResult.isSuccess()) {
      benefits.push(discountResult.value);
    }
    
    // Add store credit benefit
    const creditResult = SubscriptionBenefit.createStoreCredit(basketCreditAmount);
    if (creditResult.isSuccess()) {
      benefits.push(creditResult.value);
    }
    
    // Add tier-specific benefits
    if (tierType === SubscriptionTierType.PREMIUM || tierType === SubscriptionTierType.VIP) {
      // Add discovery bundle for Premium and VIP
      const discoveryResult = SubscriptionBenefit.create({
        name: 'Discovery Bundle',
        description: 'Monthly curated selection of new and interesting products',
        type: BenefitType.SPECIAL_SERVICE
      });
      
      if (discoveryResult.isSuccess()) {
        benefits.push(discoveryResult.value);
      }
    }
    
    if (tierType === SubscriptionTierType.VIP) {
      // Add VIP-only benefits
      const freeShippingResult = SubscriptionBenefit.createFreeShipping();
      if (freeShippingResult.isSuccess()) {
        benefits.push(freeShippingResult.value);
      }
      
      const earlyAccessResult = SubscriptionBenefit.createEarlyAccess();
      if (earlyAccessResult.isSuccess()) {
        benefits.push(earlyAccessResult.value);
      }
    }
    
    const now = clock.now();
    
    // Create subscription plan
    return SubscriptionPlan.create({
      name,
      description,
      frequency,
      durationMonths: 1, // Default to monthly
      price: priceResult.value,
      discountPercentage: 0, // The discount is applied through benefits
      isActive: true,
      productIds,
      availableFrom: now,
      maxSkipsAllowed: 1,
      maxSubstitutionsAllowed: 3,
      autoRenew: true,
      tier: tierResult.value,
      benefits,
      basketCredit: basketCreditResult.value,
      createdAt: now,
      updatedAt: now
    }, id, clock);
  }
}

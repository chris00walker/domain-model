import { AggregateRoot } from '../../../shared/domain/base/AggregateRoot';
import { UniqueEntityID } from '../../../shared/domain/base/UniqueEntityID';
import { Result, success, failure } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';
import { Money } from '../../../shared/domain/value-objects/Money';
// Temporary string type until customers context is available
type CustomerType = string;

interface SubscriptionBundleProps {
  name: string;
  description: string;
  imageUrl?: string;
  productIds: string[];
  regularPrice: Money;
  discountPrice?: Money;
  targetSegments: CustomerType[];
  cuisineType: 'LEVANTINE' | 'MEDITERRANEAN' | 'MIXED';
  isHomeAndExplore: boolean; // For "Home & Explore" dual-track bundles
  isSeasonal: boolean;
  isActive: boolean;
  availableFrom: Date;
  availableUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a curated bundle of products available for subscription
 * Specifically designed to support the "Home & Explore" dual-track model for expatriates
 * and other curated subscription options for different customer segments
 */
export class SubscriptionBundle extends AggregateRoot<SubscriptionBundleProps> {
  private constructor(props: SubscriptionBundleProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: SubscriptionBundleProps, id?: UniqueEntityID): Result<SubscriptionBundle, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.description, argumentName: 'description' },
      { argument: props.productIds, argumentName: 'productIds' },
      { argument: props.regularPrice, argumentName: 'regularPrice' },
      { argument: props.targetSegments, argumentName: 'targetSegments' },
      { argument: props.cuisineType, argumentName: 'cuisineType' },
      { argument: props.isHomeAndExplore, argumentName: 'isHomeAndExplore' },
      { argument: props.isSeasonal, argumentName: 'isSeasonal' },
      { argument: props.isActive, argumentName: 'isActive' },
      { argument: props.availableFrom, argumentName: 'availableFrom' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.productIds.length === 0) {
      return failure('Bundle must contain at least one product');
    }

    if (props.targetSegments.length === 0) {
      return failure('Bundle must target at least one customer segment');
    }

    if (props.discountPrice && props.discountPrice.amount >= props.regularPrice.amount) {
      return failure('Discount price must be less than regular price');
    }

    if (props.availableUntil && props.availableFrom > props.availableUntil) {
      return failure('Available from date must be before available until date');
    }

    return success(new SubscriptionBundle(props, id));
  }

  get bundleId(): string {
    return this._id.toString();
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }

  get productIds(): string[] {
    return [...this.props.productIds];
  }

  get regularPrice(): Money {
    return this.props.regularPrice;
  }

  get discountPrice(): Money | undefined {
    return this.props.discountPrice;
  }

  get targetSegments(): CustomerType[] {
    return [...this.props.targetSegments];
  }

  get cuisineType(): 'LEVANTINE' | 'MEDITERRANEAN' | 'MIXED' {
    return this.props.cuisineType;
  }

  get isHomeAndExplore(): boolean {
    return this.props.isHomeAndExplore;
  }

  get isSeasonal(): boolean {
    return this.props.isSeasonal;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get availableFrom(): Date {
    return this.props.availableFrom;
  }

  get availableUntil(): Date | undefined {
    return this.props.availableUntil;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public isCurrentlyAvailable(): boolean {
    const now = new Date();
    const isAfterAvailableFrom = now >= this.props.availableFrom;
    const isBeforeAvailableUntil = !this.props.availableUntil || now <= this.props.availableUntil;
    
    return this.props.isActive && isAfterAvailableFrom && isBeforeAvailableUntil;
  }

  public isRecommendedForSegment(segment: CustomerType): boolean {
    return this.props.targetSegments.includes(segment);
  }

  public getCurrentPrice(): Money {
    return this.props.discountPrice || this.props.regularPrice;
  }

  public hasDiscount(): boolean {
    return !!this.props.discountPrice;
  }

  public getDiscountPercentage(): number | null {
    if (!this.props.discountPrice) {
      return null;
    }

    const regularAmount = this.props.regularPrice.amount;
    const discountAmount = this.props.discountPrice.amount;
    
    return Math.round(((regularAmount - discountAmount) / regularAmount) * 100);
  }

  public updateAvailability(isActive: boolean, availableFrom?: Date, availableUntil?: Date): Result<void, string> {
    if (availableFrom && availableUntil && availableFrom > availableUntil) {
      return failure('Available from date must be before available until date');
    }

    this.props.isActive = isActive;
    
    if (availableFrom) {
      this.props.availableFrom = availableFrom;
    }
    
    this.props.availableUntil = availableUntil;
    this.props.updatedAt = new Date();
    
    return success(undefined);
  }

  public updatePricing(regularPrice: Money, discountPrice?: Money): Result<void, string> {
    if (discountPrice && discountPrice.amount >= regularPrice.amount) {
      return failure('Discount price must be less than regular price');
    }

    this.props.regularPrice = regularPrice;
    this.props.discountPrice = discountPrice;
    this.props.updatedAt = new Date();
    
    return success(undefined);
  }
}

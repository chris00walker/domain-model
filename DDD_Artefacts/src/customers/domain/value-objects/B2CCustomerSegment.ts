import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { CustomerSegment } from './CustomerSegment';
import { CustomerSegmentType } from './CustomerSegmentType';
import { CustomerType } from './CustomerType';

interface B2CCustomerSegmentProps {
  customerSegment: CustomerSegment;
  culturalPreferences: string[];
  dietaryRestrictions?: string[];
  purchaseFrequency: number; // Average purchases per month
  averageOrderValue: number;
  loyaltyPoints: number;
  referralCount: number;
}

/**
 * B2CCustomerSegment Value Object
 * 
 * Extends the base CustomerSegment with B2C-specific properties such as
 * cultural preferences, dietary restrictions, purchase patterns, and loyalty metrics.
 * 
 * Domain-Driven Design Value Object Pattern
 * 
 * Value Objects are immutable objects that have no identity but describe domain concepts.
 * They are used to measure, quantify, or describe things in the domain model.
 * 
 * Invariants:
 * - customerSegment must be a valid CustomerSegment
 * - customerSegment must be of a B2C type
 * - culturalPreferences must not be empty
 * - purchaseFrequency must be >= 0
 * - averageOrderValue must be >= 0
 * - loyaltyPoints must be >= 0
 * - referralCount must be >= 0
 */
export class B2CCustomerSegment {
  private readonly props: B2CCustomerSegmentProps;

  private constructor(props: B2CCustomerSegmentProps) {
    this.props = props;
  }

  get customerSegment(): CustomerSegment {
    return this.props.customerSegment;
  }

  get culturalPreferences(): string[] {
    return [...this.props.culturalPreferences];
  }

  get dietaryRestrictions(): string[] | undefined {
    return this.props.dietaryRestrictions ? [...this.props.dietaryRestrictions] : undefined;
  }

  get purchaseFrequency(): number {
    return this.props.purchaseFrequency;
  }

  get averageOrderValue(): number {
    return this.props.averageOrderValue;
  }

  get loyaltyPoints(): number {
    return this.props.loyaltyPoints;
  }

  get referralCount(): number {
    return this.props.referralCount;
  }

  /**
   * Factory method to create a new B2CCustomerSegment
   * @param props The properties of the B2C customer segment
   * @returns Result containing either the new B2CCustomerSegment or an error message
   */
  public static create(props: B2CCustomerSegmentProps): Result<B2CCustomerSegment, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.customerSegment, argumentName: 'customerSegment' },
      { argument: props.culturalPreferences, argumentName: 'culturalPreferences' },
      { argument: props.purchaseFrequency, argumentName: 'purchaseFrequency' },
      { argument: props.averageOrderValue, argumentName: 'averageOrderValue' },
      { argument: props.loyaltyPoints, argumentName: 'loyaltyPoints' },
      { argument: props.referralCount, argumentName: 'referralCount' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    // Validate that the customer segment is a B2C type
    if (!B2CCustomerSegment.isB2CCustomerType(props.customerSegment.customerType)) {
      return failure(`Customer type ${props.customerSegment.customerType} is not a B2C type`);
    }

    if (props.culturalPreferences.length === 0) {
      return failure('Cultural preferences cannot be empty for B2C customers');
    }

    if (props.purchaseFrequency < 0) {
      return failure('Purchase frequency cannot be negative');
    }

    if (props.averageOrderValue < 0) {
      return failure('Average order value cannot be negative');
    }

    if (props.loyaltyPoints < 0) {
      return failure('Loyalty points cannot be negative');
    }

    if (props.referralCount < 0) {
      return failure('Referral count cannot be negative');
    }

    return success(new B2CCustomerSegment(props));
  }

  /**
   * Updates the loyalty points of the B2C customer segment
   * @param points The new loyalty points value (must be >= 0)
   * @returns Result containing either the updated B2CCustomerSegment or an error message
   */
  public updateLoyaltyPoints(points: number): Result<B2CCustomerSegment, string> {
    if (points < 0) {
      return failure('Loyalty points cannot be negative');
    }

    return B2CCustomerSegment.create({
      ...this.props,
      loyaltyPoints: points
    });
  }

  /**
   * Adds cultural preferences to the B2C customer segment
   * @param preferences The cultural preferences to add
   * @returns Result containing either the updated B2CCustomerSegment or an error message
   */
  public addCulturalPreferences(preferences: string[]): Result<B2CCustomerSegment, string> {
    if (preferences.length === 0) {
      return failure('Cultural preferences cannot be empty');
    }

    const updatedPreferences = [...new Set([...this.props.culturalPreferences, ...preferences])];

    return B2CCustomerSegment.create({
      ...this.props,
      culturalPreferences: updatedPreferences
    });
  }

  /**
   * Updates the dietary restrictions of the B2C customer segment
   * @param restrictions The new dietary restrictions
   * @returns Result containing either the updated B2CCustomerSegment or an error message
   */
  public updateDietaryRestrictions(restrictions: string[]): Result<B2CCustomerSegment, string> {
    return B2CCustomerSegment.create({
      ...this.props,
      dietaryRestrictions: restrictions.length > 0 ? restrictions : undefined
    });
  }

  /**
   * Updates the purchase metrics of the B2C customer segment
   * @param frequency The new purchase frequency
   * @param averageValue The new average order value
   * @returns Result containing either the updated B2CCustomerSegment or an error message
   */
  public updatePurchaseMetrics(frequency: number, averageValue: number): Result<B2CCustomerSegment, string> {
    if (frequency < 0) {
      return failure('Purchase frequency cannot be negative');
    }

    if (averageValue < 0) {
      return failure('Average order value cannot be negative');
    }

    return B2CCustomerSegment.create({
      ...this.props,
      purchaseFrequency: frequency,
      averageOrderValue: averageValue
    });
  }

  /**
   * Increments the referral count of the B2C customer segment
   * @returns Result containing either the updated B2CCustomerSegment or an error message
   */
  public incrementReferralCount(): Result<B2CCustomerSegment, string> {
    return B2CCustomerSegment.create({
      ...this.props,
      referralCount: this.props.referralCount + 1
    });
  }

  /**
   * Checks if a customer type is a B2C type
   * @param customerType The customer type to check
   * @returns boolean indicating if the customer type is a B2C type
   */
  private static isB2CCustomerType(customerType: CustomerType): boolean {
    const b2cTypes = [
      CustomerType.DiasporaCommunity,
      CustomerType.Tourist,
      CustomerType.Expat,
      CustomerType.IndigenousFoodie
    ];

    return b2cTypes.includes(customerType);
  }
}

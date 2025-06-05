import { ValueObject } from '@shared/domain/base/ValueObject';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { CustomerSegmentType } from './CustomerSegmentType';
import { CustomerType } from './CustomerType';

interface CustomerSegmentProps {
  segmentType: CustomerSegmentType;
  customerType: CustomerType;
  acquisitionDate: Date;
  acquisitionChannel: string;
  lifetimeValue: number;
  engagementScore: number;
  preferredCommunicationChannel?: string;
  lastSegmentChange?: Date;
}

/**
 * CustomerSegment Value Object
 * 
 * Represents the segment-specific properties of a customer, including
 * segment type, acquisition information, lifetime value, and engagement metrics.
 * 
 * Domain-Driven Design Value Object Pattern
 * 
 * Value Objects are immutable objects that have no identity but describe domain concepts.
 * They are used to measure, quantify, or describe things in the domain model.
 * 
 * Invariants:
 * - segmentType must be a valid CustomerSegmentType
 * - customerType must be a valid CustomerType
 * - acquisitionDate must be a valid date
 * - acquisitionChannel must be non-empty
 * - lifetimeValue must be >= 0
 * - engagementScore must be between 0 and 100
 * - lastSegmentChange must be a valid date when provided and >= acquisitionDate
 */
export class CustomerSegment extends ValueObject<CustomerSegmentProps> {
  private constructor(props: CustomerSegmentProps) {
    super(props);
  }

  get segmentType(): CustomerSegmentType {
    return this.props.segmentType;
  }

  get customerType(): CustomerType {
    return this.props.customerType;
  }

  get acquisitionDate(): Date {
    return this.props.acquisitionDate;
  }

  get acquisitionChannel(): string {
    return this.props.acquisitionChannel;
  }

  get lifetimeValue(): number {
    return this.props.lifetimeValue;
  }

  get engagementScore(): number {
    return this.props.engagementScore;
  }

  get preferredCommunicationChannel(): string | undefined {
    return this.props.preferredCommunicationChannel;
  }

  get lastSegmentChange(): Date | undefined {
    return this.props.lastSegmentChange;
  }

  /**
   * Factory method to create a new CustomerSegment
   * @param props The properties of the customer segment
   * @returns Result containing either the new CustomerSegment or an error message
   */
  public static create(props: CustomerSegmentProps): Result<CustomerSegment, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.segmentType, argumentName: 'segmentType' },
      { argument: props.customerType, argumentName: 'customerType' },
      { argument: props.acquisitionDate, argumentName: 'acquisitionDate' },
      { argument: props.acquisitionChannel, argumentName: 'acquisitionChannel' },
      { argument: props.lifetimeValue, argumentName: 'lifetimeValue' },
      { argument: props.engagementScore, argumentName: 'engagementScore' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.acquisitionChannel.trim().length === 0) {
      return failure('Acquisition channel cannot be empty');
    }

    if (props.lifetimeValue < 0) {
      return failure('Lifetime value cannot be negative');
    }

    if (props.engagementScore < 0 || props.engagementScore > 100) {
      return failure('Engagement score must be between 0 and 100');
    }

    // Validate that the segment type is compatible with the customer type
    if (!CustomerSegment.isValidSegmentForCustomerType(props.segmentType, props.customerType)) {
      return failure(`Segment type ${props.segmentType} is not valid for customer type ${props.customerType}`);
    }

    // Validate lastSegmentChange if provided
    if (props.lastSegmentChange) {
      if (props.lastSegmentChange < props.acquisitionDate) {
        return failure('Last segment change date cannot be before acquisition date');
      }
    }

    return success(new CustomerSegment(props));
  }

  /**
   * Updates the engagement score of the customer segment
   * @param newScore The new engagement score (0-100)
   * @returns Result containing either the updated CustomerSegment or an error message
   */
  public updateEngagementScore(newScore: number): Result<CustomerSegment, string> {
    if (newScore < 0 || newScore > 100) {
      return failure('Engagement score must be between 0 and 100');
    }

    return CustomerSegment.create({
      ...this.props,
      engagementScore: newScore
    });
  }

  /**
   * Updates the lifetime value of the customer segment
   * @param newValue The new lifetime value (must be >= 0)
   * @returns Result containing either the updated CustomerSegment or an error message
   */
  public updateLifetimeValue(newValue: number): Result<CustomerSegment, string> {
    if (newValue < 0) {
      return failure('Lifetime value cannot be negative');
    }

    return CustomerSegment.create({
      ...this.props,
      lifetimeValue: newValue
    });
  }

  /**
   * Changes the customer segment type
   * @param newSegmentType The new segment type
   * @returns Result containing either the updated CustomerSegment or an error message
   */
  public changeSegmentType(newSegmentType: CustomerSegmentType): Result<CustomerSegment, string> {
    if (!CustomerSegment.isValidSegmentForCustomerType(newSegmentType, this.props.customerType)) {
      return failure(`Segment type ${newSegmentType} is not valid for customer type ${this.props.customerType}`);
    }

    return CustomerSegment.create({
      ...this.props,
      segmentType: newSegmentType,
      lastSegmentChange: new Date()
    });
  }

  /**
   * Sets the preferred communication channel
   * @param channel The preferred communication channel
   * @returns Result containing either the updated CustomerSegment or an error message
   */
  public setPreferredCommunicationChannel(channel: string): Result<CustomerSegment, string> {
    if (channel.trim().length === 0) {
      return failure('Communication channel cannot be empty');
    }

    return CustomerSegment.create({
      ...this.props,
      preferredCommunicationChannel: channel
    });
  }

  /**
   * Validates if a segment type is valid for a given customer type
   * @param segmentType The segment type to validate
   * @param customerType The customer type to validate against
   * @returns boolean indicating if the segment is valid for the customer type
   */
  private static isValidSegmentForCustomerType(
    segmentType: CustomerSegmentType, 
    customerType: CustomerType
  ): boolean {
    // Map segment types to their corresponding customer types
    const segmentToCustomerTypeMap: Record<string, CustomerType> = {
      // Diaspora segments
      [CustomerSegmentType.DiasporaNewArrival]: CustomerType.DiasporaCommunity,
      [CustomerSegmentType.DiasporaEstablished]: CustomerType.DiasporaCommunity,
      [CustomerSegmentType.DiasporaSecondGeneration]: CustomerType.DiasporaCommunity,
      
      // Tourist segments
      [CustomerSegmentType.TouristCulinaryExplorer]: CustomerType.Tourist,
      [CustomerSegmentType.TouristCasual]: CustomerType.Tourist,
      [CustomerSegmentType.TouristHomesick]: CustomerType.Tourist,
      
      // Expat segments
      [CustomerSegmentType.ExpatNewArrival]: CustomerType.Expat,
      [CustomerSegmentType.ExpatLongTerm]: CustomerType.Expat,
      [CustomerSegmentType.ExpatReturning]: CustomerType.Expat,
      
      // Indigenous Foodie segments
      [CustomerSegmentType.FoodieEnthusiast]: CustomerType.IndigenousFoodie,
      [CustomerSegmentType.FoodieInfluencer]: CustomerType.IndigenousFoodie,
      [CustomerSegmentType.FoodieChef]: CustomerType.IndigenousFoodie,
      
      // Food Truck segments
      [CustomerSegmentType.FoodTruckStartup]: CustomerType.FoodTruck,
      [CustomerSegmentType.FoodTruckEstablished]: CustomerType.FoodTruck,
      [CustomerSegmentType.FoodTruckChain]: CustomerType.FoodTruck,
      
      // Private Chef segments
      [CustomerSegmentType.PrivateChefIndependent]: CustomerType.PrivateChef,
      [CustomerSegmentType.PrivateChefCatering]: CustomerType.PrivateChef,
      [CustomerSegmentType.PrivateChefCelebrity]: CustomerType.PrivateChef,
      
      // Specialty Market segments
      [CustomerSegmentType.SpecialtyMarketSmall]: CustomerType.SpecialtyMarket,
      [CustomerSegmentType.SpecialtyMarketMedium]: CustomerType.SpecialtyMarket,
      [CustomerSegmentType.SpecialtyMarketLarge]: CustomerType.SpecialtyMarket,
      
      // Limited Service Restaurant segments
      [CustomerSegmentType.LimitedServiceNew]: CustomerType.LimitedServiceRestaurant,
      [CustomerSegmentType.LimitedServiceEstablished]: CustomerType.LimitedServiceRestaurant,
      [CustomerSegmentType.LimitedServiceChain]: CustomerType.LimitedServiceRestaurant,
      
      // Full Service Restaurant segments
      [CustomerSegmentType.FullServiceIndependent]: CustomerType.FullServiceRestaurant,
      [CustomerSegmentType.FullServiceChain]: CustomerType.FullServiceRestaurant,
      [CustomerSegmentType.FullServiceFine]: CustomerType.FullServiceRestaurant,
      
      // Hotel Restaurant segments
      [CustomerSegmentType.HotelRestaurantBoutique]: CustomerType.HotelRestaurant,
      [CustomerSegmentType.HotelRestaurantMidscale]: CustomerType.HotelRestaurant,
      [CustomerSegmentType.HotelRestaurantLuxury]: CustomerType.HotelRestaurant,
      
      // Importer segments
      [CustomerSegmentType.ImporterSmall]: CustomerType.Importer,
      [CustomerSegmentType.ImporterMedium]: CustomerType.Importer,
      [CustomerSegmentType.ImporterLarge]: CustomerType.Importer,
      
      // Regional Supermarket segments
      [CustomerSegmentType.RegionalSupermarketLocal]: CustomerType.RegionalSupermarket,
      [CustomerSegmentType.RegionalSupermarketRegional]: CustomerType.RegionalSupermarket,
      [CustomerSegmentType.RegionalSupermarketNational]: CustomerType.RegionalSupermarket,
      
      // Cruise Line segments
      [CustomerSegmentType.CruiseLineSmall]: CustomerType.CruiseLineProvisioner,
      [CustomerSegmentType.CruiseLineMedium]: CustomerType.CruiseLineProvisioner,
      [CustomerSegmentType.CruiseLineLarge]: CustomerType.CruiseLineProvisioner,
      
      // Retailer segments
      [CustomerSegmentType.RetailerLocal]: CustomerType.InternationalRetailer,
      [CustomerSegmentType.RetailerRegional]: CustomerType.InternationalRetailer,
      [CustomerSegmentType.RetailerGlobal]: CustomerType.InternationalRetailer
    };
    
    return segmentToCustomerTypeMap[segmentType] === customerType;
  }
}

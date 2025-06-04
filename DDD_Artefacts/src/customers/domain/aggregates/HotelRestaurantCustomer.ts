import { UniqueEntityID } from "@shared/domain/base/UniqueEntityID";
import { Result, success, failure } from "@shared/core/Result";
import { Guard } from "@shared/core/Guard";
import { Customer, CustomerProps } from './Customer';
import { CustomerType } from '../value-objects/CustomerType';
import { CustomerCreated } from '../events/CustomerCreated';
import { Address } from "@shared/domain/value-objects/Address";

interface HotelRestaurantCustomerProps extends CustomerProps {
  businessName: string;
  taxId: string;
  businessLicenseNumber: string;
  hotelType: 'BOUTIQUE' | 'LUXURY' | 'RESORT' | 'BUSINESS' | 'CHAIN' | 'OTHER';
  hotelSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  numberOfRooms: number;
  restaurantCount: number;
  hasRoomService: boolean;
  hasBanquetFacilities: boolean;
  hasConferenceFacilities: boolean;
  cuisineTypes: string[];
  averageDailyCovers: number;
  peakSeasonMonths: number[];
  hasHACCPCertification: boolean;
  hasDedicatedProcurementTeam: boolean;
  requiresMixedTemperaturePallets: boolean;
  requiresEDIIntegration: boolean;
  preferredDeliveryDays: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[];
  orderFrequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  averageOrderValue: number;
  creditTerms: 'COD' | 'NET_7' | 'NET_15' | 'NET_30';
  annualBanquetRevenue?: number;
  requiresOnSiteDemos: boolean;
  contractPricingDiscount?: number; // percentage
}

export class HotelRestaurantCustomer extends Customer {
  private constructor(props: HotelRestaurantCustomerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get businessName(): string {
    return (this.props as HotelRestaurantCustomerProps).businessName;
  }

  get taxId(): string {
    return (this.props as HotelRestaurantCustomerProps).taxId;
  }

  get businessLicenseNumber(): string {
    return (this.props as HotelRestaurantCustomerProps).businessLicenseNumber;
  }

  get hotelType(): 'BOUTIQUE' | 'LUXURY' | 'RESORT' | 'BUSINESS' | 'CHAIN' | 'OTHER' {
    return (this.props as HotelRestaurantCustomerProps).hotelType;
  }

  get hotelSize(): 'SMALL' | 'MEDIUM' | 'LARGE' {
    return (this.props as HotelRestaurantCustomerProps).hotelSize;
  }

  get numberOfRooms(): number {
    return (this.props as HotelRestaurantCustomerProps).numberOfRooms;
  }

  get restaurantCount(): number {
    return (this.props as HotelRestaurantCustomerProps).restaurantCount;
  }

  get hasRoomService(): boolean {
    return (this.props as HotelRestaurantCustomerProps).hasRoomService;
  }

  get hasBanquetFacilities(): boolean {
    return (this.props as HotelRestaurantCustomerProps).hasBanquetFacilities;
  }

  get hasConferenceFacilities(): boolean {
    return (this.props as HotelRestaurantCustomerProps).hasConferenceFacilities;
  }

  get cuisineTypes(): string[] {
    return (this.props as HotelRestaurantCustomerProps).cuisineTypes;
  }

  get averageDailyCovers(): number {
    return (this.props as HotelRestaurantCustomerProps).averageDailyCovers;
  }

  get peakSeasonMonths(): number[] {
    return (this.props as HotelRestaurantCustomerProps).peakSeasonMonths;
  }

  get hasHACCPCertification(): boolean {
    return (this.props as HotelRestaurantCustomerProps).hasHACCPCertification;
  }

  get hasDedicatedProcurementTeam(): boolean {
    return (this.props as HotelRestaurantCustomerProps).hasDedicatedProcurementTeam;
  }

  get requiresMixedTemperaturePallets(): boolean {
    return (this.props as HotelRestaurantCustomerProps).requiresMixedTemperaturePallets;
  }

  get requiresEDIIntegration(): boolean {
    return (this.props as HotelRestaurantCustomerProps).requiresEDIIntegration;
  }

  get preferredDeliveryDays(): ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[] {
    return (this.props as HotelRestaurantCustomerProps).preferredDeliveryDays;
  }

  get orderFrequency(): 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' {
    return (this.props as HotelRestaurantCustomerProps).orderFrequency;
  }

  get averageOrderValue(): number {
    return (this.props as HotelRestaurantCustomerProps).averageOrderValue;
  }

  get creditTerms(): 'COD' | 'NET_7' | 'NET_15' | 'NET_30' {
    return (this.props as HotelRestaurantCustomerProps).creditTerms;
  }

  get annualBanquetRevenue(): number | undefined {
    return (this.props as HotelRestaurantCustomerProps).annualBanquetRevenue;
  }

  get requiresOnSiteDemos(): boolean {
    return (this.props as HotelRestaurantCustomerProps).requiresOnSiteDemos;
  }

  get contractPricingDiscount(): number | undefined {
    return (this.props as HotelRestaurantCustomerProps).contractPricingDiscount;
  }

  public updateBusinessInfo(
    businessName: string,
    taxId: string,
    businessLicenseNumber: string
  ): Result<void, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: businessName, argumentName: 'businessName' },
      { argument: taxId, argumentName: 'taxId' },
      { argument: businessLicenseNumber, argumentName: 'businessLicenseNumber' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    (this.props as HotelRestaurantCustomerProps).businessName = businessName;
    (this.props as HotelRestaurantCustomerProps).taxId = taxId;
    (this.props as HotelRestaurantCustomerProps).businessLicenseNumber = businessLicenseNumber;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateHotelDetails(
    hotelType: 'BOUTIQUE' | 'LUXURY' | 'RESORT' | 'BUSINESS' | 'CHAIN' | 'OTHER',
    hotelSize: 'SMALL' | 'MEDIUM' | 'LARGE',
    numberOfRooms: number,
    restaurantCount: number
  ): Result<void, string> {
    if (numberOfRooms <= 0) {
      return failure('Number of rooms must be greater than 0');
    }

    if (restaurantCount <= 0) {
      return failure('Restaurant count must be greater than 0');
    }

    (this.props as HotelRestaurantCustomerProps).hotelType = hotelType;
    (this.props as HotelRestaurantCustomerProps).hotelSize = hotelSize;
    (this.props as HotelRestaurantCustomerProps).numberOfRooms = numberOfRooms;
    (this.props as HotelRestaurantCustomerProps).restaurantCount = restaurantCount;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateFacilities(
    hasRoomService: boolean,
    hasBanquetFacilities: boolean,
    hasConferenceFacilities: boolean
  ): Result<void, string> {
    (this.props as HotelRestaurantCustomerProps).hasRoomService = hasRoomService;
    (this.props as HotelRestaurantCustomerProps).hasBanquetFacilities = hasBanquetFacilities;
    (this.props as HotelRestaurantCustomerProps).hasConferenceFacilities = hasConferenceFacilities;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateCuisineTypes(cuisineTypes: string[]): Result<void, string> {
    if (cuisineTypes.length === 0) {
      return failure('At least one cuisine type must be specified');
    }

    (this.props as HotelRestaurantCustomerProps).cuisineTypes = cuisineTypes;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateOperationalDetails(
    averageDailyCovers: number,
    peakSeasonMonths: number[]
  ): Result<void, string> {
    if (averageDailyCovers < 0) {
      return failure('Average daily covers cannot be negative');
    }

    // Validate month numbers (1-12)
    for (const month of peakSeasonMonths) {
      if (month < 1 || month > 12) {
        return failure('Peak season months must be between 1 and 12');
      }
    }

    (this.props as HotelRestaurantCustomerProps).averageDailyCovers = averageDailyCovers;
    (this.props as HotelRestaurantCustomerProps).peakSeasonMonths = peakSeasonMonths;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateComplianceDetails(
    hasHACCPCertification: boolean,
    hasDedicatedProcurementTeam: boolean
  ): Result<void, string> {
    (this.props as HotelRestaurantCustomerProps).hasHACCPCertification = hasHACCPCertification;
    (this.props as HotelRestaurantCustomerProps).hasDedicatedProcurementTeam = hasDedicatedProcurementTeam;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateLogisticsRequirements(
    requiresMixedTemperaturePallets: boolean,
    requiresEDIIntegration: boolean
  ): Result<void, string> {
    (this.props as HotelRestaurantCustomerProps).requiresMixedTemperaturePallets = requiresMixedTemperaturePallets;
    (this.props as HotelRestaurantCustomerProps).requiresEDIIntegration = requiresEDIIntegration;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateOrderingPreferences(
    preferredDeliveryDays: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[],
    orderFrequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY',
    averageOrderValue: number
  ): Result<void, string> {
    if (preferredDeliveryDays.length === 0) {
      return failure('At least one preferred delivery day must be specified');
    }

    if (averageOrderValue <= 0) {
      return failure('Average order value must be greater than 0');
    }

    (this.props as HotelRestaurantCustomerProps).preferredDeliveryDays = preferredDeliveryDays;
    (this.props as HotelRestaurantCustomerProps).orderFrequency = orderFrequency;
    (this.props as HotelRestaurantCustomerProps).averageOrderValue = averageOrderValue;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateCreditTerms(terms: 'COD' | 'NET_7' | 'NET_15' | 'NET_30'): Result<void, string> {
    (this.props as HotelRestaurantCustomerProps).creditTerms = terms;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateBanquetRevenue(annualRevenue?: number): Result<void, string> {
    if (annualRevenue !== undefined && annualRevenue < 0) {
      return failure('Annual banquet revenue cannot be negative');
    }

    (this.props as HotelRestaurantCustomerProps).annualBanquetRevenue = annualRevenue;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateOnSiteDemoRequirement(requires: boolean): Result<void, string> {
    (this.props as HotelRestaurantCustomerProps).requiresOnSiteDemos = requires;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateContractPricingDiscount(discount?: number): Result<void, string> {
    if (discount !== undefined) {
      if (discount < 0 || discount > 100) {
        return failure('Contract pricing discount must be between 0 and 100');
      }
    }

    (this.props as HotelRestaurantCustomerProps).contractPricingDiscount = discount;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public static create(
    props: Omit<HotelRestaurantCustomerProps, 'type' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ): Result<HotelRestaurantCustomer, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.contactInfo, argumentName: 'contactInfo' },
      { argument: props.businessName, argumentName: 'businessName' },
      { argument: props.taxId, argumentName: 'taxId' },
      { argument: props.businessLicenseNumber, argumentName: 'businessLicenseNumber' },
      { argument: props.hotelType, argumentName: 'hotelType' },
      { argument: props.hotelSize, argumentName: 'hotelSize' },
      { argument: props.numberOfRooms, argumentName: 'numberOfRooms' },
      { argument: props.restaurantCount, argumentName: 'restaurantCount' },
      { argument: props.hasRoomService, argumentName: 'hasRoomService' },
      { argument: props.hasBanquetFacilities, argumentName: 'hasBanquetFacilities' },
      { argument: props.hasConferenceFacilities, argumentName: 'hasConferenceFacilities' },
      { argument: props.cuisineTypes, argumentName: 'cuisineTypes' },
      { argument: props.averageDailyCovers, argumentName: 'averageDailyCovers' },
      { argument: props.peakSeasonMonths, argumentName: 'peakSeasonMonths' },
      { argument: props.hasHACCPCertification, argumentName: 'hasHACCPCertification' },
      { argument: props.hasDedicatedProcurementTeam, argumentName: 'hasDedicatedProcurementTeam' },
      { argument: props.requiresMixedTemperaturePallets, argumentName: 'requiresMixedTemperaturePallets' },
      { argument: props.requiresEDIIntegration, argumentName: 'requiresEDIIntegration' },
      { argument: props.preferredDeliveryDays, argumentName: 'preferredDeliveryDays' },
      { argument: props.orderFrequency, argumentName: 'orderFrequency' },
      { argument: props.averageOrderValue, argumentName: 'averageOrderValue' },
      { argument: props.creditTerms, argumentName: 'creditTerms' },
      { argument: props.requiresOnSiteDemos, argumentName: 'requiresOnSiteDemos' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.cuisineTypes.length === 0) {
      return failure('At least one cuisine type must be specified');
    }

    if (props.preferredDeliveryDays.length === 0) {
      return failure('At least one preferred delivery day must be specified');
    }

    if (props.numberOfRooms <= 0) {
      return failure('Number of rooms must be greater than 0');
    }

    if (props.restaurantCount <= 0) {
      return failure('Restaurant count must be greater than 0');
    }

    if (props.averageDailyCovers < 0) {
      return failure('Average daily covers cannot be negative');
    }

    if (props.averageOrderValue <= 0) {
      return failure('Average order value must be greater than 0');
    }

    // Validate month numbers (1-12)
    for (const month of props.peakSeasonMonths) {
      if (month < 1 || month > 12) {
        return failure('Peak season months must be between 1 and 12');
      }
    }

    if (props.annualBanquetRevenue !== undefined && props.annualBanquetRevenue < 0) {
      return failure('Annual banquet revenue cannot be negative');
    }

    if (props.contractPricingDiscount !== undefined && 
        (props.contractPricingDiscount < 0 || props.contractPricingDiscount > 100)) {
      return failure('Contract pricing discount must be between 0 and 100');
    }

    const isNewCustomer = !id;
    const customer = new HotelRestaurantCustomer(
      {
        ...props,
        type: CustomerType.HotelRestaurant,
        createdAt: isNewCustomer ? new Date() : new Date(),
        updatedAt: new Date()
      },
      id
    );

    if (isNewCustomer) {
      customer.addDomainEvent(new CustomerCreated(customer));
    }

    return success(customer);
  }
}

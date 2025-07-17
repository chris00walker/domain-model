import { UniqueEntityID } from "@shared/domain/base/UniqueEntityID";
import { Result, success, failure } from "@shared/core/Result";
import { Guard } from "@shared/core/Guard";
import { Customer, CustomerProps } from './Customer';
import { CustomerType } from '../value-objects/CustomerType';
import { CustomerCreated } from '../events/CustomerCreated';
import { Address } from "@shared/domain/value-objects/Address";

interface FullServiceRestaurantCustomerProps extends CustomerProps {
  businessName: string;
  taxId: string;
  businessLicenseNumber: string;
  restaurantType: 'FINE_DINING' | 'CASUAL_DINING' | 'FAMILY_STYLE' | 'BISTRO' | 'OTHER';
  cuisineTypes: string[];
  averageDailyCovers: number;
  seatingCapacity: number;
  hasPrivateDiningRoom: boolean;
  operatingHours: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  staffSize: number;
  headChefName?: string;
  headChefSpecialty?: string;
  hasTrainedMediterraneanStaff: boolean;
  acceptsTableSideQrStories: boolean;
  preferredDeliveryDays: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[];
  orderFrequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  averageOrderValue: number;
  creditTerms: 'COD' | 'NET_7' | 'NET_15' | 'NET_30';
  participatesInPromotions: boolean;
  seasonalMenuRotation: boolean;
  acceptsBatchConsistencyGuarantee: boolean;
}

export class FullServiceRestaurantCustomer extends Customer {
  private constructor(props: FullServiceRestaurantCustomerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get businessName(): string {
    return (this.props as FullServiceRestaurantCustomerProps).businessName;
  }

  get taxId(): string {
    return (this.props as FullServiceRestaurantCustomerProps).taxId;
  }

  get businessLicenseNumber(): string {
    return (this.props as FullServiceRestaurantCustomerProps).businessLicenseNumber;
  }

  get restaurantType(): 'FINE_DINING' | 'CASUAL_DINING' | 'FAMILY_STYLE' | 'BISTRO' | 'OTHER' {
    return (this.props as FullServiceRestaurantCustomerProps).restaurantType;
  }

  get cuisineTypes(): string[] {
    return (this.props as FullServiceRestaurantCustomerProps).cuisineTypes;
  }

  get averageDailyCovers(): number {
    return (this.props as FullServiceRestaurantCustomerProps).averageDailyCovers;
  }

  get seatingCapacity(): number {
    return (this.props as FullServiceRestaurantCustomerProps).seatingCapacity;
  }

  get hasPrivateDiningRoom(): boolean {
    return (this.props as FullServiceRestaurantCustomerProps).hasPrivateDiningRoom;
  }

  get operatingHours(): {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  } {
    return (this.props as FullServiceRestaurantCustomerProps).operatingHours;
  }

  get staffSize(): number {
    return (this.props as FullServiceRestaurantCustomerProps).staffSize;
  }

  get headChefName(): string | undefined {
    return (this.props as FullServiceRestaurantCustomerProps).headChefName;
  }

  get headChefSpecialty(): string | undefined {
    return (this.props as FullServiceRestaurantCustomerProps).headChefSpecialty;
  }

  get hasTrainedMediterraneanStaff(): boolean {
    return (this.props as FullServiceRestaurantCustomerProps).hasTrainedMediterraneanStaff;
  }

  get acceptsTableSideQrStories(): boolean {
    return (this.props as FullServiceRestaurantCustomerProps).acceptsTableSideQrStories;
  }

  get preferredDeliveryDays(): ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[] {
    return (this.props as FullServiceRestaurantCustomerProps).preferredDeliveryDays;
  }

  get orderFrequency(): 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' {
    return (this.props as FullServiceRestaurantCustomerProps).orderFrequency;
  }

  get averageOrderValue(): number {
    return (this.props as FullServiceRestaurantCustomerProps).averageOrderValue;
  }

  get creditTerms(): 'COD' | 'NET_7' | 'NET_15' | 'NET_30' {
    return (this.props as FullServiceRestaurantCustomerProps).creditTerms;
  }

  get participatesInPromotions(): boolean {
    return (this.props as FullServiceRestaurantCustomerProps).participatesInPromotions;
  }

  get seasonalMenuRotation(): boolean {
    return (this.props as FullServiceRestaurantCustomerProps).seasonalMenuRotation;
  }

  get acceptsBatchConsistencyGuarantee(): boolean {
    return (this.props as FullServiceRestaurantCustomerProps).acceptsBatchConsistencyGuarantee;
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

    (this.props as FullServiceRestaurantCustomerProps).businessName = businessName;
    (this.props as FullServiceRestaurantCustomerProps).taxId = taxId;
    (this.props as FullServiceRestaurantCustomerProps).businessLicenseNumber = businessLicenseNumber;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateRestaurantType(type: 'FINE_DINING' | 'CASUAL_DINING' | 'FAMILY_STYLE' | 'BISTRO' | 'OTHER'): Result<void, string> {
    (this.props as FullServiceRestaurantCustomerProps).restaurantType = type;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateCuisineTypes(cuisineTypes: string[]): Result<void, string> {
    if (cuisineTypes.length === 0) {
      return failure('At least one cuisine type must be specified');
    }

    (this.props as FullServiceRestaurantCustomerProps).cuisineTypes = cuisineTypes;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateRestaurantDetails(
    averageDailyCovers: number,
    seatingCapacity: number,
    hasPrivateDiningRoom: boolean,
    staffSize: number
  ): Result<void, string> {
    if (averageDailyCovers < 0) {
      return failure('Average daily covers cannot be negative');
    }

    if (seatingCapacity < 0) {
      return failure('Seating capacity cannot be negative');
    }

    if (staffSize < 0) {
      return failure('Staff size cannot be negative');
    }

    (this.props as FullServiceRestaurantCustomerProps).averageDailyCovers = averageDailyCovers;
    (this.props as FullServiceRestaurantCustomerProps).seatingCapacity = seatingCapacity;
    (this.props as FullServiceRestaurantCustomerProps).hasPrivateDiningRoom = hasPrivateDiningRoom;
    (this.props as FullServiceRestaurantCustomerProps).staffSize = staffSize;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateOperatingHours(hours: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  }): Result<void, string> {
    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    
    for (const day in hours) {
      const dayHours = hours[day as keyof typeof hours];
      if (dayHours) {
        if (!timeRegex.test(dayHours.open) || !timeRegex.test(dayHours.close)) {
          return failure(`Invalid time format for ${day}. Use HH:MM format (24-hour).`);
        }
      }
    }

    (this.props as FullServiceRestaurantCustomerProps).operatingHours = hours;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateHeadChefInfo(name?: string, specialty?: string): Result<void, string> {
    (this.props as FullServiceRestaurantCustomerProps).headChefName = name;
    (this.props as FullServiceRestaurantCustomerProps).headChefSpecialty = specialty;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateStaffTraining(hasTrainedMediterraneanStaff: boolean): Result<void, string> {
    (this.props as FullServiceRestaurantCustomerProps).hasTrainedMediterraneanStaff = hasTrainedMediterraneanStaff;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateQrStoryAcceptance(accepts: boolean): Result<void, string> {
    (this.props as FullServiceRestaurantCustomerProps).acceptsTableSideQrStories = accepts;
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

    (this.props as FullServiceRestaurantCustomerProps).preferredDeliveryDays = preferredDeliveryDays;
    (this.props as FullServiceRestaurantCustomerProps).orderFrequency = orderFrequency;
    (this.props as FullServiceRestaurantCustomerProps).averageOrderValue = averageOrderValue;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateCreditTerms(terms: 'COD' | 'NET_7' | 'NET_15' | 'NET_30'): Result<void, string> {
    (this.props as FullServiceRestaurantCustomerProps).creditTerms = terms;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updatePromotionParticipation(participates: boolean): Result<void, string> {
    (this.props as FullServiceRestaurantCustomerProps).participatesInPromotions = participates;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateSeasonalMenuRotation(usesSeasonal: boolean): Result<void, string> {
    (this.props as FullServiceRestaurantCustomerProps).seasonalMenuRotation = usesSeasonal;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateBatchConsistencyAcceptance(accepts: boolean): Result<void, string> {
    (this.props as FullServiceRestaurantCustomerProps).acceptsBatchConsistencyGuarantee = accepts;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public static create(
    props: Omit<FullServiceRestaurantCustomerProps, 'type' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ): Result<FullServiceRestaurantCustomer, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.contactInfo, argumentName: 'contactInfo' },
      { argument: props.businessName, argumentName: 'businessName' },
      { argument: props.taxId, argumentName: 'taxId' },
      { argument: props.businessLicenseNumber, argumentName: 'businessLicenseNumber' },
      { argument: props.restaurantType, argumentName: 'restaurantType' },
      { argument: props.cuisineTypes, argumentName: 'cuisineTypes' },
      { argument: props.averageDailyCovers, argumentName: 'averageDailyCovers' },
      { argument: props.seatingCapacity, argumentName: 'seatingCapacity' },
      { argument: props.hasPrivateDiningRoom, argumentName: 'hasPrivateDiningRoom' },
      { argument: props.operatingHours, argumentName: 'operatingHours' },
      { argument: props.staffSize, argumentName: 'staffSize' },
      { argument: props.hasTrainedMediterraneanStaff, argumentName: 'hasTrainedMediterraneanStaff' },
      { argument: props.acceptsTableSideQrStories, argumentName: 'acceptsTableSideQrStories' },
      { argument: props.preferredDeliveryDays, argumentName: 'preferredDeliveryDays' },
      { argument: props.orderFrequency, argumentName: 'orderFrequency' },
      { argument: props.averageOrderValue, argumentName: 'averageOrderValue' },
      { argument: props.creditTerms, argumentName: 'creditTerms' },
      { argument: props.participatesInPromotions, argumentName: 'participatesInPromotions' },
      { argument: props.seasonalMenuRotation, argumentName: 'seasonalMenuRotation' },
      { argument: props.acceptsBatchConsistencyGuarantee, argumentName: 'acceptsBatchConsistencyGuarantee' }
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

    if (props.averageDailyCovers < 0) {
      return failure('Average daily covers cannot be negative');
    }

    if (props.seatingCapacity < 0) {
      return failure('Seating capacity cannot be negative');
    }

    if (props.staffSize < 0) {
      return failure('Staff size cannot be negative');
    }

    if (props.averageOrderValue <= 0) {
      return failure('Average order value must be greater than 0');
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    
    for (const day in props.operatingHours) {
      const dayHours = props.operatingHours[day as keyof typeof props.operatingHours];
      if (dayHours) {
        if (!timeRegex.test(dayHours.open) || !timeRegex.test(dayHours.close)) {
          return failure(`Invalid time format for ${day}. Use HH:MM format (24-hour).`);
        }
      }
    }

    const isNewCustomer = !id;
    const customer = new FullServiceRestaurantCustomer(
      {
        ...props,
        type: CustomerType.FullServiceRestaurant,
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

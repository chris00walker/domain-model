import { UniqueEntityID } from "@shared/domain/base/UniqueEntityID";
import { Result, success, failure } from "@shared/core/Result";
import { Guard } from "@shared/core/Guard";
import { Customer, CustomerProps } from './Customer';
import { CustomerType } from '../value-objects/CustomerType';
import { CustomerCreated } from '../events/CustomerCreated';
import { Address } from "@shared/domain/value-objects/Address";

interface LimitedServiceRestaurantCustomerProps extends CustomerProps {
  businessName: string;
  taxId: string;
  businessLicenseNumber: string;
  restaurantType: 'FAST_CASUAL' | 'QUICK_SERVICE' | 'FOOD_COURT' | 'CAFE' | 'OTHER';
  cuisineTypes: string[];
  averageDailyOrders: number;
  seatingCapacity: number;
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
  hasTrainedMediterraneanStaff: boolean;
  preferredDeliveryDays: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[];
  orderFrequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  averageOrderValue: number;
  creditTerms: 'COD' | 'NET_7' | 'NET_15' | 'NET_30';
  participatesInPromotions: boolean;
}

export class LimitedServiceRestaurantCustomer extends Customer {
  private constructor(props: LimitedServiceRestaurantCustomerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get businessName(): string {
    return (this.props as LimitedServiceRestaurantCustomerProps).businessName;
  }

  get taxId(): string {
    return (this.props as LimitedServiceRestaurantCustomerProps).taxId;
  }

  get businessLicenseNumber(): string {
    return (this.props as LimitedServiceRestaurantCustomerProps).businessLicenseNumber;
  }

  get restaurantType(): 'FAST_CASUAL' | 'QUICK_SERVICE' | 'FOOD_COURT' | 'CAFE' | 'OTHER' {
    return (this.props as LimitedServiceRestaurantCustomerProps).restaurantType;
  }

  get cuisineTypes(): string[] {
    return (this.props as LimitedServiceRestaurantCustomerProps).cuisineTypes;
  }

  get averageDailyOrders(): number {
    return (this.props as LimitedServiceRestaurantCustomerProps).averageDailyOrders;
  }

  get seatingCapacity(): number {
    return (this.props as LimitedServiceRestaurantCustomerProps).seatingCapacity;
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
    return (this.props as LimitedServiceRestaurantCustomerProps).operatingHours;
  }

  get staffSize(): number {
    return (this.props as LimitedServiceRestaurantCustomerProps).staffSize;
  }

  get hasTrainedMediterraneanStaff(): boolean {
    return (this.props as LimitedServiceRestaurantCustomerProps).hasTrainedMediterraneanStaff;
  }

  get preferredDeliveryDays(): ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[] {
    return (this.props as LimitedServiceRestaurantCustomerProps).preferredDeliveryDays;
  }

  get orderFrequency(): 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' {
    return (this.props as LimitedServiceRestaurantCustomerProps).orderFrequency;
  }

  get averageOrderValue(): number {
    return (this.props as LimitedServiceRestaurantCustomerProps).averageOrderValue;
  }

  get creditTerms(): 'COD' | 'NET_7' | 'NET_15' | 'NET_30' {
    return (this.props as LimitedServiceRestaurantCustomerProps).creditTerms;
  }

  get participatesInPromotions(): boolean {
    return (this.props as LimitedServiceRestaurantCustomerProps).participatesInPromotions;
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

    (this.props as LimitedServiceRestaurantCustomerProps).businessName = businessName;
    (this.props as LimitedServiceRestaurantCustomerProps).taxId = taxId;
    (this.props as LimitedServiceRestaurantCustomerProps).businessLicenseNumber = businessLicenseNumber;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateRestaurantType(type: 'FAST_CASUAL' | 'QUICK_SERVICE' | 'FOOD_COURT' | 'CAFE' | 'OTHER'): Result<void, string> {
    (this.props as LimitedServiceRestaurantCustomerProps).restaurantType = type;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateCuisineTypes(cuisineTypes: string[]): Result<void, string> {
    if (cuisineTypes.length === 0) {
      return failure('At least one cuisine type must be specified');
    }

    (this.props as LimitedServiceRestaurantCustomerProps).cuisineTypes = cuisineTypes;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateRestaurantDetails(
    averageDailyOrders: number,
    seatingCapacity: number,
    staffSize: number
  ): Result<void, string> {
    if (averageDailyOrders < 0) {
      return failure('Average daily orders cannot be negative');
    }

    if (seatingCapacity < 0) {
      return failure('Seating capacity cannot be negative');
    }

    if (staffSize < 0) {
      return failure('Staff size cannot be negative');
    }

    (this.props as LimitedServiceRestaurantCustomerProps).averageDailyOrders = averageDailyOrders;
    (this.props as LimitedServiceRestaurantCustomerProps).seatingCapacity = seatingCapacity;
    (this.props as LimitedServiceRestaurantCustomerProps).staffSize = staffSize;
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

    (this.props as LimitedServiceRestaurantCustomerProps).operatingHours = hours;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateStaffTraining(hasTrainedMediterraneanStaff: boolean): Result<void, string> {
    (this.props as LimitedServiceRestaurantCustomerProps).hasTrainedMediterraneanStaff = hasTrainedMediterraneanStaff;
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

    (this.props as LimitedServiceRestaurantCustomerProps).preferredDeliveryDays = preferredDeliveryDays;
    (this.props as LimitedServiceRestaurantCustomerProps).orderFrequency = orderFrequency;
    (this.props as LimitedServiceRestaurantCustomerProps).averageOrderValue = averageOrderValue;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateCreditTerms(terms: 'COD' | 'NET_7' | 'NET_15' | 'NET_30'): Result<void, string> {
    (this.props as LimitedServiceRestaurantCustomerProps).creditTerms = terms;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updatePromotionParticipation(participates: boolean): Result<void, string> {
    (this.props as LimitedServiceRestaurantCustomerProps).participatesInPromotions = participates;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public static create(
    props: Omit<LimitedServiceRestaurantCustomerProps, 'type' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ): Result<LimitedServiceRestaurantCustomer, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.contactInfo, argumentName: 'contactInfo' },
      { argument: props.businessName, argumentName: 'businessName' },
      { argument: props.taxId, argumentName: 'taxId' },
      { argument: props.businessLicenseNumber, argumentName: 'businessLicenseNumber' },
      { argument: props.restaurantType, argumentName: 'restaurantType' },
      { argument: props.cuisineTypes, argumentName: 'cuisineTypes' },
      { argument: props.averageDailyOrders, argumentName: 'averageDailyOrders' },
      { argument: props.seatingCapacity, argumentName: 'seatingCapacity' },
      { argument: props.operatingHours, argumentName: 'operatingHours' },
      { argument: props.staffSize, argumentName: 'staffSize' },
      { argument: props.hasTrainedMediterraneanStaff, argumentName: 'hasTrainedMediterraneanStaff' },
      { argument: props.preferredDeliveryDays, argumentName: 'preferredDeliveryDays' },
      { argument: props.orderFrequency, argumentName: 'orderFrequency' },
      { argument: props.averageOrderValue, argumentName: 'averageOrderValue' },
      { argument: props.creditTerms, argumentName: 'creditTerms' },
      { argument: props.participatesInPromotions, argumentName: 'participatesInPromotions' }
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

    if (props.averageDailyOrders < 0) {
      return failure('Average daily orders cannot be negative');
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
    const customer = new LimitedServiceRestaurantCustomer(
      {
        ...props,
        type: CustomerType.LimitedServiceRestaurant,
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

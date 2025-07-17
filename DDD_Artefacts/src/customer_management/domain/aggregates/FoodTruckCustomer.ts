import { UniqueEntityID } from "@shared/domain/base/UniqueEntityID";
import { Result, success, failure } from "@shared/core/Result";
import { Guard } from "@shared/core/Guard";
import { Customer, CustomerProps } from './Customer';
import { CustomerType } from '../value-objects/CustomerType';
import { CustomerCreated } from '../events/CustomerCreated';
import { Address } from "@shared/domain/value-objects/Address";

interface FoodTruckCustomerProps extends CustomerProps {
  businessName: string;
  taxId: string;
  businessLicenseNumber: string;
  cuisineType: string[];
  operatingLocations: Address[];
  storageCapacity: 'SMALL' | 'MEDIUM' | 'LARGE';
  preferredDeliverySchedule?: {
    frequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY';
    preferredDays: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[];
  };
  creditTerms: 'COD' | 'NET_7' | 'NET_15' | 'NET_30';
}

export class FoodTruckCustomer extends Customer {
  private constructor(props: FoodTruckCustomerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get businessName(): string {
    return (this.props as FoodTruckCustomerProps).businessName;
  }

  get taxId(): string {
    return (this.props as FoodTruckCustomerProps).taxId;
  }

  get businessLicenseNumber(): string {
    return (this.props as FoodTruckCustomerProps).businessLicenseNumber;
  }

  get cuisineType(): string[] {
    return (this.props as FoodTruckCustomerProps).cuisineType;
  }

  get operatingLocations(): Address[] {
    return (this.props as FoodTruckCustomerProps).operatingLocations;
  }

  get storageCapacity(): 'SMALL' | 'MEDIUM' | 'LARGE' {
    return (this.props as FoodTruckCustomerProps).storageCapacity;
  }

  get preferredDeliverySchedule(): { 
    frequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY'; 
    preferredDays: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[];
  } | undefined {
    return (this.props as FoodTruckCustomerProps).preferredDeliverySchedule;
  }

  get creditTerms(): 'COD' | 'NET_7' | 'NET_15' | 'NET_30' {
    return (this.props as FoodTruckCustomerProps).creditTerms;
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

    (this.props as FoodTruckCustomerProps).businessName = businessName;
    (this.props as FoodTruckCustomerProps).taxId = taxId;
    (this.props as FoodTruckCustomerProps).businessLicenseNumber = businessLicenseNumber;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateCuisineType(cuisineType: string[]): Result<void, string> {
    if (cuisineType.length === 0) {
      return failure('At least one cuisine type must be specified');
    }

    (this.props as FoodTruckCustomerProps).cuisineType = cuisineType;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public addOperatingLocation(location: Address): Result<void, string> {
    (this.props as FoodTruckCustomerProps).operatingLocations.push(location);
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public removeOperatingLocation(index: number): Result<void, string> {
    const locations = (this.props as FoodTruckCustomerProps).operatingLocations;
    
    if (index < 0 || index >= locations.length) {
      return failure('Invalid location index');
    }
    
    locations.splice(index, 1);
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateStorageCapacity(capacity: 'SMALL' | 'MEDIUM' | 'LARGE'): Result<void, string> {
    (this.props as FoodTruckCustomerProps).storageCapacity = capacity;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateDeliverySchedule(
    frequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY',
    preferredDays: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[]
  ): Result<void, string> {
    if (preferredDays.length === 0) {
      return failure('At least one preferred delivery day must be specified');
    }

    (this.props as FoodTruckCustomerProps).preferredDeliverySchedule = {
      frequency,
      preferredDays
    };
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateCreditTerms(terms: 'COD' | 'NET_7' | 'NET_15' | 'NET_30'): Result<void, string> {
    (this.props as FoodTruckCustomerProps).creditTerms = terms;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public static create(
    props: Omit<FoodTruckCustomerProps, 'type' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ): Result<FoodTruckCustomer, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.contactInfo, argumentName: 'contactInfo' },
      { argument: props.businessName, argumentName: 'businessName' },
      { argument: props.taxId, argumentName: 'taxId' },
      { argument: props.businessLicenseNumber, argumentName: 'businessLicenseNumber' },
      { argument: props.cuisineType, argumentName: 'cuisineType' },
      { argument: props.operatingLocations, argumentName: 'operatingLocations' },
      { argument: props.storageCapacity, argumentName: 'storageCapacity' },
      { argument: props.creditTerms, argumentName: 'creditTerms' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.cuisineType.length === 0) {
      return failure('At least one cuisine type must be specified');
    }

    if (props.operatingLocations.length === 0) {
      return failure('At least one operating location must be specified');
    }

    if (props.preferredDeliverySchedule && props.preferredDeliverySchedule.preferredDays.length === 0) {
      return failure('At least one preferred delivery day must be specified');
    }

    const isNewCustomer = !id;
    const customer = new FoodTruckCustomer(
      {
        ...props,
        type: CustomerType.FoodTruck,
        createdAt: isNewCustomer ? new Date() : new Date(), // Default to current date if not a new customer
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

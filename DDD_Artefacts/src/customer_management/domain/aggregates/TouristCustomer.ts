import { UniqueEntityID } from "@shared/domain/base/UniqueEntityID";
import { Result, success, failure } from "@shared/core/Result";
import { Guard } from "@shared/core/Guard";
import { Customer, CustomerProps } from './Customer';
import { CustomerType } from '../value-objects/CustomerType';
import { CustomerCreated } from '../events/CustomerCreated';

interface TouristCustomerProps extends CustomerProps {
  countryOfOrigin: string;
  stayDuration: number; // in days
  accommodationType: 'AIRBNB' | 'HOTEL' | 'VILLA' | 'OTHER';
  accommodationAddress: string;
  departureDate?: Date;
}

export class TouristCustomer extends Customer {
  private constructor(props: TouristCustomerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get countryOfOrigin(): string {
    return (this.props as TouristCustomerProps).countryOfOrigin;
  }

  get stayDuration(): number {
    return (this.props as TouristCustomerProps).stayDuration;
  }

  get accommodationType(): 'AIRBNB' | 'HOTEL' | 'VILLA' | 'OTHER' {
    return (this.props as TouristCustomerProps).accommodationType;
  }

  get accommodationAddress(): string {
    return (this.props as TouristCustomerProps).accommodationAddress;
  }

  get departureDate(): Date | undefined {
    return (this.props as TouristCustomerProps).departureDate;
  }

  public updateAccommodationDetails(
    accommodationType: 'AIRBNB' | 'HOTEL' | 'VILLA' | 'OTHER',
    accommodationAddress: string
  ): Result<void, string> {
    if (!accommodationAddress) {
      return failure('Accommodation address is required');
    }

    (this.props as TouristCustomerProps).accommodationType = accommodationType;
    (this.props as TouristCustomerProps).accommodationAddress = accommodationAddress;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateDepartureDate(departureDate: Date): Result<void, string> {
    if (departureDate < new Date()) {
      return failure('Departure date cannot be in the past');
    }

    (this.props as TouristCustomerProps).departureDate = departureDate;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public static create(
    props: Omit<TouristCustomerProps, 'type' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ): Result<TouristCustomer, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.contactInfo, argumentName: 'contactInfo' },
      { argument: props.countryOfOrigin, argumentName: 'countryOfOrigin' },
      { argument: props.stayDuration, argumentName: 'stayDuration' },
      { argument: props.accommodationType, argumentName: 'accommodationType' },
      { argument: props.accommodationAddress, argumentName: 'accommodationAddress' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.stayDuration <= 0) {
      return failure('Stay duration must be greater than 0');
    }

    if (props.departureDate && props.departureDate < new Date()) {
      return failure('Departure date cannot be in the past');
    }

    const isNewCustomer = !id;
    const customer = new TouristCustomer(
      {
        ...props,
        type: CustomerType.Tourist,
        createdAt: new Date(),
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

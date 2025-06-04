import { UniqueEntityID } from "@shared/domain/base/UniqueEntityID";
import { Result, success, failure } from "@shared/core/Result";
import { Guard } from "@shared/core/Guard";
import { Customer, CustomerProps } from './Customer';
import { CustomerType } from '../value-objects/CustomerType';
import { CustomerCreated } from '../events/CustomerCreated';

interface ExpatCustomerProps extends CustomerProps {
  countryOfOrigin: string;
  residencyStatus: 'PERMANENT' | 'TEMPORARY' | 'WORK_PERMIT';
  residenceDuration: number; // in months
  dietaryPreferences?: string[];
  hasSubscription: boolean;
  preferredDeliveryDay?: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  preferredDeliveryFrequency?: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
}

export class ExpatCustomer extends Customer {
  private constructor(props: ExpatCustomerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get countryOfOrigin(): string {
    return (this.props as ExpatCustomerProps).countryOfOrigin;
  }

  get residencyStatus(): 'PERMANENT' | 'TEMPORARY' | 'WORK_PERMIT' {
    return (this.props as ExpatCustomerProps).residencyStatus;
  }

  get residenceDuration(): number {
    return (this.props as ExpatCustomerProps).residenceDuration;
  }

  get dietaryPreferences(): string[] | undefined {
    return (this.props as ExpatCustomerProps).dietaryPreferences;
  }

  get hasSubscription(): boolean {
    return (this.props as ExpatCustomerProps).hasSubscription;
  }

  get preferredDeliveryDay(): 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY' | undefined {
    return (this.props as ExpatCustomerProps).preferredDeliveryDay;
  }

  get preferredDeliveryFrequency(): 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | undefined {
    return (this.props as ExpatCustomerProps).preferredDeliveryFrequency;
  }

  public updateResidencyInfo(
    status: 'PERMANENT' | 'TEMPORARY' | 'WORK_PERMIT',
    duration: number
  ): Result<void, string> {
    if (duration <= 0) {
      return failure('Residence duration must be greater than 0');
    }

    (this.props as ExpatCustomerProps).residencyStatus = status;
    (this.props as ExpatCustomerProps).residenceDuration = duration;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateDietaryPreferences(preferences: string[]): Result<void, string> {
    (this.props as ExpatCustomerProps).dietaryPreferences = preferences;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public setSubscriptionStatus(hasSubscription: boolean): Result<void, string> {
    (this.props as ExpatCustomerProps).hasSubscription = hasSubscription;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateDeliveryPreferences(
    day?: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY',
    frequency?: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY'
  ): Result<void, string> {
    if (day) {
      (this.props as ExpatCustomerProps).preferredDeliveryDay = day;
    }
    
    if (frequency) {
      (this.props as ExpatCustomerProps).preferredDeliveryFrequency = frequency;
    }
    
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public static create(
    props: Omit<ExpatCustomerProps, 'type' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ): Result<ExpatCustomer, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.contactInfo, argumentName: 'contactInfo' },
      { argument: props.countryOfOrigin, argumentName: 'countryOfOrigin' },
      { argument: props.residencyStatus, argumentName: 'residencyStatus' },
      { argument: props.residenceDuration, argumentName: 'residenceDuration' },
      { argument: props.hasSubscription, argumentName: 'hasSubscription' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.residenceDuration <= 0) {
      return failure('Residence duration must be greater than 0');
    }

    // If customer has subscription, delivery preferences must be set
    if (props.hasSubscription && (!props.preferredDeliveryDay || !props.preferredDeliveryFrequency)) {
      return failure('Delivery preferences must be set for subscription customers');
    }

    const isNewCustomer = !id;
    const customer = new ExpatCustomer(
      {
        ...props,
        type: CustomerType.Expat,
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

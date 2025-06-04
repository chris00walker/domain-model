import { UniqueEntityID } from "@shared/domain/base/UniqueEntityID"
import { Result, success, failure } from "@shared/core/Result";
import { Guard } from '@shared/core/Guard';
import { Customer, CustomerProps } from './Customer';
import { CustomerType } from '../value-objects/CustomerType';
import { ContactInfo } from '../value-objects/ContactInfo';
import { Address } from "@shared/domain/value-objects/Address";
import { CustomerCreated } from '../events/CustomerCreated';

interface DiasporaCustomerProps extends CustomerProps {
  culturalBackground: string;
  dietaryPreferences?: string[];
  preferredCuisines: string[];
}

/**
 * Invariants:
 * - DiasporaCustomer inherits all Customer invariants
 * - DiasporaCustomer.culturalBackground must be non-empty
 * - DiasporaCustomer.preferredCuisines must contain at least one cuisine
 * - DiasporaCustomer.type must be CustomerType.DIASPORA
 */
export class DiasporaCustomer extends Customer {
  private constructor(props: DiasporaCustomerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get culturalBackground(): string {
    return (this.props as DiasporaCustomerProps).culturalBackground;
  }

  get dietaryPreferences(): string[] | undefined {
    return (this.props as DiasporaCustomerProps).dietaryPreferences;
  }

  get preferredCuisines(): string[] {
    return (this.props as DiasporaCustomerProps).preferredCuisines;
  }

  public updateCulturalBackground(culturalBackground: string): Result<void, string> {
    (this.props as DiasporaCustomerProps).culturalBackground = culturalBackground;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateDietaryPreferences(preferences: string[]): Result<void, string> {
    (this.props as DiasporaCustomerProps).dietaryPreferences = preferences;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updatePreferredCuisines(cuisines: string[]): Result<void, string> {
    (this.props as DiasporaCustomerProps).preferredCuisines = cuisines;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public static create(
    props: Omit<DiasporaCustomerProps, 'type' | 'createdAt' | 'updatedAt'>, 
    id?: UniqueEntityID
  ): Result<DiasporaCustomer, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.contactInfo, argumentName: 'contactInfo' },
      { argument: props.culturalBackground, argumentName: 'culturalBackground' },
      { argument: props.preferredCuisines, argumentName: 'preferredCuisines' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.preferredCuisines.length === 0) {
      return failure('At least one preferred cuisine must be specified');
    }

    const isNewCustomer = !id;
    const customer = new DiasporaCustomer(
      {
        ...props,
        type: CustomerType.DiasporaCommunity,
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

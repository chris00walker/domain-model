import { UniqueEntityID } from "@shared/domain/base/UniqueEntityID";
import { Result, success, failure } from "@shared/core/Result";
import { Guard } from "@shared/core/Guard";
import { Customer, CustomerProps } from './Customer';
import { CustomerType } from '../value-objects/CustomerType';
import { CustomerCreated } from '../events/CustomerCreated';

interface IndigenousFoodieCustomerProps extends CustomerProps {
  culinaryInterests: string[];
  cookingExperienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  familySize: number;
  dietaryRestrictions?: string[];
  preferredMealTypes?: string[];
  hasSampledBefore: boolean;
}

export class IndigenousFoodieCustomer extends Customer {
  private constructor(props: IndigenousFoodieCustomerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get culinaryInterests(): string[] {
    return (this.props as IndigenousFoodieCustomerProps).culinaryInterests;
  }

  get cookingExperienceLevel(): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
    return (this.props as IndigenousFoodieCustomerProps).cookingExperienceLevel;
  }

  get familySize(): number {
    return (this.props as IndigenousFoodieCustomerProps).familySize;
  }

  get dietaryRestrictions(): string[] | undefined {
    return (this.props as IndigenousFoodieCustomerProps).dietaryRestrictions;
  }

  get preferredMealTypes(): string[] | undefined {
    return (this.props as IndigenousFoodieCustomerProps).preferredMealTypes;
  }

  get hasSampledBefore(): boolean {
    return (this.props as IndigenousFoodieCustomerProps).hasSampledBefore;
  }

  public updateCulinaryInterests(interests: string[]): Result<void, string> {
    if (interests.length === 0) {
      return failure('At least one culinary interest must be specified');
    }

    (this.props as IndigenousFoodieCustomerProps).culinaryInterests = interests;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateCookingExperienceLevel(level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): Result<void, string> {
    (this.props as IndigenousFoodieCustomerProps).cookingExperienceLevel = level;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateFamilySize(size: number): Result<void, string> {
    if (size <= 0) {
      return failure('Family size must be greater than 0');
    }

    (this.props as IndigenousFoodieCustomerProps).familySize = size;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateDietaryRestrictions(restrictions: string[]): Result<void, string> {
    (this.props as IndigenousFoodieCustomerProps).dietaryRestrictions = restrictions;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updatePreferredMealTypes(mealTypes: string[]): Result<void, string> {
    (this.props as IndigenousFoodieCustomerProps).preferredMealTypes = mealTypes;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public markAsSampled(): Result<void, string> {
    (this.props as IndigenousFoodieCustomerProps).hasSampledBefore = true;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public static create(
    props: Omit<IndigenousFoodieCustomerProps, 'type' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ): Result<IndigenousFoodieCustomer, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.contactInfo, argumentName: 'contactInfo' },
      { argument: props.culinaryInterests, argumentName: 'culinaryInterests' },
      { argument: props.cookingExperienceLevel, argumentName: 'cookingExperienceLevel' },
      { argument: props.familySize, argumentName: 'familySize' },
      { argument: props.hasSampledBefore, argumentName: 'hasSampledBefore' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.culinaryInterests.length === 0) {
      return failure('At least one culinary interest must be specified');
    }

    if (props.familySize <= 0) {
      return failure('Family size must be greater than 0');
    }

    const isNewCustomer = !id;
    const customer = new IndigenousFoodieCustomer(
      {
        ...props,
        type: CustomerType.IndigenousFoodie,
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

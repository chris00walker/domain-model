import { AggregateRoot } from '@shared/domain/base/AggregateRoot';
import { UniqueEntityID } from "@shared/domain/base/UniqueEntityID";
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from "@shared/core/Guard";
import { CustomerId } from '../value-objects/CustomerId';
import { CustomerType } from '../value-objects/CustomerType';
import { CustomerCreated } from '../events/CustomerCreated';
import { CustomerUpdated } from '../events/CustomerUpdated';
import { Address } from "@shared/domain/value-objects/Address";
import { ContactInfo } from '../value-objects/ContactInfo';

export interface CustomerProps {
  name: string;
  type: CustomerType;
  contactInfo: ContactInfo;
  defaultShippingAddress?: Address;
  defaultBillingAddress?: Address;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Invariants:
 * - Customer.name must be non-empty
 * - Customer.type must be a valid CustomerType
 * - Customer.contactInfo must be valid (email format, phone number format)
 * - Customer.defaultShippingAddress and defaultBillingAddress must be valid addresses when provided
 * - Customer.createdAt must be a valid date
 * - Customer.updatedAt must be a valid date and >= createdAt
 */
export abstract class Customer extends AggregateRoot<CustomerProps> {
  protected constructor(props: CustomerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get customerId(): CustomerId {
    const result = CustomerId.create(this._id.toString());
    if (result.isSuccess()) {
      return result.value;
    }
    throw new Error(`Failed to create CustomerId: ${result.error}`);
  }

  get name(): string {
    return this.props.name;
  }

  get type(): CustomerType {
    return this.props.type;
  }

  get contactInfo(): ContactInfo {
    return this.props.contactInfo;
  }

  get defaultShippingAddress(): Address | undefined {
    return this.props.defaultShippingAddress;
  }

  get defaultBillingAddress(): Address | undefined {
    return this.props.defaultBillingAddress;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateContactInfo(contactInfo: ContactInfo): Result<void, string> {
    this.props.contactInfo = contactInfo;
    this.props.updatedAt = new Date();
    
    // Emit domain event for contact info update
    this.addDomainEvent(new CustomerUpdated(this, ['contactInfo']));
    
    return success(undefined);
  }

  public updateDefaultShippingAddress(address: Address): Result<void, string> {
    this.props.defaultShippingAddress = address;
    this.props.updatedAt = new Date();
    
    // Emit domain event for shipping address update
    this.addDomainEvent(new CustomerUpdated(this, ['defaultShippingAddress']));
    
    return success(undefined);
  }

  public updateDefaultBillingAddress(address: Address): Result<void, string> {
    this.props.defaultBillingAddress = address;
    this.props.updatedAt = new Date();
    
    // Emit domain event for billing address update
    this.addDomainEvent(new CustomerUpdated(this, ['defaultBillingAddress']));
    
    return success(undefined);
  }

  protected static validateCommonProps(props: CustomerProps): Result<void, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.type, argumentName: 'type' },
      { argument: props.contactInfo, argumentName: 'contactInfo' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    return success(undefined);
  }
}

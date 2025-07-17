import { AggregateRoot } from '@shared/domain/base/AggregateRoot';
import { UniqueEntityID } from "@shared/domain/base/UniqueEntityID";
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from "@shared/core/Guard";
import { CustomerId } from '../value-objects/CustomerId';
import { CustomerType } from '../value-objects/CustomerType';
import { CustomerSegmentType } from '../value-objects/CustomerSegmentType';
import { CustomerSegment } from '../value-objects/CustomerSegment';
import { B2CCustomerSegment } from '../value-objects/B2CCustomerSegment';
import { B2BCustomerSegment } from '../value-objects/B2BCustomerSegment';
import { CustomerCreated } from '../events/CustomerCreated';
import { CustomerUpdated } from '../events/CustomerUpdated';
import { CustomerSegmentChanged } from '../events/CustomerSegmentChanged';
import { Address } from "@shared/domain/value-objects/Address";
import { ContactInfo } from '../value-objects/ContactInfo';

export interface CustomerProps {
  name: string;
  type: CustomerType;
  contactInfo: ContactInfo;
  customerSegment: CustomerSegment;
  b2cSegment?: B2CCustomerSegment;
  b2bSegment?: B2BCustomerSegment;
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
 * - Customer.customerSegment must be valid and compatible with customer type
 * - Customer.b2cSegment must be present if customer is B2C type
 * - Customer.b2bSegment must be present if customer is B2B type
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

  get customerSegment(): CustomerSegment {
    return this.props.customerSegment;
  }

  get segmentType(): CustomerSegmentType {
    return this.props.customerSegment.segmentType;
  }

  get b2cSegment(): B2CCustomerSegment | undefined {
    return this.props.b2cSegment;
  }

  get b2bSegment(): B2BCustomerSegment | undefined {
    return this.props.b2bSegment;
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

  /**
   * Updates the customer's segment
   * @param newSegment The new customer segment
   * @param reason Optional reason for the segment change
   * @returns Result containing either void or an error message
   */
  public updateSegment(newSegment: CustomerSegment, reason?: string): Result<void, string> {
    // Ensure the new segment is compatible with the customer type
    if (newSegment.customerType !== this.props.type) {
      return failure(`Segment type ${newSegment.segmentType} is not compatible with customer type ${this.props.type}`);
    }

    const previousSegmentType = this.props.customerSegment.segmentType;
    this.props.customerSegment = newSegment;
    this.props.updatedAt = new Date();
    
    // Emit domain event for segment change
    this.addDomainEvent(
      CustomerSegmentChanged.create(
        this,
        newSegment.segmentType,
        previousSegmentType,
        reason
      )
    );
    
    return success(undefined);
  }

  /**
   * Updates the B2C segment details for the customer
   * @param b2cSegment The new B2C segment details
   * @returns Result containing either void or an error message
   */
  public updateB2CSegment(b2cSegment: B2CCustomerSegment): Result<void, string> {
    // Ensure the customer is a B2C type
    if (!this.isB2CCustomer()) {
      return failure(`Cannot update B2C segment for customer type ${this.props.type}`);
    }

    this.props.b2cSegment = b2cSegment;
    this.props.updatedAt = new Date();
    
    // Emit domain event for segment update
    this.addDomainEvent(new CustomerUpdated(this, ['b2cSegment']));
    
    return success(undefined);
  }

  /**
   * Updates the B2B segment details for the customer
   * @param b2bSegment The new B2B segment details
   * @returns Result containing either void or an error message
   */
  public updateB2BSegment(b2bSegment: B2BCustomerSegment): Result<void, string> {
    // Ensure the customer is a B2B type
    if (!this.isB2BCustomer()) {
      return failure(`Cannot update B2B segment for customer type ${this.props.type}`);
    }

    this.props.b2bSegment = b2bSegment;
    this.props.updatedAt = new Date();
    
    // Emit domain event for segment update
    this.addDomainEvent(new CustomerUpdated(this, ['b2bSegment']));
    
    return success(undefined);
  }

  /**
   * Checks if the customer is a B2C type
   * @returns boolean indicating if the customer is a B2C type
   */
  public isB2CCustomer(): boolean {
    const b2cTypes = [
      CustomerType.DiasporaCommunity,
      CustomerType.Tourist,
      CustomerType.Expat,
      CustomerType.IndigenousFoodie
    ];

    return b2cTypes.includes(this.props.type);
  }

  /**
   * Checks if the customer is a B2B type
   * @returns boolean indicating if the customer is a B2B type
   */
  public isB2BCustomer(): boolean {
    const b2bTypes = [
      CustomerType.FoodTruck,
      CustomerType.PrivateChef,
      CustomerType.SpecialtyMarket,
      CustomerType.LimitedServiceRestaurant,
      CustomerType.FullServiceRestaurant,
      CustomerType.HotelRestaurant,
      CustomerType.Importer,
      CustomerType.RegionalSupermarket,
      CustomerType.CruiseLineProvisioner,
      CustomerType.InternationalRetailer
    ];

    return b2bTypes.includes(this.props.type);
  }

  protected static validateCommonProps(props: CustomerProps): Result<void, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.type, argumentName: 'type' },
      { argument: props.contactInfo, argumentName: 'contactInfo' },
      { argument: props.customerSegment, argumentName: 'customerSegment' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    // Validate that the customer segment is compatible with the customer type
    if (props.customerSegment.customerType !== props.type) {
      return failure(`Segment type ${props.customerSegment.segmentType} is not compatible with customer type ${props.type}`);
    }

    // Validate B2C/B2B segment presence based on customer type
    const b2cTypes = [
      CustomerType.DiasporaCommunity,
      CustomerType.Tourist,
      CustomerType.Expat,
      CustomerType.IndigenousFoodie
    ];

    const b2bTypes = [
      CustomerType.FoodTruck,
      CustomerType.PrivateChef,
      CustomerType.SpecialtyMarket,
      CustomerType.LimitedServiceRestaurant,
      CustomerType.FullServiceRestaurant,
      CustomerType.HotelRestaurant,
      CustomerType.Importer,
      CustomerType.RegionalSupermarket,
      CustomerType.CruiseLineProvisioner,
      CustomerType.InternationalRetailer
    ];

    if (b2cTypes.includes(props.type) && !props.b2cSegment) {
      return failure(`B2C segment details are required for customer type ${props.type}`);
    }

    if (b2bTypes.includes(props.type) && !props.b2bSegment) {
      return failure(`B2B segment details are required for customer type ${props.type}`);
    }

    return success(undefined);
  }
}

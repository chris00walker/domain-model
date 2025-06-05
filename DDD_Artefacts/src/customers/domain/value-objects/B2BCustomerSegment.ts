import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { CustomerSegment } from './CustomerSegment';
import { CustomerSegmentType } from './CustomerSegmentType';
import { CustomerType } from './CustomerType';

interface B2BCustomerSegmentProps {
  customerSegment: CustomerSegment;
  businessSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  annualRevenue: number;
  employeeCount: number;
  orderVolume: number; // Average monthly order volume
  paymentTerms: number; // In days
  contractType?: string;
  specialPricing: boolean;
  accountManagerId?: string;
}

/**
 * B2BCustomerSegment Value Object
 * 
 * Extends the base CustomerSegment with B2B-specific properties such as
 * business size, revenue, order volume, payment terms, and account management details.
 * 
 * Domain-Driven Design Value Object Pattern
 * 
 * Value Objects are immutable objects that have no identity but describe domain concepts.
 * They are used to measure, quantify, or describe things in the domain model.
 * 
 * Invariants:
 * - customerSegment must be a valid CustomerSegment
 * - customerSegment must be of a B2B type
 * - businessSize must be one of 'SMALL', 'MEDIUM', or 'LARGE'
 * - annualRevenue must be >= 0
 * - employeeCount must be > 0
 * - orderVolume must be >= 0
 * - paymentTerms must be >= 0
 */
export class B2BCustomerSegment {
  private readonly props: B2BCustomerSegmentProps;

  private constructor(props: B2BCustomerSegmentProps) {
    this.props = props;
  }

  get customerSegment(): CustomerSegment {
    return this.props.customerSegment;
  }

  get businessSize(): 'SMALL' | 'MEDIUM' | 'LARGE' {
    return this.props.businessSize;
  }

  get annualRevenue(): number {
    return this.props.annualRevenue;
  }

  get employeeCount(): number {
    return this.props.employeeCount;
  }

  get orderVolume(): number {
    return this.props.orderVolume;
  }

  get paymentTerms(): number {
    return this.props.paymentTerms;
  }

  get contractType(): string | undefined {
    return this.props.contractType;
  }

  get specialPricing(): boolean {
    return this.props.specialPricing;
  }

  get accountManagerId(): string | undefined {
    return this.props.accountManagerId;
  }

  /**
   * Factory method to create a new B2BCustomerSegment
   * @param props The properties of the B2B customer segment
   * @returns Result containing either the new B2BCustomerSegment or an error message
   */
  public static create(props: B2BCustomerSegmentProps): Result<B2BCustomerSegment, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.customerSegment, argumentName: 'customerSegment' },
      { argument: props.businessSize, argumentName: 'businessSize' },
      { argument: props.annualRevenue, argumentName: 'annualRevenue' },
      { argument: props.employeeCount, argumentName: 'employeeCount' },
      { argument: props.orderVolume, argumentName: 'orderVolume' },
      { argument: props.paymentTerms, argumentName: 'paymentTerms' },
      { argument: props.specialPricing, argumentName: 'specialPricing' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    // Validate that the customer segment is a B2B type
    if (!B2BCustomerSegment.isB2BCustomerType(props.customerSegment.customerType)) {
      return failure(`Customer type ${props.customerSegment.customerType} is not a B2B type`);
    }

    // Validate business size
    if (!['SMALL', 'MEDIUM', 'LARGE'].includes(props.businessSize)) {
      return failure('Business size must be one of SMALL, MEDIUM, or LARGE');
    }

    if (props.annualRevenue < 0) {
      return failure('Annual revenue cannot be negative');
    }

    if (props.employeeCount <= 0) {
      return failure('Employee count must be greater than zero');
    }

    if (props.orderVolume < 0) {
      return failure('Order volume cannot be negative');
    }

    if (props.paymentTerms < 0) {
      return failure('Payment terms cannot be negative');
    }

    return success(new B2BCustomerSegment(props));
  }

  /**
   * Updates the business size of the B2B customer segment
   * @param size The new business size
   * @returns Result containing either the updated B2BCustomerSegment or an error message
   */
  public updateBusinessSize(size: 'SMALL' | 'MEDIUM' | 'LARGE'): Result<B2BCustomerSegment, string> {
    return B2BCustomerSegment.create({
      ...this.props,
      businessSize: size
    });
  }

  /**
   * Updates the annual revenue of the B2B customer segment
   * @param revenue The new annual revenue
   * @returns Result containing either the updated B2BCustomerSegment or an error message
   */
  public updateAnnualRevenue(revenue: number): Result<B2BCustomerSegment, string> {
    if (revenue < 0) {
      return failure('Annual revenue cannot be negative');
    }

    return B2BCustomerSegment.create({
      ...this.props,
      annualRevenue: revenue
    });
  }

  /**
   * Updates the employee count of the B2B customer segment
   * @param count The new employee count
   * @returns Result containing either the updated B2BCustomerSegment or an error message
   */
  public updateEmployeeCount(count: number): Result<B2BCustomerSegment, string> {
    if (count <= 0) {
      return failure('Employee count must be greater than zero');
    }

    return B2BCustomerSegment.create({
      ...this.props,
      employeeCount: count
    });
  }

  /**
   * Updates the order volume of the B2B customer segment
   * @param volume The new order volume
   * @returns Result containing either the updated B2BCustomerSegment or an error message
   */
  public updateOrderVolume(volume: number): Result<B2BCustomerSegment, string> {
    if (volume < 0) {
      return failure('Order volume cannot be negative');
    }

    return B2BCustomerSegment.create({
      ...this.props,
      orderVolume: volume
    });
  }

  /**
   * Updates the payment terms of the B2B customer segment
   * @param terms The new payment terms in days
   * @returns Result containing either the updated B2BCustomerSegment or an error message
   */
  public updatePaymentTerms(terms: number): Result<B2BCustomerSegment, string> {
    if (terms < 0) {
      return failure('Payment terms cannot be negative');
    }

    return B2BCustomerSegment.create({
      ...this.props,
      paymentTerms: terms
    });
  }

  /**
   * Updates the contract type of the B2B customer segment
   * @param contractType The new contract type
   * @returns Result containing either the updated B2BCustomerSegment or an error message
   */
  public updateContractType(contractType: string | undefined): Result<B2BCustomerSegment, string> {
    return B2BCustomerSegment.create({
      ...this.props,
      contractType
    });
  }

  /**
   * Updates the special pricing flag of the B2B customer segment
   * @param hasSpecialPricing Whether the customer has special pricing
   * @returns Result containing either the updated B2BCustomerSegment or an error message
   */
  public updateSpecialPricing(hasSpecialPricing: boolean): Result<B2BCustomerSegment, string> {
    return B2BCustomerSegment.create({
      ...this.props,
      specialPricing: hasSpecialPricing
    });
  }

  /**
   * Assigns an account manager to the B2B customer segment
   * @param accountManagerId The ID of the account manager
   * @returns Result containing either the updated B2BCustomerSegment or an error message
   */
  public assignAccountManager(accountManagerId: string): Result<B2BCustomerSegment, string> {
    if (accountManagerId.trim().length === 0) {
      return failure('Account manager ID cannot be empty');
    }

    return B2BCustomerSegment.create({
      ...this.props,
      accountManagerId
    });
  }

  /**
   * Removes the assigned account manager from the B2B customer segment
   * @returns Result containing either the updated B2BCustomerSegment or an error message
   */
  public removeAccountManager(): Result<B2BCustomerSegment, string> {
    return B2BCustomerSegment.create({
      ...this.props,
      accountManagerId: undefined
    });
  }

  /**
   * Checks if a customer type is a B2B type
   * @param customerType The customer type to check
   * @returns boolean indicating if the customer type is a B2B type
   */
  private static isB2BCustomerType(customerType: CustomerType): boolean {
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

    return b2bTypes.includes(customerType);
  }
}

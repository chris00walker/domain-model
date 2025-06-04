import { UniqueEntityID } from "@shared/domain/base/UniqueEntityID";
import { Result, success, failure } from "@shared/core/Result";
import { Guard } from "@shared/core/Guard";
import { Customer, CustomerProps } from './Customer';
import { CustomerType } from '../value-objects/CustomerType';
import { CustomerCreated } from '../events/CustomerCreated';

interface SpecialtyMarketCustomerProps extends CustomerProps {
  businessName: string;
  taxId: string;
  businessLicenseNumber: string;
  storeSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  averageMonthlyFootfall: number;
  specialtyFocus: string[];
  hasRefrigeration: boolean;
  shelfSpace: number; // in linear feet
  orderFrequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  creditTerms: 'COD' | 'NET_7' | 'NET_15' | 'NET_30';
  usesQrShelfTalkers: boolean;
}

export class SpecialtyMarketCustomer extends Customer {
  private constructor(props: SpecialtyMarketCustomerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get businessName(): string {
    return (this.props as SpecialtyMarketCustomerProps).businessName;
  }

  get taxId(): string {
    return (this.props as SpecialtyMarketCustomerProps).taxId;
  }

  get businessLicenseNumber(): string {
    return (this.props as SpecialtyMarketCustomerProps).businessLicenseNumber;
  }

  get storeSize(): 'SMALL' | 'MEDIUM' | 'LARGE' {
    return (this.props as SpecialtyMarketCustomerProps).storeSize;
  }

  get averageMonthlyFootfall(): number {
    return (this.props as SpecialtyMarketCustomerProps).averageMonthlyFootfall;
  }

  get specialtyFocus(): string[] {
    return (this.props as SpecialtyMarketCustomerProps).specialtyFocus;
  }

  get hasRefrigeration(): boolean {
    return (this.props as SpecialtyMarketCustomerProps).hasRefrigeration;
  }

  get shelfSpace(): number {
    return (this.props as SpecialtyMarketCustomerProps).shelfSpace;
  }

  get orderFrequency(): 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' {
    return (this.props as SpecialtyMarketCustomerProps).orderFrequency;
  }

  get creditTerms(): 'COD' | 'NET_7' | 'NET_15' | 'NET_30' {
    return (this.props as SpecialtyMarketCustomerProps).creditTerms;
  }

  get usesQrShelfTalkers(): boolean {
    return (this.props as SpecialtyMarketCustomerProps).usesQrShelfTalkers;
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

    (this.props as SpecialtyMarketCustomerProps).businessName = businessName;
    (this.props as SpecialtyMarketCustomerProps).taxId = taxId;
    (this.props as SpecialtyMarketCustomerProps).businessLicenseNumber = businessLicenseNumber;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateStoreDetails(
    storeSize: 'SMALL' | 'MEDIUM' | 'LARGE',
    averageMonthlyFootfall: number,
    shelfSpace: number,
    hasRefrigeration: boolean
  ): Result<void, string> {
    if (averageMonthlyFootfall < 0) {
      return failure('Average monthly footfall cannot be negative');
    }

    if (shelfSpace <= 0) {
      return failure('Shelf space must be greater than 0');
    }

    (this.props as SpecialtyMarketCustomerProps).storeSize = storeSize;
    (this.props as SpecialtyMarketCustomerProps).averageMonthlyFootfall = averageMonthlyFootfall;
    (this.props as SpecialtyMarketCustomerProps).shelfSpace = shelfSpace;
    (this.props as SpecialtyMarketCustomerProps).hasRefrigeration = hasRefrigeration;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateSpecialtyFocus(specialtyFocus: string[]): Result<void, string> {
    if (specialtyFocus.length === 0) {
      return failure('At least one specialty focus must be specified');
    }

    (this.props as SpecialtyMarketCustomerProps).specialtyFocus = specialtyFocus;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateOrderFrequency(frequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY'): Result<void, string> {
    (this.props as SpecialtyMarketCustomerProps).orderFrequency = frequency;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateCreditTerms(terms: 'COD' | 'NET_7' | 'NET_15' | 'NET_30'): Result<void, string> {
    (this.props as SpecialtyMarketCustomerProps).creditTerms = terms;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public setQrShelfTalkerUsage(usesQrShelfTalkers: boolean): Result<void, string> {
    (this.props as SpecialtyMarketCustomerProps).usesQrShelfTalkers = usesQrShelfTalkers;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public static create(
    props: Omit<SpecialtyMarketCustomerProps, 'type' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ): Result<SpecialtyMarketCustomer, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.contactInfo, argumentName: 'contactInfo' },
      { argument: props.businessName, argumentName: 'businessName' },
      { argument: props.taxId, argumentName: 'taxId' },
      { argument: props.businessLicenseNumber, argumentName: 'businessLicenseNumber' },
      { argument: props.storeSize, argumentName: 'storeSize' },
      { argument: props.averageMonthlyFootfall, argumentName: 'averageMonthlyFootfall' },
      { argument: props.specialtyFocus, argumentName: 'specialtyFocus' },
      { argument: props.hasRefrigeration, argumentName: 'hasRefrigeration' },
      { argument: props.shelfSpace, argumentName: 'shelfSpace' },
      { argument: props.orderFrequency, argumentName: 'orderFrequency' },
      { argument: props.creditTerms, argumentName: 'creditTerms' },
      { argument: props.usesQrShelfTalkers, argumentName: 'usesQrShelfTalkers' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.specialtyFocus.length === 0) {
      return failure('At least one specialty focus must be specified');
    }

    if (props.averageMonthlyFootfall < 0) {
      return failure('Average monthly footfall cannot be negative');
    }

    if (props.shelfSpace <= 0) {
      return failure('Shelf space must be greater than 0');
    }

    const isNewCustomer = !id;
    const customer = new SpecialtyMarketCustomer(
      {
        ...props,
        type: CustomerType.SpecialtyMarket,
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

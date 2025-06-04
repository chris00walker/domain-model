import { UniqueEntityID } from "@shared/domain/base/UniqueEntityID";
import { Result, success, failure } from "@shared/core/Result";
import { Guard } from "@shared/core/Guard";
import { Customer, CustomerProps } from './Customer';
import { CustomerType } from '../value-objects/CustomerType';
import { CustomerCreated } from '../events/CustomerCreated';
import { Address } from "@shared/domain/value-objects/Address";

interface PrivateChefCustomerProps extends CustomerProps {
  businessName: string;
  taxId: string;
  businessLicenseNumber: string;
  specialties: string[];
  clientTypes: ('VILLA' | 'HOTEL' | 'EVENT' | 'CORPORATE')[];
  serviceRadius: number; // in kilometers
  minimumNoticeHours: number;
  emergencyAvailability: boolean;
  socialMediaHandles?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    other?: string;
  };
  portfolioUrl?: string;
  certifications: string[];
  creditTerms: 'COD' | 'NET_7' | 'NET_15' | 'NET_30';
}

export class PrivateChefCustomer extends Customer {
  private constructor(props: PrivateChefCustomerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get businessName(): string {
    return (this.props as PrivateChefCustomerProps).businessName;
  }

  get taxId(): string {
    return (this.props as PrivateChefCustomerProps).taxId;
  }

  get businessLicenseNumber(): string {
    return (this.props as PrivateChefCustomerProps).businessLicenseNumber;
  }

  get specialties(): string[] {
    return (this.props as PrivateChefCustomerProps).specialties;
  }

  get clientTypes(): ('VILLA' | 'HOTEL' | 'EVENT' | 'CORPORATE')[] {
    return (this.props as PrivateChefCustomerProps).clientTypes;
  }

  get serviceRadius(): number {
    return (this.props as PrivateChefCustomerProps).serviceRadius;
  }

  get minimumNoticeHours(): number {
    return (this.props as PrivateChefCustomerProps).minimumNoticeHours;
  }

  get emergencyAvailability(): boolean {
    return (this.props as PrivateChefCustomerProps).emergencyAvailability;
  }

  get socialMediaHandles(): { instagram?: string; facebook?: string; twitter?: string; other?: string } | undefined {
    return (this.props as PrivateChefCustomerProps).socialMediaHandles;
  }

  get portfolioUrl(): string | undefined {
    return (this.props as PrivateChefCustomerProps).portfolioUrl;
  }

  get certifications(): string[] {
    return (this.props as PrivateChefCustomerProps).certifications;
  }

  get creditTerms(): 'COD' | 'NET_7' | 'NET_15' | 'NET_30' {
    return (this.props as PrivateChefCustomerProps).creditTerms;
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

    (this.props as PrivateChefCustomerProps).businessName = businessName;
    (this.props as PrivateChefCustomerProps).taxId = taxId;
    (this.props as PrivateChefCustomerProps).businessLicenseNumber = businessLicenseNumber;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateSpecialties(specialties: string[]): Result<void, string> {
    if (specialties.length === 0) {
      return failure('At least one specialty must be specified');
    }

    (this.props as PrivateChefCustomerProps).specialties = specialties;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateClientTypes(clientTypes: ('VILLA' | 'HOTEL' | 'EVENT' | 'CORPORATE')[]): Result<void, string> {
    if (clientTypes.length === 0) {
      return failure('At least one client type must be specified');
    }

    (this.props as PrivateChefCustomerProps).clientTypes = clientTypes;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateServiceDetails(
    serviceRadius: number,
    minimumNoticeHours: number,
    emergencyAvailability: boolean
  ): Result<void, string> {
    if (serviceRadius <= 0) {
      return failure('Service radius must be greater than 0');
    }

    if (minimumNoticeHours < 0) {
      return failure('Minimum notice hours cannot be negative');
    }

    (this.props as PrivateChefCustomerProps).serviceRadius = serviceRadius;
    (this.props as PrivateChefCustomerProps).minimumNoticeHours = minimumNoticeHours;
    (this.props as PrivateChefCustomerProps).emergencyAvailability = emergencyAvailability;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateSocialMediaHandles(
    handles: { instagram?: string; facebook?: string; twitter?: string; other?: string }
  ): Result<void, string> {
    (this.props as PrivateChefCustomerProps).socialMediaHandles = handles;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updatePortfolioUrl(url: string): Result<void, string> {
    // Basic URL validation
    try {
      new URL(url);
    } catch (error) {
      return failure('Invalid URL format');
    }

    (this.props as PrivateChefCustomerProps).portfolioUrl = url;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateCertifications(certifications: string[]): Result<void, string> {
    (this.props as PrivateChefCustomerProps).certifications = certifications;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateCreditTerms(terms: 'COD' | 'NET_7' | 'NET_15' | 'NET_30'): Result<void, string> {
    (this.props as PrivateChefCustomerProps).creditTerms = terms;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public static create(
    props: Omit<PrivateChefCustomerProps, 'type' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ): Result<PrivateChefCustomer, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.contactInfo, argumentName: 'contactInfo' },
      { argument: props.businessName, argumentName: 'businessName' },
      { argument: props.taxId, argumentName: 'taxId' },
      { argument: props.businessLicenseNumber, argumentName: 'businessLicenseNumber' },
      { argument: props.specialties, argumentName: 'specialties' },
      { argument: props.clientTypes, argumentName: 'clientTypes' },
      { argument: props.serviceRadius, argumentName: 'serviceRadius' },
      { argument: props.minimumNoticeHours, argumentName: 'minimumNoticeHours' },
      { argument: props.emergencyAvailability, argumentName: 'emergencyAvailability' },
      { argument: props.certifications, argumentName: 'certifications' },
      { argument: props.creditTerms, argumentName: 'creditTerms' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.specialties.length === 0) {
      return failure('At least one specialty must be specified');
    }

    if (props.clientTypes.length === 0) {
      return failure('At least one client type must be specified');
    }

    if (props.serviceRadius <= 0) {
      return failure('Service radius must be greater than 0');
    }

    if (props.minimumNoticeHours < 0) {
      return failure('Minimum notice hours cannot be negative');
    }

    if (props.portfolioUrl) {
      try {
        new URL(props.portfolioUrl);
      } catch (error) {
        return failure('Invalid portfolio URL format');
      }
    }

    const isNewCustomer = !id;
    const customer = new PrivateChefCustomer(
      {
        ...props,
        type: CustomerType.PrivateChef,
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

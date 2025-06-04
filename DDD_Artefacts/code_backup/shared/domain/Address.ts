import { ValueObject } from './ValueObject';
import { Result, success, failure } from '../core/Result';
import { Guard } from '../core/Guard';

interface AddressProps {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  additionalInfo?: string;
}

export class Address extends ValueObject<AddressProps> {
  get street(): string {
    return this.props.street;
  }

  get city(): string {
    return this.props.city;
  }

  get state(): string | undefined {
    return this.props.state;
  }

  get postalCode(): string | undefined {
    return this.props.postalCode;
  }

  get country(): string {
    return this.props.country;
  }

  get additionalInfo(): string | undefined {
    return this.props.additionalInfo;
  }

  private constructor(props: AddressProps) {
    super(props);
  }

  public static create(props: AddressProps): Result<Address, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.street, argumentName: 'street' },
      { argument: props.city, argumentName: 'city' },
      { argument: props.country, argumentName: 'country' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    return success(new Address(props));
  }

  public toString(): string {
    let addressString = `${this.props.street}, ${this.props.city}`;
    
    if (this.props.state) {
      addressString += `, ${this.props.state}`;
    }
    
    if (this.props.postalCode) {
      addressString += ` ${this.props.postalCode}`;
    }
    
    addressString += `, ${this.props.country}`;
    
    if (this.props.additionalInfo) {
      addressString += ` (${this.props.additionalInfo})`;
    }
    
    return addressString;
  }
}

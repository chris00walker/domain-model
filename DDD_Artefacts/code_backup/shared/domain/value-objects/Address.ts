import { ValueObject } from '../base/ValueObject';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

interface AddressProps {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  additionalInfo?: string;
}

/**
 * Address Value Object
 * 
 * Represents a physical address with validation rules.
 * 
 * Invariants:
 * - street, city, and country must be non-empty strings
 * - street must be between 3 and 100 characters
 * - city must be between 2 and 50 characters
 * - country must be a valid ISO country code or full country name
 * - postalCode must follow country-specific format if provided
 * - state is required for certain countries (US, CA, AU)
 */
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
    // Basic null/undefined checks
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.street, argumentName: 'street' },
      { argument: props.city, argumentName: 'city' },
      { argument: props.country, argumentName: 'country' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    // String length validations
    if (props.street.trim().length < 3) {
      return failure('Street must be at least 3 characters long');
    }

    if (props.street.trim().length > 100) {
      return failure('Street must not exceed 100 characters');
    }

    if (props.city.trim().length < 2) {
      return failure('City must be at least 2 characters long');
    }

    if (props.city.trim().length > 50) {
      return failure('City must not exceed 50 characters');
    }

    // Country validation - simplified version, in a real app would validate against a list of countries
    if (props.country.trim().length < 2) {
      return failure('Country must be at least 2 characters long');
    }

    // State validation for countries that require it
    const countriesRequiringState = ['US', 'USA', 'UNITED STATES', 'CA', 'CANADA', 'AU', 'AUSTRALIA'];
    if (
      countriesRequiringState.includes(props.country.toUpperCase()) && 
      (!props.state || props.state.trim().length === 0)
    ) {
      return failure(`State is required for ${props.country}`);
    }

    // Postal code validation - simplified, in a real app would have country-specific regex patterns
    if (props.postalCode) {
      // US postal code validation
      if (props.country.toUpperCase() === 'US' || props.country.toUpperCase() === 'USA') {
        const usZipRegex = /^\d{5}(-\d{4})?$/;
        if (!usZipRegex.test(props.postalCode)) {
          return failure('Invalid US postal code format');
        }
      }
      
      // Simple length check for other countries
      if (props.postalCode.trim().length < 3 || props.postalCode.trim().length > 10) {
        return failure('Postal code must be between 3 and 10 characters');
      }
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

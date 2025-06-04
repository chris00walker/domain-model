import { ValueObject } from './ValueObject';
import { Result } from '../core/Result';

interface AddressProps {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  additionalInfo?: string;
}

export class Address extends ValueObject<AddressProps> {
  get street(): string;
  get city(): string;
  get state(): string | undefined;
  get postalCode(): string | undefined;
  get country(): string;
  get additionalInfo(): string | undefined;
  
  private constructor(props: AddressProps);
  
  static create(props: AddressProps): Result<Address, string>;
  
  toString(): string;
}

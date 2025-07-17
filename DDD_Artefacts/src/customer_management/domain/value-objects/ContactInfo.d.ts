import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result } from '../../../shared/core/Result';

interface ContactInfoProps {
  email: string;
  phone?: string;
  alternatePhone?: string;
  preferredContactMethod: 'EMAIL' | 'PHONE' | 'EITHER';
}

export class ContactInfo extends ValueObject<ContactInfoProps> {
  get email(): string;
  get phone(): string | undefined;
  get alternatePhone(): string | undefined;
  get preferredContactMethod(): 'EMAIL' | 'PHONE' | 'EITHER';
  
  private constructor(props: ContactInfoProps);
  
  static create(props: ContactInfoProps): Result<ContactInfo, string>;
}

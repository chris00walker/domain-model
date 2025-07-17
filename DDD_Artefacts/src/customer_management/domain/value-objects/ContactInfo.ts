import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';

interface ContactInfoProps {
  email: string;
  phone?: string;
  alternatePhone?: string;
  preferredContactMethod: 'EMAIL' | 'PHONE' | 'EITHER';
}

export class ContactInfo extends ValueObject<ContactInfoProps> {
  get email(): string {
    return this.props.email;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get alternatePhone(): string | undefined {
    return this.props.alternatePhone;
  }

  get preferredContactMethod(): 'EMAIL' | 'PHONE' | 'EITHER' {
    return this.props.preferredContactMethod;
  }

  private constructor(props: ContactInfoProps) {
    super(props);
  }

  public static create(props: ContactInfoProps): Result<ContactInfo, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.email, argumentName: 'email' },
      { argument: props.preferredContactMethod, argumentName: 'preferredContactMethod' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(props.email)) {
      return failure('Email is not in a valid format');
    }

    // Phone validation if provided
    if (props.phone) {
      const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
      if (!phoneRegex.test(props.phone)) {
        return failure('Phone number is not in a valid format');
      }
    }

    if (props.alternatePhone) {
      const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
      if (!phoneRegex.test(props.alternatePhone)) {
        return failure('Alternate phone number is not in a valid format');
      }
    }

    // If preferred contact method is PHONE, ensure a phone number is provided
    if (props.preferredContactMethod === 'PHONE' && !props.phone) {
      return failure('Phone number is required when preferred contact method is PHONE');
    }

    return success(new ContactInfo(props));
  }
}

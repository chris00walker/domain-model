import { ValueObject } from '../../../../shared/domain/ValueObject';
import { Result, success, failure } from '../../../../shared/core/Result';

interface AdminUserEmailProps {
  value: string;
}

/**
 * AdminUserEmail Value Object
 * 
 * Represents the email address of an admin user, with validation.
 */
export class AdminUserEmail extends ValueObject<AdminUserEmailProps> {
  
  get value(): string {
    return this.props.value;
  }
  
  private constructor(props: AdminUserEmailProps) {
    super(props);
  }
  
  /**
   * Validates and creates an AdminUserEmail value object
   */
  public static create(email: string): Result<AdminUserEmail> {
    if (!email || email.trim().length === 0) {
      return failure('Email is required');
    }
    
    // RFC 5322 compliant email regex
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if (!emailRegex.test(email)) {
      return failure('Invalid email format');
    }
    
    return success(new AdminUserEmail({ value: email.toLowerCase() }));
  }
  
  toString(): string {
    return this.props.value;
  }
}

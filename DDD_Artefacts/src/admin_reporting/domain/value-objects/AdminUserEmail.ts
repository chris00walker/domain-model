import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';

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
  public static create(email: string): Result<AdminUserEmail, Error> {
    if (!email || email.trim().length === 0) {
      return failure(new Error('Email is required'));
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return failure(new Error('Invalid email format'));
    }
    
    return success(new AdminUserEmail({ value: email.toLowerCase() }));
  }
  
  toString(): string {
    return this.props.value;
  }
}

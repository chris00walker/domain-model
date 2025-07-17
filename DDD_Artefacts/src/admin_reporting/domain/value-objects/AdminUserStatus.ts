import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';

/**
 * Possible states of an admin user account
 */
export enum AdminUserStatusValue {
  PENDING_MFA = 'PENDING_MFA',  // Account created but MFA setup required
  ACTIVE = 'ACTIVE',            // Account is active and can be used
  INACTIVE = 'INACTIVE',        // Account has been deactivated
  LOCKED = 'LOCKED'             // Account temporarily locked due to suspicious activity
}

interface AdminUserStatusProps {
  value: AdminUserStatusValue;
}

/**
 * AdminUserStatus Value Object
 * 
 * Represents the current status of an admin user account.
 */
export class AdminUserStatus extends ValueObject<AdminUserStatusProps> {
  
  get value(): AdminUserStatusValue {
    return this.props.value;
  }
  
  private constructor(props: AdminUserStatusProps) {
    super(props);
  }
  
  public static create(status: AdminUserStatusValue): Result<AdminUserStatus, Error> {
    if (!Object.values(AdminUserStatusValue).includes(status)) {
      return failure(new Error('Invalid admin user status'));
    }
    
    return success(new AdminUserStatus({ value: status }));
  }
  
  /**
   * Factory methods for creating specific status instances
   */
  public static PENDING_MFA(): AdminUserStatus {
    return new AdminUserStatus({ value: AdminUserStatusValue.PENDING_MFA });
  }
  
  public static ACTIVE(): AdminUserStatus {
    return new AdminUserStatus({ value: AdminUserStatusValue.ACTIVE });
  }
  
  public static INACTIVE(): AdminUserStatus {
    return new AdminUserStatus({ value: AdminUserStatusValue.INACTIVE });
  }
  
  public static LOCKED(): AdminUserStatus {
    return new AdminUserStatus({ value: AdminUserStatusValue.LOCKED });
  }
  
  /**
   * Equality check with another AdminUserStatus
   */
  public equals(vo?: ValueObject<AdminUserStatusProps>): boolean {
    return super.equals(vo);
  }
  
  toString(): string {
    return this.props.value;
  }
}

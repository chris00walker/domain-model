import { AggregateRoot } from '../../../../shared/domain/AggregateRoot';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { Result, success, failure } from '../../../../shared/core/Result';
import { Role } from '../entities/Role';
import { AdminUserStatus } from '../value-objects/AdminUserStatus';
import { AdminUserEmail } from '../value-objects/AdminUserEmail';
import { AdminUserCreatedEvent } from '../events/AdminUserCreatedEvent';
import { AdminRoleChangedEvent } from '../events/AdminRoleChangedEvent';
import { AdminUserDeactivatedEvent } from '../events/AdminUserDeactivatedEvent';

interface AdminUserProps {
  email: AdminUserEmail;
  name: string;
  roles: Role[];
  status: AdminUserStatus;
  mfaEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AdminUser Aggregate Root
 * 
 * Represents an administrative user with associated roles and permissions.
 * Manages the lifecycle of admin accounts including creation, role assignment, and deactivation.
 */
export class AdminUser extends AggregateRoot<AdminUserProps> {
  
  get email(): AdminUserEmail {
    return this.props.email;
  }
  
  get name(): string {
    return this.props.name;
  }
  
  get roles(): Role[] {
    return [...this.props.roles];
  }
  
  get status(): AdminUserStatus {
    return this.props.status;
  }
  
  get mfaEnabled(): boolean {
    return this.props.mfaEnabled;
  }
  
  get lastLogin(): Date | undefined {
    return this.props.lastLogin;
  }
  
  get createdAt(): Date {
    return this.props.createdAt;
  }
  
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  
  get isActive(): boolean {
    return this.status.equals(AdminUserStatus.ACTIVE);
  }

  /**
   * Creates a new admin user with the specified properties
   */
  public static create(props: Omit<AdminUserProps, 'createdAt' | 'updatedAt' | 'status'>, id?: UniqueEntityID): Result<AdminUser> {
    if (!props.email) {
      return failure('Admin user must have an email');
    }
    
    if (!props.name || props.name.trim().length === 0) {
      return failure('Admin user must have a name');
    }
    
    if (!props.roles || props.roles.length === 0) {
      return failure('Admin user must have at least one role');
    }
    
    const now = new Date();
    const adminUser = new AdminUser({
      ...props,
      status: AdminUserStatus.PENDING_MFA,
      createdAt: now,
      updatedAt: now
    }, id);
    
    // Add domain event
    adminUser.addDomainEvent(new AdminUserCreatedEvent(adminUser));
    
    return success(adminUser);
  }
  
  /**
   * Assigns roles to the admin user
   */
  public assignRoles(roles: Role[]): Result<void> {
    if (!roles || roles.length === 0) {
      return failure('At least one role must be provided');
    }
    
    // Update roles
    this.props.roles = [...roles];
    this.props.updatedAt = new Date();
    
    // Add domain event
    this.addDomainEvent(new AdminRoleChangedEvent(this));
    
    return success(undefined);
  }
  
  /**
   * Adds a role to the admin user
   */
  public addRole(role: Role): Result<void> {
    if (!this.props.roles.some(r => r.id.equals(role.id))) {
      this.props.roles.push(role);
      this.props.updatedAt = new Date();
      
      // Add domain event
      this.addDomainEvent(new AdminRoleChangedEvent(this));
    }
    
    return success(undefined);
  }
  
  /**
   * Removes a role from the admin user
   */
  public removeRole(roleId: UniqueEntityID): Result<void> {
    if (this.props.roles.length <= 1) {
      return failure('Admin user must have at least one role');
    }
    
    const initialLength = this.props.roles.length;
    this.props.roles = this.props.roles.filter(r => !r.id.equals(roleId));
    
    if (this.props.roles.length < initialLength) {
      this.props.updatedAt = new Date();
      
      // Add domain event
      this.addDomainEvent(new AdminRoleChangedEvent(this));
    }
    
    return success(undefined);
  }
  
  /**
   * Deactivates the admin user
   */
  public deactivate(): Result<void> {
    if (!this.isActive) {
      return failure('Admin user is already inactive');
    }
    
    this.props.status = AdminUserStatus.INACTIVE;
    this.props.updatedAt = new Date();
    
    // Add domain event
    this.addDomainEvent(new AdminUserDeactivatedEvent(this));
    
    return success(undefined);
  }
  
  /**
   * Activates the admin user if MFA is enabled
   */
  public activate(): Result<void> {
    if (this.isActive) {
      return failure('Admin user is already active');
    }
    
    if (!this.props.mfaEnabled) {
      return failure('MFA must be enabled before activating an admin user');
    }
    
    this.props.status = AdminUserStatus.ACTIVE;
    this.props.updatedAt = new Date();
    
    return success(undefined);
  }
  
  /**
   * Records a successful login
   */
  public recordLogin(): void {
    this.props.lastLogin = new Date();
    this.props.updatedAt = new Date();
  }
  
  /**
   * Enables multi-factor authentication
   */
  public enableMfa(): Result<void> {
    if (this.props.mfaEnabled) {
      return failure('MFA is already enabled');
    }
    
    this.props.mfaEnabled = true;
    this.props.updatedAt = new Date();
    
    return success(undefined);
  }
}

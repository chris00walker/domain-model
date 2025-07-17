import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';

/**
 * Permission categories represented as a hierarchical structure
 * Format: CONTEXT.RESOURCE.ACTION
 * 
 * Examples:
 * - CATALOG.PRODUCT.READ
 * - CATALOG.PRODUCT.CREATE
 * - CUSTOMER.ACCOUNT.UPDATE
 */
export enum PermissionValue {
  // Catalog Context
  CATALOG_PRODUCT_READ = 'CATALOG.PRODUCT.READ',
  CATALOG_PRODUCT_CREATE = 'CATALOG.PRODUCT.CREATE',
  CATALOG_PRODUCT_UPDATE = 'CATALOG.PRODUCT.UPDATE',
  CATALOG_PRODUCT_DELETE = 'CATALOG.PRODUCT.DELETE',
  
  // Customer Context
  CUSTOMER_ACCOUNT_READ = 'CUSTOMER.ACCOUNT.READ',
  CUSTOMER_ACCOUNT_UPDATE = 'CUSTOMER.ACCOUNT.UPDATE',
  CUSTOMER_SEGMENT_READ = 'CUSTOMER.SEGMENT.READ',
  CUSTOMER_SEGMENT_UPDATE = 'CUSTOMER.SEGMENT.UPDATE',
  
  // Orders Context
  ORDER_READ = 'ORDER.ORDER.READ',
  ORDER_UPDATE = 'ORDER.ORDER.UPDATE',
  ORDER_CANCEL = 'ORDER.ORDER.CANCEL',
  
  // Pricing Context
  PRICING_RULE_READ = 'PRICING.RULE.READ',
  PRICING_RULE_CREATE = 'PRICING.RULE.CREATE',
  PRICING_RULE_UPDATE = 'PRICING.RULE.UPDATE',
  PRICING_RULE_DELETE = 'PRICING.RULE.DELETE',
  
  // Subscription Context
  SUBSCRIPTION_READ = 'SUBSCRIPTION.SUBSCRIPTION.READ',
  SUBSCRIPTION_UPDATE = 'SUBSCRIPTION.SUBSCRIPTION.UPDATE',
  SUBSCRIPTION_CANCEL = 'SUBSCRIPTION.SUBSCRIPTION.CANCEL',
  
  // Admin Context
  ADMIN_USER_READ = 'ADMIN.USER.READ',
  ADMIN_USER_CREATE = 'ADMIN.USER.CREATE',
  ADMIN_USER_UPDATE = 'ADMIN.USER.UPDATE',
  ADMIN_USER_DELETE = 'ADMIN.USER.DELETE',
  ADMIN_ROLE_READ = 'ADMIN.ROLE.READ',
  ADMIN_ROLE_CREATE = 'ADMIN.ROLE.CREATE',
  ADMIN_ROLE_UPDATE = 'ADMIN.ROLE.UPDATE',
  ADMIN_ROLE_DELETE = 'ADMIN.ROLE.DELETE',
  ADMIN_SETTING_READ = 'ADMIN.SETTING.READ',
  ADMIN_SETTING_UPDATE = 'ADMIN.SETTING.UPDATE',
  
  // System-wide
  SYSTEM_AUDIT_LOG_READ = 'SYSTEM.AUDIT_LOG.READ',
  SYSTEM_METRICS_READ = 'SYSTEM.METRICS.READ',
  
  // Content moderation
  MODERATION_TASK_READ = 'MODERATION.TASK.READ',
  MODERATION_TASK_APPROVE = 'MODERATION.TASK.APPROVE',
  MODERATION_TASK_REJECT = 'MODERATION.TASK.REJECT'
}

interface PermissionProps {
  value: PermissionValue;
}

/**
 * Permission Value Object
 * 
 * Represents a specific permission that can be assigned to roles.
 */
export class Permission extends ValueObject<PermissionProps> {
  
  get value(): PermissionValue {
    return this.props.value;
  }
  
  private constructor(props: PermissionProps) {
    super(props);
  }
  
  public static create(permission: PermissionValue): Result<Permission, Error> {
    if (!Object.values(PermissionValue).includes(permission)) {
      return failure(new Error('Invalid permission value'));
    }
    
    return success(new Permission({ value: permission }));
  }
  
  /**
   * Gets the context part of the permission (e.g., CATALOG from CATALOG.PRODUCT.READ)
   */
  public getContext(): string {
    return this.props.value.split('.')[0];
  }
  
  /**
   * Gets the resource part of the permission (e.g., PRODUCT from CATALOG.PRODUCT.READ)
   */
  public getResource(): string {
    return this.props.value.split('.')[1];
  }
  
  /**
   * Gets the action part of the permission (e.g., READ from CATALOG.PRODUCT.READ)
   */
  public getAction(): string {
    return this.props.value.split('.')[2];
  }
  
  /**
   * Checks if this permission is related to reading data
   */
  public isReadPermission(): boolean {
    return this.getAction() === 'READ';
  }
  
  /**
   * Checks if this permission is related to modifying data
   */
  public isWritePermission(): boolean {
    return ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'CANCEL'].includes(this.getAction());
  }
  
  toString(): string {
    return this.props.value;
  }
}

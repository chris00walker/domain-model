import { ValueObject } from '../../../../shared/domain/ValueObject';
import { Result, success, failure } from '../../../../shared/core/Result';

/**
 * Predefined system settings keys
 * These represent the configurable aspects of the application
 */
export enum SystemSettingKeyValue {
  // Security settings
  PASSWORD_EXPIRATION_DAYS = 'PASSWORD_EXPIRATION_DAYS',
  MFA_REQUIRED = 'MFA_REQUIRED',
  LOGIN_ATTEMPT_LIMIT = 'LOGIN_ATTEMPT_LIMIT',
  SESSION_TIMEOUT_MINUTES = 'SESSION_TIMEOUT_MINUTES',
  
  // Moderation settings
  AUTO_MODERATION_ENABLED = 'AUTO_MODERATION_ENABLED',
  AUTO_APPROVAL_THRESHOLD = 'AUTO_APPROVAL_THRESHOLD',
  CONTENT_FILTER_LEVEL = 'CONTENT_FILTER_LEVEL',
  
  // Notification settings
  ADMIN_EMAIL_NOTIFICATIONS = 'ADMIN_EMAIL_NOTIFICATIONS',
  ALERT_EMAIL_RECIPIENTS = 'ALERT_EMAIL_RECIPIENTS',
  
  // Performance settings
  CACHE_DURATION_SECONDS = 'CACHE_DURATION_SECONDS',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  
  // Feature flags
  FEATURE_ADVANCED_ANALYTICS = 'FEATURE_ADVANCED_ANALYTICS',
  FEATURE_AI_RECOMMENDATIONS = 'FEATURE_AI_RECOMMENDATIONS',
  FEATURE_BULK_OPERATIONS = 'FEATURE_BULK_OPERATIONS'
}

interface SystemSettingKeyProps {
  value: string;
}

/**
 * SystemSettingKey Value Object
 * 
 * Represents keys for system settings that can be configured by administrators.
 */
export class SystemSettingKey extends ValueObject<SystemSettingKeyProps> {
  
  get value(): string {
    return this.props.value;
  }
  
  private constructor(props: SystemSettingKeyProps) {
    super(props);
  }
  
  /**
   * Creates a new SystemSettingKey value object
   * Can accept either predefined enum values or custom string keys
   */
  public static create(key: string): Result<SystemSettingKey> {
    if (!key || key.trim().length === 0) {
      return failure('Setting key cannot be empty');
    }
    
    // Enforce naming convention for custom keys
    if (!Object.values(SystemSettingKeyValue).includes(key as SystemSettingKeyValue)) {
      // Custom keys must be in UPPER_SNAKE_CASE
      const keyRegex = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;
      if (!keyRegex.test(key)) {
        return failure('Custom setting keys must be in UPPER_SNAKE_CASE format');
      }
    }
    
    return success(new SystemSettingKey({ value: key }));
  }
  
  /**
   * Factory methods for predefined settings
   */
  public static fromEnum(enumValue: SystemSettingKeyValue): SystemSettingKey {
    return new SystemSettingKey({ value: enumValue });
  }
  
  /**
   * Checks if this key represents a security setting
   */
  public isSecuritySetting(): boolean {
    return [
      SystemSettingKeyValue.PASSWORD_EXPIRATION_DAYS,
      SystemSettingKeyValue.MFA_REQUIRED,
      SystemSettingKeyValue.LOGIN_ATTEMPT_LIMIT,
      SystemSettingKeyValue.SESSION_TIMEOUT_MINUTES
    ].includes(this.props.value as SystemSettingKeyValue);
  }
  
  /**
   * Checks if this key represents a feature flag
   */
  public isFeatureFlag(): boolean {
    return this.props.value.startsWith('FEATURE_');
  }
  
  toString(): string {
    return this.props.value;
  }
}

import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';

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
  public static create(key: string): Result<SystemSettingKey, Error> {
    if (!key || key.trim().length === 0) {
      return failure(new Error('System setting key cannot be empty'));
    }
    
    // Check if it's a predefined key
    if (Object.values(SystemSettingKeyValue).includes(key as SystemSettingKeyValue)) {
      return failure(new Error('Cannot create custom key with predefined key name'));
    }
    
    // Enforce naming convention for custom keys
    const keyRegex = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;
    if (!keyRegex.test(key)) {
      return failure(new Error('Custom setting keys must be in UPPER_SNAKE_CASE format'));
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
  
  /**
   * Gets the expected value type for this setting key
   */
  public getValueType(): string {
    switch (this.props.value as SystemSettingKeyValue) {
      // Boolean settings
      case SystemSettingKeyValue.MFA_REQUIRED:
      case SystemSettingKeyValue.AUTO_MODERATION_ENABLED:
      case SystemSettingKeyValue.ADMIN_EMAIL_NOTIFICATIONS:
      case SystemSettingKeyValue.FEATURE_ADVANCED_ANALYTICS:
      case SystemSettingKeyValue.FEATURE_AI_RECOMMENDATIONS:
      case SystemSettingKeyValue.FEATURE_BULK_OPERATIONS:
        return 'BOOLEAN';
        
      // Numeric settings
      case SystemSettingKeyValue.PASSWORD_EXPIRATION_DAYS:
      case SystemSettingKeyValue.LOGIN_ATTEMPT_LIMIT:
      case SystemSettingKeyValue.SESSION_TIMEOUT_MINUTES:
      case SystemSettingKeyValue.AUTO_APPROVAL_THRESHOLD:
      case SystemSettingKeyValue.CACHE_DURATION_SECONDS:
      case SystemSettingKeyValue.API_RATE_LIMIT:
        return 'NUMBER';
        
      // Email list settings
      case SystemSettingKeyValue.ALERT_EMAIL_RECIPIENTS:
        return 'EMAIL_LIST';
        
      // Default to string for other settings
      default:
        // Check if it's a feature flag
        if (this.props.value.startsWith('FEATURE_')) {
          return 'BOOLEAN';
        }
        
        return 'STRING';
    }
  }
  
  toString(): string {
    return this.props.value;
  }
}

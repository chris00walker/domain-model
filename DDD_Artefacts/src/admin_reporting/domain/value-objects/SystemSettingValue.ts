import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';
import { SystemSettingKey, SystemSettingKeyValue } from './SystemSettingKey';

/**
 * Types of system setting values
 */
export enum SystemSettingValueType {
  BOOLEAN = 'BOOLEAN',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  JSON = 'JSON',
  EMAIL_LIST = 'EMAIL_LIST'
}

interface SystemSettingValueProps {
  value: string;
  type: SystemSettingValueType;
}

/**
 * SystemSettingValue Value Object
 * 
 * Represents values for system settings with type validation.
 */
export class SystemSettingValue extends ValueObject<SystemSettingValueProps> {
  
  get rawValue(): string {
    return this.props.value;
  }
  
  get type(): SystemSettingValueType {
    return this.props.type;
  }
  
  /**
   * Gets the typed value based on the setting type
   */
  get value(): boolean | number | string | object | string[] {
    switch (this.props.type) {
      case SystemSettingValueType.BOOLEAN:
        return this.props.value.toLowerCase() === 'true';
      case SystemSettingValueType.NUMBER:
        return Number(this.props.value);
      case SystemSettingValueType.JSON:
        try {
          return JSON.parse(this.props.value);
        } catch (e) {
          return {};
        }
      case SystemSettingValueType.EMAIL_LIST:
        return this.props.value.split(',').map(email => email.trim());
      case SystemSettingValueType.STRING:
      default:
        return this.props.value;
    }
  }
  
  private constructor(props: SystemSettingValueProps) {
    super(props);
  }
  
  /**
   * Creates a new setting value with appropriate validation based on the setting key
   */
  public static create(key: SystemSettingKey, value: string): Result<SystemSettingValue, Error> {
    if (value === undefined || value === null) {
      return failure(new Error('Setting value cannot be null or undefined'));
    }
    
    // Determine the expected type based on the key
    const type = this.getTypeForKey(key);
    
    // Validate value based on type
    switch (type) {
      case SystemSettingValueType.BOOLEAN:
        if (value.toLowerCase() !== 'true' && value.toLowerCase() !== 'false') {
          return failure(new Error('Boolean setting must be "true" or "false"'));
        }
        break;
        
      case SystemSettingValueType.NUMBER:
        if (isNaN(Number(value))) {
          return failure(new Error('Numeric setting must be a valid number'));
        }
        
        // Additional validation for specific numeric settings
        if (key.value === SystemSettingKeyValue.PASSWORD_EXPIRATION_DAYS) {
          const days = Number(value);
          if (days < 0 || days > 365) {
            return failure(new Error('Password expiration days must be between 0 and 365'));
          }
        } else if (key.value === SystemSettingKeyValue.AUTO_APPROVAL_THRESHOLD) {
          const threshold = Number(value);
          if (threshold < 0 || threshold > 1) {
            return failure(new Error('Approval threshold must be between 0 and 1'));
          }
        }
        break;
        
      case SystemSettingValueType.EMAIL_LIST:
        const emails = value.split(',').map(email => email.trim());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (const email of emails) {
          if (!emailRegex.test(email)) {
            return failure(new Error(`Invalid email format: ${email}`));
          }
        }
        break;
        
      case SystemSettingValueType.JSON:
        try {
          JSON.parse(value);
        } catch (e) {
          return failure(new Error('Invalid JSON format'));
        }
        break;
    }
    
    return success(new SystemSettingValue({ value, type }));
  }
  
  /**
   * Determines the appropriate type for a given setting key
   */
  private static getTypeForKey(key: SystemSettingKey): SystemSettingValueType {
    switch (key.value) {
      // Boolean settings
      case SystemSettingKeyValue.MFA_REQUIRED:
      case SystemSettingKeyValue.AUTO_MODERATION_ENABLED:
      case SystemSettingKeyValue.ADMIN_EMAIL_NOTIFICATIONS:
      case SystemSettingKeyValue.FEATURE_ADVANCED_ANALYTICS:
      case SystemSettingKeyValue.FEATURE_AI_RECOMMENDATIONS:
      case SystemSettingKeyValue.FEATURE_BULK_OPERATIONS:
        return SystemSettingValueType.BOOLEAN;
        
      // Numeric settings
      case SystemSettingKeyValue.PASSWORD_EXPIRATION_DAYS:
      case SystemSettingKeyValue.LOGIN_ATTEMPT_LIMIT:
      case SystemSettingKeyValue.SESSION_TIMEOUT_MINUTES:
      case SystemSettingKeyValue.AUTO_APPROVAL_THRESHOLD:
      case SystemSettingKeyValue.CACHE_DURATION_SECONDS:
      case SystemSettingKeyValue.API_RATE_LIMIT:
        return SystemSettingValueType.NUMBER;
        
      // Email list settings
      case SystemSettingKeyValue.ALERT_EMAIL_RECIPIENTS:
        return SystemSettingValueType.EMAIL_LIST;
        
      // Default to string for other settings
      default:
        // Check if it's a feature flag
        if (key.value.startsWith('FEATURE_')) {
          return SystemSettingValueType.BOOLEAN;
        }
        
        return SystemSettingValueType.STRING;
    }
  }
  
  toString(): string {
    return this.props.value;
  }
}

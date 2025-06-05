import { Result, success, failure } from '../../core/Result';

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validator interface for field-level validation
 */
export interface IValidator<T> {
  /**
   * Validate a value
   * @param value The value to validate
   * @returns Validation result
   */
  validate(value: T): ValidationResult;
}

/**
 * Validation rule interface
 */
export interface ValidationRule<T> {
  /**
   * Validate a value against this rule
   * @param value The value to validate
   * @param fieldName The field name for error reporting
   * @returns Array of validation errors, empty if valid
   */
  validate(value: T, fieldName: string): ValidationError[];
}

/**
 * Required validation rule
 */
export class RequiredRule<T> implements ValidationRule<T> {
  /**
   * Validate that a value is not null or undefined
   * @param value The value to validate
   * @param fieldName The field name for error reporting
   * @returns Array of validation errors, empty if valid
   */
  public validate(value: T, fieldName: string): ValidationError[] {
    if (value === null || value === undefined) {
      return [{
        field: fieldName,
        message: `${fieldName} is required`,
        code: 'REQUIRED'
      }];
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      return [{
        field: fieldName,
        message: `${fieldName} is required`,
        code: 'REQUIRED'
      }];
    }
    
    return [];
  }
}

/**
 * String length validation rule
 */
export class StringLengthRule implements ValidationRule<string> {
  constructor(
    private readonly min?: number,
    private readonly max?: number
  ) {}
  
  /**
   * Validate string length
   * @param value The string to validate
   * @param fieldName The field name for error reporting
   * @returns Array of validation errors, empty if valid
   */
  public validate(value: string, fieldName: string): ValidationError[] {
    if (value === null || value === undefined) {
      return [];
    }
    
    const errors: ValidationError[] = [];
    
    if (this.min !== undefined && value.length < this.min) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at least ${this.min} characters`,
        code: 'MIN_LENGTH',
        value
      });
    }
    
    if (this.max !== undefined && value.length > this.max) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at most ${this.max} characters`,
        code: 'MAX_LENGTH',
        value
      });
    }
    
    return errors;
  }
}

/**
 * Numeric range validation rule
 */
export class NumericRangeRule implements ValidationRule<number> {
  constructor(
    private readonly min?: number,
    private readonly max?: number
  ) {}
  
  /**
   * Validate numeric range
   * @param value The number to validate
   * @param fieldName The field name for error reporting
   * @returns Array of validation errors, empty if valid
   */
  public validate(value: number, fieldName: string): ValidationError[] {
    if (value === null || value === undefined) {
      return [];
    }
    
    const errors: ValidationError[] = [];
    
    if (this.min !== undefined && value < this.min) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at least ${this.min}`,
        code: 'MIN_VALUE',
        value
      });
    }
    
    if (this.max !== undefined && value > this.max) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at most ${this.max}`,
        code: 'MAX_VALUE',
        value
      });
    }
    
    return errors;
  }
}

/**
 * Pattern validation rule
 */
export class PatternRule implements ValidationRule<string> {
  constructor(
    private readonly pattern: RegExp,
    private readonly message: string
  ) {}
  
  /**
   * Validate string against pattern
   * @param value The string to validate
   * @param fieldName The field name for error reporting
   * @returns Array of validation errors, empty if valid
   */
  public validate(value: string, fieldName: string): ValidationError[] {
    if (value === null || value === undefined) {
      return [];
    }
    
    if (!this.pattern.test(value)) {
      return [{
        field: fieldName,
        message: this.message.replace('{field}', fieldName),
        code: 'PATTERN',
        value
      }];
    }
    
    return [];
  }
}

/**
 * Email validation rule
 */
export class EmailRule implements ValidationRule<string> {
  private readonly emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  /**
   * Validate email format
   * @param value The email to validate
   * @param fieldName The field name for error reporting
   * @returns Array of validation errors, empty if valid
   */
  public validate(value: string, fieldName: string): ValidationError[] {
    if (value === null || value === undefined) {
      return [];
    }
    
    if (!this.emailPattern.test(value)) {
      return [{
        field: fieldName,
        message: `${fieldName} must be a valid email address`,
        code: 'INVALID_EMAIL',
        value
      }];
    }
    
    return [];
  }
}

/**
 * Field validator for validating a single field
 */
export class FieldValidator<T> implements IValidator<T> {
  private readonly rules: ValidationRule<T>[] = [];
  private readonly fieldName: string;
  
  constructor(fieldName: string) {
    this.fieldName = fieldName;
  }
  
  /**
   * Add a validation rule
   * @param rule The rule to add
   * @returns This validator for chaining
   */
  public addRule(rule: ValidationRule<T>): FieldValidator<T> {
    this.rules.push(rule);
    return this;
  }
  
  /**
   * Add a required rule
   * @returns This validator for chaining
   */
  public required(): FieldValidator<T> {
    return this.addRule(new RequiredRule<T>());
  }
  
  /**
   * Validate a value against all rules
   * @param value The value to validate
   * @returns Validation result
   */
  public validate(value: T): ValidationResult {
    const errors: ValidationError[] = [];
    
    for (const rule of this.rules) {
      const ruleErrors = rule.validate(value, this.fieldName);
      errors.push(...ruleErrors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Object validator for validating an entire object
 */
export class ObjectValidator<T extends object> implements IValidator<T> {
  private readonly validators: Map<keyof T, IValidator<any>> = new Map();
  
  /**
   * Add a field validator
   * @param field The field to validate
   * @param validator The validator to use
   * @returns This validator for chaining
   */
  public addField<K extends keyof T>(field: K, validator: IValidator<T[K]>): ObjectValidator<T> {
    this.validators.set(field, validator);
    return this;
  }
  
  /**
   * Create a field validator for a field
   * @param field The field to validate
   * @returns A new field validator
   */
  public forField<K extends keyof T>(field: K): FieldValidator<T[K]> {
    const validator = new FieldValidator<T[K]>(field as string);
    this.addField(field, validator);
    return validator;
  }
  
  /**
   * Validate an object against all field validators
   * @param value The object to validate
   * @returns Validation result
   */
  public validate(value: T): ValidationResult {
    const errors: ValidationError[] = [];
    
    for (const [field, validator] of this.validators.entries()) {
      const fieldValue = value[field];
      const fieldResult = validator.validate(fieldValue);
      
      if (!fieldResult.isValid) {
        errors.push(...fieldResult.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Validation service for cross-cutting validation concerns
 */
export class ValidationService {
  /**
   * Create a validator for an object
   * @returns A new object validator
   */
  public createValidator<T extends object>(): ObjectValidator<T> {
    return new ObjectValidator<T>();
  }
  
  /**
   * Validate an object and return a Result
   * @param validator The validator to use
   * @param value The value to validate
   * @returns Result with value if valid, or error message if invalid
   */
  public validate<T>(validator: IValidator<T>, value: T): Result<T, ValidationError[]> {
    const result = validator.validate(value);
    
    if (result.isValid) {
      return success(value);
    }
    
    return failure(result.errors);
  }
  
  /**
   * Create common validators for reuse
   */
  public static createCommonValidators() {
    return {
      /**
       * Create an email validator
       * @param fieldName The field name
       * @param required Whether the field is required
       * @returns A field validator for emails
       */
      email(fieldName: string, required: boolean = true): FieldValidator<string> {
        const validator = new FieldValidator<string>(fieldName);
        
        if (required) {
          validator.addRule(new RequiredRule<string>());
        }
        
        validator.addRule(new EmailRule());
        
        return validator;
      },
      
      /**
       * Create a password validator
       * @param fieldName The field name
       * @returns A field validator for passwords
       */
      password(fieldName: string): FieldValidator<string> {
        return new FieldValidator<string>(fieldName)
          .addRule(new RequiredRule<string>())
          .addRule(new StringLengthRule(8, 100))
          .addRule(new PatternRule(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            '{field} must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
          ));
      },
      
      /**
       * Create a name validator
       * @param fieldName The field name
       * @param required Whether the field is required
       * @returns A field validator for names
       */
      name(fieldName: string, required: boolean = true): FieldValidator<string> {
        const validator = new FieldValidator<string>(fieldName);
        
        if (required) {
          validator.addRule(new RequiredRule<string>());
        }
        
        validator.addRule(new StringLengthRule(2, 100));
        
        return validator;
      },
      
      /**
       * Create a phone validator
       * @param fieldName The field name
       * @param required Whether the field is required
       * @returns A field validator for phone numbers
       */
      phone(fieldName: string, required: boolean = true): FieldValidator<string> {
        const validator = new FieldValidator<string>(fieldName);
        
        if (required) {
          validator.addRule(new RequiredRule<string>());
        }
        
        validator.addRule(new PatternRule(
          /^\+?[0-9]{10,15}$/,
          '{field} must be a valid phone number'
        ));
        
        return validator;
      }
    };
  }
}

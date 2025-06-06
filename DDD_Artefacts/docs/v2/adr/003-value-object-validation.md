---
title: Value Object Validation Pattern
status: accepted
date: 2025-06-06
deciders: DDD Implementation Team
---

# ADR-003: Value Object Validation Pattern

## Context

Value Objects are immutable objects that model domain concepts with no identity beyond their attributes. As an essential building block of our domain model, Value Objects need consistent validation to ensure they always represent valid domain states. Without a standardized approach to validation:

1. Business rules might be inconsistently applied across the codebase
2. Invalid domain states might be created, leading to bugs and data corruption
3. Validation error handling becomes unpredictable
4. Developer experience suffers from having to implement validation logic differently across Value Objects

Our domain has numerous Value Objects (Money, ProductCode, EmailAddress, etc.) each with specific validation rules that must be enforced at creation time.

## Decision

We will implement a standardized Value Object validation pattern with the following characteristics:

1. **Creation-time validation**: All Value Objects validate their inputs during construction
2. **Self-validation**: Value Objects contain their own validation logic
3. **No invalid state**: It should be impossible to create an invalid Value Object
4. **Domain-specific errors**: Validation failures throw specific domain error types
5. **Descriptive error messages**: Error messages use the ubiquitous language and provide clear guidance
6. **Factory methods**: Named factory methods for specific creation scenarios

### Implementation Pattern

```typescript
export class EmailAddress {
  private readonly value: string;
  
  private constructor(email: string) {
    this.value = email;
  }
  
  public static create(email: string): EmailAddress {
    EmailAddress.validate(email);
    return new EmailAddress(email);
  }
  
  private static validate(email: string): void {
    if (!email) {
      throw new InvalidEmailError('Email address cannot be empty');
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new InvalidEmailError(`"${email}" is not a valid email address format`);
    }
    
    // Additional domain-specific validations
    const [local, domain] = email.split('@');
    if (local.length > 64) {
      throw new InvalidEmailError('Email local part cannot exceed 64 characters');
    }
    
    if (domain.length > 255) {
      throw new InvalidEmailError('Email domain cannot exceed 255 characters');
    }
  }
  
  public toString(): string {
    return this.value;
  }
  
  public equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }
  
  // Domain-specific factory methods
  public static fromCorporateDirectory(username: string): EmailAddress {
    return EmailAddress.create(`${username}@eliasfoodimports.com`);
  }
}

// Domain-specific error types
export class InvalidEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEmailError';
  }
}
```

## Consequences

### Positive

1. **Consistency**: All Value Objects follow the same validation pattern
2. **No invalid state**: Domain invariants are enforced at object creation time
3. **Self-documentation**: The code clearly documents validation rules for each Value Object
4. **Testability**: Value Object validation can be tested independently
5. **Domain-driven errors**: Error types and messages reflect the domain language
6. **Developer experience**: Clear pattern makes it easy to implement new Value Objects

### Negative

1. **Verbosity**: More code is required compared to simple value types
2. **Learning curve**: Developers need to understand the pattern
3. **Error handling**: Requires consistent error handling throughout the application

## Implementation Examples

### Money Value Object

```typescript
export class Money {
  private readonly amount: number;
  private readonly currency: string;
  
  private constructor(amount: number, currency: string) {
    this.amount = amount;
    this.currency = currency;
  }
  
  public static create(amount: number, currency: string): Money {
    Money.validate(amount, currency);
    return new Money(amount, currency);
  }
  
  private static validate(amount: number, currency: string): void {
    if (isNaN(amount)) {
      throw new InvalidMoneyError('Amount must be a number');
    }
    
    // Amount must be specified with correct precision
    if (amount * 100 % 1 !== 0) {
      throw new InvalidMoneyError('Amount cannot have more than 2 decimal places');
    }
    
    if (!currency) {
      throw new InvalidMoneyError('Currency code is required');
    }
    
    const currencyRegex = /^[A-Z]{3}$/;
    if (!currencyRegex.test(currency)) {
      throw new InvalidMoneyError(`"${currency}" is not a valid ISO currency code`);
    }
  }
  
  public getAmount(): number {
    return this.amount;
  }
  
  public getCurrency(): string {
    return this.currency;
  }
  
  public equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
  
  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new InvalidMoneyOperationError('Cannot add Money values with different currencies');
    }
    
    return Money.create(this.amount + other.amount, this.currency);
  }
  
  // Additional operations...
}

export class InvalidMoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMoneyError';
  }
}

export class InvalidMoneyOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMoneyOperationError';
  }
}
```

### ProductCode Value Object

```typescript
export class ProductCode {
  private static readonly FORMAT_REGEX = /^EFI-[A-Z]{2}-\d{6}$/;
  private readonly value: string;
  
  private constructor(code: string) {
    this.value = code;
  }
  
  public static create(code: string): ProductCode {
    ProductCode.validate(code);
    return new ProductCode(code);
  }
  
  private static validate(code: string): void {
    if (!code) {
      throw new InvalidProductCodeError('Product code cannot be empty');
    }
    
    if (!ProductCode.FORMAT_REGEX.test(code)) {
      throw new InvalidProductCodeError(
        `"${code}" does not match product code format EFI-XX-000000`
      );
    }
    
    const countryCode = code.substring(4, 6);
    if (!ProductCode.isValidCountryCode(countryCode)) {
      throw new InvalidProductCodeError(
        `"${countryCode}" is not a valid country code for product origination`
      );
    }
  }
  
  private static isValidCountryCode(code: string): boolean {
    const validCountryCodes = ['IT', 'FR', 'ES', 'GR', 'MX', 'JP', 'IN', 'TH', 'VN', 'MA'];
    return validCountryCodes.includes(code);
  }
  
  public toString(): string {
    return this.value;
  }
  
  public equals(other: ProductCode): boolean {
    return this.value === other.value;
  }
  
  public getCountryOfOrigin(): string {
    return this.value.substring(4, 6);
  }
}

export class InvalidProductCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidProductCodeError';
  }
}
```

## Testing Approach

Value Objects should be thoroughly tested, particularly their validation rules:

```typescript
describe('EmailAddress Value Object', () => {
  it('should create a valid email address', () => {
    const email = EmailAddress.create('test@example.com');
    expect(email.toString()).toBe('test@example.com');
  });
  
  it('should throw InvalidEmailError for empty email', () => {
    expect(() => EmailAddress.create('')).toThrow(InvalidEmailError);
    expect(() => EmailAddress.create('')).toThrow('Email address cannot be empty');
  });
  
  it('should throw InvalidEmailError for invalid format', () => {
    expect(() => EmailAddress.create('invalid-email')).toThrow(InvalidEmailError);
    expect(() => EmailAddress.create('invalid-email')).toThrow(
      '"invalid-email" is not a valid email address format'
    );
  });
  
  it('should create email from corporate directory', () => {
    const email = EmailAddress.fromCorporateDirectory('john.smith');
    expect(email.toString()).toBe('john.smith@eliasfoodimports.com');
  });
  
  // Additional tests...
});
```

## References

- Evans, Eric. Domain-Driven Design: Tackling Complexity in the Heart of Software.
- Vernon, Vaughn. Implementing Domain-Driven Design.
- Cockburn, Alistair. Hexagonal Architecture.

---

*This ADR establishes the patterns for implementing Value Objects with robust validation in our domain model. All Value Object implementations should follow this pattern to ensure consistency and data integrity.*

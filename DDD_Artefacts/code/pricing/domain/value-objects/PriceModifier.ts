import { ValueObject } from '@shared/domain/base/ValueObject';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { Money } from '@shared/domain/value-objects/Money';
import { DiscountPercentage } from './DiscountPercentage';

export enum PriceModifierType {
  PERCENTAGE_DISCOUNT = 'PERCENTAGE_DISCOUNT',
  FIXED_DISCOUNT = 'FIXED_DISCOUNT',
  PERCENTAGE_SURCHARGE = 'PERCENTAGE_SURCHARGE',
  FIXED_SURCHARGE = 'FIXED_SURCHARGE'
}

interface PriceModifierProps {
  type: PriceModifierType;
  name: string;
  description: string;
  value: number; // Either percentage or fixed amount depending on type
  currency?: string; // Required for fixed types
  priority: number; // Used to determine order of application when multiple modifiers exist
}

export class PriceModifier extends ValueObject<PriceModifierProps> {
  get type(): PriceModifierType {
    return this.props.type;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get value(): number {
    return this.props.value;
  }

  get currency(): string | undefined {
    return this.props.currency;
  }

  get priority(): number {
    return this.props.priority;
  }

  private constructor(props: PriceModifierProps) {
    super(props);
  }

  public static createPercentageDiscount(
    name: string,
    description: string,
    percentageValue: number,
    priority: number = 0
  ): Result<PriceModifier, string> {
    const discountResult = DiscountPercentage.create(percentageValue);
    if (discountResult.isFailure()) {
      return failure(discountResult.error);
    }

    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: name, argumentName: 'name' },
      { argument: description, argumentName: 'description' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    return success(
      new PriceModifier({
        type: PriceModifierType.PERCENTAGE_DISCOUNT,
        name,
        description,
        value: percentageValue,
        priority
      })
    );
  }

  public static createFixedDiscount(
    name: string,
    description: string,
    amount: number,
    currency: string,
    priority: number = 0
  ): Result<PriceModifier, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: name, argumentName: 'name' },
      { argument: description, argumentName: 'description' },
      { argument: amount, argumentName: 'amount' },
      { argument: currency, argumentName: 'currency' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (amount <= 0) {
      return failure('Fixed discount amount must be positive');
    }

    return success(
      new PriceModifier({
        type: PriceModifierType.FIXED_DISCOUNT,
        name,
        description,
        value: amount,
        currency,
        priority
      })
    );
  }

  public static createPercentageSurcharge(
    name: string,
    description: string,
    percentageValue: number,
    priority: number = 0
  ): Result<PriceModifier, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: name, argumentName: 'name' },
      { argument: description, argumentName: 'description' },
      { argument: percentageValue, argumentName: 'percentageValue' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (percentageValue <= 0 || percentageValue > 100) {
      return failure('Percentage surcharge must be between 0 and 100');
    }

    return success(
      new PriceModifier({
        type: PriceModifierType.PERCENTAGE_SURCHARGE,
        name,
        description,
        value: percentageValue,
        priority
      })
    );
  }

  public static createFixedSurcharge(
    name: string,
    description: string,
    amount: number,
    currency: string,
    priority: number = 0
  ): Result<PriceModifier, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: name, argumentName: 'name' },
      { argument: description, argumentName: 'description' },
      { argument: amount, argumentName: 'amount' },
      { argument: currency, argumentName: 'currency' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (amount <= 0) {
      return failure('Fixed surcharge amount must be positive');
    }

    return success(
      new PriceModifier({
        type: PriceModifierType.FIXED_SURCHARGE,
        name,
        description,
        value: amount,
        currency,
        priority
      })
    );
  }

  /**
   * Applies this price modifier to a Money object
   * @param price The price to modify
   * @returns The modified price or error
   */
  public applyToPrice(price: Money): Result<Money, string> {
    if (!price) {
      return failure('Price cannot be null or undefined');
    }

    switch (this.props.type) {
      case PriceModifierType.PERCENTAGE_DISCOUNT: {
        const multiplier = 1 - (this.props.value / 100);
        return price.multiply(multiplier);
      }
      
      case PriceModifierType.FIXED_DISCOUNT: {
        if (!this.props.currency) {
          return failure('Currency is required for fixed discount');
        }
        
        if (this.props.currency !== price.currency) {
          return failure(`Currency mismatch: price is in ${price.currency} but discount is in ${this.props.currency}`);
        }
        
        const discountMoney = Money.create(this.props.value, this.props.currency);
        if (discountMoney.isFailure()) {
          return failure(`Failed to create discount money: ${discountMoney.error}`);
        }
        
        return price.subtract(discountMoney.value);
      }
      
      case PriceModifierType.PERCENTAGE_SURCHARGE: {
        const multiplier = 1 + (this.props.value / 100);
        return price.multiply(multiplier);
      }
      
      case PriceModifierType.FIXED_SURCHARGE: {
        if (!this.props.currency) {
          return failure('Currency is required for fixed surcharge');
        }
        
        if (this.props.currency !== price.currency) {
          return failure(`Currency mismatch: price is in ${price.currency} but surcharge is in ${this.props.currency}`);
        }
        
        const surchargeMoney = Money.create(this.props.value, this.props.currency);
        if (surchargeMoney.isFailure()) {
          return failure(`Failed to create surcharge money: ${surchargeMoney.error}`);
        }
        
        return price.add(surchargeMoney.value);
      }
      
      default:
        return failure(`Unknown price modifier type: ${this.props.type}`);
    }
  }

  public isDiscount(): boolean {
    return this.props.type === PriceModifierType.PERCENTAGE_DISCOUNT || 
           this.props.type === PriceModifierType.FIXED_DISCOUNT;
  }

  public isSurcharge(): boolean {
    return this.props.type === PriceModifierType.PERCENTAGE_SURCHARGE || 
           this.props.type === PriceModifierType.FIXED_SURCHARGE;
  }

  public isPercentage(): boolean {
    return this.props.type === PriceModifierType.PERCENTAGE_DISCOUNT || 
           this.props.type === PriceModifierType.PERCENTAGE_SURCHARGE;
  }

  public isFixed(): boolean {
    return this.props.type === PriceModifierType.FIXED_DISCOUNT || 
           this.props.type === PriceModifierType.FIXED_SURCHARGE;
  }

  public toString(): string {
    switch (this.props.type) {
      case PriceModifierType.PERCENTAGE_DISCOUNT:
        return `${this.props.name}: ${this.props.value}% discount`;
      case PriceModifierType.FIXED_DISCOUNT:
        return `${this.props.name}: ${this.props.currency} ${this.props.value} discount`;
      case PriceModifierType.PERCENTAGE_SURCHARGE:
        return `${this.props.name}: ${this.props.value}% surcharge`;
      case PriceModifierType.FIXED_SURCHARGE:
        return `${this.props.name}: ${this.props.currency} ${this.props.value} surcharge`;
      default:
        return `${this.props.name}: Unknown modifier`;
    }
  }
}

import { ValueObject } from './ValueObject';
import { Result, success, failure } from '../core/Result';
import { Guard } from '../core/Guard';

export interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  private static VALID_CURRENCIES = ['BBD', 'USD', 'EUR', 'GBP', 'BRL'];
  private static DECIMAL_PLACES = 2;
  private static ROUNDING = Math.pow(10, Money.DECIMAL_PLACES);

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  private static round(amount: number): number {
    return Math.round(amount * Money.ROUNDING) / Money.ROUNDING;
  }

  public add(money: Money): Result<Money, string> {
    this.assertSameCurrency(money);
    const newAmount = Money.round(this.amount + money.amount);
    return Money.create(newAmount, this.currency);
  }

  public subtract(money: Money): Result<Money, string> {
    this.assertSameCurrency(money);
    const newAmount = Money.round(this.amount - money.amount);
    return Money.create(newAmount, this.currency);
  }

  public multiply(multiplier: number): Result<Money, string> {
    const newAmount = Money.round(this.amount * multiplier);
    return Money.create(newAmount, this.currency);
  }

  public divide(divisor: number): Result<Money, string> {
    if (divisor === 0) {
      return failure('Division by zero');
    }
    const newAmount = Money.round(this.amount / divisor);
    return Money.create(newAmount, this.currency);
  }

  public isPositive(): boolean {
    return this.amount > 0;
  }

  public isNegative(): boolean {
    return this.amount < 0;
  }

  public isZero(): boolean {
    return this.amount === 0;
  }

  public equals(money: Money): boolean {
    return (
      this.currency === money.currency &&
      this.amount === money.amount
    );
  }

  public toJSON(): MoneyProps {
    return {
      amount: this.amount,
      currency: this.currency
    };
  }

  public toString(): string {
    return `${this.currency} ${this.amount.toFixed(Money.DECIMAL_PLACES)}`;
  }

  private assertSameCurrency(money: Money): void {
    if (this.currency !== money.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${money.currency}`);
    }
  }

  public static create(amount: number, currency: string): Result<Money, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: amount, argumentName: 'amount' },
      { argument: currency, argumentName: 'currency' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (!Number.isFinite(amount)) {
      return failure('Amount must be a finite number');
    }

    if (typeof currency !== 'string' || currency.trim().length === 0) {
      return failure('Currency must be a non-empty string');
    }

    if (!this.VALID_CURRENCIES.includes(currency)) {
      return failure(
        `Invalid currency. Must be one of: ${this.VALID_CURRENCIES.join(', ')}`
      );
    }

    // Round to avoid floating point precision issues
    const roundedAmount = this.round(amount);

    return success(
      new Money({
        amount: roundedAmount,
        currency: currency.toUpperCase()
      })
    );
  }

  public static zero(currency: string = 'BBD'): Money {
    return new Money({
      amount: 0,
      currency: currency.toUpperCase()
    });
  }
}

// src/shared/value-objects/Money.ts
export class Money {
  readonly value: number;
  readonly currency: string;

  constructor(value: number, currency: string) {
    if (value < 0) throw new Error('Amount cannot be negative');
    this.value = value;
    this.currency = currency;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.value + other.value, this.currency);
  }

  private assertSameCurrency(other: Money) {
    if (this.currency !== other.currency) {
      throw new Error('Currency mismatch');
    }
  }
}

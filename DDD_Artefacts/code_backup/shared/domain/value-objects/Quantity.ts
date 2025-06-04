import { ValueObject } from '../base/ValueObject';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

export enum UnitOfMeasure {
  PIECE = 'PIECE',
  GRAM = 'GRAM',
  KILOGRAM = 'KILOGRAM',
  MILLILITER = 'MILLILITER',
  LITER = 'LITER',
  POUND = 'POUND',
  OUNCE = 'OUNCE'
}

interface QuantityProps {
  value: number;
  unit: UnitOfMeasure;
}

/**
 * Quantity Value Object
 * 
 * Represents a measurement quantity with a value and unit of measure.
 * 
 * Invariants:
 * - Quantity value must be non-negative
 * - Quantity unit must be a valid UnitOfMeasure
 */
export class Quantity extends ValueObject<QuantityProps> {
  get value(): number {
    return this.props.value;
  }

  get unit(): UnitOfMeasure {
    return this.props.unit;
  }

  private constructor(props: QuantityProps) {
    super(props);
  }

  public static create(value: number, unit: UnitOfMeasure): Result<Quantity, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: value, argumentName: 'value' },
      { argument: unit, argumentName: 'unit' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (value < 0) {
      return failure('Quantity value cannot be negative');
    }

    if (!Object.values(UnitOfMeasure).includes(unit)) {
      return failure(`Invalid unit of measure: ${unit}`);
    }

    return success(new Quantity({ value, unit }));
  }

  public add(quantity: Quantity): Result<Quantity, string> {
    if (this.unit !== quantity.unit) {
      return failure(`Cannot add quantities with different units: ${this.unit} and ${quantity.unit}`);
    }

    return Quantity.create(this.value + quantity.value, this.unit);
  }

  public subtract(quantity: Quantity): Result<Quantity, string> {
    if (this.unit !== quantity.unit) {
      return failure(`Cannot subtract quantities with different units: ${this.unit} and ${quantity.unit}`);
    }

    const newValue = this.value - quantity.value;
    if (newValue < 0) {
      return failure('Quantity cannot be negative after subtraction');
    }

    return Quantity.create(newValue, this.unit);
  }

  public multiply(multiplier: number): Result<Quantity, string> {
    if (multiplier < 0) {
      return failure('Multiplier cannot be negative');
    }

    return Quantity.create(this.value * multiplier, this.unit);
  }

  public isZero(): boolean {
    return this.value === 0;
  }

  public isPositive(): boolean {
    return this.value > 0;
  }

  public toString(): string {
    return `${this.value} ${this.unit}`;
  }

  public equals(vo?: ValueObject<QuantityProps>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (!(vo instanceof Quantity)) {
      return false;
    }
    return this.value === vo.value && this.unit === vo.unit;
  }
}

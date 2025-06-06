import { ValueObject } from '@shared/domain/base/ValueObject';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

interface PaymentIdProps {
  value: string;
}

export class PaymentId extends ValueObject<PaymentIdProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: PaymentIdProps) {
    super(props);
  }

  public static create(id?: string): Result<PaymentId, string> {
    const value = id ?? new UniqueEntityID().toString();
    const guardResult = Guard.againstNullOrUndefined(value, 'paymentId');
    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }
    return success(new PaymentId({ value }));
  }

  public equals(vo?: ValueObject<PaymentIdProps>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (!(vo instanceof PaymentId)) {
      return false;
    }
    return this.value === vo.value;
  }
}

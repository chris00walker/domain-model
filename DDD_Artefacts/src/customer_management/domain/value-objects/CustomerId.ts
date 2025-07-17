import { ValueObject } from '../../../shared/domain/base/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';

interface CustomerIdProps {
  value: string;
}

export class CustomerId extends ValueObject<CustomerIdProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: CustomerIdProps) {
    super(props);
  }

  public static create(id: string): Result<CustomerId, string> {
    const guardResult = Guard.againstNullOrUndefined(id, 'customerId');
    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    return success(new CustomerId({ value: id }));
  }
}

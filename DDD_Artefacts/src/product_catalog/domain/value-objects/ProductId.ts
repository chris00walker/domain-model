import { ValueObject } from '../../../shared/domain/base/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';

interface ProductIdProps {
  value: string;
}

export class ProductId extends ValueObject<ProductIdProps> {
  get value(): string {
    return (this as any).props.value;
  }

  private constructor(props: ProductIdProps) {
    super(props);
  }

  public static create(id: string): Result<ProductId, string> {
    const guardResult = Guard.againstNullOrUndefined(id, 'productId');
    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    return success(new ProductId({ value: id }));
  }

  public equals(vo?: ValueObject<ProductIdProps>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (!(vo instanceof ProductId)) {
      return false;
    }
    return this.value === vo.value;
  }
}

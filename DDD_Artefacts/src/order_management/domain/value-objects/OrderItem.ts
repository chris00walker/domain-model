import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';
import { Money } from '../../../shared/domain/value-objects/Money';
// Note: ProductId import commented out as catalog context may not exist
// import { ProductId } from '../../../catalog/domain/value-objects/ProductId';

// Temporary ProductId type definition until catalog context is available
type ProductId = string;

export interface OrderItemProps {
  productId: ProductId;
  name: string;
  price: Money;
  quantity: number;
  sku: string;
  imageUrl?: string;
}

export class OrderItem extends ValueObject<OrderItemProps> {
  constructor(props: OrderItemProps) {
    super(props);
  }

  get productId(): ProductId {
    return this.props.productId;
  }

  get name(): string {
    return this.props.name;
  }

  get price(): Money {
    return this.props.price;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get sku(): string {
    return this.props.sku;
  }

  get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }

  public updateQuantity(quantity: number): Result<void, string> {
    if (quantity <= 0) {
      return failure('Quantity must be greater than 0');
    }
    
    this.props.quantity = quantity;
    return success(undefined);
  }

  public calculateTotal(): Result<Money, string> {
    return this.price.multiply(this.quantity);
  }

  public equals(vo?: ValueObject<OrderItemProps>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (!(vo instanceof OrderItem)) {
      return false;
    }
    return this.productId === vo.productId;
  }

  public static create(props: OrderItemProps): Result<OrderItem, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.productId, argumentName: 'productId' },
      { argument: props.name, argumentName: 'name' },
      { argument: props.price, argumentName: 'price' },
      { argument: props.quantity, argumentName: 'quantity' },
      { argument: props.sku, argumentName: 'sku' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.quantity <= 0) {
      return failure('Quantity must be greater than 0');
    }

    if (props.price.isNegative()) {
      return failure('Price cannot be negative');
    }

    return success(
      new OrderItem({
        ...props
      })
    );
  }
}

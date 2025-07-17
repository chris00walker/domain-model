import { ValueObject } from '../../../shared/domain/base/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';
// Temporary string type until catalog context is available
type ProductId = string;
import { Money } from '../../../shared/domain/value-objects/Money';

interface SubscriptionItemProps {
  productId: ProductId;
  name: string;
  price: Money;
  quantity: number;
  sku: string;
  imageUrl?: string;
  isSubstitutable: boolean;
  substitutionPreferences?: string[];
}

export class SubscriptionItem extends ValueObject<SubscriptionItemProps> {
  constructor(props: SubscriptionItemProps) {
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

  get isSubstitutable(): boolean {
    return this.props.isSubstitutable;
  }

  get substitutionPreferences(): string[] | undefined {
    return this.props.substitutionPreferences ? [...this.props.substitutionPreferences] : undefined;
  }

  public updateQuantity(quantity: number): Result<SubscriptionItem, string> {
    if (quantity <= 0) {
      return failure('Quantity must be greater than 0');
    }
    
    // Create a new instance with updated quantity to maintain value object immutability
    return SubscriptionItem.create({
      ...this.props,
      quantity: quantity
    });
  }

  public updateSubstitutionPreferences(isSubstitutable: boolean, preferences?: string[]): Result<SubscriptionItem, string> {
    // Create a new instance with updated preferences to maintain value object immutability
    return SubscriptionItem.create({
      ...this.props,
      isSubstitutable: isSubstitutable,
      substitutionPreferences: preferences
    });
  }

  public calculateTotal(): Money {
    const multiplyResult = this.price.multiply(this.quantity);
    if (multiplyResult.isFailure()) {
      throw new Error(`Failed to calculate total: ${multiplyResult.error}`);
    }
    return multiplyResult.value;
  }

  public equals(vo?: ValueObject<SubscriptionItemProps>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    
    if (!(vo instanceof SubscriptionItem)) {
      return false;
    }
    
    return this.productId === vo.productId;
  }

  public static create(props: SubscriptionItemProps): Result<SubscriptionItem, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.productId, argumentName: 'productId' },
      { argument: props.name, argumentName: 'name' },
      { argument: props.price, argumentName: 'price' },
      { argument: props.quantity, argumentName: 'quantity' },
      { argument: props.sku, argumentName: 'sku' },
      { argument: props.isSubstitutable, argumentName: 'isSubstitutable' }
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
      new SubscriptionItem({
        ...props
      })
    );
  }
}

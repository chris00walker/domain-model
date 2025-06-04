import { AggregateRoot } from '@shared/domain/base/AggregateRoot';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { ProductId } from '../value-objects/ProductId';
import { Money } from '@shared/domain/value-objects/Money';
import { ProductCreated, InventoryAdjusted, PriceChanged } from '../events';
import { Clock, SystemClock } from '@shared/domain/Clock';

/**
 * Invariants:
 * - Product must have a valid name, description, and price
 * - Product.inventoryCount must be >= 0
 * - Product.price must be a valid Money value object with amount > 0
 * - Product price changes must publish a PriceChanged event
 * - Product inventory adjustments must publish an InventoryAdjusted event
 * - Product can be marked as discontinued but not deleted
 */
interface ProductProps {
  name: string;
  description: string;
  price: Money;
  inventoryCount: number;
  isDiscontinued: boolean;
  qrProvenanceUrl?: string;
  categoryIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends AggregateRoot<ProductProps> {
  private constructor(props: ProductProps, id?: UniqueEntityID) {
    super(props, id);
  }

  /**
   * Factory method to create a new Product aggregate
   * Enforces invariants and business rules
   * @param props Product properties
   * @param id Optional unique entity ID
   * @param clock Clock implementation for time-dependent operations
   */
  public static create(
    props: Omit<ProductProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
    clock: Clock = new SystemClock()
  ): Result<Product, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.description, argumentName: 'description' },
      { argument: props.price, argumentName: 'price' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.inventoryCount < 0) {
      return failure('Product inventory count cannot be negative');
    }

    if (!props.price.isPositive()) {
      return failure('Product price must be greater than zero');
    }

    const now = clock.now();
    const product = new Product({
      ...props,
      isDiscontinued: props.isDiscontinued ?? false,
      createdAt: now,
      updatedAt: now
    }, id);

    // Emit domain event for product creation
    const isNewProduct = !id;
    if (isNewProduct) {
      product.addDomainEvent(new ProductCreated(product));
    }

    return success(product);
  }

  /**
   * Adjusts the inventory count by the specified delta
   * Enforces inventory count >= 0 invariant
   * @param delta Amount to adjust inventory by
   * @param clock Clock implementation for time-dependent operations
   */
  public adjustInventory(delta: number, clock: Clock = new SystemClock()): Result<void, string> {
    const previousCount = this.props.inventoryCount;
    const newCount = previousCount + delta;
    
    if (newCount < 0) {
      return failure('Inventory adjustment would result in negative inventory');
    }
    
    this.props.inventoryCount = newCount;
    this.props.updatedAt = clock.now();
    
    // Emit domain event for inventory adjustment
    this.addDomainEvent(new InventoryAdjusted(this, previousCount, delta));
    
    return success(undefined);
  }

  /**
   * Changes the product price
   * Enforces price > 0 invariant
   * @param newPrice New price for the product
   * @param clock Clock implementation for time-dependent operations
   */
  public changePrice(newPrice: Money, clock: Clock = new SystemClock()): Result<void, string> {
    if (!newPrice.isPositive()) {
      return failure('Product price must be greater than zero');
    }

    const previousPrice = this.props.price;
    this.props.price = newPrice;
    this.props.updatedAt = clock.now();
    
    // Emit domain event for price change
    this.addDomainEvent(new PriceChanged(this, previousPrice));
    
    return success(undefined);
  }

  /**
   * Discontinues the product
   * @param clock Clock implementation for time-dependent operations
   */
  public discontinue(clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.isDiscontinued) {
      return failure('Product is already discontinued');
    }
    
    this.props.isDiscontinued = true;
    this.props.updatedAt = clock.now();
    
    return success(undefined);
  }

  /**
   * Reactivates a discontinued product
   * @param clock Clock implementation for time-dependent operations
   */
  public reactivate(clock: Clock = new SystemClock()): Result<void, string> {
    if (!this.props.isDiscontinued) {
      return failure('Product is not discontinued');
    }
    
    this.props.isDiscontinued = false;
    this.props.updatedAt = clock.now();
    
    return success(undefined);
  }

  get productId(): ProductId {
    const result = ProductId.create(this.id);
    if (result.isSuccess()) {
      return result.value;
    }
    throw new Error(`Failed to create ProductId: ${result.error}`);
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get price(): Money {
    return this.props.price;
  }

  get inventoryCount(): number {
    return this.props.inventoryCount;
  }

  get isDiscontinued(): boolean {
    return this.props.isDiscontinued;
  }

  get qrProvenanceUrl(): string | undefined {
    return this.props.qrProvenanceUrl;
  }

  get categoryIds(): string[] | undefined {
    return this.props.categoryIds ? [...this.props.categoryIds] : undefined;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}

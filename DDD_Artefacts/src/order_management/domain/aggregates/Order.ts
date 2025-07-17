import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result, success, failure } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';
import { DomainEvent } from '../../../shared/domain/events/DomainEvent';
import { OrderCreated } from '../events/OrderCreated';
import { OrderPaid } from '../events/OrderPaid';
import { OrderFulfilled } from '../events/OrderFulfilled';
import { OrderStatus } from '../value-objects/OrderStatus';
import { OrderItem } from '../value-objects/OrderItem';
import { CustomerId } from '../../../customer_management/domain/value-objects/CustomerId';
import { Money } from '../../../shared/domain/value-objects/Money';
import { Clock, SystemClock } from '../../../shared/domain/Clock';

export interface OrderProps {
  customerId: CustomerId;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: string;
  billingAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Invariants:
 * - Order must have a valid customerId
 * - Order must have a valid shipping and billing address
 * - Order items collection can be empty or contain valid OrderItems
 * - Order status transitions must follow the state machine pattern:
 *   * Created -> Paid -> Processing -> Fulfilled
 *   * Created, Paid, Processing can transition to Cancelled
 *   * Fulfilled and Cancelled are terminal states
 * - Order.updatedAt must be updated on any state change
 * - Order can only be cancelled if in Created, Paid, or Processing state
 * - Items in order must have unique productIds (no duplicates)
 */
export class Order extends AggregateRoot<OrderProps> {
  private constructor(props: OrderProps, id?: UniqueEntityID) {
    super(props, id);
  }

  // Access props directly from parent class - no need for getter

  // Public getter for id
  public get id(): string {
    return super.id;
  }

  // Add domain event method
  public addDomainEvent(event: DomainEvent): void {
    super.addDomainEvent(event);
  }

  public static create(props: OrderProps, id?: UniqueEntityID, clock: Clock = new SystemClock()): Result<Order, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.customerId, argumentName: 'customerId' },
      { argument: props.shippingAddress, argumentName: 'shippingAddress' },
      { argument: props.billingAddress, argumentName: 'billingAddress' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    const isNewOrder = !id;
    const now = clock.now();
    const order = new Order(
      {
        ...props,
        status: isNewOrder ? OrderStatus.Created : props.status,
        createdAt: isNewOrder ? now : props.createdAt,
        updatedAt: now
      },
      id
    );

    if (isNewOrder) {
      order.addDomainEvent(new OrderCreated(order));
    }

    return success(order);
  }

  public addItem(item: OrderItem, clock: Clock = new SystemClock()): Result<void, string> {
    const itemExists = this.props.items.some(i => i.productId === item.productId);
    
    if (itemExists) {
      return failure('Item already exists in order');
    }

    this.props.items.push(item);
    this.props.updatedAt = clock.now();
    return success(undefined);
  }

  public removeItem(productId: string, clock: Clock = new SystemClock()): Result<void, string> {
    const itemIndex = this.props.items.findIndex(item => 
      item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return failure('Item not found in order');
    }

    this.props.items.splice(itemIndex, 1);
    this.props.updatedAt = clock.now();
    return success(undefined);
  }

  public calculateTotal(): Result<Money, string> {
    // Start with zero money
    let runningTotal = Money.zero('BBD');
    
    // Calculate total by summing up all items
    for (const item of this.props.items) {
      // Get item total (price × quantity)
      const itemTotal = item.calculateTotal();
      if (itemTotal.isFailure()) {
        return failure(`Error calculating item total: ${itemTotal.getErrorValue()}`);
      }
      
      // Add to running total
      const addResult = runningTotal.add(itemTotal.getValue());
      if (addResult.isFailure()) {
        return failure(`Error calculating total: ${addResult.getErrorValue()}`);
      }
      runningTotal = addResult.getValue();
    }
    
    return success(runningTotal);
  }

  public confirmPayment(clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status !== OrderStatus.Created) {
      return failure('Only pending orders can be confirmed');
    }

    this.props.status = OrderStatus.Paid;
    this.props.updatedAt = clock.now();
  
    // Add domain event for payment confirmation
    // Create OrderPaid event with the required parameters
    const orderTotalResult = this.calculateTotal();
    const amount = orderTotalResult.isSuccess() ? orderTotalResult.getValue().amount : 0;
    
    this.addDomainEvent(new OrderPaid(
      this.id.toString(), 
      `payment-${this.id.toString().substring(0, 8)}`, // Generate a mock payment ID
      amount,
      'BBD', // Default currency
      clock.now()
    ));
  
    return success(undefined);
  }

  public fulfill(clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status !== OrderStatus.Paid) {
      return failure('Only paid orders can be fulfilled');
    }

    this.props.status = OrderStatus.Fulfilled;
    this.props.updatedAt = clock.now();
  
    // Add domain event for order fulfillment
    this.addDomainEvent(new OrderFulfilled(this.id.toString(), clock.now()));
  
    return success(undefined);
  }

  public cancel(reason: string, clock: Clock = new SystemClock()): Result<void, string> {
    if (!this.canBeCancelled()) {
      return failure('Order cannot be cancelled in its current state');
    }

    this.props.status = OrderStatus.Cancelled;
    this.props.updatedAt = clock.now();
    // TODO: Add cancellation reason to domain event
    return success(undefined);
  }

  private canBeCancelled(): boolean {
    return [
      OrderStatus.Created,
      OrderStatus.Paid,
      OrderStatus.Processing
    ].includes(this.props.status);
  }

  get orderId(): string {
    return this._id.toString();
  }

  get customerId(): CustomerId {
    return this.props.customerId;
  }

  get items(): OrderItem[] {
    return [...this.props.items];
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get shippingAddress(): string {
    return this.props.shippingAddress;
  }

  get billingAddress(): string {
    return this.props.billingAddress;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}

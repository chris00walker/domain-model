/**
 * Domain-Driven Design - Subscription Aggregate
 *
 * This file implements the Subscription aggregate root, a fundamental DDD pattern. An aggregate is a
 * cluster of domain objects that can be treated as a single unit, with the aggregate root being the
 * entity that handles all external references.
 *
 * Key DDD patterns implemented here:
 * 1. Aggregate Root - The Subscription class controls all access to its members
 * 2. Encapsulated Operations - Domain logic for subscription management is contained here
 * 3. Invariants - Business rules that must be maintained (e.g., active subscriptions must have items)
 * 4. Domain Events - Important changes in the subscription emit events for other systems
 * 5. Value Objects - Immutable objects that describe aspects of the domain
 * 6. Factory Method - The create() static method enforces all construction rules
 * 7. Guards - Defensive validation of inputs to maintain domain integrity
 */
import { AggregateRoot } from '../../../shared/domain/base/AggregateRoot';
import { UniqueEntityID } from '../../../shared/domain/base/UniqueEntityID';
import { Result, success, failure } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';
import { Clock, SystemClock } from '../../../shared/domain/Clock';
import { SubscriptionItem } from '../value-objects/SubscriptionItem';
import { SubscriptionStatus, SubscriptionStatusType } from '../value-objects/SubscriptionStatus';
import { ProductId } from '../../../catalog/domain/value-objects/ProductId';
import { SubscriptionFrequency } from '../value-objects/SubscriptionFrequency';
import { Money } from '../../../shared/domain/value-objects/Money';
/**
 * Domain Events
 *
 * Domain events are a crucial part of DDD, representing something significant that occurred in the domain.
 * They enable loose coupling between aggregates and support the eventual consistency model.
 * 
 * Each event below represents a specific significant occurrence in the subscription lifecycle:
 */
import {
  SubscriptionCreated,      // Emitted when a new subscription is created
  SubscriptionCancelled,    // Emitted when a subscription is cancelled
  SubscriptionPaused,       // Emitted when a subscription is temporarily paused
  SubscriptionResumed,      // Emitted when a paused subscription is resumed
  SubscriptionEdited,       // Emitted when subscription details are modified
  SubscriptionRenewed       // Emitted when a subscription is renewed for another period
} from '../events';

/**
 * Subscription Properties Interface
 *
 * This defines the data structure for the Subscription aggregate.
 * In DDD, we separate the properties definition from behavior to maintain
 * a clear boundary between data and domain logic.
 */
interface SubscriptionProps {
  customerId: string;
  status: SubscriptionStatus;
  items: SubscriptionItem[];
  startDate: Date;
  endDate?: Date;
  nextDeliveryDate?: Date;
  lastDeliveryDate?: Date;
  totalDeliveries: number;
  remainingDeliveries: number;
  frequency: SubscriptionFrequency;
  isPrepaid: boolean;
  autoRenew: boolean;
  skipsRemaining: number;
  substitutionsRemaining: number;
  notes?: string;
  billingAddressId?: string;
  shippingAddressId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Subscription Aggregate Root
 *
 * This class represents a subscription in the domain model. As an aggregate root, it:
 * - Encapsulates a cluster of domain objects (subscription items, frequency, status)
 * - Enforces invariants and business rules for the entire aggregate
 * - Is the only object in the cluster that outside objects can hold references to
 * - Handles all domain events related to subscription lifecycle
 * 
 * Following DDD principles, this aggregate maintains consistency boundaries and
 * handles all operations that could potentially affect its internal state.
 */
/**
 * Invariants:
 * - Subscription must have a valid customerId
 * - Subscription must have at least one SubscriptionItem
 * - Subscription status transitions must follow valid paths:
 *   * ACTIVE -> PAUSED -> ACTIVE
 *   * ACTIVE -> CANCELLED (terminal state)
 *   * ACTIVE -> EXPIRED (when deliveries = 0 and !autoRenew)
 *   * EXPIRED -> ACTIVE (via renewal)
 * - Subscription.remainingDeliveries must be <= totalDeliveries
 * - Subscription.nextDeliveryDate must be >= now() for active subscriptions
 * - Subscription can only be renewed if expired or has 0 remaining deliveries
 * - Subscription renewal resets remainingDeliveries to totalDeliveries
 * - Subscription frequency must be valid and determine delivery schedule
 */
export class Subscription extends AggregateRoot<SubscriptionProps> {
  private constructor(props: SubscriptionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  /**
   * Factory Method for creating a Subscription aggregate
   *
   * This static factory method encapsulates the creation logic for the Subscription aggregate.
   * Following DDD principles, we use this pattern to:
   * - Enforce all invariants during creation
   * - Encapsulate complex construction logic
   * - Return a Result type for better error handling
   * - Publish domain events when a new aggregate is created
   *
   * @param props - The properties required to create a subscription
   * @param id - Optional unique ID for the subscription
   * @returns A Result containing either the new Subscription or an error message
   */
  public static create(props: SubscriptionProps, id?: UniqueEntityID, clock: Clock = new SystemClock()): Result<Subscription, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.customerId, argumentName: 'customerId' },
      { argument: props.status, argumentName: 'status' },
      { argument: props.items, argumentName: 'items' },
      { argument: props.startDate, argumentName: 'startDate' },
      { argument: props.totalDeliveries, argumentName: 'totalDeliveries' },
      { argument: props.remainingDeliveries, argumentName: 'remainingDeliveries' },
      { argument: props.frequency, argumentName: 'frequency' },
      { argument: props.isPrepaid, argumentName: 'isPrepaid' },
      { argument: props.autoRenew, argumentName: 'autoRenew' },
      { argument: props.skipsRemaining, argumentName: 'skipsRemaining' },
      { argument: props.substitutionsRemaining, argumentName: 'substitutionsRemaining' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.items.length === 0) {
      return failure('Subscription must have at least one item');
    }

    if (props.totalDeliveries <= 0) {
      return failure('Total deliveries must be greater than 0');
    }

    if (props.remainingDeliveries < 0 || props.remainingDeliveries > props.totalDeliveries) {
      return failure('Remaining deliveries must be between 0 and total deliveries');
    }

    if (props.skipsRemaining < 0) {
      return failure('Remaining skips cannot be negative');
    }

    if (props.substitutionsRemaining < 0) {
      return failure('Remaining substitutions cannot be negative');
    }

    const subscription = new Subscription({
      ...props,
      createdAt: props.createdAt || clock.now(),
      updatedAt: props.updatedAt || clock.now()
    }, id);

    const idWasProvided = !!id;
    
    if (!idWasProvided) {
      subscription.addDomainEvent(new SubscriptionCreated(subscription));
    }

    return success(subscription);
  }

  get subscriptionId(): string {
    return this._id.toString();
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get status(): SubscriptionStatus {
    return this.props.status;
  }

  get items(): SubscriptionItem[] {
    return [...this.props.items];
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  get nextDeliveryDate(): Date | undefined {
    return this.props.nextDeliveryDate;
  }

  get lastDeliveryDate(): Date | undefined {
    return this.props.lastDeliveryDate;
  }

  get totalDeliveries(): number {
    return this.props.totalDeliveries;
  }

  get remainingDeliveries(): number {
    return this.props.remainingDeliveries;
  }

  get frequency(): SubscriptionFrequency {
    return this.props.frequency;
  }

  get isPrepaid(): boolean {
    return this.props.isPrepaid;
  }

  get autoRenew(): boolean {
    return this.props.autoRenew;
  }

  get skipsRemaining(): number {
    return this.props.skipsRemaining;
  }

  get substitutionsRemaining(): number {
    return this.props.substitutionsRemaining;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get billingAddressId(): string | undefined {
    return this.props.billingAddressId;
  }

  get shippingAddressId(): string | undefined {
    return this.props.shippingAddressId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public isActive(): boolean {
    return this.props.status.isActive();
  }

  public isPaused(): boolean {
    return this.props.status.isPaused();
  }

  public isCancelled(): boolean {
    return this.props.status.isCancelled();
  }

  public isExpired(): boolean {
    return this.props.status.isExpired();
  }

  public calculateTotal(): Money {
    let total = Money.zero('USD');
    
    for (const item of this.props.items) {
      const itemTotal = item.calculateTotal();
      const addResult = total.add(itemTotal);
      
      if (addResult.isFailure()) {
        throw new Error(`Failed to add item total: ${addResult.error}`);
      }
      
      total = addResult.value;
    }
    
    return total;
  }

  /**
   * Adds a new item to the subscription
   * @param item - The subscription item to add
   * @returns Result indicating success or failure
   */
  public addItem(item: SubscriptionItem, clock: Clock = new SystemClock()): Result<void, string> {
    // Check if item with same product ID already exists
    // Use value property for consistent ID comparison across aggregate boundaries
    const exists = this.props.items.some(existingItem => 
      existingItem.productId.value === item.productId.value
    );

    if (exists) {
      return failure('Item with this product ID already exists in the subscription');
    }

    this.props.items.push(item);
    this.props.updatedAt = new Date();
    
    this.addDomainEvent(new SubscriptionEdited(this));
    
    return success(undefined);
  }

  /**
   * Removes an item from the subscription by its product ID
   * @param productId - The ID of the product to remove
   * @returns Result indicating success or failure
   */
  public removeItem(productId: ProductId | string, clock: Clock = new SystemClock()): Result<void, string> {
    // Convert string to ProductId if needed for consistent comparison
    let productIdObj: ProductId;
    
    if (typeof productId === 'string') {
      const productIdResult = ProductId.create(productId);
      if (productIdResult.isFailure()) {
        return failure(productIdResult.error);
      }
      productIdObj = productIdResult.value;
    } else {
      productIdObj = productId;
    }
    
    const initialLength = this.props.items.length;
    this.props.items = this.props.items.filter(item => 
      item.productId.value !== productIdObj.value
    );

    if (this.props.items.length === initialLength) {
      return failure('Item with this product ID not found in the subscription');
    }

    if (this.props.items.length === 0) {
      return failure('Cannot remove last item from subscription');
    }

    this.props.updatedAt = clock.now();
    
    this.addDomainEvent(new SubscriptionEdited(this));
    
    return success(undefined);
  }

  /**
   * Updates the quantity of an item in the subscription
   * 
   * This method demonstrates several important DDD patterns:
   * 1. Encapsulated Operation: Domain logic is contained within the aggregate
   * 2. Consistency Boundary: Updates maintain the aggregate's invariants
   * 3. Value Object Immutability: We replace items rather than modifying them
   * 4. Domain Events: Changes to the aggregate result in domain events
   * 
   * @param productId - The ID of the product to update
   * @param quantity - The new quantity
   * @returns Result indicating success or failure
   */
  public updateItemQuantity(productId: ProductId | string, newQuantity: number, clock: Clock = new SystemClock()): Result<void, string> {
    if (newQuantity <= 0) {
      return failure('Quantity must be greater than 0');
    }

    // Convert string to ProductId if needed for consistent comparison
    let productIdObj: ProductId;
    
    if (typeof productId === 'string') {
      const productIdResult = ProductId.create(productId);
      if (productIdResult.isFailure()) {
        return failure(productIdResult.error);
      }
      productIdObj = productIdResult.value;
    } else {
      productIdObj = productId;
    }
    
    const itemIndex = this.props.items.findIndex(item => 
      item.productId.value === productIdObj.value
    );

    if (itemIndex === -1) {
      return failure('Item with this product ID not found in the subscription');
    }

    const item = this.props.items[itemIndex];
    const updatedItemResult = item.updateQuantity(newQuantity);
    
    if (updatedItemResult.isFailure()) {
      return failure(updatedItemResult.error);
    }

    // Replace the item with the updated one in the items array
    const updatedItems = [...this.props.items];
    updatedItems[itemIndex] = updatedItemResult.value;
    this.props.items = updatedItems;

    this.props.updatedAt = clock.now();
    
    this.addDomainEvent(new SubscriptionEdited(this));
    
    return success(undefined);
  }

  public cancel(reason: string, clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status.isCancelled()) {
      return failure('Subscription is already cancelled');
    }

    const statusResult = SubscriptionStatus.create(SubscriptionStatusType.CANCELLED);
    if (statusResult.isFailure()) {
      return failure(statusResult.error);
    }

    this.props.status = statusResult.value;
    this.props.endDate = clock.now();
    this.props.remainingDeliveries = 0;
    this.props.updatedAt = clock.now();
    
    this.addDomainEvent(new SubscriptionCancelled(this));
    
    return success(undefined);
  }

  public pause(reason: string, clock: Clock = new SystemClock()): Result<void, string> {
    if (!this.props.status.isActive()) {
      return failure('Only active subscriptions can be paused');
    }

    const statusResult = SubscriptionStatus.create(SubscriptionStatusType.PAUSED);
    if (statusResult.isFailure()) {
      return failure(statusResult.error);
    }

    this.props.status = statusResult.value;
    this.props.updatedAt = clock.now();
    
    this.addDomainEvent(new SubscriptionPaused(this));
    
    return success(undefined);
  }

  public resume(clock: Clock = new SystemClock()): Result<void, string> {
    if (!this.props.status.isPaused()) {
      return failure('Only paused subscriptions can be resumed');
    }

    const statusResult = SubscriptionStatus.create(SubscriptionStatusType.ACTIVE);
    if (statusResult.isFailure()) {
      return failure(statusResult.error);
    }

    this.props.status = statusResult.value;
    this.props.updatedAt = clock.now();
    
    this.addDomainEvent(new SubscriptionResumed(this));
    
    return success(undefined);
  }

  public recordDelivery(deliveryDate: Date, clock: Clock = new SystemClock()): Result<void, string> {
    if (!this.props.status.isActive()) {
      return failure('Cannot record delivery for inactive subscription');
    }

    if (this.props.remainingDeliveries <= 0) {
      return failure('No remaining deliveries');
    }

    this.props.lastDeliveryDate = deliveryDate;
    this.props.remainingDeliveries--;
    
    if (this.props.remainingDeliveries === 0 && !this.props.autoRenew) {
      const statusResult = SubscriptionStatus.create(SubscriptionStatusType.EXPIRED);
      if (statusResult.isFailure()) {
        return failure(statusResult.error);
      }
      
      this.props.status = statusResult.value;
      this.props.endDate = deliveryDate;
    } else {
      // Calculate next delivery date based on frequency
      this.calculateNextDeliveryDate(clock);
    }
    
    this.props.updatedAt = clock.now();
    
    return success(undefined);
  }

  /**
   * Renews a subscription that has expired or has no remaining deliveries
   * 
   * This method enforces the following invariants:
   * - Can only renew if subscription is expired or has 0 remaining deliveries
   * - Auto-renewal must be enabled unless explicitly overridden
   * - Upon renewal, subscription status is reset to ACTIVE
   * - Remaining deliveries are reset to the original total deliveries
   * - Next delivery date is recalculated based on the frequency
   * 
   * @param forceRenew Optional flag to force renewal even if autoRenew is disabled
   * @returns Result indicating success or failure with error message
   */
  public renew(forceRenew: boolean = false, clock: Clock = new SystemClock()): Result<void, string> {
    // Validate subscription can be renewed
    if (!this.props.status.isExpired() && this.props.remainingDeliveries > 0) {
      return failure('Cannot renew an active subscription with remaining deliveries');
    }
    
    // Check if auto-renewal is enabled or forced
    if (!this.props.autoRenew && !forceRenew) {
      return failure('Auto-renewal is not enabled for this subscription');
    }

    // Create new active status
    const statusResult = SubscriptionStatus.create(SubscriptionStatusType.ACTIVE);
    if (statusResult.isFailure()) {
      return failure(`Failed to create active status: ${statusResult.error}`);
    }

    // Reset subscription properties for new term
    this.props.status = statusResult.value;
    this.props.remainingDeliveries = this.props.totalDeliveries;
    this.props.startDate = clock.now();
    this.props.endDate = undefined;
    
    // Calculate the next delivery date based on frequency
    this.calculateNextDeliveryDate(clock);
    
    this.props.updatedAt = clock.now();
    
    // Publish domain event for subscription renewal
    this.addDomainEvent(new SubscriptionRenewed(this));
    
    return success(undefined);
  }

  private calculateNextDeliveryDate(clock: Clock = new SystemClock()): void {
    if (!this.props.lastDeliveryDate) {
      this.props.nextDeliveryDate = this.props.startDate;
      return;
    }

    const lastDate = new Date(this.props.lastDeliveryDate);
    
    switch (this.props.frequency.value) {
      case 'WEEKLY':
        lastDate.setDate(lastDate.getDate() + 7);
        break;
      case 'BIWEEKLY':
        lastDate.setDate(lastDate.getDate() + 14);
        break;
      case 'MONTHLY':
        lastDate.setMonth(lastDate.getMonth() + 1);
        break;
      default:
        lastDate.setDate(lastDate.getDate() + 7);
    }
    
    this.props.nextDeliveryDate = lastDate;
  }
}

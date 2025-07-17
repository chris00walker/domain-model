import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result, success, failure } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';
import { ShipmentStatus } from '../value-objects/ShipmentStatus';
import { TrackingNumber } from '../value-objects/TrackingNumber';
import { ShipmentCreated } from '../events/ShipmentCreated';
import { ShipmentStatusChanged } from '../events/ShipmentStatusChanged';
import { Clock, SystemClock } from '../../../shared/domain/Clock';

export interface ShipmentItem {
  productId: string;
  quantity: number;
  description: string;
  weight?: number; // in kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
  }; // in cm
}

export interface ShipmentProps {
  orderId: string;
  customerId: string;
  status: ShipmentStatus;
  shippingAddress: string;
  items: ShipmentItem[];
  serviceLevel: string; // e.g., "Standard", "Express", "Overnight"
  trackingNumber?: TrackingNumber;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  carrier?: string;
  labelUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Invariants:
 * - Shipment must have a valid orderId and customerId
 * - Shipment must have at least one item
 * - Shipment must have a valid shipping address
 * - Shipment status transitions must follow the state machine pattern
 * - Shipment.updatedAt must be updated on any state change
 * - Tracking number must be provided when status is beyond SCHEDULED
 */
export class ShipmentAggregate extends AggregateRoot<ShipmentProps> {
  private constructor(props: ShipmentProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: ShipmentProps, id?: UniqueEntityID, clock: Clock = new SystemClock()): Result<ShipmentAggregate, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.orderId, argumentName: 'orderId' },
      { argument: props.customerId, argumentName: 'customerId' },
      { argument: props.shippingAddress, argumentName: 'shippingAddress' },
      { argument: props.items, argumentName: 'items' },
      { argument: props.serviceLevel, argumentName: 'serviceLevel' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.items.length === 0) {
      return failure('Shipment must have at least one item');
    }

    const isNewShipment = !id;
    const now = clock.now();
    const shipment = new ShipmentAggregate(
      {
        ...props,
        status: isNewShipment ? ShipmentStatus.Created : props.status,
        createdAt: isNewShipment ? now : props.createdAt,
        updatedAt: now
      },
      id
    );

    if (isNewShipment) {
      shipment.addDomainEvent(new ShipmentCreated(
        shipment.id.toString(),
        props.orderId,
        props.customerId,
        props.shippingAddress,
        props.items.map(item => ({ productId: item.productId, quantity: item.quantity })),
        props.serviceLevel
      ));
    }

    return success(shipment);
  }

  /**
   * Schedule the shipment for pickup
   */
  public schedule(estimatedDeliveryDate: Date, clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status !== ShipmentStatus.Created) {
      return failure(`Cannot schedule shipment in ${this.props.status} status. Shipment must be in CREATED status.`);
    }

    const previousStatus = this.props.status;
    this.props.status = ShipmentStatus.Scheduled;
    this.props.estimatedDeliveryDate = estimatedDeliveryDate;
    this.props.updatedAt = clock.now();

    this.addDomainEvent(new ShipmentStatusChanged(
      this.id.toString(),
      this.props.orderId,
      previousStatus,
      this.props.status,
      undefined,
      undefined,
      `Shipment scheduled for delivery by ${estimatedDeliveryDate.toISOString().split('T')[0]}`
    ));

    return success(undefined);
  }

  /**
   * Generate shipping label for the shipment
   */
  public generateLabel(carrier: string, trackingNumber: string, labelUrl: string, clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status !== ShipmentStatus.Scheduled) {
      return failure(`Cannot generate label for shipment in ${this.props.status} status. Shipment must be in SCHEDULED status.`);
    }

    const trackingNumberResult = TrackingNumber.create({
      value: trackingNumber,
      carrier: carrier
    });

    if (trackingNumberResult.isFailure()) {
      return failure(trackingNumberResult.error);
    }

    const previousStatus = this.props.status;
    this.props.status = ShipmentStatus.LabelGenerated;
    this.props.trackingNumber = trackingNumberResult.value;
    this.props.carrier = carrier;
    this.props.labelUrl = labelUrl;
    this.props.updatedAt = clock.now();

    this.addDomainEvent(new ShipmentStatusChanged(
      this.id.toString(),
      this.props.orderId,
      previousStatus,
      this.props.status,
      trackingNumber,
      carrier,
      `Shipping label generated with ${carrier} tracking number ${trackingNumber}`
    ));

    return success(undefined);
  }

  /**
   * Mark the shipment as picked up by the carrier
   */
  public markAsPickedUp(clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status !== ShipmentStatus.LabelGenerated) {
      return failure(`Cannot mark shipment as picked up in ${this.props.status} status. Shipment must be in LABEL_GENERATED status.`);
    }

    if (!this.props.trackingNumber) {
      return failure('Cannot mark shipment as picked up without a tracking number');
    }

    const previousStatus = this.props.status;
    this.props.status = ShipmentStatus.PickedUp;
    this.props.updatedAt = clock.now();

    this.addDomainEvent(new ShipmentStatusChanged(
      this.id.toString(),
      this.props.orderId,
      previousStatus,
      this.props.status,
      this.props.trackingNumber.value,
      this.props.trackingNumber.carrier,
      `Shipment picked up by ${this.props.trackingNumber.carrier}`
    ));

    return success(undefined);
  }

  /**
   * Update the shipment status to in-transit
   */
  public markAsInTransit(lastLocation: string, clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status !== ShipmentStatus.PickedUp && this.props.status !== ShipmentStatus.InTransit) {
      return failure(`Cannot mark shipment as in-transit in ${this.props.status} status. Shipment must be in PICKED_UP or IN_TRANSIT status.`);
    }

    if (!this.props.trackingNumber) {
      return failure('Cannot mark shipment as in-transit without a tracking number');
    }

    const previousStatus = this.props.status;
    this.props.status = ShipmentStatus.InTransit;
    this.props.updatedAt = clock.now();

    this.addDomainEvent(new ShipmentStatusChanged(
      this.id.toString(),
      this.props.orderId,
      previousStatus,
      this.props.status,
      this.props.trackingNumber.value,
      this.props.trackingNumber.carrier,
      `Shipment in transit. Last location: ${lastLocation}`
    ));

    return success(undefined);
  }

  /**
   * Mark the shipment as delivered
   */
  public markAsDelivered(recipientName: string, clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status !== ShipmentStatus.InTransit && this.props.status !== ShipmentStatus.OutForDelivery) {
      return failure(`Cannot mark shipment as delivered in ${this.props.status} status. Shipment must be in IN_TRANSIT or OUT_FOR_DELIVERY status.`);
    }

    if (!this.props.trackingNumber) {
      return failure('Cannot mark shipment as delivered without a tracking number');
    }

    const previousStatus = this.props.status;
    this.props.status = ShipmentStatus.Delivered;
    this.props.actualDeliveryDate = clock.now();
    this.props.updatedAt = clock.now();

    this.addDomainEvent(new ShipmentStatusChanged(
      this.id.toString(),
      this.props.orderId,
      previousStatus,
      this.props.status,
      this.props.trackingNumber.value,
      this.props.trackingNumber.carrier,
      `Shipment delivered to ${recipientName}`
    ));

    return success(undefined);
  }

  /**
   * Record a delivery exception
   */
  public recordException(exceptionType: string, details: string, clock: Clock = new SystemClock()): Result<void, string> {
    if (!this.props.trackingNumber) {
      return failure('Cannot record exception without a tracking number');
    }

    const previousStatus = this.props.status;
    this.props.status = ShipmentStatus.Exception;
    this.props.notes = this.props.notes ? `${this.props.notes}\n${exceptionType}: ${details}` : `${exceptionType}: ${details}`;
    this.props.updatedAt = clock.now();

    this.addDomainEvent(new ShipmentStatusChanged(
      this.id.toString(),
      this.props.orderId,
      previousStatus,
      this.props.status,
      this.props.trackingNumber.value,
      this.props.trackingNumber.carrier,
      `Delivery exception: ${exceptionType} - ${details}`
    ));

    return success(undefined);
  }

  /**
   * Cancel the shipment
   */
  public cancel(reason: string, clock: Clock = new SystemClock()): Result<void, string> {
    // Can only cancel if not already delivered or returned
    if (this.props.status === ShipmentStatus.Delivered || this.props.status === ShipmentStatus.Returned) {
      return failure(`Cannot cancel shipment in ${this.props.status} status`);
    }

    const previousStatus = this.props.status;
    this.props.status = ShipmentStatus.Cancelled;
    this.props.notes = this.props.notes ? `${this.props.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
    this.props.updatedAt = clock.now();

    this.addDomainEvent(new ShipmentStatusChanged(
      this.id.toString(),
      this.props.orderId,
      previousStatus,
      this.props.status,
      this.props.trackingNumber?.value,
      this.props.trackingNumber?.carrier,
      `Shipment cancelled: ${reason}`
    ));

    return success(undefined);
  }

  // Getters
  get shipmentId(): string {
    return this._id.toString();
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get status(): ShipmentStatus {
    return this.props.status;
  }

  get shippingAddress(): string {
    return this.props.shippingAddress;
  }

  get items(): ShipmentItem[] {
    return [...this.props.items];
  }

  get serviceLevel(): string {
    return this.props.serviceLevel;
  }

  get trackingNumber(): TrackingNumber | undefined {
    return this.props.trackingNumber;
  }

  get carrier(): string | undefined {
    return this.props.carrier;
  }

  get estimatedDeliveryDate(): Date | undefined {
    return this.props.estimatedDeliveryDate;
  }

  get actualDeliveryDate(): Date | undefined {
    return this.props.actualDeliveryDate;
  }

  get labelUrl(): string | undefined {
    return this.props.labelUrl;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}

import { DomainEvent } from '@shared/domain/events/DomainEvent';
import { Customer } from '../aggregates/Customer';
import { CustomerSegmentType } from '../value-objects/CustomerSegmentType';

interface DomainEventProps {
  aggregateId: string;
  occurredOn: Date;
}

interface CustomerSegmentChangedEventProps {
  customerId: string;
  previousSegmentType?: CustomerSegmentType;
  newSegmentType: CustomerSegmentType;
  reason?: string;
}

/**
 * CustomerSegmentChanged Domain Event
 * 
 * Represents an event that occurs when a customer's segment is changed.
 * This event is used to notify other bounded contexts about changes in customer segmentation.
 * 
 * Domain-Driven Design Domain Event Pattern
 * 
 * Domain Events represent something that happened in the domain that domain experts care about.
 * They are used to communicate between bounded contexts and to implement event sourcing.
 */
export class CustomerSegmentChanged extends DomainEvent {
  private readonly _customerId: string;
  private readonly _previousSegmentType?: CustomerSegmentType;
  private readonly _newSegmentType: CustomerSegmentType;
  private readonly _reason?: string;

  private constructor(props: DomainEventProps, eventProps: CustomerSegmentChangedEventProps) {
    super(props);
    this._customerId = eventProps.customerId;
    this._previousSegmentType = eventProps.previousSegmentType;
    this._newSegmentType = eventProps.newSegmentType;
    this._reason = eventProps.reason;
  }

  get customerId(): string {
    return this._customerId;
  }

  get previousSegmentType(): CustomerSegmentType | undefined {
    return this._previousSegmentType;
  }

  get newSegmentType(): CustomerSegmentType {
    return this._newSegmentType;
  }

  get reason(): string | undefined {
    return this._reason;
  }

  /**
   * Factory method to create a new CustomerSegmentChanged event
   * @param customer The customer whose segment has changed
   * @param previousSegmentType The previous segment type (optional for new customers)
   * @param newSegmentType The new segment type
   * @param reason The reason for the segment change (optional)
   * @returns A new CustomerSegmentChanged event
   */
  public static create(
    customer: Customer,
    newSegmentType: CustomerSegmentType,
    previousSegmentType?: CustomerSegmentType,
    reason?: string
  ): CustomerSegmentChanged {
    const props: DomainEventProps = {
      aggregateId: customer.id.toString(),
      occurredOn: new Date()
    };

    const eventProps: CustomerSegmentChangedEventProps = {
      customerId: customer.customerId.value,
      previousSegmentType,
      newSegmentType,
      reason
    };

    return new CustomerSegmentChanged(props, eventProps);
  }

  /**
   * Serializes the event to a primitive object for storage or transmission
   * @returns A primitive object representation of the event
   */
  public toPrimitives(): any {
    return {
      customerId: this._customerId,
      previousSegmentType: this._previousSegmentType,
      newSegmentType: this._newSegmentType,
      reason: this._reason
    };
  }

  /**
   * Recreates a CustomerSegmentChanged event from primitive data
   * @param aggregateId The ID of the aggregate that emitted the event
   * @param payload The primitive data
   * @param occurredOn The date when the event occurred
   * @returns A reconstructed CustomerSegmentChanged event
   */
  public static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): CustomerSegmentChanged {
    const props: DomainEventProps = {
      aggregateId,
      occurredOn
    };

    const eventProps: CustomerSegmentChangedEventProps = {
      customerId: payload.customerId,
      previousSegmentType: payload.previousSegmentType,
      newSegmentType: payload.newSegmentType,
      reason: payload.reason
    };

    return new CustomerSegmentChanged(props, eventProps);
  }
}

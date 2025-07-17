import { DomainEvent } from '../../../shared/domain/events/DomainEvent';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';

export class OrderFulfilled extends DomainEvent {
  public static readonly EVENT_NAME = 'order.fulfilled';

  constructor(
    public readonly orderId: string,
    public readonly fulfillmentDate: Date,
    public readonly trackingNumber?: string,
    public readonly occurredOn: Date = new Date()
  ) {
    super({
      aggregateId: orderId,
      eventId: new UniqueEntityID().toString(),
      occurredOn
    });
  }

  toPrimitives(): any {
    return {
      orderId: this.aggregateId,
      fulfillmentDate: this.fulfillmentDate.toISOString(),
      trackingNumber: this.trackingNumber,
      occurredOn: this.occurredOn.toISOString()
    };
  }

  static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): OrderFulfilled {
    return new OrderFulfilled(
      aggregateId,
      new Date(payload.fulfillmentDate),
      payload.trackingNumber,
      occurredOn
    );
  }
}

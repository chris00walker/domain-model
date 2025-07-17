import { DomainEvent } from '../../../shared/domain/events/DomainEvent';

export class OrderCancelled extends DomainEvent {
  public static readonly EVENT_NAME = 'order.cancelled';

  constructor(
    public readonly orderId: string,
    public readonly reason: string,
    public readonly cancelledBy?: string,
    public readonly occurredOn: Date = new Date()
  ) {
    super({
      aggregateId: orderId,
      eventId: undefined,
      occurredOn
    });
  }

  toPrimitives(): any {
    return {
      orderId: this.aggregateId,
      reason: this.reason,
      cancelledBy: this.cancelledBy,
      occurredOn: this.occurredOn.toISOString()
    };
  }

  static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): OrderCancelled {
    return new OrderCancelled(
      aggregateId,
      payload.reason,
      payload.cancelledBy,
      occurredOn
    );
  }
}

import { DomainEvent } from '../../../shared/domain/events/DomainEvent';

export class OrderPaid extends DomainEvent {
  public static readonly EVENT_NAME = 'order.paid';

  constructor(
    public readonly orderId: string,
    public readonly paymentId: string,
    public readonly amount: number,
    public readonly currency: string,
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
      paymentId: this.paymentId,
      amount: this.amount,
      currency: this.currency,
      occurredOn: this.occurredOn.toISOString()
    };
  }

  static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): OrderPaid {
    return new OrderPaid(
      aggregateId,
      payload.paymentId,
      payload.amount,
      payload.currency,
      occurredOn
    );
  }
}

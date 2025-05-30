import { DomainEvent } from '../../shared/domain/events/DomainEvent';

export class OrderPaymentFailed extends DomainEvent {
  public static readonly EVENT_NAME = 'order.payment_failed';

  constructor(
    public readonly orderId: string,
    public readonly error: string,
    public readonly attempt: number,
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
      error: this.error,
      attempt: this.attempt,
      occurredOn: this.occurredOn.toISOString()
    };
  }

  static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): OrderPaymentFailed {
    return new OrderPaymentFailed(
      aggregateId,
      payload.error,
      payload.attempt,
      occurredOn
    );
  }
}

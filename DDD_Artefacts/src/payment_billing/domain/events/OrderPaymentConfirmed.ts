import { DomainEvent } from '@shared/domain/events/DomainEvent';

export class OrderPaymentConfirmed extends DomainEvent {
  public static readonly EVENT_NAME = 'order.payment.confirmed';

  constructor(
    public readonly orderId: string,
    public readonly paymentId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly occurredOn: Date = new Date()
  ) {
    super({ aggregateId: orderId, occurredOn });
  }

  toPrimitives(): any {
    return {
      orderId: this.orderId,
      paymentId: this.paymentId,
      amount: this.amount,
      currency: this.currency,
      occurredOn: this.occurredOn.toISOString()
    };
  }

  static fromPrimitives(aggregateId: string, payload: any, occurredOn: Date): OrderPaymentConfirmed {
    return new OrderPaymentConfirmed(
      aggregateId,
      payload.paymentId,
      payload.amount,
      payload.currency,
      occurredOn
    );
  }
}

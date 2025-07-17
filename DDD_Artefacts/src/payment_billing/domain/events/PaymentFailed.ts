import { DomainEvent } from '@shared/domain/events/DomainEvent';
import { PaymentMethod } from '../value-objects/PaymentMethod';

export class PaymentFailed extends DomainEvent {
  public static readonly EVENT_NAME = 'payment.failed';

  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly method: PaymentMethod,
    public readonly reason: string,
    public readonly occurredOn: Date = new Date()
  ) {
    super({ aggregateId: paymentId, occurredOn });
  }

  toPrimitives(): any {
    return {
      paymentId: this.paymentId,
      orderId: this.orderId,
      amount: this.amount,
      currency: this.currency,
      method: this.method,
      reason: this.reason,
      occurredOn: this.occurredOn.toISOString()
    };
  }

  static fromPrimitives(aggregateId: string, payload: any, occurredOn: Date): PaymentFailed {
    return new PaymentFailed(
      aggregateId,
      payload.orderId,
      payload.amount,
      payload.currency,
      payload.method,
      payload.reason,
      occurredOn
    );
  }
}

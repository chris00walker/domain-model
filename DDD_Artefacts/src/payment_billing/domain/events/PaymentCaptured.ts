import { DomainEvent } from '@shared/domain/events/DomainEvent';
import { PaymentMethod } from '../value-objects/PaymentMethod';

export class PaymentCaptured extends DomainEvent {
  public static readonly EVENT_NAME = 'payment.captured';

  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly method: PaymentMethod,
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
      occurredOn: this.occurredOn.toISOString()
    };
  }

  static fromPrimitives(aggregateId: string, payload: any, occurredOn: Date): PaymentCaptured {
    return new PaymentCaptured(
      aggregateId,
      payload.orderId,
      payload.amount,
      payload.currency,
      payload.method,
      occurredOn
    );
  }
}

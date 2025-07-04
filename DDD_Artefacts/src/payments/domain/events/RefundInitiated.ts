import { DomainEvent } from '@shared/domain/events/DomainEvent';

export class RefundInitiated extends DomainEvent {
  public static readonly EVENT_NAME = 'refund.initiated';

  constructor(
    public readonly paymentId: string,
    public readonly refundId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly occurredOn: Date = new Date()
  ) {
    super({ aggregateId: paymentId, occurredOn });
  }

  toPrimitives(): any {
    return {
      paymentId: this.paymentId,
      refundId: this.refundId,
      amount: this.amount,
      currency: this.currency,
      occurredOn: this.occurredOn.toISOString()
    };
  }

  static fromPrimitives(aggregateId: string, payload: any, occurredOn: Date): RefundInitiated {
    return new RefundInitiated(
      aggregateId,
      payload.refundId,
      payload.amount,
      payload.currency,
      occurredOn
    );
  }
}

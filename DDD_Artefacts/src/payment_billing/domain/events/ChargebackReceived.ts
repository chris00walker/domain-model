import { DomainEvent } from '@shared/domain/events/DomainEvent';

export class ChargebackReceived extends DomainEvent {
  public static readonly EVENT_NAME = 'chargeback.received';

  constructor(
    public readonly paymentId: string,
    public readonly chargebackId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly reason: string,
    public readonly occurredOn: Date = new Date()
  ) {
    super({ aggregateId: paymentId, occurredOn });
  }

  toPrimitives(): any {
    return {
      paymentId: this.paymentId,
      chargebackId: this.chargebackId,
      amount: this.amount,
      currency: this.currency,
      reason: this.reason,
      occurredOn: this.occurredOn.toISOString()
    };
  }

  static fromPrimitives(aggregateId: string, payload: any, occurredOn: Date): ChargebackReceived {
    return new ChargebackReceived(
      aggregateId,
      payload.chargebackId,
      payload.amount,
      payload.currency,
      payload.reason,
      occurredOn
    );
  }
}

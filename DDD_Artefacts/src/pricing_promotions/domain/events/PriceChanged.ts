import { DomainEvent } from '@shared/domain/events/DomainEvent';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';

export class PriceChanged extends DomainEvent {
  public dateTimeOccurred: Date;
  public productId: string;
  public oldPrice: number;
  public newPrice: number;
  public currency: string;
  public reason: string;
  public triggeredBy: string;

  constructor(
    productId: string,
    oldPrice: number,
    newPrice: number,
    currency: string,
    reason: string,
    triggeredBy: string
  ) {
    super({
      aggregateId: productId,
      occurredOn: new Date()
    });
    this.dateTimeOccurred = new Date();
    this.productId = productId;
    this.oldPrice = oldPrice;
    this.newPrice = newPrice;
    this.currency = currency;
    this.reason = reason;
    this.triggeredBy = triggeredBy;
  }

  getAggregateId(): UniqueEntityID {
    return new UniqueEntityID(this.productId);
  }

  toPrimitives(): any {
    return {
      productId: this.productId,
      oldPrice: this.oldPrice,
      newPrice: this.newPrice,
      currency: this.currency,
      reason: this.reason,
      triggeredBy: this.triggeredBy,
      dateTimeOccurred: this.dateTimeOccurred.toISOString()
    };
  }
}

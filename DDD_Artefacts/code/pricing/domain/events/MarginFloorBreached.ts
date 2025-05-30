import { DomainEvent } from '@shared/domain/events/DomainEvent';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';

export class MarginFloorBreached implements DomainEvent {
  public dateTimeOccurred: Date;
  public productId: string;
  public price: number;
  public cost: number;
  public currency: string;
  public calculatedMargin: number;
  public floorMargin: number;
  public pricingTierType: string;
  public orderId?: string;
  public calculationId: string;

  constructor(
    productId: string,
    price: number,
    cost: number,
    currency: string,
    calculatedMargin: number,
    floorMargin: number,
    pricingTierType: string,
    calculationId: string,
    orderId?: string
  ) {
    this.dateTimeOccurred = new Date();
    this.productId = productId;
    this.price = price;
    this.cost = cost;
    this.currency = currency;
    this.calculatedMargin = calculatedMargin;
    this.floorMargin = floorMargin;
    this.pricingTierType = pricingTierType;
    this.calculationId = calculationId;
    this.orderId = orderId;
  }

  getAggregateId(): UniqueEntityID {
    return new UniqueEntityID(this.calculationId);
  }
}

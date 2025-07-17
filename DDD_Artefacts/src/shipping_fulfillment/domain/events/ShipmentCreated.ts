import { DomainEvent } from '../../../../shared/domain/events/DomainEvent';

export class ShipmentCreated implements DomainEvent {
  public readonly dateTimeOccurred: Date;
  
  constructor(
    public readonly shipmentId: string,
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly shippingAddress: string,
    public readonly items: Array<{ productId: string, quantity: number }>,
    public readonly serviceLevel: string,
    dateTimeOccurred?: Date
  ) {
    this.dateTimeOccurred = dateTimeOccurred || new Date();
  }
}

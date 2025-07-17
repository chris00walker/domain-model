import { DomainEvent } from '../../../shared/domain/events/DomainEvent';

export class ShipmentCreated extends DomainEvent {
  constructor(
    public readonly shipmentId: string,
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly shippingAddress: string,
    public readonly items: Array<{ productId: string, quantity: number }>,
    public readonly serviceLevel: string
  ) {
    super({
      aggregateId: shipmentId
    });
  }

  toPrimitives(): any {
    return {
      shipmentId: this.shipmentId,
      orderId: this.orderId,
      customerId: this.customerId,
      shippingAddress: this.shippingAddress,
      items: this.items,
      serviceLevel: this.serviceLevel,
      eventId: this.eventId,
      occurredOn: this.occurredOn.toISOString(),
      aggregateId: this.aggregateId
    };
  }
}

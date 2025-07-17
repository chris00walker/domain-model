import { DomainEvent } from '../../../shared/domain/events/DomainEvent';
import { ShipmentStatus } from '../value-objects/ShipmentStatus';

export class ShipmentStatusChanged extends DomainEvent {
  constructor(
    public readonly shipmentId: string,
    public readonly orderId: string,
    public readonly previousStatus: ShipmentStatus,
    public readonly newStatus: ShipmentStatus,
    public readonly trackingNumber?: string,
    public readonly carrier?: string,
    public readonly statusDetails?: string
  ) {
    super({
      aggregateId: shipmentId
    });
  }

  toPrimitives(): any {
    return {
      shipmentId: this.shipmentId,
      orderId: this.orderId,
      previousStatus: this.previousStatus,
      newStatus: this.newStatus,
      trackingNumber: this.trackingNumber,
      carrier: this.carrier,
      statusDetails: this.statusDetails,
      eventId: this.eventId,
      occurredOn: this.occurredOn.toISOString(),
      aggregateId: this.aggregateId
    };
  }
}

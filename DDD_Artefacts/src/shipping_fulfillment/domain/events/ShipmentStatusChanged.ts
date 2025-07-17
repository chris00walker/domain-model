import { DomainEvent } from '../../../../shared/domain/events/DomainEvent';
import { ShipmentStatus } from '../value-objects/ShipmentStatus';

export class ShipmentStatusChanged implements DomainEvent {
  public readonly dateTimeOccurred: Date;
  
  constructor(
    public readonly shipmentId: string,
    public readonly orderId: string,
    public readonly previousStatus: ShipmentStatus,
    public readonly newStatus: ShipmentStatus,
    public readonly trackingNumber?: string,
    public readonly carrier?: string,
    public readonly statusDetails?: string,
    dateTimeOccurred?: Date
  ) {
    this.dateTimeOccurred = dateTimeOccurred || new Date();
  }
}

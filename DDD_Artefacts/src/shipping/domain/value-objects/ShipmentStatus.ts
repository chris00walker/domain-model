/**
 * Represents the possible states of a shipment in the system
 */
export enum ShipmentStatus {
  Created = 'CREATED',
  Scheduled = 'SCHEDULED',
  LabelGenerated = 'LABEL_GENERATED',
  PickedUp = 'PICKED_UP',
  InTransit = 'IN_TRANSIT',
  OutForDelivery = 'OUT_FOR_DELIVERY',
  Delivered = 'DELIVERED',
  Exception = 'EXCEPTION',
  Returned = 'RETURNED',
  Cancelled = 'CANCELLED'
}

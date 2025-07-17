import { ShipmentAggregate } from '../aggregates/ShipmentAggregate';
import { Result } from '../../../../shared/core/Result';

export interface IShipmentRepository {
  /**
   * Find a shipment by its ID
   * @param id The shipment ID
   */
  findById(id: string): Promise<Result<ShipmentAggregate, string>>;

  /**
   * Find shipments by order ID
   * @param orderId The order ID
   */
  findByOrderId(orderId: string): Promise<Result<ShipmentAggregate[], string>>;

  /**
   * Find shipments by customer ID
   * @param customerId The customer ID
   * @param limit Optional limit on number of results
   * @param offset Optional offset for pagination
   */
  findByCustomerId(customerId: string, limit?: number, offset?: number): Promise<Result<ShipmentAggregate[], string>>;

  /**
   * Find shipments by tracking number
   * @param trackingNumber The tracking number
   * @param carrier Optional carrier name
   */
  findByTrackingNumber(trackingNumber: string, carrier?: string): Promise<Result<ShipmentAggregate[], string>>;

  /**
   * Save a shipment
   * @param shipment The shipment to save
   */
  save(shipment: ShipmentAggregate): Promise<Result<void, string>>;

  /**
   * Delete a shipment
   * @param shipment The shipment to delete
   */
  delete(shipment: ShipmentAggregate): Promise<Result<void, string>>;
}

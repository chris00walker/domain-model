import { Order } from '../aggregates/Order';
import { CustomerId } from '../../../customer_management/domain/value-objects/CustomerId';
import { OrderStatus } from '../value-objects/OrderStatus';

/**
 * Repository interface for the Order aggregate
 * 
 * Following DDD principles, this repository provides an abstraction for
 * persisting and retrieving Order aggregates. It encapsulates the
 * storage mechanism and provides a collection-like interface.
 */
export interface OrderRepository {
  /**
   * Find an order by its ID
   */
  findById(id: string): Promise<Order | null>;
  
  /**
   * Find orders by customer ID
   */
  findByCustomerId(customerId: CustomerId): Promise<Order[]>;
  
  /**
   * Find orders by status
   */
  findByStatus(status: OrderStatus): Promise<Order[]>;
  
  /**
   * Find orders created within a date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Order[]>;
  
  /**
   * Find orders that contain a specific product
   */
  findByProductId(productId: string): Promise<Order[]>;
  
  /**
   * Save an order (create or update)
   */
  save(order: Order): Promise<void>;
  
  /**
   * Remove an order
   */
  delete(order: Order): Promise<void>;
  
  /**
   * Get all orders with pagination
   */
  findAll(page: number, limit: number): Promise<Order[]>;
  
  /**
   * Count orders by status
   */
  countByStatus(status: OrderStatus): Promise<number>;
}

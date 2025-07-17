import { Result } from '../../../shared/core/Result';
import { Order } from '../aggregates/Order';

/**
 * IOrderRepository interface defines a contract for order persistence operations
 */
export interface IOrderRepository {
  /**
   * Find order by ID
   * @param id Order ID
   */
  findById(id: string): Promise<Result<Order>>;
  
  /**
   * Save an order
   * @param order Order to save
   */
  save(order: Order): Promise<Result<void>>;
  
  /**
   * Find orders for a customer within a date range
   * @param customerId Customer ID
   * @param startDate Start date
   * @param endDate End date
   */
  findByCustomerIdAndDateRange(
    customerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<Order[]>>;
}

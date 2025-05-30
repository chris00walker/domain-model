import { Customer } from '../aggregates/Customer';
import { CustomerId } from '../value-objects/CustomerId';
import { CustomerType } from '../value-objects/CustomerType';

/**
 * Repository interface for the Customer aggregate
 * 
 * Following DDD principles, this repository provides an abstraction for
 * persisting and retrieving Customer aggregates. It encapsulates the
 * storage mechanism and provides a collection-like interface.
 */
export interface CustomerRepository {
  /**
   * Find a customer by its ID
   */
  findById(id: CustomerId): Promise<Customer | null>;

  /**
   * Find customers by name (partial match)
   */
  findByName(name: string): Promise<Customer[]>;

  /**
   * Find customers by type
   */
  findByType(type: CustomerType): Promise<Customer[]>;

  /**
   * Find customers by email address
   */
  findByEmail(email: string): Promise<Customer | null>;

  /**
   * Save a customer (create or update)
   */
  save(customer: Customer): Promise<void>;

  /**
   * Remove a customer
   */
  remove(customer: Customer): Promise<void>;

  /**
   * Get all customers
   */
  findAll(): Promise<Customer[]>;

  /**
   * Count customers by type
   */
  countByType(type: CustomerType): Promise<number>;
}

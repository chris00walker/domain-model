import { DiasporaCustomer } from '../aggregates/DiasporaCustomer';
import { CustomerId } from '../value-objects/CustomerId';

/**
 * Repository interface for the DiasporaCustomer aggregate
 * 
 * Following DDD principles, this repository provides an abstraction for
 * persisting and retrieving DiasporaCustomer aggregates. It encapsulates the
 * storage mechanism and provides a collection-like interface.
 */
export interface DiasporaCustomerRepository {
  /**
   * Find a diaspora customer by its ID
   */
  findById(id: CustomerId): Promise<DiasporaCustomer | null>;

  /**
   * Find diaspora customers by name (partial match)
   */
  findByName(name: string): Promise<DiasporaCustomer[]>;

  /**
   * Find diaspora customers by email
   */
  findByEmail(email: string): Promise<DiasporaCustomer[]>;

  /**
   * Find diaspora customers by country of origin
   */
  findByCountryOfOrigin(country: string): Promise<DiasporaCustomer[]>;

  /**
   * Find diaspora customers by region of origin
   */
  findByRegionOfOrigin(region: string): Promise<DiasporaCustomer[]>;

  /**
   * Find diaspora customers by cultural preferences
   */
  findByCulturalPreference(preference: string): Promise<DiasporaCustomer[]>;

  /**
   * Save a diaspora customer (create or update)
   */
  save(customer: DiasporaCustomer): Promise<void>;

  /**
   * Delete a diaspora customer
   */
  delete(customer: DiasporaCustomer): Promise<void>;

  /**
   * Get all diaspora customers
   */
  findAll(): Promise<DiasporaCustomer[]>;
}

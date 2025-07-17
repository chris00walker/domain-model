import { Product } from '../aggregates/Product';
import { ProductId } from '../value-objects/ProductId';
import { Money } from '../../../shared/domain/value-objects/Money';

/**
 * Repository interface for the Product aggregate
 * 
 * Following DDD principles, this repository provides an abstraction for
 * persisting and retrieving Product aggregates. It encapsulates the
 * storage mechanism and provides a collection-like interface.
 */
export interface ProductRepository {
  /**
   * Find a product by its ID
   */
  findById(id: ProductId): Promise<Product | null>;

  /**
   * Find products by name (partial match)
   */
  findByName(name: string): Promise<Product[]>;

  /**
   * Find products within a price range
   */
  findByPriceRange(min: Money, max: Money): Promise<Product[]>;

  /**
   * Find products that are low in inventory (below threshold)
   */
  findLowInventory(threshold: number): Promise<Product[]>;

  /**
   * Find discontinued products
   */
  findDiscontinued(): Promise<Product[]>;

  /**
   * Save a product (create or update)
   */
  save(product: Product): Promise<void>;

  /**
   * Get all products
   */
  findAll(): Promise<Product[]>;
}

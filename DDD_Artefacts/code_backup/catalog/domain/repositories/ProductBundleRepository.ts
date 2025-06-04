import { ProductBundle } from '../aggregates/ProductBundle';
import { ProductId } from '../value-objects/ProductId';

/**
 * Repository interface for the ProductBundle aggregate
 * 
 * Following DDD principles, this repository provides an abstraction for
 * persisting and retrieving ProductBundle aggregates. It encapsulates the
 * storage mechanism and provides a collection-like interface.
 */
export interface ProductBundleRepository {
  /**
   * Find a product bundle by its ID
   */
  findById(id: string): Promise<ProductBundle | null>;

  /**
   * Find product bundles by name (partial match)
   */
  findByName(name: string): Promise<ProductBundle[]>;

  /**
   * Find product bundles that contain a specific product
   */
  findByContainedProduct(productId: ProductId): Promise<ProductBundle[]>;

  /**
   * Find active product bundles (currently available)
   */
  findActive(): Promise<ProductBundle[]>;

  /**
   * Find product bundles by promotion/discount type
   */
  findByDiscountType(discountType: string): Promise<ProductBundle[]>;

  /**
   * Save a product bundle (create or update)
   */
  save(bundle: ProductBundle): Promise<void>;

  /**
   * Delete a product bundle
   */
  delete(bundle: ProductBundle): Promise<void>;

  /**
   * Get all product bundles
   */
  findAll(): Promise<ProductBundle[]>;
}

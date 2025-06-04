import { ProductCategory } from '../aggregates/ProductCategory';

/**
 * Repository interface for the ProductCategory aggregate
 * 
 * Following DDD principles, this repository provides an abstraction for
 * persisting and retrieving ProductCategory aggregates. It encapsulates the
 * storage mechanism and provides a collection-like interface.
 */
export interface ProductCategoryRepository {
  /**
   * Find a product category by its ID
   */
  findById(id: string): Promise<ProductCategory | null>;

  /**
   * Find product categories by name (partial match)
   */
  findByName(name: string): Promise<ProductCategory[]>;

  /**
   * Find product categories by parent category
   */
  findByParentCategory(parentCategoryId: string): Promise<ProductCategory[]>;

  /**
   * Find top-level categories (with no parent)
   */
  findRootCategories(): Promise<ProductCategory[]>;

  /**
   * Save a product category (create or update)
   */
  save(category: ProductCategory): Promise<void>;

  /**
   * Delete a product category
   */
  delete(category: ProductCategory): Promise<void>;

  /**
   * Get all product categories
   */
  findAll(): Promise<ProductCategory[]>;
}

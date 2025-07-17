import { AdminUser } from '../aggregates/AdminUser';
import { AdminUserEmail } from '../value-objects/AdminUserEmail';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';

/**
 * IAdminUserRepository
 * 
 * Repository interface for managing administrative users.
 */
export interface IAdminUserRepository {
  /**
   * Find an admin user by their unique ID
   */
  findById(id: UniqueEntityID): Promise<AdminUser | null>;
  
  /**
   * Find an admin user by their email address
   */
  findByEmail(email: AdminUserEmail): Promise<AdminUser | null>;
  
  /**
   * Get all admin users, with optional pagination
   */
  findAll(limit?: number, offset?: number): Promise<AdminUser[]>;
  
  /**
   * Get admin users by status
   */
  findByStatus(status: string, limit?: number, offset?: number): Promise<AdminUser[]>;
  
  /**
   * Save a new or updated admin user
   */
  save(adminUser: AdminUser): Promise<void>;
  
  /**
   * Check if an email is already in use by an admin user
   */
  exists(email: AdminUserEmail): Promise<boolean>;
  
  /**
   * Count all admin users
   */
  count(): Promise<number>;
}

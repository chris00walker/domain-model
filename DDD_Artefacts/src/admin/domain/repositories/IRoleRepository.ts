import { Role } from '../entities/Role';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';

/**
 * IRoleRepository
 * 
 * Repository interface for managing roles.
 */
export interface IRoleRepository {
  /**
   * Find a role by its unique ID
   */
  findById(id: UniqueEntityID): Promise<Role | null>;
  
  /**
   * Find a role by name
   */
  findByName(name: string): Promise<Role | null>;
  
  /**
   * Get all roles
   */
  findAll(): Promise<Role[]>;
  
  /**
   * Get system roles
   */
  findSystemRoles(): Promise<Role[]>;
  
  /**
   * Get custom (non-system) roles
   */
  findCustomRoles(): Promise<Role[]>;
  
  /**
   * Save a new or updated role
   */
  save(role: Role): Promise<void>;
  
  /**
   * Delete a role (only if not a system role)
   */
  delete(id: UniqueEntityID): Promise<boolean>;
  
  /**
   * Check if a role name already exists
   */
  exists(name: string): Promise<boolean>;
}

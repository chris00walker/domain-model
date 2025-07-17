import { Entity } from '../../../shared/domain/Entity';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result, success, failure } from '../../../shared/core/Result';
import { Permission } from '../value-objects/Permission';

interface RoleProps {
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role Entity
 * 
 * Represents a role with associated permissions that can be assigned to admin users.
 * Roles define the capabilities and access levels of administrative users.
 */
export class Role extends Entity<RoleProps> {
  
  constructor(props: RoleProps, id?: UniqueEntityID) {
    super(props, id);
  }
  
  get name(): string {
    return this.props.name;
  }
  
  get description(): string {
    return this.props.description;
  }
  
  get permissions(): Permission[] {
    return [...this.props.permissions];
  }
  
  get isSystemRole(): boolean {
    return this.props.isSystemRole;
  }
  
  get createdAt(): Date {
    return this.props.createdAt;
  }
  
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Creates a new role with the specified properties
   */
  public static create(props: Omit<RoleProps, 'createdAt' | 'updatedAt'>, id?: UniqueEntityID): Result<Role> {
    if (!props.name || props.name.trim().length === 0) {
      return failure(new Error('Role must have a name'));
    }
    
    if (!props.permissions || props.permissions.length === 0) {
      return failure(new Error('Role must have at least one permission'));
    }
    
    const now = new Date();
    const role = new Role({
      ...props,
      createdAt: now,
      updatedAt: now
    }, id);
    
    return success(role);
  }
  
  /**
   * Adds a permission to the role
   */
  public addPermission(permission: Permission): Result<void> {
    if (this.isSystemRole) {
      return failure(new Error('Cannot modify permissions of a system role'));
    }
    
    if (!this.hasPermission(permission)) {
      this.props.permissions.push(permission);
      this.props.updatedAt = new Date();
    }
    
    return success(undefined);
  }
  
  /**
   * Removes a permission from the role
   */
  public removePermission(permission: Permission): Result<void> {
    if (this.isSystemRole) {
      return failure(new Error('Cannot modify permissions of a system role'));
    }
    
    const initialLength = this.props.permissions.length;
    this.props.permissions = this.props.permissions.filter(p => p !== permission);
    
    if (this.props.permissions.length < initialLength) {
      this.props.updatedAt = new Date();
    }
    
    return success(undefined);
  }
  
  /**
   * Checks if the role has a specific permission
   */
  public hasPermission(permission: Permission): boolean {
    return this.props.permissions.some(p => p === permission);
  }
  
  /**
   * Updates the role's name and description
   */
  public update(name: string, description: string): Result<void> {
    if (this.isSystemRole) {
      return failure(new Error('Cannot modify a system role'));
    }
    
    if (!name || name.trim().length === 0) {
      return failure(new Error('Role must have a name'));
    }
    
    this.props.name = name;
    this.props.description = description;
    this.props.updatedAt = new Date();
    
    return success(undefined);
  }
}

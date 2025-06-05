import { MongoClient, ObjectId } from 'mongodb';
import { Role } from '../../../domain/entities/Role';
import { IRoleRepository } from '../../../domain/repositories/IRoleRepository';
import { Permission } from '../../../domain/value-objects/Permission';
import { UniqueEntityID } from '../../../../../shared/domain/UniqueEntityID';
import { BaseMongoRepository } from './BaseMongoRepository';

/**
 * MongoDB implementation of the Role repository
 */
export class MongoRoleRepository extends BaseMongoRepository<Role> implements IRoleRepository {
  
  constructor(client: MongoClient, dbName: string) {
    super(client, dbName, 'roles');
  }

  /**
   * Maps a domain Role to a MongoDB document
   */
  protected toPersistence(role: Role): any {
    return {
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => p.value),
      isSystemRole: role.isSystemRole,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    };
  }

  /**
   * Maps a MongoDB document to a domain Role
   */
  protected toDomain(record: any): Role {
    const permissions = (record.permissions || []).map(p => Permission.create(p));
    
    const props = {
      name: record.name,
      description: record.description,
      permissions,
      isSystemRole: record.isSystemRole,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt)
    };
    
    const id = new UniqueEntityID(record._id.toString());
    return Role.create(props, id).getValue();
  }

  /**
   * Find a role by name
   */
  async findByName(name: string): Promise<Role | null> {
    const record = await this.collection.findOne({ name });
    
    if (!record) {
      return null;
    }
    
    return this.toDomain(record);
  }

  /**
   * Get all roles
   */
  async findAll(): Promise<Role[]> {
    const records = await this.collection.find().sort({ name: 1 }).toArray();
    return records.map(record => this.toDomain(record));
  }

  /**
   * Get system roles
   */
  async findSystemRoles(): Promise<Role[]> {
    const records = await this.collection.find({ isSystemRole: true }).sort({ name: 1 }).toArray();
    return records.map(record => this.toDomain(record));
  }

  /**
   * Get custom (non-system) roles
   */
  async findCustomRoles(): Promise<Role[]> {
    const records = await this.collection.find({ isSystemRole: false }).sort({ name: 1 }).toArray();
    return records.map(record => this.toDomain(record));
  }

  /**
   * Delete a role (only if not a system role)
   */
  async delete(id: UniqueEntityID): Promise<boolean> {
    // First check if it's a system role
    const role = await this.findById(id);
    
    if (!role) {
      return false;
    }
    
    if (role.isSystemRole) {
      return false; // Cannot delete system roles
    }
    
    // If not a system role, proceed with deletion
    return super.delete(id);
  }

  /**
   * Check if a role name already exists
   */
  async exists(name: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ name }, { limit: 1 });
    return count > 0;
  }
}

import { MongoClient, ObjectId } from 'mongodb';
import { AdminUser } from '../../../domain/aggregates/AdminUser';
import { Role } from '../../../domain/entities/Role';
import { IAdminUserRepository } from '../../../domain/repositories/IAdminUserRepository';
import { IRoleRepository } from '../../../domain/repositories/IRoleRepository';
import { AdminUserEmail } from '../../../domain/value-objects/AdminUserEmail';
import { AdminUserStatus } from '../../../domain/value-objects/AdminUserStatus';
import { UniqueEntityID } from '../../../../../shared/domain/UniqueEntityID';
import { BaseMongoRepository } from './BaseMongoRepository';

/**
 * MongoDB implementation of the AdminUser repository
 */
export class MongoAdminUserRepository extends BaseMongoRepository<AdminUser> implements IAdminUserRepository {
  private roleRepository: IRoleRepository;
  
  constructor(
    client: MongoClient, 
    dbName: string,
    roleRepository: IRoleRepository
  ) {
    super(client, dbName, 'admin_users');
    this.roleRepository = roleRepository;
  }

  /**
   * Maps a domain AdminUser to a MongoDB document
   */
  protected toPersistence(adminUser: AdminUser): any {
    return {
      email: adminUser.email.value,
      name: adminUser.name,
      roleIds: adminUser.roles.map(role => role.id.toString()),
      status: adminUser.status.value,
      mfaEnabled: adminUser.mfaEnabled,
      lastLogin: adminUser.lastLogin,
      createdAt: adminUser.createdAt,
      updatedAt: adminUser.updatedAt
    };
  }

  /**
   * Maps a MongoDB document to a domain AdminUser
   */
  protected async toDomain(record: any): Promise<AdminUser> {
    // Load referenced roles
    const roles: Role[] = [];
    
    for (const roleId of record.roleIds) {
      const role = await this.roleRepository.findById(new UniqueEntityID(roleId));
      if (role) {
        roles.push(role);
      }
    }

    // Create email value object
    const emailOrError = AdminUserEmail.create(record.email);
    if (emailOrError.isFailure) {
      throw new Error(`Invalid admin user email: ${record.email}`);
    }
    
    // Create admin user
    const adminUserProps = {
      email: emailOrError.getValue(),
      name: record.name,
      roles,
      status: AdminUserStatus.create(record.status),
      mfaEnabled: record.mfaEnabled,
      lastLogin: record.lastLogin ? new Date(record.lastLogin) : undefined,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt)
    };
    
    const id = new UniqueEntityID(record._id.toString());
    
    return AdminUser.create(adminUserProps, id).getValue();
  }

  /**
   * Find an admin user by their email address
   */
  async findByEmail(email: AdminUserEmail): Promise<AdminUser | null> {
    const record = await this.collection.findOne({ email: email.value });
    
    if (!record) {
      return null;
    }
    
    return this.toDomain(record);
  }

  /**
   * Get all admin users, with optional pagination
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<AdminUser[]> {
    const records = await this.collection
      .find()
      .sort({ name: 1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return Promise.all(records.map(record => this.toDomain(record)));
  }

  /**
   * Get admin users by status
   */
  async findByStatus(status: string, limit: number = 100, offset: number = 0): Promise<AdminUser[]> {
    const records = await this.collection
      .find({ status })
      .sort({ name: 1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return Promise.all(records.map(record => this.toDomain(record)));
  }

  /**
   * Check if an email is already in use by an admin user
   */
  async exists(email: AdminUserEmail): Promise<boolean> {
    const count = await this.collection.countDocuments({ email: email.value }, { limit: 1 });
    return count > 0;
  }

  /**
   * Count all admin users
   */
  async count(): Promise<number> {
    return this.collection.countDocuments();
  }
}

import { Result, success, failure } from '../../../../shared/core/Result';
import { AdminUser } from '../aggregates/AdminUser';
import { Role } from '../entities/Role';
import { IAdminUserRepository } from '../repositories/IAdminUserRepository';
import { IRoleRepository } from '../repositories/IRoleRepository';
import { AdminUserEmail } from '../value-objects/AdminUserEmail';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { IAuditLogService } from './IAuditLogService';

/**
 * AdminUserService
 * 
 * Domain service for managing admin user operations.
 */
export class AdminUserService {
  private adminUserRepository: IAdminUserRepository;
  private roleRepository: IRoleRepository;
  private auditLogService: IAuditLogService;
  
  constructor(
    adminUserRepository: IAdminUserRepository,
    roleRepository: IRoleRepository,
    auditLogService: IAuditLogService
  ) {
    this.adminUserRepository = adminUserRepository;
    this.roleRepository = roleRepository;
    this.auditLogService = auditLogService;
  }
  
  /**
   * Creates a new admin user
   */
  public async createAdminUser(
    email: string, 
    name: string, 
    roleIds: string[],
    creatorId: string
  ): Promise<Result<AdminUser>> {
    // Validate email
    const emailOrError = AdminUserEmail.create(email);
    if (emailOrError.isFailure) {
      return failure(emailOrError.error);
    }
    const adminUserEmail = emailOrError.getValue();
    
    // Check if admin user already exists
    const exists = await this.adminUserRepository.exists(adminUserEmail);
    if (exists) {
      return failure('Admin user with this email already exists');
    }
    
    // Retrieve roles
    const roles: Role[] = [];
    for (const roleId of roleIds) {
      const role = await this.roleRepository.findById(new UniqueEntityID(roleId));
      if (!role) {
        return failure(`Role with ID ${roleId} not found`);
      }
      roles.push(role);
    }
    
    if (roles.length === 0) {
      return failure('At least one role must be assigned');
    }
    
    // Create admin user
    const adminUserOrError = AdminUser.create({
      email: adminUserEmail,
      name,
      roles,
      mfaEnabled: false
    });
    
    if (adminUserOrError.isFailure) {
      return failure(adminUserOrError.error);
    }
    
    const adminUser = adminUserOrError.getValue();
    
    // Save admin user
    await this.adminUserRepository.save(adminUser);
    
    // Log action
    await this.auditLogService.logAction({
      actionType: 'ADMIN_USER_CREATED',
      performedBy: new UniqueEntityID(creatorId),
      targetId: adminUser.id,
      details: {
        email: adminUser.email.value,
        name: adminUser.name,
        roleCount: adminUser.roles.length
      }
    });
    
    return success(adminUser);
  }
  
  /**
   * Updates an admin user's roles
   */
  public async updateUserRoles(
    adminUserId: string, 
    roleIds: string[],
    updaterId: string
  ): Promise<Result<void>> {
    // Get admin user
    const adminUser = await this.adminUserRepository.findById(new UniqueEntityID(adminUserId));
    if (!adminUser) {
      return failure('Admin user not found');
    }
    
    // Retrieve roles
    const roles: Role[] = [];
    for (const roleId of roleIds) {
      const role = await this.roleRepository.findById(new UniqueEntityID(roleId));
      if (!role) {
        return failure(`Role with ID ${roleId} not found`);
      }
      roles.push(role);
    }
    
    if (roles.length === 0) {
      return failure('At least one role must be assigned');
    }
    
    // Update roles
    const result = adminUser.assignRoles(roles);
    if (result.isFailure) {
      return failure(result.error);
    }
    
    // Save admin user
    await this.adminUserRepository.save(adminUser);
    
    // Log action
    await this.auditLogService.logAction({
      actionType: 'ADMIN_USER_ROLES_UPDATED',
      performedBy: new UniqueEntityID(updaterId),
      targetId: adminUser.id,
      details: {
        roleIds: roles.map(r => r.id.toString())
      }
    });
    
    return success(undefined);
  }
  
  /**
   * Deactivates an admin user
   */
  public async deactivateAdminUser(
    adminUserId: string,
    deactivatorId: string
  ): Promise<Result<void>> {
    // Get admin user
    const adminUser = await this.adminUserRepository.findById(new UniqueEntityID(adminUserId));
    if (!adminUser) {
      return failure('Admin user not found');
    }
    
    // Check if trying to deactivate oneself
    if (adminUserId === deactivatorId) {
      return failure('An admin user cannot deactivate their own account');
    }
    
    // Deactivate user
    const result = adminUser.deactivate();
    if (result.isFailure) {
      return failure(result.error);
    }
    
    // Save admin user
    await this.adminUserRepository.save(adminUser);
    
    // Log action
    await this.auditLogService.logAction({
      actionType: 'ADMIN_USER_DEACTIVATED',
      performedBy: new UniqueEntityID(deactivatorId),
      targetId: adminUser.id,
      details: {
        email: adminUser.email.value
      }
    });
    
    return success(undefined);
  }
  
  /**
   * Sets up MFA for an admin user
   */
  public async setupMfa(
    adminUserId: string
  ): Promise<Result<void>> {
    // Get admin user
    const adminUser = await this.adminUserRepository.findById(new UniqueEntityID(adminUserId));
    if (!adminUser) {
      return failure('Admin user not found');
    }
    
    // Enable MFA
    const mfaResult = adminUser.enableMfa();
    if (mfaResult.isFailure) {
      return failure(mfaResult.error);
    }
    
    // Activate account if it was pending MFA
    if (adminUser.status.value === 'PENDING_MFA') {
      const activateResult = adminUser.activate();
      if (activateResult.isFailure) {
        return failure(activateResult.error);
      }
    }
    
    // Save admin user
    await this.adminUserRepository.save(adminUser);
    
    // Log action (self-performed)
    await this.auditLogService.logAction({
      actionType: 'ADMIN_USER_MFA_ENABLED',
      performedBy: adminUser.id,
      targetId: adminUser.id,
      details: {}
    });
    
    return success(undefined);
  }
}

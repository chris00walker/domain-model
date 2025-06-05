import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AdminUser } from '../../../src/admin/domain/aggregates/AdminUser';
import { Role } from '../../../src/admin/domain/entities/Role';
import { AdminUserService } from '../../../src/admin/domain/services/AdminUserService';
import { AdminUserStatus } from '../../../src/admin/domain/value-objects/AdminUserStatus';
import { Permission } from '../../../src/admin/domain/value-objects/Permission';
import { IAdminUserRepository } from '../../../src/admin/domain/repositories/IAdminUserRepository';
import { IRoleRepository } from '../../../src/admin/domain/repositories/IRoleRepository';
import { IAuditLogService } from '../../../src/admin/domain/services/IAuditLogService';
import { Result } from '../../../src/shared/core/Result';
import { UniqueEntityID } from '../../../src/shared/domain/UniqueEntityID';

describe('Admin User MFA Invariant Tests', () => {
  let adminUserRepo: IAdminUserRepository;
  let roleRepo: IRoleRepository;
  let auditLogService: IAuditLogService;
  let adminUserService: AdminUserService;
  let adminUser: AdminUser;
  let adminRole: Role;
  let editorRole: Role;

  beforeEach(() => {
    // Setup mocks
    adminUserRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
      delete: jest.fn(),
    } as unknown as IAdminUserRepository;

    roleRepo = {
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as unknown as IRoleRepository;

    auditLogService = {
      logEvent: jest.fn().mockResolvedValue(true),
    } as unknown as IAuditLogService;

    // Create admin service with mocked dependencies
    adminUserService = new AdminUserService(adminUserRepo, roleRepo, auditLogService);

    // Create admin user
    const createAdminResult = AdminUser.create({
      email: 'admin@eliasfoods.com',
      name: 'Admin User',
      passwordHash: 'hashed_password',
      status: AdminUserStatus.INACTIVE,
      roles: [],
      lastLogin: null
    }, new UniqueEntityID());

    adminUser = createAdminResult.getValue();

    // Create test roles
    const adminPermissions = [
      Permission.create({ name: 'manage_users', description: 'Can manage users' }).getValue(),
      Permission.create({ name: 'manage_roles', description: 'Can manage roles' }).getValue(),
      Permission.create({ name: 'manage_settings', description: 'Can manage system settings' }).getValue()
    ];

    const editorPermissions = [
      Permission.create({ name: 'moderate_content', description: 'Can moderate content' }).getValue()
    ];

    const createAdminRoleResult = Role.create({
      name: 'Administrator',
      description: 'Full system access',
      permissions: adminPermissions,
      isSystemRole: true
    }, new UniqueEntityID());

    const createEditorRoleResult = Role.create({
      name: 'Editor',
      description: 'Can edit and moderate content',
      permissions: editorPermissions,
      isSystemRole: false
    }, new UniqueEntityID());

    adminRole = createAdminRoleResult.getValue();
    editorRole = createEditorRoleResult.getValue();
  });

  it('should not allow assigning privileged roles without MFA enabled', async () => {
    // Setup
    jest.spyOn(adminUserRepo, 'findById').mockResolvedValue(Result.ok(adminUser));
    jest.spyOn(roleRepo, 'findById').mockResolvedValue(Result.ok(adminRole));
    
    // Test invariant: cannot assign admin role without MFA
    const result = await adminUserService.assignRole(
      adminUser.id.toString(),
      adminRole.id.toString()
    );
    
    // Verify the role assignment was rejected due to missing MFA
    expect(result.isFailure).toBeTruthy();
    expect(result.error).toContain('MFA must be enabled');
    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'AdminUser',
        actionType: 'PERMISSION_DENIED',
        details: expect.stringContaining('MFA required')
      })
    );
  });

  it('should allow assigning privileged roles when MFA is enabled', async () => {
    // Setup user with MFA enabled
    const mfaEnabledUser = AdminUser.create({
      email: 'admin@eliasfoods.com',
      name: 'Admin User',
      passwordHash: 'hashed_password',
      status: AdminUserStatus.ACTIVE, // Active status means MFA is enabled
      roles: [],
      lastLogin: new Date()
    }, new UniqueEntityID()).getValue();
    
    jest.spyOn(adminUserRepo, 'findById').mockResolvedValue(Result.ok(mfaEnabledUser));
    jest.spyOn(roleRepo, 'findById').mockResolvedValue(Result.ok(adminRole));
    
    // Test with MFA enabled
    const result = await adminUserService.assignRole(
      mfaEnabledUser.id.toString(),
      adminRole.id.toString()
    );
    
    // Verify the role assignment was successful
    expect(result.isSuccess).toBeTruthy();
    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'AdminUser',
        actionType: 'ROLE_ASSIGNED',
        details: expect.stringContaining('Administrator')
      })
    );
  });
  
  it('should allow assigning non-privileged roles without MFA enabled', async () => {
    // Setup
    jest.spyOn(adminUserRepo, 'findById').mockResolvedValue(Result.ok(adminUser));
    jest.spyOn(roleRepo, 'findById').mockResolvedValue(Result.ok(editorRole));
    
    // Test with non-privileged role
    const result = await adminUserService.assignRole(
      adminUser.id.toString(),
      editorRole.id.toString()
    );
    
    // Verify the role assignment was allowed for non-privileged role
    expect(result.isSuccess).toBeTruthy();
  });
});

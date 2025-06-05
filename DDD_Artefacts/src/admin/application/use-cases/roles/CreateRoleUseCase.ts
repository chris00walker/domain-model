import { Result, success, failure } from '../../../../shared/core/Result';
import { Permission, PermissionValue } from '../../../domain/value-objects/Permission';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { IRoleRepository } from '../../../domain/repositories/IRoleRepository';
import { IAuditLogService } from '../../../domain/services/IAuditLogService';
import { Role } from '../../../domain/entities/Role';

// Define UseCase interface directly since the import is causing issues
interface UseCase<Request, Response> {
  execute(request: Request): Promise<Response>;
}

interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
  createdById: string;
}

type CreateRoleResponse = Result<{
  roleId: string;
  name: string;
  isSystemRole: boolean;
}, Error>;

/**
 * CreateRoleUseCase
 * 
 * Use case for creating a new role with specific permissions
 */
export class CreateRoleUseCase implements UseCase<CreateRoleRequest, CreateRoleResponse> {
  
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly auditLogService: IAuditLogService
  ) {}
  
  async execute(request: CreateRoleRequest): Promise<CreateRoleResponse> {
    try {
      // Validate request
      if (!request.name || request.name.trim() === '') {
        return failure(new Error('Role name is required'));
      }
      
      if (!request.permissions || request.permissions.length === 0) {
        return failure(new Error('At least one permission is required'));
      }
      
      // Check if role with same name already exists
      const roleExists = await this.roleRepository.exists(request.name);
      if (roleExists) {
        return failure(new Error(`Role with name '${request.name}' already exists`));
      }
      
      // Convert permission strings to Permission value objects
      const permissions: Permission[] = [];
      for (const permString of request.permissions) {
        // Check if the string matches a valid PermissionValue enum
        const permValue = Object.values(PermissionValue).find(
          value => value === permString
        ) as PermissionValue | undefined;
        
        if (!permValue) {
          return failure(new Error(`Invalid permission: ${permString}. Must match a defined permission value.`));
        }
        
        const permissionOrError = Permission.create(permValue);
        if (permissionOrError.isFailure) {
          return failure(new Error(`Invalid permission: ${permString}`));
        }
        permissions.push(permissionOrError.getValue());
      }
      
      // Create the role using the domain entity
      const roleOrError = Role.create({
        name: request.name,
        description: request.description || '',
        permissions,
        isSystemRole: false // Custom roles created through this use case are never system roles
      });
      
      if (roleOrError.isFailure) {
        return failure(new Error(roleOrError.error));
      }
      
      const role = roleOrError.getValue();
      
      // Save to repository
      await this.roleRepository.save(role);
      
      // Log the action
      await this.auditLogService.logAction({
        actionType: 'ROLE_CREATED',
        performedBy: new UniqueEntityID(request.createdById),
        targetId: role.id,
        details: {
          roleName: role.name,
          permissionCount: permissions.length
        }
      });
      
      return success({
        roleId: role.id.toString(),
        name: role.name,
        isSystemRole: role.isSystemRole
      });
      
    } catch (error: any) {
      return failure(new Error(`Failed to create role: ${error.message || error}`));
    }
  }
}

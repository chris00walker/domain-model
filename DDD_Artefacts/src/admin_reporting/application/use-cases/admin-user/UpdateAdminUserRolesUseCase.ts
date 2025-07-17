import { Result, success, failure } from '../../../../shared/core/Result';
import { AdminUserService } from '../../../domain/services/AdminUserService';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';

interface UpdateAdminUserRolesRequest {
  adminUserId: string;
  roleIds: string[];
  updatedById: string;
}

type UpdateAdminUserRolesResponse = Result<{
  adminUserId: string;
  roleIds: string[];
}, Error>;

/**
 * UpdateAdminUserRolesUseCase
 * 
 * Use case for updating the roles assigned to an admin user
 */
export class UpdateAdminUserRolesUseCase {
  
  constructor(
    private readonly adminUserService: AdminUserService
  ) {}
  
  async execute(request: UpdateAdminUserRolesRequest): Promise<UpdateAdminUserRolesResponse> {
    try {
      // Input validation
      if (!request.adminUserId) {
        return failure(new Error('Admin user ID is required'));
      }
      
      if (!request.roleIds || !Array.isArray(request.roleIds)) {
        return failure(new Error('Role IDs must be provided as an array'));
      }
      
      if (!request.updatedById) {
        return failure(new Error('Updater ID is required'));
      }
      
      // Update user roles via domain service
      const result = await this.adminUserService.updateUserRoles(
        request.adminUserId, 
        request.roleIds,
        request.updatedById
      );
      
      if (result.isFailure()) {
        return failure(result.getErrorValue());
      }
      
      // Return success response
      return success({
        adminUserId: request.adminUserId,
        roleIds: request.roleIds
      });
      
    } catch (error: any) {
      return failure(new Error(`Failed to update admin user roles: ${error.message || error}`));
    }
  }
}

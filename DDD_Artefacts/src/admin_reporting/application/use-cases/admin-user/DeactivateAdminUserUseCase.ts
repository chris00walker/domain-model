import { Result, success, failure } from '../../../../shared/core/Result';
import { AdminUserService } from '../../../domain/services/AdminUserService';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';

interface DeactivateAdminUserRequest {
  adminUserId: string;
  deactivatorId: string;
}

type DeactivateAdminUserResponse = Result<void, Error>;

/**
 * DeactivateAdminUserUseCase
 * 
 * Use case for deactivating an admin user account
 */
export class DeactivateAdminUserUseCase {
  
  constructor(
    private readonly adminUserService: AdminUserService
  ) {}
  
  async execute(request: DeactivateAdminUserRequest): Promise<DeactivateAdminUserResponse> {
    try {
      // Input validation
      if (!request.adminUserId) {
        return failure(new Error('Admin user ID is required'));
      }
      
      if (!request.deactivatorId) {
        return failure(new Error('Deactivator ID is required'));
      }
      
      // Prevent self-deactivation
      if (request.adminUserId === request.deactivatorId) {
        return failure(new Error('Administrators cannot deactivate their own accounts'));
      }
      
      // Deactivate the user via domain service
      const result = await this.adminUserService.deactivateAdminUser(
        request.adminUserId, 
        request.deactivatorId
      );
      
      if (result.isFailure) {
        return failure(new Error(result.error));
      }
      
      return success(undefined);
      
    } catch (error: any) {
      return failure(new Error(`Failed to deactivate admin user: ${error.message || error}`));
    }
  }
}

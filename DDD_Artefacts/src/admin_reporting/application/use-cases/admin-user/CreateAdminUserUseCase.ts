import { Result, success, failure } from '../../../../shared/core/Result';
import { AdminUserService } from '../../../domain/services/AdminUserService';
import { IRoleRepository } from '../../../domain/repositories/IRoleRepository';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { UseCase } from '../../../../shared/application/UseCase';

interface CreateAdminUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
  createdById: string;
}

type CreateAdminUserResponse = Result<{
  adminUserId: string;
  email: string;
}, Error>;

/**
 * CreateAdminUserUseCase
 * 
 * Use case for creating a new admin user in the system
 */
export class CreateAdminUserUseCase implements UseCase<CreateAdminUserRequest, CreateAdminUserResponse> {
  
  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly roleRepository: IRoleRepository
  ) {}
  
  async execute(request: CreateAdminUserRequest): Promise<CreateAdminUserResponse> {
    try {
      // Validate roles exist
      for (const roleId of request.roleIds) {
        const role = await this.roleRepository.findById(
          new UniqueEntityID(roleId)
        );
        
        if (!role) {
          return failure(new Error(`Role with ID ${roleId} does not exist`));
        }
      }
      
      // Map role IDs to UniqueEntityIDs
      const roleUniqueIds = request.roleIds.map(
        roleId => new UniqueEntityID(roleId)
      );
      
      // Create admin user via domain service
      const adminUserResult = await this.adminUserService.createAdminUser(
        request.email,
        `${request.firstName} ${request.lastName}`,
        request.roleIds,
        request.createdById
      );
      
      if (adminUserResult.isFailure()) {
        return failure(adminUserResult.getErrorValue());
      }
      
      const adminUser = adminUserResult.getValue();
      
      return success({
        adminUserId: adminUser.id.toString(),
        email: adminUser.email.value
      });
      
    } catch (error) {
      return failure(new Error(`Failed to create admin user: ${(error as Error).message}`));
    }
  }
}

import { Result, success, failure } from '../../../../shared/core/Result';
import { AdminUserService } from '../../../domain/services/AdminUserService';
import { RoleRepository } from '../../../domain/repositories/IRoleRepository';
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
}>;

/**
 * CreateAdminUserUseCase
 * 
 * Use case for creating a new admin user in the system
 */
export class CreateAdminUserUseCase implements UseCase<CreateAdminUserRequest, CreateAdminUserResponse> {
  
  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly roleRepository: RoleRepository
  ) {}
  
  async execute(request: CreateAdminUserRequest): Promise<CreateAdminUserResponse> {
    try {
      // Validate roles exist
      for (const roleId of request.roleIds) {
        const roleExists = await this.roleRepository.exists(
          new UniqueEntityID(roleId)
        );
        
        if (!roleExists) {
          return failure(`Role with ID ${roleId} does not exist`);
        }
      }
      
      // Map role IDs to UniqueEntityIDs
      const roleUniqueIds = request.roleIds.map(
        roleId => new UniqueEntityID(roleId)
      );
      
      // Create admin user via domain service
      const adminUserResult = await this.adminUserService.createAdminUser({
        email: request.email,
        password: request.password,
        firstName: request.firstName,
        lastName: request.lastName,
        roleIds: roleUniqueIds,
        createdById: new UniqueEntityID(request.createdById)
      });
      
      if (adminUserResult.isFailure) {
        return failure(adminUserResult.error);
      }
      
      const adminUser = adminUserResult.getValue();
      
      return success({
        adminUserId: adminUser.id.toString(),
        email: adminUser.email.value
      });
      
    } catch (error) {
      return failure(`Failed to create admin user: ${error.message}`);
    }
  }
}

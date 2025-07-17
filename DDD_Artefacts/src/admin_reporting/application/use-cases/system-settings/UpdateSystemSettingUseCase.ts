import { Result, success, failure } from '../../../../shared/core/Result';
import { SystemSettingService } from '../../../domain/services/SystemSettingService';
import { UseCase } from '../../../../shared/application/UseCase';
import { SystemSettingKey } from '../../../domain/value-objects/SystemSettingKey';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';

interface UpdateSystemSettingRequest {
  key: string;
  value: any;
  description?: string;
  updatedById: string;
}

type UpdateSystemSettingResponse = Result<{
  key: string;
  valueType: string;
  isEncrypted: boolean;
  isFeatureFlag: boolean;
  isSecuritySetting: boolean;
}, Error>;

/**
 * UpdateSystemSettingUseCase
 * 
 * Use case for updating or creating system settings
 */
export class UpdateSystemSettingUseCase implements UseCase<UpdateSystemSettingRequest, UpdateSystemSettingResponse> {
  
  constructor(
    private readonly systemSettingService: SystemSettingService
  ) {}
  
  async execute(request: UpdateSystemSettingRequest): Promise<UpdateSystemSettingResponse> {
    try {
      // Get key string
      const keyString = request.key;
      
      // Convert value to string format for the service
      // (SystemSettingService will handle proper typing internally)
      const stringValue = typeof request.value === 'object' ? 
        JSON.stringify(request.value) : String(request.value);
      
      // Determine if this is a security setting that should be encrypted
      const keyOrError = SystemSettingKey.create(keyString);
      if (keyOrError.isFailure()) {
        return failure(new Error(`Invalid system setting key: ${request.key}`));
      }
      const key = keyOrError.getValue();
      const isSecuritySetting = key.isSecuritySetting();
      
      // Update or create the system setting using the domain service
      const settingResult = await this.systemSettingService.saveSystemSetting(
        request.key,
        stringValue,
        request.description,
        isSecuritySetting, // encrypt if it's a security setting
        request.updatedById
      );
      
      if (settingResult.isFailure()) {
        return failure(settingResult.getErrorValue());
      }
      
      const setting = settingResult.getValue();
      
      return success({
        key: setting.key.value,
        valueType: setting.key.getValueType(),
        isEncrypted: setting.isEncrypted,
        isFeatureFlag: setting.key.isFeatureFlag(),
        isSecuritySetting: setting.key.isSecuritySetting()
      });
      
    } catch (error: any) {
      return failure(new Error(`Failed to update system setting: ${error.message || error}`));
    }
  }
}

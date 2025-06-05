import { Result, success, failure } from '../../../../shared/core/Result';
import { SystemSettingService } from '../../../domain/services/SystemSettingService';

interface GetSystemSettingsRequest {
  category?: string;
  includeSecuritySettings?: boolean;
  limit?: number;
  offset?: number;
}

interface SystemSettingDTO {
  id: string;
  key: string;
  value: string;
  description: string;
  isSecuritySetting: boolean;
  category: string;
  lastUpdated: Date;
  lastUpdatedBy: string;
}

type GetSystemSettingsResponse = Result<{
  settings: SystemSettingDTO[];
  totalCount: number;
}, Error>;

/**
 * GetSystemSettingsUseCase
 * 
 * Use case for retrieving system settings with optional filtering by category
 */
export class GetSystemSettingsUseCase {
  
  constructor(
    private readonly systemSettingService: SystemSettingService
  ) {}
  
  async execute(request: GetSystemSettingsRequest): Promise<GetSystemSettingsResponse> {
    try {
      const {
        category,
        includeSecuritySettings = false,
        limit = 50,
        offset = 0
      } = request;
      
      // Get system settings from domain service
      const settingsResult = await this.systemSettingService.getSystemSettings(
        category,
        includeSecuritySettings,
        limit,
        offset
      );
      
      if (settingsResult.isFailure) {
        return failure(new Error(settingsResult.error));
      }
      
      const { settings, totalCount } = settingsResult.getValue();
      
      // Map domain entities to DTOs
      const settingDTOs = settings.map(setting => ({
        id: setting.id.toString(),
        key: setting.key,
        value: setting.value,
        description: setting.description || '',
        isSecuritySetting: setting.isEncrypted,
        category: setting.category || 'general',
        lastUpdated: setting.updatedAt,
        lastUpdatedBy: setting.updatedBy ? setting.updatedBy.toString() : ''
      }));
      
      return success({
        settings: settingDTOs,
        totalCount
      });
      
    } catch (error: any) {
      return failure(new Error(`Failed to retrieve system settings: ${error.message || error}`));
    }
  }
}

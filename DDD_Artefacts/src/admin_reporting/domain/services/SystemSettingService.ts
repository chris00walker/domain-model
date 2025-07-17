import { Result, success, failure } from '../../../shared/core/Result';
import { SystemSetting } from '../aggregates/SystemSetting';
import { ISystemSettingRepository } from '../repositories/ISystemSettingRepository';
import { SystemSettingKey } from '../value-objects/SystemSettingKey';
import { SystemSettingValue } from '../value-objects/SystemSettingValue';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { IAuditLogService } from './IAuditLogService';

/**
 * SystemSettingService
 * 
 * Domain service for managing system settings.
 */
export class SystemSettingService {
  private systemSettingRepository: ISystemSettingRepository;
  private auditLogService: IAuditLogService;
  
  constructor(
    systemSettingRepository: ISystemSettingRepository,
    auditLogService: IAuditLogService
  ) {
    this.systemSettingRepository = systemSettingRepository;
    this.auditLogService = auditLogService;
  }
  
  /**
   * Creates or updates a system setting
   */
  public async saveSystemSetting(
    keyString: string,
    value: string,
    description: string | undefined,
    isEncrypted: boolean,
    adminId: string
  ): Promise<Result<SystemSetting>> {
    // Create key value object
    const keyOrError = SystemSettingKey.create(keyString);
    if (keyOrError.isFailure()) {
      return failure(keyOrError.getErrorValue());
    }
    const key = keyOrError.getValue();
    
    // Check if setting already exists
    const existingSetting = await this.systemSettingRepository.findByKey(key);
    
    if (existingSetting) {
      // Update existing setting
      const updateResult = existingSetting.updateValue(value, new UniqueEntityID(adminId));
      if (updateResult.isFailure()) {
        return failure(updateResult.getErrorValue());
      }
      
      // Update description if provided
      if (description !== undefined) {
        existingSetting.updateDescription(description, new UniqueEntityID(adminId));
      }
      
      // Update encryption flag if different
      if (isEncrypted !== existingSetting.isEncrypted) {
        const encryptionResult = existingSetting.setEncryption(isEncrypted, new UniqueEntityID(adminId));
        if (encryptionResult.isFailure()) {
          return failure(encryptionResult.getErrorValue());
        }
      }
      
      // Save setting
      await this.systemSettingRepository.save(existingSetting);
      
      // Log action
      await this.auditLogService.logAction({
        actionType: 'SYSTEM_SETTING_UPDATED',
        performedBy: new UniqueEntityID(adminId),
        targetId: existingSetting.id,
        details: {
          key: key.value,
          encrypted: isEncrypted ? 'Yes' : 'No'
        }
      });
      
      return success(existingSetting);
    } else {
      // Create value value object
      const valueOrError = SystemSettingValue.create(key, value);
      if (valueOrError.isFailure()) {
        return failure(valueOrError.getErrorValue());
      }
      const settingValue = valueOrError.getValue();
      
      // Create new setting
      const settingOrError = SystemSetting.create({
        key,
        value: settingValue,
        description,
        isEncrypted,
        lastModifiedBy: new UniqueEntityID(adminId)
      });
      
      if (settingOrError.isFailure()) {
        return failure(settingOrError.getErrorValue());
      }
      
      const setting = settingOrError.getValue();
      
      // Save setting
      await this.systemSettingRepository.save(setting);
      
      // Log action
      await this.auditLogService.logAction({
        actionType: 'SYSTEM_SETTING_CREATED',
        performedBy: new UniqueEntityID(adminId),
        targetId: setting.id,
        details: {
          key: key.value,
          encrypted: isEncrypted ? 'Yes' : 'No'
        }
      });
      
      return success(setting);
    }
  }
  
  /**
   * Gets a system setting by key
   */
  public async getSystemSetting<T>(keyString: string): Promise<Result<T, Error>> {
    // Create key value object
    const keyOrError = SystemSettingKey.create(keyString);
    if (keyOrError.isFailure()) {
      return failure(keyOrError.getErrorValue());
    }
    const key = keyOrError.getValue();
    
    // Get setting
    const setting = await this.systemSettingRepository.findByKey(key);
    if (!setting) {
      return failure(new Error(`System setting with key ${keyString} not found`));
    }
    
    // Return typed value
    return success(setting.value.value as T);
  }
  
  /**
   * Gets all feature flags
   */
  public async getFeatureFlags(): Promise<Record<string, boolean>> {
    const featureFlags: Record<string, boolean> = {};
    
    // Get all feature flag settings
    const settings = await this.systemSettingRepository.findAllFeatureFlags();
    
    // Extract values
    for (const setting of settings) {
      featureFlags[setting.key.value] = setting.value.value as boolean;
    }
    
    return featureFlags;
  }
  
  /**
   * Gets all security settings
   */
  public async getSecuritySettings(): Promise<Record<string, any>> {
    const securitySettings: Record<string, any> = {};
    
    // Get all security settings
    const settings = await this.systemSettingRepository.findAllSecuritySettings();
    
    // Extract values
    for (const setting of settings) {
      securitySettings[setting.key.value] = setting.value.value;
    }
    
    return securitySettings;
  }
  
  /**
   * Gets system settings with optional filtering
   */
  public async getSystemSettings(
    category?: string,
    includeSecuritySettings: boolean = false,
    limit: number = 50,
    offset: number = 0
  ): Promise<Result<{ settings: SystemSetting[]; totalCount: number }>> {
    try {
      // Get settings with filters
      const settings = await this.systemSettingRepository.findAll({
        category,
        includeSecuritySettings,
        limit,
        offset
      });
      
      // Get total count for pagination
      const totalCount = await this.systemSettingRepository.count({
        category,
        includeSecuritySettings
      });
      
      return success({
        settings,
        totalCount
      });
    } catch (error: any) {
      return failure(new Error(`Failed to retrieve system settings: ${error.message || error}`));
    }
  }
}

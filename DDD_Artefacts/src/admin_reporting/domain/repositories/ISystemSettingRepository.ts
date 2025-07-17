import { SystemSetting } from '../aggregates/SystemSetting';
import { SystemSettingKey } from '../value-objects/SystemSettingKey';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';

export interface SystemSettingFilters {
  category?: string;
  includeSecuritySettings?: boolean;
  limit?: number;
  offset?: number;
};

/**
 * ISystemSettingRepository
 * 
 * Repository interface for managing system settings.
 */
export interface ISystemSettingRepository {
  /**
   * Find a system setting by its unique ID
   */
  findById(id: UniqueEntityID): Promise<SystemSetting | null>;
  
  /**
   * Find a system setting by its key
   */
  findByKey(key: SystemSettingKey): Promise<SystemSetting | null>;
  
  /**
   * Get all system settings
   */
  findAll(filters?: SystemSettingFilters): Promise<SystemSetting[]>;
  
  /**
   * Count system settings based on filters
   */
  count(filters?: SystemSettingFilters): Promise<number>;
  
  /**
   * Get all feature flag settings
   */
  findAllFeatureFlags(): Promise<SystemSetting[]>;
  
  /**
   * Get all security settings
   */
  findAllSecuritySettings(): Promise<SystemSetting[]>;
  
  /**
   * Save a new or updated system setting
   */
  save(systemSetting: SystemSetting): Promise<void>;
  
  /**
   * Check if a system setting with the given key exists
   */
  exists(key: SystemSettingKey): Promise<boolean>;
}

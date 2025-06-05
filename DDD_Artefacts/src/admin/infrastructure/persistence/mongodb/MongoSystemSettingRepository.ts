import { MongoClient, ObjectId } from 'mongodb';
import { SystemSetting } from '../../../domain/aggregates/SystemSetting';
import { ISystemSettingRepository } from '../../../domain/repositories/ISystemSettingRepository';
import { SystemSettingKey } from '../../../domain/value-objects/SystemSettingKey';
import { SystemSettingValue } from '../../../domain/value-objects/SystemSettingValue';
import { UniqueEntityID } from '../../../../../shared/domain/UniqueEntityID';
import { BaseMongoRepository } from './BaseMongoRepository';

/**
 * MongoDB implementation of the SystemSetting repository
 */
export class MongoSystemSettingRepository extends BaseMongoRepository<SystemSetting> implements ISystemSettingRepository {
  
  constructor(client: MongoClient, dbName: string) {
    super(client, dbName, 'system_settings');
  }

  /**
   * Maps a domain SystemSetting to a MongoDB document
   */
  protected toPersistence(setting: SystemSetting): any {
    return {
      key: setting.key.value,
      value: setting.value.rawValue,
      valueType: setting.key.valueType(),
      description: setting.description,
      isEncrypted: setting.isEncrypted,
      isFeatureFlag: setting.key.isFeatureFlag(),
      isSecuritySetting: setting.key.isSecuritySetting(),
      lastModifiedBy: setting.lastModifiedBy.toString(),
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt
    };
  }

  /**
   * Maps a MongoDB document to a domain SystemSetting
   */
  protected toDomain(record: any): SystemSetting {
    const key = SystemSettingKey.create(record.key);
    const valueOrError = SystemSettingValue.create(key, record.value);
    
    if (valueOrError.isFailure) {
      throw new Error(`Invalid system setting value for key ${record.key}: ${valueOrError.error}`);
    }
    
    const props = {
      key,
      value: valueOrError.getValue(),
      description: record.description,
      isEncrypted: record.isEncrypted,
      lastModifiedBy: new UniqueEntityID(record.lastModifiedBy),
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt)
    };
    
    const id = new UniqueEntityID(record._id.toString());
    return SystemSetting.create(props, id).getValue();
  }

  /**
   * Find a system setting by its key
   */
  async findByKey(key: SystemSettingKey): Promise<SystemSetting | null> {
    const record = await this.collection.findOne({ key: key.value });
    
    if (!record) {
      return null;
    }
    
    return this.toDomain(record);
  }

  /**
   * Get all system settings
   */
  async findAll(): Promise<SystemSetting[]> {
    const records = await this.collection.find().sort({ key: 1 }).toArray();
    return records.map(record => this.toDomain(record));
  }

  /**
   * Get all feature flag settings
   */
  async findAllFeatureFlags(): Promise<SystemSetting[]> {
    const records = await this.collection.find({ isFeatureFlag: true }).sort({ key: 1 }).toArray();
    return records.map(record => this.toDomain(record));
  }

  /**
   * Get all security settings
   */
  async findAllSecuritySettings(): Promise<SystemSetting[]> {
    const records = await this.collection.find({ isSecuritySetting: true }).sort({ key: 1 }).toArray();
    return records.map(record => this.toDomain(record));
  }

  /**
   * Check if a system setting with the given key exists
   */
  async exists(key: SystemSettingKey): Promise<boolean> {
    const count = await this.collection.countDocuments({ key: key.value }, { limit: 1 });
    return count > 0;
  }
}

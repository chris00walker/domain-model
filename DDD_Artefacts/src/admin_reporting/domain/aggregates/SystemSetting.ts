import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result, success, failure } from '../../../shared/core/Result';
import { SystemSettingKey } from '../value-objects/SystemSettingKey';
import { SystemSettingValue } from '../value-objects/SystemSettingValue';
import { SystemSettingUpdatedEvent } from '../events/SystemSettingUpdatedEvent';

interface SystemSettingProps {
  key: SystemSettingKey;
  value: SystemSettingValue;
  description?: string;
  isEncrypted: boolean;
  lastModifiedBy: UniqueEntityID;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SystemSetting Aggregate Root
 * 
 * Represents a configurable system setting that can be managed by administrators.
 * Handles the management of application configuration parameters.
 */
export class SystemSetting extends AggregateRoot<SystemSettingProps> {
  
  constructor(props: SystemSettingProps, id?: UniqueEntityID) {
    super(props, id);
  }
  
  get key(): SystemSettingKey {
    return this.props.key;
  }
  
  get value(): SystemSettingValue {
    return this.props.value;
  }
  
  get description(): string | undefined {
    return this.props.description;
  }
  
  get isEncrypted(): boolean {
    return this.props.isEncrypted;
  }
  
  get lastModifiedBy(): UniqueEntityID {
    return this.props.lastModifiedBy;
  }
  
  get createdAt(): Date {
    return this.props.createdAt;
  }
  
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Creates a new system setting
   */
  public static create(props: Omit<SystemSettingProps, 'createdAt' | 'updatedAt'>, id?: UniqueEntityID): Result<SystemSetting> {
    const now = new Date();
    
    const systemSetting = new SystemSetting({
      ...props,
      createdAt: now,
      updatedAt: now
    }, id);
    
    return success(systemSetting);
  }
  
  /**
   * Updates the value of a system setting
   */
  public updateValue(value: string, modifiedBy: UniqueEntityID): Result<void> {
    const valueResult = SystemSettingValue.create(this.props.key, value);
    
    if (valueResult.isFailure()) {
      return failure(valueResult.getErrorValue());
    }
    
    const previousValue = this.props.value.rawValue;
    this.props.value = valueResult.getValue();
    this.props.lastModifiedBy = modifiedBy;
    this.props.updatedAt = new Date();
    
    // Add domain event
    this.addDomainEvent(new SystemSettingUpdatedEvent(
      this,
      previousValue
    ));
    
    return success(undefined);
  }
  
  /**
   * Updates the description of a system setting
   */
  public updateDescription(description: string, modifiedBy: UniqueEntityID): Result<void> {
    this.props.description = description;
    this.props.lastModifiedBy = modifiedBy;
    this.props.updatedAt = new Date();
    
    return success(undefined);
  }
  
  /**
   * Sets whether the value should be encrypted in storage
   */
  public setEncryption(isEncrypted: boolean, modifiedBy: UniqueEntityID): Result<void> {
    // Only allow encryption changes if security setting
    if (!this.props.key.isSecuritySetting() && isEncrypted) {
      return failure(new Error('Only security settings can be encrypted'));
    }
    
    this.props.isEncrypted = isEncrypted;
    this.props.lastModifiedBy = modifiedBy;
    this.props.updatedAt = new Date();
    
    return success(undefined);
  }
}

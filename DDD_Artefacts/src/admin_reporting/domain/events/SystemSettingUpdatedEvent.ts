import { DomainEvent } from '../../../shared/domain/events/DomainEvent';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { SystemSetting } from '../aggregates/SystemSetting';

/**
 * SystemSettingUpdatedEvent
 * 
 * Domain event emitted when a system setting is updated.
 */
export class SystemSettingUpdatedEvent extends DomainEvent {
  public dateTimeOccurred: Date;
  public systemSetting: SystemSetting;
  public previousValue: string;

  constructor(systemSetting: SystemSetting, previousValue: string) {
    super({
      aggregateId: systemSetting.id.toString(),
      eventId: new UniqueEntityID().toString(),
      occurredOn: new Date()
    });
    this.dateTimeOccurred = new Date();
    this.systemSetting = systemSetting;
    this.previousValue = previousValue;
  }
  
  toPrimitives() {
    return {
      dateTimeOccurred: this.dateTimeOccurred,
      settingKey: this.systemSetting.key.value,
      settingId: this.systemSetting.id.toString(),
      previousValue: this.previousValue,
      newValue: this.systemSetting.value.rawValue
    };
  }

  getAggregateId(): UniqueEntityID {
    return new UniqueEntityID(this.systemSetting.id);
  }
}

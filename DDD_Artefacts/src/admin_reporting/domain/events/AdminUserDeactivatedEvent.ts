import { IDomainEvent } from '../../../../shared/domain/events/IDomainEvent';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { AdminUser } from '../aggregates/AdminUser';

/**
 * AdminUserDeactivatedEvent
 * 
 * Domain event emitted when an administrative user is deactivated.
 */
export class AdminUserDeactivatedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;
  public adminUser: AdminUser;

  constructor(adminUser: AdminUser) {
    this.dateTimeOccurred = new Date();
    this.adminUser = adminUser;
  }

  getAggregateId(): UniqueEntityID {
    return this.adminUser.id;
  }
}

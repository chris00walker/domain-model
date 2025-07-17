import { IDomainEvent } from '../../../../shared/domain/events/IDomainEvent';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { AdminUser } from '../aggregates/AdminUser';

/**
 * AdminUserCreatedEvent
 * 
 * Domain event emitted when a new administrative user is created.
 */
export class AdminUserCreatedEvent implements IDomainEvent {
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

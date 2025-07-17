import { DomainEvent } from '../../../shared/domain/events/DomainEvent';
import { AdminUser } from '../aggregates/AdminUser';

/**
 * AdminUserDeactivatedEvent
 * 
 * Domain event emitted when an administrative user is deactivated.
 */
export class AdminUserDeactivatedEvent extends DomainEvent {
  public readonly adminUser: AdminUser;

  constructor(adminUser: AdminUser) {
    super({
      aggregateId: adminUser.id.toString()
    });
    this.adminUser = adminUser;
  }

  toPrimitives(): any {
    return {
      adminUserId: this.adminUser.id.toString(),
      email: this.adminUser.email,
      name: this.adminUser.name,
      roles: this.adminUser.roles.map(r => r.name),
      status: this.adminUser.status.value,
      eventId: this.eventId,
      occurredOn: this.occurredOn.toISOString(),
      aggregateId: this.aggregateId
    };
  }
}

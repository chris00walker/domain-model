import { DomainEvent } from '@shared/domain/events/DomainEvent';
import { Customer } from '../aggregates/Customer';

/**
 * Domain event raised when a customer's information is updated
 */
export class CustomerUpdated extends DomainEvent {
  private readonly customer: Customer;
  private readonly updatedFields: string[];

  constructor(customer: Customer, updatedFields: string[]) {
    super({
      aggregateId: customer.id,
      eventId: undefined,
      occurredOn: undefined,
    });
    this.customer = customer;
    this.updatedFields = updatedFields;
  }

  toPrimitives(): any {
    return {
      aggregateId: this.aggregateId,
      customerId: this.customer.customerId.toString(),
      customerName: this.customer.name,
      customerType: this.customer.type.toString(),
      updatedFields: this.updatedFields,
      occurredOn: this.occurredOn
    };
  }
}

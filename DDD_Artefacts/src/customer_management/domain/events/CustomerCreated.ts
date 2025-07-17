import { DomainEvent, DomainEventProps } from '@shared/domain/events/DomainEvent';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';
import { Customer } from '../aggregates/Customer';

export class CustomerCreated extends DomainEvent {
  public static readonly EVENT_NAME = 'customer.created';
  public readonly customer: Customer;

  constructor(customer: Customer) {
    super({
      aggregateId: customer.id.toString(),
      occurredOn: new Date(),
      eventId: new UniqueEntityID().toString()
    });
    this.customer = customer;
  }

  public toPrimitives(): any {
    return {
      customerId: this.customer.customerId.value,
      customerType: this.customer.type,
      customerName: this.customer.name
    };
  }

  public static fromPrimitives(
    aggregateId: string,
    payload: { customerId: string; customerType: string; customerName: string },
    occurredOn: Date
  ): CustomerCreated {
    // This would typically reconstruct the event from primitives
    // For now, we'll throw an error as this requires a Customer instance
    throw new Error('Cannot reconstruct CustomerCreated from primitives');
  }
}

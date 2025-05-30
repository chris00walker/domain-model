import { DomainEvent } from '../../shared/domain/events/DomainEvent';
import { Customer } from '../domain/Customer';

export class CustomerCreated extends DomainEvent {
  readonly customer: Customer;
  
  constructor(customer: Customer);
  
  toPrimitives(): any;
  
  static fromPrimitives(
    aggregateId: string,
    payload: { customerId: string; customerType: string; customerName: string },
    occurredOn: Date
  ): CustomerCreated;
}

import { DomainEvent, DomainEventProps } from '../../../shared/domain/events/DomainEvent';
import { InvoiceAggregate } from '../aggregates/InvoiceAggregate';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';

interface InvoiceOverdueProps {
  invoiceNumber: string;
  customerId: string;
  subscriptionId?: string;
  total: number;
  dueDate: Date;
  daysOverdue: number;
}

/**
 * Domain event raised when an invoice becomes overdue
 */
export class InvoiceOverdue extends DomainEvent {
  public readonly invoiceNumber: string;
  public readonly customerId: string;
  public readonly subscriptionId?: string;
  public readonly total: number;
  public readonly dueDate: Date;
  public readonly daysOverdue: number;

  private constructor(props: DomainEventProps, eventProps: InvoiceOverdueProps) {
    super(props);
    
    this.invoiceNumber = eventProps.invoiceNumber;
    this.customerId = eventProps.customerId;
    this.subscriptionId = eventProps.subscriptionId;
    this.total = eventProps.total;
    this.dueDate = eventProps.dueDate;
    this.daysOverdue = eventProps.daysOverdue;
  }
  
  public static create(invoice: InvoiceAggregate): InvoiceOverdue {
    const props: DomainEventProps = {
      aggregateId: invoice.id.toString()
    };
    
    // Calculate days overdue
    const now = new Date();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const daysOverdue = Math.floor((now.getTime() - invoice.dueDate.getTime()) / millisecondsPerDay);
    
    const eventProps: InvoiceOverdueProps = {
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId.toString(),
      subscriptionId: invoice.subscriptionId?.toString(),
      total: invoice.total,
      dueDate: invoice.dueDate,
      daysOverdue: daysOverdue
    };
    
    return new InvoiceOverdue(props, eventProps);
  }

  /**
   * Convert the domain event to a primitive object
   * Required by the DomainEvent abstract class
   */
  public toPrimitives(): any {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      aggregateId: this.aggregateId,
      invoiceNumber: this.invoiceNumber,
      customerId: this.customerId,
      subscriptionId: this.subscriptionId,
      total: this.total,
      dueDate: this.dueDate,
      daysOverdue: this.daysOverdue
    };
  }

  /**
   * Deserialize the event from persistence or messaging
   * @param data The serialized event data
   */
  public static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): InvoiceOverdue {
    const props: DomainEventProps = {
      aggregateId: aggregateId,
      occurredOn: occurredOn
    };
    
    const eventProps: InvoiceOverdueProps = {
      invoiceNumber: payload.invoiceNumber,
      customerId: payload.customerId,
      subscriptionId: payload.subscriptionId,
      total: payload.total,
      dueDate: new Date(payload.dueDate),
      daysOverdue: payload.daysOverdue
    };
    
    return new InvoiceOverdue(props, eventProps);
  }
}

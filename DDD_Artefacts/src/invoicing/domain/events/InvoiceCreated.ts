import { DomainEvent, DomainEventProps } from '../../../shared/domain/events/DomainEvent';
import { InvoiceAggregate } from '../aggregates/InvoiceAggregate';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';

interface InvoiceCreatedProps {
  invoiceNumber: string;
  customerId: string;
  subscriptionId?: string;
  total: number;
  dueDate: Date;
}

/**
 * Domain event raised when an invoice is created
 */
export class InvoiceCreated extends DomainEvent {
  public readonly invoiceNumber: string;
  public readonly customerId: string;
  public readonly subscriptionId?: string;
  public readonly total: number;
  public readonly dueDate: Date;

  private constructor(props: DomainEventProps, eventProps: InvoiceCreatedProps) {
    super(props);
    
    this.invoiceNumber = eventProps.invoiceNumber;
    this.customerId = eventProps.customerId;
    this.subscriptionId = eventProps.subscriptionId;
    this.total = eventProps.total;
    this.dueDate = eventProps.dueDate;
  }
  
  public static create(invoice: InvoiceAggregate): InvoiceCreated {
    const props: DomainEventProps = {
      aggregateId: invoice.id.toString()
    };
    
    const eventProps: InvoiceCreatedProps = {
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId.toString(),
      subscriptionId: invoice.subscriptionId?.toString(),
      total: invoice.total,
      dueDate: invoice.dueDate
    };
    
    return new InvoiceCreated(props, eventProps);
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
      dueDate: this.dueDate
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
  ): InvoiceCreated {
    const props: DomainEventProps = {
      aggregateId: aggregateId,
      occurredOn: occurredOn
    };
    
    const eventProps: InvoiceCreatedProps = {
      invoiceNumber: payload.invoiceNumber,
      customerId: payload.customerId,
      subscriptionId: payload.subscriptionId,
      total: payload.total,
      dueDate: new Date(payload.dueDate)
    };
    
    return new InvoiceCreated(props, eventProps);
  }
}

import { DomainEvent, DomainEventProps } from '../../../shared/domain/events/DomainEvent';
import { InvoiceAggregate } from '../aggregates/InvoiceAggregate';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';

interface InvoiceCancelledProps {
  invoiceNumber: string;
  customerId: string;
  subscriptionId?: string;
  total: number;
  cancelledAt: Date;
  notes?: string;
}

/**
 * Domain event raised when an invoice is cancelled
 */
export class InvoiceCancelled extends DomainEvent {
  public readonly invoiceNumber: string;
  public readonly customerId: string;
  public readonly subscriptionId?: string;
  public readonly total: number;
  public readonly cancelledAt: Date;
  public readonly notes?: string;

  private constructor(props: DomainEventProps, eventProps: InvoiceCancelledProps) {
    super(props);
    
    this.invoiceNumber = eventProps.invoiceNumber;
    this.customerId = eventProps.customerId;
    this.subscriptionId = eventProps.subscriptionId;
    this.total = eventProps.total;
    this.cancelledAt = eventProps.cancelledAt;
    this.notes = eventProps.notes;
  }
  
  public static create(invoice: InvoiceAggregate): InvoiceCancelled {
    if (!invoice.cancelledAt) {
      throw new Error('Cannot create InvoiceCancelled event: missing cancellation date');
    }
    
    const props: DomainEventProps = {
      aggregateId: invoice.id.toString()
    };
    
    const eventProps: InvoiceCancelledProps = {
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId.toString(),
      subscriptionId: invoice.subscriptionId?.toString(),
      total: invoice.total,
      cancelledAt: invoice.cancelledAt,
      notes: invoice.notes
    };
    
    return new InvoiceCancelled(props, eventProps);
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
      cancelledAt: this.cancelledAt,
      notes: this.notes
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
  ): InvoiceCancelled {
    const props: DomainEventProps = {
      aggregateId: aggregateId,
      occurredOn: occurredOn
    };
    
    const eventProps: InvoiceCancelledProps = {
      invoiceNumber: payload.invoiceNumber,
      customerId: payload.customerId,
      subscriptionId: payload.subscriptionId,
      total: payload.total,
      cancelledAt: new Date(payload.cancelledAt),
      notes: payload.notes
    };
    
    return new InvoiceCancelled(props, eventProps);
  }
}

import { DomainEvent, DomainEventProps } from '../../../shared/domain/events/DomainEvent';
import { InvoiceAggregate } from '../aggregates/InvoiceAggregate';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';

interface InvoicePaidProps {
  invoiceNumber: string;
  customerId: string;
  subscriptionId?: string;
  total: number;
  paymentDate: Date;
  paymentMethodId: string;
  transactionId: string;
}

/**
 * Domain event raised when an invoice is paid
 */
export class InvoicePaid extends DomainEvent {
  public readonly invoiceNumber: string;
  public readonly customerId: string;
  public readonly subscriptionId?: string;
  public readonly total: number;
  public readonly paymentDate: Date;
  public readonly paymentMethodId: string;
  public readonly transactionId: string;

  private constructor(props: DomainEventProps, eventProps: InvoicePaidProps) {
    super(props);
    
    this.invoiceNumber = eventProps.invoiceNumber;
    this.customerId = eventProps.customerId;
    this.subscriptionId = eventProps.subscriptionId;
    this.total = eventProps.total;
    this.paymentDate = eventProps.paymentDate;
    this.paymentMethodId = eventProps.paymentMethodId;
    this.transactionId = eventProps.transactionId;
  }
  
  public static create(invoice: InvoiceAggregate): InvoicePaid {
    if (!invoice.paymentDate || !invoice.paymentMethodId || !invoice.transactionId) {
      throw new Error('Cannot create InvoicePaid event: missing payment information');
    }
    
    const props: DomainEventProps = {
      aggregateId: invoice.id.toString()
    };
    
    const eventProps: InvoicePaidProps = {
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId.toString(),
      subscriptionId: invoice.subscriptionId?.toString(),
      total: invoice.total,
      paymentDate: invoice.paymentDate,
      paymentMethodId: invoice.paymentMethodId,
      transactionId: invoice.transactionId
    };
    
    return new InvoicePaid(props, eventProps);
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
      paymentDate: this.paymentDate,
      paymentMethodId: this.paymentMethodId,
      transactionId: this.transactionId
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
  ): InvoicePaid {
    const props: DomainEventProps = {
      aggregateId: aggregateId,
      occurredOn: occurredOn
    };
    
    const eventProps: InvoicePaidProps = {
      invoiceNumber: payload.invoiceNumber,
      customerId: payload.customerId,
      subscriptionId: payload.subscriptionId,
      total: payload.total,
      paymentDate: new Date(payload.paymentDate),
      paymentMethodId: payload.paymentMethodId,
      transactionId: payload.transactionId
    };
    
    return new InvoicePaid(props, eventProps);
  }
}

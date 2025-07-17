import { DomainEvent, DomainEventProps } from '../../../shared/domain/events/DomainEvent';

export interface InvoiceGeneratedEventProps {
  invoiceId: string;
  orderId: string;
  customerId: string;
  totalAmount: number;
  currency: string;
  dueDate: Date;
}

/**
 * Domain event raised when an invoice is generated for an order
 */
export class InvoiceGenerated extends DomainEvent {
  public readonly invoiceId: string;
  public readonly orderId: string;
  public readonly customerId: string;
  public readonly totalAmount: number;
  public readonly currency: string;
  public readonly dueDate: Date;

  private constructor(props: DomainEventProps, eventProps: InvoiceGeneratedEventProps) {
    super(props);
    this.invoiceId = eventProps.invoiceId;
    this.orderId = eventProps.orderId;
    this.customerId = eventProps.customerId;
    this.totalAmount = eventProps.totalAmount;
    this.currency = eventProps.currency;
    this.dueDate = eventProps.dueDate;
  }

  public static create(
    invoiceId: string,
    orderId: string,
    customerId: string,
    totalAmount: number,
    currency: string,
    dueDate: Date
  ): InvoiceGenerated {
    const props: DomainEventProps = {
      aggregateId: invoiceId
    };
    
    const eventProps: InvoiceGeneratedEventProps = {
      invoiceId,
      orderId,
      customerId,
      totalAmount,
      currency,
      dueDate
    };
    
    return new InvoiceGenerated(props, eventProps);
  }
  
  public toPrimitives(): any {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      aggregateId: this.aggregateId,
      invoiceId: this.invoiceId,
      orderId: this.orderId,
      customerId: this.customerId,
      totalAmount: this.totalAmount,
      currency: this.currency,
      dueDate: this.dueDate.toISOString()
    };
  }
  
  public static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): InvoiceGenerated {
    const props: DomainEventProps = {
      aggregateId,
      occurredOn
    };
    
    const eventProps: InvoiceGeneratedEventProps = {
      invoiceId: payload.invoiceId,
      orderId: payload.orderId,
      customerId: payload.customerId,
      totalAmount: payload.totalAmount,
      currency: payload.currency,
      dueDate: new Date(payload.dueDate)
    };
    
    return new InvoiceGenerated(props, eventProps);
  }
}

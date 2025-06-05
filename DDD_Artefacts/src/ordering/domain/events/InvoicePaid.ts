import { DomainEvent, DomainEventProps } from '../../../shared/domain/events/DomainEvent';

export interface InvoicePaidEventProps {
  invoiceId: string;
  paymentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: Date;
}

/**
 * Domain event raised when an invoice is paid
 */
export class InvoicePaid extends DomainEvent {
  public readonly invoiceId: string;
  public readonly paymentId: string;
  public readonly amount: number;
  public readonly currency: string;
  public readonly paymentMethod: string;
  public readonly paymentDate: Date;

  private constructor(props: DomainEventProps, eventProps: InvoicePaidEventProps) {
    super(props);
    this.invoiceId = eventProps.invoiceId;
    this.paymentId = eventProps.paymentId;
    this.amount = eventProps.amount;
    this.currency = eventProps.currency;
    this.paymentMethod = eventProps.paymentMethod;
    this.paymentDate = eventProps.paymentDate;
  }

  public static create(
    invoiceId: string,
    paymentId: string,
    amount: number,
    currency: string,
    paymentMethod: string,
    paymentDate: Date
  ): InvoicePaid {
    const props: DomainEventProps = {
      aggregateId: invoiceId
    };
    
    const eventProps: InvoicePaidEventProps = {
      invoiceId,
      paymentId,
      amount,
      currency,
      paymentMethod,
      paymentDate
    };
    
    return new InvoicePaid(props, eventProps);
  }
  
  public toPrimitives(): any {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      aggregateId: this.aggregateId,
      invoiceId: this.invoiceId,
      paymentId: this.paymentId,
      amount: this.amount,
      currency: this.currency,
      paymentMethod: this.paymentMethod,
      paymentDate: this.paymentDate.toISOString()
    };
  }
  
  public static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): InvoicePaid {
    const props: DomainEventProps = {
      aggregateId,
      occurredOn
    };
    
    const eventProps: InvoicePaidEventProps = {
      invoiceId: payload.invoiceId,
      paymentId: payload.paymentId,
      amount: payload.amount,
      currency: payload.currency,
      paymentMethod: payload.paymentMethod,
      paymentDate: new Date(payload.paymentDate)
    };
    
    return new InvoicePaid(props, eventProps);
  }
}

import { DomainEvent, DomainEventProps } from '../../../shared/domain/events/DomainEvent';

export interface InvoiceCancelledEventProps {
  invoiceId: string;
  reason: string;
}

/**
 * Domain event raised when an invoice is cancelled
 */
export class InvoiceCancelled extends DomainEvent {
  public readonly invoiceId: string;
  public readonly reason: string;

  private constructor(props: DomainEventProps, eventProps: InvoiceCancelledEventProps) {
    super(props);
    this.invoiceId = eventProps.invoiceId;
    this.reason = eventProps.reason;
  }

  public static create(invoiceId: string, reason: string): InvoiceCancelled {
    const props: DomainEventProps = {
      aggregateId: invoiceId
    };
    
    const eventProps: InvoiceCancelledEventProps = {
      invoiceId,
      reason
    };
    
    return new InvoiceCancelled(props, eventProps);
  }
  
  public toPrimitives(): any {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      aggregateId: this.aggregateId,
      invoiceId: this.invoiceId,
      reason: this.reason
    };
  }
  
  public static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): InvoiceCancelled {
    const props: DomainEventProps = {
      aggregateId,
      occurredOn
    };
    
    const eventProps: InvoiceCancelledEventProps = {
      invoiceId: payload.invoiceId,
      reason: payload.reason
    };
    
    return new InvoiceCancelled(props, eventProps);
  }
}

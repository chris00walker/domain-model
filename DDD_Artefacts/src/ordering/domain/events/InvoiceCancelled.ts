import { IDomainEvent } from '../../../shared/domain/events/IDomainEvent';

export interface InvoiceCancelledProps {
  invoiceId: string;
  reason: string;
  occurredAt: Date;
}

/**
 * Domain event raised when an invoice is cancelled
 */
export class InvoiceCancelled implements IDomainEvent {
  public readonly invoiceId: string;
  public readonly reason: string;
  public readonly occurredAt: Date;
  public readonly eventType: string = 'InvoiceCancelled';

  constructor(props: InvoiceCancelledProps) {
    this.invoiceId = props.invoiceId;
    this.reason = props.reason;
    this.occurredAt = props.occurredAt;
  }
}

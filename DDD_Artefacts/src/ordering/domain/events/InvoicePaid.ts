import { IDomainEvent } from '../../../shared/domain/events/IDomainEvent';

export interface InvoicePaidProps {
  invoiceId: string;
  paymentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: Date;
  occurredAt: Date;
}

/**
 * Domain event raised when an invoice is paid
 */
export class InvoicePaid implements IDomainEvent {
  public readonly invoiceId: string;
  public readonly paymentId: string;
  public readonly amount: number;
  public readonly currency: string;
  public readonly paymentMethod: string;
  public readonly paymentDate: Date;
  public readonly occurredAt: Date;
  public readonly eventType: string = 'InvoicePaid';

  constructor(props: InvoicePaidProps) {
    this.invoiceId = props.invoiceId;
    this.paymentId = props.paymentId;
    this.amount = props.amount;
    this.currency = props.currency;
    this.paymentMethod = props.paymentMethod;
    this.paymentDate = props.paymentDate;
    this.occurredAt = props.occurredAt;
  }
}

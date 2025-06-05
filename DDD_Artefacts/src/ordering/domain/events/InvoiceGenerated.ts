import { IDomainEvent } from '../../../shared/domain/events/IDomainEvent';

export interface InvoiceGeneratedProps {
  invoiceId: string;
  orderId: string;
  customerId: string;
  totalAmount: number;
  currency: string;
  dueDate: Date;
  occurredAt: Date;
}

/**
 * Domain event raised when an invoice is generated for an order
 */
export class InvoiceGenerated implements IDomainEvent {
  public readonly invoiceId: string;
  public readonly orderId: string;
  public readonly customerId: string;
  public readonly totalAmount: number;
  public readonly currency: string;
  public readonly dueDate: Date;
  public readonly occurredAt: Date;
  public readonly eventType: string = 'InvoiceGenerated';

  constructor(props: InvoiceGeneratedProps) {
    this.invoiceId = props.invoiceId;
    this.orderId = props.orderId;
    this.customerId = props.customerId;
    this.totalAmount = props.totalAmount;
    this.currency = props.currency;
    this.dueDate = props.dueDate;
    this.occurredAt = props.occurredAt;
  }
}

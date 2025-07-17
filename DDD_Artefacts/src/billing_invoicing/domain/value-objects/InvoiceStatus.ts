import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';

/**
 * Possible invoice statuses
 */
export type InvoiceStatusType = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

/**
 * Value object representing the status of an invoice
 */
export class InvoiceStatus extends ValueObject<{ value: InvoiceStatusType }> {
  get value(): InvoiceStatusType {
    return this.props.value;
  }

  private constructor(props: { value: InvoiceStatusType }) {
    super(props);
  }

  /**
   * Create a new InvoiceStatus
   * @param status The invoice status
   * @returns Result with InvoiceStatus or error
   */
  public static create(status: string): Result<InvoiceStatus, string> {
    const validStatuses: InvoiceStatusType[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    
    if (!validStatuses.includes(status as InvoiceStatusType)) {
      return failure(`Invalid invoice status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    return success(new InvoiceStatus({ value: status as InvoiceStatusType }));
  }

  /**
   * Check if the invoice is in draft status
   */
  public isDraft(): boolean {
    return this.props.value === 'draft';
  }

  /**
   * Check if the invoice has been sent
   */
  public isSent(): boolean {
    return this.props.value === 'sent';
  }

  /**
   * Check if the invoice has been paid
   */
  public isPaid(): boolean {
    return this.props.value === 'paid';
  }

  /**
   * Check if the invoice is overdue
   */
  public isOverdue(): boolean {
    return this.props.value === 'overdue';
  }

  /**
   * Check if the invoice has been cancelled
   */
  public isCancelled(): boolean {
    return this.props.value === 'cancelled';
  }

  /**
   * Check if the invoice can be paid
   */
  public canBePaid(): boolean {
    return this.props.value === 'sent' || this.props.value === 'overdue';
  }

  /**
   * Check if the invoice can be cancelled
   */
  public canBeCancelled(): boolean {
    return this.props.value === 'draft' || this.props.value === 'sent' || this.props.value === 'overdue';
  }

  /**
   * Check if the invoice can be sent
   */
  public canBeSent(): boolean {
    return this.props.value === 'draft';
  }

  /**
   * Check if this status equals another status
   * @param status The status to compare with
   */
  public equals(status: InvoiceStatus): boolean {
    return this.props.value === status.value;
  }
}

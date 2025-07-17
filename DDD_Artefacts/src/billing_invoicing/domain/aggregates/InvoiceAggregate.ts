import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result, success, failure } from '../../../shared/core/Result';
import { InvoiceStatus, InvoiceStatusType } from '../value-objects/InvoiceStatus';
import { Guard } from '../../../shared/core/Guard';
import { InvoiceCreated } from '../events/InvoiceCreated';
import { InvoicePaid } from '../events/InvoicePaid';
import { InvoiceCancelled } from '../events/InvoiceCancelled';
import { InvoiceSent } from '../events/InvoiceSent';
import { InvoiceOverdue } from '../events/InvoiceOverdue';

/**
 * Invoice item representing a line item in an invoice
 */
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
}

/**
 * Address information for billing
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Properties for creating an invoice
 */
export interface InvoiceProps {
  invoiceNumber: string;
  customerId: UniqueEntityID;
  subscriptionId?: UniqueEntityID;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  billingAddress: Address;
  issueDate: Date;
  dueDate: Date;
  paymentDate?: Date;
  paymentMethodId?: string;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
}

/**
 * Invoice aggregate root
 */
export class InvoiceAggregate extends AggregateRoot<InvoiceProps> {
  get invoiceNumber(): string {
    return this.props.invoiceNumber;
  }

  get customerId(): UniqueEntityID {
    return this.props.customerId;
  }

  get subscriptionId(): UniqueEntityID | undefined {
    return this.props.subscriptionId;
  }

  get status(): InvoiceStatus {
    return this.props.status;
  }

  get items(): InvoiceItem[] {
    return this.props.items;
  }

  get subtotal(): number {
    return this.props.subtotal;
  }

  get taxTotal(): number {
    return this.props.taxTotal;
  }

  get total(): number {
    return this.props.total;
  }

  get billingAddress(): Address {
    return this.props.billingAddress;
  }

  get issueDate(): Date {
    return this.props.issueDate;
  }

  get dueDate(): Date {
    return this.props.dueDate;
  }

  get paymentDate(): Date | undefined {
    return this.props.paymentDate;
  }

  get paymentMethodId(): string | undefined {
    return this.props.paymentMethodId;
  }

  get transactionId(): string | undefined {
    return this.props.transactionId;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get cancelledAt(): Date | undefined {
    return this.props.cancelledAt;
  }

  private constructor(props: InvoiceProps, id?: UniqueEntityID) {
    super(props, id);
  }

  /**
   * Create a new invoice
   * @param props Invoice properties
   * @param id Optional ID
   * @returns Result with invoice or error
   */
  public static create(props: InvoiceProps, id?: UniqueEntityID): Result<InvoiceAggregate, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.invoiceNumber, argumentName: 'invoiceNumber' },
      { argument: props.customerId, argumentName: 'customerId' },
      { argument: props.status, argumentName: 'status' },
      { argument: props.items, argumentName: 'items' },
      { argument: props.subtotal, argumentName: 'subtotal' },
      { argument: props.taxTotal, argumentName: 'taxTotal' },
      { argument: props.total, argumentName: 'total' },
      { argument: props.billingAddress, argumentName: 'billingAddress' },
      { argument: props.issueDate, argumentName: 'issueDate' },
      { argument: props.dueDate, argumentName: 'dueDate' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.items.length === 0) {
      return failure('Invoice must have at least one item');
    }

    // Validate total matches sum of items
    const calculatedSubtotal = props.items.reduce((sum, item) => sum + item.totalPrice, 0);
    if (Math.abs(calculatedSubtotal - props.subtotal) > 0.01) {
      return failure('Invoice subtotal does not match sum of item totals');
    }

    // Validate tax total matches sum of item tax amounts
    const calculatedTaxTotal = props.items.reduce((sum, item) => sum + item.taxAmount, 0);
    if (Math.abs(calculatedTaxTotal - props.taxTotal) > 0.01) {
      return failure('Invoice tax total does not match sum of item tax amounts');
    }

    // Validate total matches subtotal + tax total
    const calculatedTotal = props.subtotal + props.taxTotal;
    if (Math.abs(calculatedTotal - props.total) > 0.01) {
      return failure('Invoice total does not match subtotal + tax total');
    }

    const invoice = new InvoiceAggregate(props, id);
    
    // Add domain event if this is a new invoice
    const isNewInvoice = !id;
    if (isNewInvoice) {
      invoice.addDomainEvent(InvoiceCreated.create(invoice));
    }

    return success(invoice);
  }

  /**
   * Mark the invoice as paid
   * @param paymentDate Date of payment
   * @param paymentMethodId Payment method ID
   * @param transactionId Transaction ID
   * @returns Result with success or error
   */
  public markAsPaid(paymentDate: Date, paymentMethodId: string, transactionId: string): Result<void, string> {
    if (!this.status.canBePaid()) {
      return failure(`Invoice cannot be paid because it is in ${this.status.value} status`);
    }

    const statusResult = InvoiceStatus.create('paid');
    if (statusResult.isFailure()) {
      return failure(statusResult.error);
    }

    this.props.status = statusResult.value;
    this.props.paymentDate = paymentDate;
    this.props.paymentMethodId = paymentMethodId;
    this.props.transactionId = transactionId;
    this.props.updatedAt = new Date();

    this.addDomainEvent(InvoicePaid.create(this));

    return success(undefined);
  }

  /**
   * Cancel the invoice
   * @param reason Reason for cancellation
   * @returns Result with success or error
   */
  public cancel(reason?: string): Result<void, string> {
    if (!this.status.canBeCancelled()) {
      return failure(`Invoice cannot be cancelled because it is in ${this.status.value} status`);
    }

    const statusResult = InvoiceStatus.create('cancelled');
    if (statusResult.isFailure()) {
      return failure(statusResult.error);
    }

    this.props.status = statusResult.value;
    this.props.cancelledAt = new Date();
    this.props.updatedAt = new Date();
    
    if (reason) {
      this.props.notes = this.props.notes 
        ? `${this.props.notes}\nCancellation reason: ${reason}` 
        : `Cancellation reason: ${reason}`;
    }

    this.addDomainEvent(InvoiceCancelled.create(this));

    return success(undefined);
  }

  /**
   * Send the invoice
   * @returns Result with success or error
   */
  public send(): Result<void, string> {
    if (!this.status.canBeSent()) {
      return failure(`Invoice cannot be sent because it is in ${this.status.value} status`);
    }

    const statusResult = InvoiceStatus.create('sent');
    if (statusResult.isFailure()) {
      return failure(statusResult.error);
    }

    this.props.status = statusResult.value;
    this.props.updatedAt = new Date();

    this.addDomainEvent(InvoiceSent.create(this));

    return success(undefined);
  }

  /**
   * Mark the invoice as overdue
   * @returns Result with success or error
   */
  public markAsOverdue(): Result<void, string> {
    if (!this.status.isSent()) {
      return failure(`Invoice cannot be marked as overdue because it is in ${this.status.value} status`);
    }

    const now = new Date();
    if (now < this.props.dueDate) {
      return failure('Invoice is not yet due');
    }

    const statusResult = InvoiceStatus.create('overdue');
    if (statusResult.isFailure()) {
      return failure(statusResult.error);
    }

    this.props.status = statusResult.value;
    this.props.updatedAt = new Date();

    this.addDomainEvent(InvoiceOverdue.create(this));

    return success(undefined);
  }

  /**
   * Check if the invoice is overdue
   * @param currentDate Current date to check against
   * @returns True if the invoice is overdue
   */
  public isOverdue(currentDate: Date = new Date()): boolean {
    return this.status.isSent() && currentDate > this.props.dueDate;
  }

  /**
   * Add a note to the invoice
   * @param note Note to add
   * @returns Result with success or error
   */
  public addNote(note: string): Result<void, string> {
    if (!note || note.trim() === '') {
      return failure('Note cannot be empty');
    }

    this.props.notes = this.props.notes 
      ? `${this.props.notes}\n${note}` 
      : note;
    
    this.props.updatedAt = new Date();

    return success(undefined);
  }
}

import { InvoiceAggregate } from '../aggregates/InvoiceAggregate';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result } from '../../../shared/core/Result';
import { InvoiceStatus } from '../value-objects/InvoiceStatus';

/**
 * Repository interface for invoice persistence
 */
export interface IInvoiceRepository {
  /**
   * Find an invoice by ID
   * @param id The invoice ID
   * @returns The invoice if found
   */
  findById(id: UniqueEntityID): Promise<Result<InvoiceAggregate | null, string>>;
  
  /**
   * Find invoices by customer ID
   * @param customerId The customer ID
   * @returns The invoices for the customer
   */
  findByCustomerId(customerId: UniqueEntityID): Promise<Result<InvoiceAggregate[], string>>;
  
  /**
   * Find invoices by subscription ID
   * @param subscriptionId The subscription ID
   * @returns The invoices for the subscription
   */
  findBySubscriptionId(subscriptionId: UniqueEntityID): Promise<Result<InvoiceAggregate[], string>>;
  
  /**
   * Find invoices by status
   * @param status The invoice status
   * @returns The invoices with the given status
   */
  findByStatus(status: InvoiceStatus): Promise<Result<InvoiceAggregate[], string>>;
  
  /**
   * Find invoices by invoice number
   * @param invoiceNumber The invoice number
   * @returns The invoice if found
   */
  findByInvoiceNumber(invoiceNumber: string): Promise<Result<InvoiceAggregate | null, string>>;
  
  /**
   * Find overdue invoices
   * @param referenceDate The reference date to check against due dates
   * @returns The overdue invoices
   */
  findOverdueInvoices(referenceDate: Date): Promise<Result<InvoiceAggregate[], string>>;
  
  /**
   * Save an invoice
   * @param invoice The invoice to save
   */
  save(invoice: InvoiceAggregate): Promise<Result<void, string>>;
  
  /**
   * Delete an invoice
   * @param invoice The invoice to delete
   */
  delete(invoice: InvoiceAggregate): Promise<Result<void, string>>;
}

import { IInvoiceRepository } from '../repositories/IInvoiceRepository';
import { InvoiceAggregate, InvoiceItem, Address } from '../aggregates/InvoiceAggregate';
import { InvoiceStatus } from '../value-objects/InvoiceStatus';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result, success, failure } from '../../../shared/core/Result';
import { ILogger } from '../../../shared/infrastructure/logging/LoggingService';
import { IMonitoringService } from '../../../shared/infrastructure/monitoring/MonitoringService';
import { IEventPublisher } from '../../../shared/infrastructure/events/IEventPublisher';

/**
 * Service for invoice domain operations
 */
export class InvoiceService {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly logger: ILogger,
    private readonly monitoringService: IMonitoringService,
    private readonly eventPublisher: IEventPublisher
  ) {}

  /**
   * Create a new invoice
   * @param customerId Customer ID
   * @param items Invoice items
   * @param billingAddress Billing address
   * @param dueDate Due date (defaults to 30 days from now)
   * @param subscriptionId Optional subscription ID
   * @returns Result with the created invoice or error
   */
  public async createInvoice(
    customerId: UniqueEntityID,
    items: InvoiceItem[],
    billingAddress: Address,
    dueDate?: Date,
    subscriptionId?: UniqueEntityID
  ): Promise<Result<InvoiceAggregate, string>> {
    try {
      const startTime = Date.now();
      
      // Generate invoice number
      const invoiceNumber = this.generateInvoiceNumber();
      
      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxTotal = items.reduce((sum, item) => sum + item.taxAmount, 0);
      const total = subtotal + taxTotal;
      
      // Set default due date if not provided
      const now = new Date();
      const actualDueDate = dueDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      // Create invoice status
      const statusResult = InvoiceStatus.create('draft');
      if (statusResult.isFailure()) {
        return failure(statusResult.error);
      }
      
      // Create invoice
      const invoiceResult = InvoiceAggregate.create({
        invoiceNumber,
        customerId,
        subscriptionId,
        status: statusResult.value,
        items,
        subtotal,
        taxTotal,
        total,
        billingAddress,
        issueDate: now,
        dueDate: actualDueDate,
        createdAt: now,
        updatedAt: now
      });
      
      if (invoiceResult.isFailure()) {
        return failure(invoiceResult.error);
      }
      
      const invoice = invoiceResult.value;
      
      // Save invoice
      const saveResult = await this.invoiceRepository.save(invoice);
      if (saveResult.isFailure()) {
        return failure(saveResult.error);
      }
      
      // Publish domain events
      for (const event of invoice.domainEvents) {
        await this.eventPublisher.publishEvent(event);
      }
      
      // Clear domain events after publishing
      invoice.clearEvents();
      
      // Record metrics
      const duration = Date.now() - startTime;
      this.monitoringService.recordHistogram('invoice_service_operation_duration_ms', duration, {
        operation: 'createInvoice'
      });
      this.monitoringService.incrementCounter('invoices_created', 1);
      
      this.logger.info(`Created invoice ${invoiceNumber} for customer ${customerId.toString()}`);
      
      return success(invoice);
    } catch (error: any) {
      this.logger.error(`Error creating invoice: ${error.message}`, error);
      this.monitoringService.incrementCounter('invoice_service_errors', 1, {
        operation: 'createInvoice'
      });
      return failure(`Error creating invoice: ${error.message}`);
    }
  }

  /**
   * Mark an invoice as paid
   * @param invoiceId Invoice ID
   * @param paymentDate Payment date
   * @param paymentMethodId Payment method ID
   * @param transactionId Transaction ID
   * @returns Result with success or error
   */
  public async markInvoiceAsPaid(
    invoiceId: UniqueEntityID,
    paymentDate: Date,
    paymentMethodId: string,
    transactionId: string
  ): Promise<Result<void, string>> {
    try {
      const startTime = Date.now();
      
      // Find invoice
      const invoiceResult = await this.invoiceRepository.findById(invoiceId);
      if (invoiceResult.isFailure()) {
        return failure(invoiceResult.error);
      }
      
      const invoice = invoiceResult.value;
      if (!invoice) {
        return failure(`Invoice with ID ${invoiceId.toString()} not found`);
      }
      
      // Mark as paid
      const markAsPaidResult = invoice.markAsPaid(paymentDate, paymentMethodId, transactionId);
      if (markAsPaidResult.isFailure()) {
        return failure(markAsPaidResult.error);
      }
      
      // Save invoice
      const saveResult = await this.invoiceRepository.save(invoice);
      if (saveResult.isFailure()) {
        return failure(saveResult.error);
      }
      
      // Publish domain events
      for (const event of invoice.domainEvents) {
        await this.eventPublisher.publishEvent(event);
      }
      
      // Clear domain events after publishing
      invoice.clearEvents();
      
      // Record metrics
      const duration = Date.now() - startTime;
      this.monitoringService.recordHistogram('invoice_service_operation_duration_ms', duration, {
        operation: 'markInvoiceAsPaid'
      });
      this.monitoringService.incrementCounter('invoices_paid', 1);
      
      this.logger.info(`Marked invoice ${invoice.invoiceNumber} as paid`);
      
      return success(undefined);
    } catch (error: any) {
      this.logger.error(`Error marking invoice as paid: ${error.message}`, error);
      this.monitoringService.incrementCounter('invoice_service_errors', 1, {
        operation: 'markInvoiceAsPaid'
      });
      return failure(`Error marking invoice as paid: ${error.message}`);
    }
  }

  /**
   * Cancel an invoice
   * @param invoiceId Invoice ID
   * @param reason Cancellation reason
   * @returns Result with success or error
   */
  public async cancelInvoice(
    invoiceId: UniqueEntityID,
    reason?: string
  ): Promise<Result<void, string>> {
    try {
      const startTime = Date.now();
      
      // Find invoice
      const invoiceResult = await this.invoiceRepository.findById(invoiceId);
      if (invoiceResult.isFailure()) {
        return failure(invoiceResult.error);
      }
      
      const invoice = invoiceResult.value;
      if (!invoice) {
        return failure(`Invoice with ID ${invoiceId.toString()} not found`);
      }
      
      // Cancel invoice
      const cancelResult = invoice.cancel(reason);
      if (cancelResult.isFailure()) {
        return failure(cancelResult.error);
      }
      
      // Save invoice
      const saveResult = await this.invoiceRepository.save(invoice);
      if (saveResult.isFailure()) {
        return failure(saveResult.error);
      }
      
      // Publish domain events
      for (const event of invoice.domainEvents) {
        await this.eventPublisher.publishEvent(event);
      }
      
      // Clear domain events after publishing
      invoice.clearEvents();
      
      // Record metrics
      const duration = Date.now() - startTime;
      this.monitoringService.recordHistogram('invoice_service_operation_duration_ms', duration, {
        operation: 'cancelInvoice'
      });
      this.monitoringService.incrementCounter('invoices_cancelled', 1);
      
      this.logger.info(`Cancelled invoice ${invoice.invoiceNumber}`);
      
      return success(undefined);
    } catch (error: any) {
      this.logger.error(`Error cancelling invoice: ${error.message}`, error);
      this.monitoringService.incrementCounter('invoice_service_errors', 1, {
        operation: 'cancelInvoice'
      });
      return failure(`Error cancelling invoice: ${error.message}`);
    }
  }

  /**
   * Send an invoice
   * @param invoiceId Invoice ID
   * @returns Result with success or error
   */
  public async sendInvoice(invoiceId: UniqueEntityID): Promise<Result<void, string>> {
    try {
      const startTime = Date.now();
      
      // Find invoice
      const invoiceResult = await this.invoiceRepository.findById(invoiceId);
      if (invoiceResult.isFailure()) {
        return failure(invoiceResult.error);
      }
      
      const invoice = invoiceResult.value;
      if (!invoice) {
        return failure(`Invoice with ID ${invoiceId.toString()} not found`);
      }
      
      // Send invoice
      const sendResult = invoice.send();
      if (sendResult.isFailure()) {
        return failure(sendResult.error);
      }
      
      // Save invoice
      const saveResult = await this.invoiceRepository.save(invoice);
      if (saveResult.isFailure()) {
        return failure(saveResult.error);
      }
      
      // Publish domain events
      for (const event of invoice.domainEvents) {
        await this.eventPublisher.publishEvent(event);
      }
      
      // Clear domain events after publishing
      invoice.clearEvents();
      
      // Record metrics
      const duration = Date.now() - startTime;
      this.monitoringService.recordHistogram('invoice_service_operation_duration_ms', duration, {
        operation: 'sendInvoice'
      });
      this.monitoringService.incrementCounter('invoices_sent', 1);
      
      this.logger.info(`Sent invoice ${invoice.invoiceNumber}`);
      
      return success(undefined);
    } catch (error: any) {
      this.logger.error(`Error sending invoice: ${error.message}`, error);
      this.monitoringService.incrementCounter('invoice_service_errors', 1, {
        operation: 'sendInvoice'
      });
      return failure(`Error sending invoice: ${error.message}`);
    }
  }

  /**
   * Generate invoice PDF
   * @param invoiceId Invoice ID
   * @returns Result with PDF content or error
   */
  public async generateInvoicePdf(invoiceId: UniqueEntityID): Promise<Result<Uint8Array, string>> {
    try {
      const startTime = Date.now();
      
      // Find invoice
      const invoiceResult = await this.invoiceRepository.findById(invoiceId);
      if (invoiceResult.isFailure()) {
        return failure(invoiceResult.error);
      }
      
      const invoice = invoiceResult.value;
      if (!invoice) {
        return failure(`Invoice with ID ${invoiceId.toString()} not found`);
      }
      
      // In a real implementation, this would generate a PDF
      // For now, we'll just simulate PDF generation
      this.logger.debug(`Generating PDF for invoice ${invoice.invoiceNumber}`);
      
      // Simulate PDF generation
      await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
      
      // Create a dummy PDF buffer
      const pdfBuffer = new Uint8Array(Buffer.from(`Invoice ${invoice.invoiceNumber} PDF content`));
      
      // Record metrics
      const duration = Date.now() - startTime;
      this.monitoringService.recordHistogram('invoice_service_operation_duration_ms', duration, {
        operation: 'generateInvoicePdf'
      });
      this.monitoringService.incrementCounter('invoice_pdfs_generated', 1);
      
      this.logger.info(`Generated PDF for invoice ${invoice.invoiceNumber}`);
      
      return success(pdfBuffer);
    } catch (error: any) {
      this.logger.error(`Error generating invoice PDF: ${error.message}`, error);
      this.monitoringService.incrementCounter('invoice_service_errors', 1, {
        operation: 'generateInvoicePdf'
      });
      return failure(`Error generating invoice PDF: ${error.message}`);
    }
  }

  /**
   * Process overdue invoices
   * @param referenceDate Reference date to check against due dates
   * @returns Result with processed invoices or error
   */
  public async processOverdueInvoices(referenceDate: Date = new Date()): Promise<Result<InvoiceAggregate[], string>> {
    try {
      const startTime = Date.now();
      
      // Find overdue invoices
      const overdueInvoicesResult = await this.invoiceRepository.findOverdueInvoices(referenceDate);
      if (overdueInvoicesResult.isFailure()) {
        return failure(overdueInvoicesResult.error);
      }
      
      const overdueInvoices = overdueInvoicesResult.value;
      const processedInvoices: InvoiceAggregate[] = [];
      
      // Process each overdue invoice
      for (const invoice of overdueInvoices) {
        // Mark as overdue
        const markAsOverdueResult = invoice.markAsOverdue();
        if (markAsOverdueResult.isFailure()) {
          this.logger.warn(`Failed to mark invoice ${invoice.invoiceNumber} as overdue: ${markAsOverdueResult.error}`);
          continue;
        }
        
        // Save invoice
        const saveResult = await this.invoiceRepository.save(invoice);
        if (saveResult.isFailure()) {
          this.logger.warn(`Failed to save invoice ${invoice.invoiceNumber}: ${saveResult.error}`);
          continue;
        }
        
        // Publish domain events
        for (const event of invoice.domainEvents) {
          await this.eventPublisher.publishEvent(event);
        }
        
        // Clear domain events after publishing
        invoice.clearEvents();
        
        processedInvoices.push(invoice);
      }
      
      // Record metrics
      const duration = Date.now() - startTime;
      this.monitoringService.recordHistogram('invoice_service_operation_duration_ms', duration, {
        operation: 'processOverdueInvoices'
      });
      this.monitoringService.incrementCounter('invoices_marked_overdue', processedInvoices.length);
      
      this.logger.info(`Processed ${processedInvoices.length} overdue invoices`);
      
      return success(processedInvoices);
    } catch (error: any) {
      this.logger.error(`Error processing overdue invoices: ${error.message}`, error);
      this.monitoringService.incrementCounter('invoice_service_errors', 1, {
        operation: 'processOverdueInvoices'
      });
      return failure(`Error processing overdue invoices: ${error.message}`);
    }
  }

  /**
   * Generate a unique invoice number
   * @returns The generated invoice number
   */
  private generateInvoiceNumber(): string {
    const prefix = 'INV';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${timestamp}-${random}`;
  }
}

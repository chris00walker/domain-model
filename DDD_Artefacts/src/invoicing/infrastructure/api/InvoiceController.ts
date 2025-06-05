import { 
  BaseApiController, 
  ApiRouter, 
  HttpMethod, 
  ApiRequest, 
  ApiResponse 
} from '../../../shared/infrastructure/api/ApiInfrastructure';
import { ILogger } from '../../../shared/infrastructure/logging/LoggingService';
import { IMonitoringService } from '../../../shared/infrastructure/monitoring/MonitoringService';
import { IAuthenticationService } from '../../../shared/infrastructure/auth/AuthenticationService';
import { ValidationService, ObjectValidator } from '../../../shared/infrastructure/validation/ValidationService';
import { InvoiceService } from '../../domain/services/InvoiceService';
import { IInvoiceRepository } from '../../domain/repositories/IInvoiceRepository';
import { InvoiceAggregate } from '../../domain/aggregates/InvoiceAggregate';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result, success, failure } from '../../../shared/core/Result';
import { InvoiceStatus } from '../../domain/value-objects/InvoiceStatus';

// Define interfaces for invoice items to avoid implicit any types
interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
}

/**
 * Invoice controller for exposing invoice domain services via API
 */
export class InvoiceController extends BaseApiController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly invoiceRepository: IInvoiceRepository,
    logger: ILogger,
    monitoringService: IMonitoringService,
    authService: IAuthenticationService,
    validationService: ValidationService
  ) {
    super(logger, monitoringService, authService, validationService);
  }
  
  /**
   * Get the base path for this controller
   */
  public getBasePath(): string {
    return '/api/invoices';
  }
  
  /**
   * Register routes for this controller
   * @param router The router to register routes with
   */
  public registerRoutes(router: ApiRouter): void {
    // Get invoice by ID
    router.registerRoute(
      HttpMethod.GET,
      `${this.getBasePath()}/:id`,
      this.getInvoiceById.bind(this),
      true,
      ['invoices:read']
    );
    
    // Get invoices by customer ID
    router.registerRoute(
      HttpMethod.GET,
      `${this.getBasePath()}/customer/:customerId`,
      this.getInvoicesByCustomerId.bind(this),
      true,
      ['invoices:read']
    );
    
    // Get invoices by subscription ID
    router.registerRoute(
      HttpMethod.GET,
      `${this.getBasePath()}/subscription/:subscriptionId`,
      this.getInvoicesBySubscriptionId.bind(this),
      true,
      ['invoices:read']
    );
    
    // Get invoices by status
    router.registerRoute(
      HttpMethod.GET,
      `${this.getBasePath()}/status/:status`,
      this.getInvoicesByStatus.bind(this),
      true,
      ['invoices:read']
    );
    
    // Create invoice
    router.registerRoute(
      HttpMethod.POST,
      this.getBasePath(),
      this.createInvoice.bind(this),
      true,
      ['invoices:create']
    );
    
    // Mark invoice as paid
    router.registerRoute(
      HttpMethod.POST,
      `${this.getBasePath()}/:id/pay`,
      this.markInvoiceAsPaid.bind(this),
      true,
      ['invoices:update']
    );
    
    // Cancel invoice
    router.registerRoute(
      HttpMethod.POST,
      `${this.getBasePath()}/:id/cancel`,
      this.cancelInvoice.bind(this),
      true,
      ['invoices:update']
    );
    
    // Send invoice
    router.registerRoute(
      HttpMethod.POST,
      `${this.getBasePath()}/:id/send`,
      this.sendInvoice.bind(this),
      true,
      ['invoices:update']
    );
    
    // Generate PDF
    router.registerRoute(
      HttpMethod.GET,
      `${this.getBasePath()}/:id/pdf`,
      this.generateInvoicePdf.bind(this),
      true,
      ['invoices:read']
    );
    
    // Process overdue invoices (admin only)
    router.registerRoute(
      HttpMethod.POST,
      `${this.getBasePath()}/process-overdue`,
      this.processOverdueInvoices.bind(this),
      true,
      ['invoices:admin']
    );
  }
  
  /**
   * Get invoice by ID
   * @param req The API request
   * @returns The invoice
   */
  private async getInvoiceById(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const id = req.params?.id;
      
      if (!id) {
        return failure('Invoice ID is required');
      }
      
      const invoiceId = new UniqueEntityID(id);
      const invoiceResult = await this.invoiceRepository.findById(invoiceId);
      
      if (invoiceResult.isFailure()) {
        return failure(invoiceResult.error);
      }
      
      const invoice = invoiceResult.value;
      
      if (!invoice) {
        return failure('Invoice not found');
      }
      
      // Map domain model to API response
      return success(this.mapInvoiceToResponse(invoice));
    } catch (error: unknown) {
      this.logger.error('Error getting invoice by ID', error instanceof Error ? error : new Error(String(error)));
      return failure(`Error getting invoice: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get invoices by customer ID
   * @param req The API request
   * @returns The invoices
   */
  private async getInvoicesByCustomerId(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const customerId = req.params?.customerId;
      
      if (!customerId) {
        return failure('Customer ID is required');
      }
      
      const customerUniqueId = new UniqueEntityID(customerId);
      const invoicesResult = await this.invoiceRepository.findByCustomerId(customerUniqueId);
      
      if (invoicesResult.isFailure()) {
        return failure(invoicesResult.error);
      }
      
      const invoices = invoicesResult.value;
      
      // Map domain models to API responses
      return success(invoices.map((invoice: InvoiceAggregate) => this.mapInvoiceToResponse(invoice)));
    } catch (error: unknown) {
      this.logger.error('Error getting invoices by customer ID', error instanceof Error ? error : new Error(String(error)));
      return failure(`Error getting invoices: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get invoices by subscription ID
   * @param req The API request
   * @returns The invoices
   */
  private async getInvoicesBySubscriptionId(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const subscriptionId = req.params?.subscriptionId;
      
      if (!subscriptionId) {
        return failure('Subscription ID is required');
      }
      
      const subscriptionUniqueId = new UniqueEntityID(subscriptionId);
      const invoicesResult = await this.invoiceRepository.findBySubscriptionId(subscriptionUniqueId);
      
      if (invoicesResult.isFailure()) {
        return failure(invoicesResult.error);
      }
      
      const invoices = invoicesResult.value;
      
      // Map domain models to API responses
      return success(invoices.map((invoice: InvoiceAggregate) => this.mapInvoiceToResponse(invoice)));
    } catch (error: unknown) {
      this.logger.error('Error getting invoices by subscription ID', error instanceof Error ? error : new Error(String(error)));
      return failure(`Error getting invoices: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get invoices by status
   * @param req The API request
   * @returns The invoices
   */
  private async getInvoicesByStatus(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const statusStr = req.params?.status;
      
      if (!statusStr) {
        return failure('Invoice status is required');
      }
      
      // Validate status
      const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
      if (!validStatuses.includes(statusStr)) {
        return failure(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      
      const statusResult = InvoiceStatus.create(statusStr);
      if (statusResult.isFailure()) {
        return failure(statusResult.error);
      }
      
      const status = statusResult.value;
      const invoicesResult = await this.invoiceRepository.findByStatus(status);
      
      if (invoicesResult.isFailure()) {
        return failure(invoicesResult.error);
      }
      
      const invoices = invoicesResult.value;
      
      // Map domain models to API responses
      return success(invoices.map((invoice: InvoiceAggregate) => this.mapInvoiceToResponse(invoice)));
    } catch (error: unknown) {
      this.logger.error('Error getting invoices by status', error instanceof Error ? error : new Error(String(error)));
      return failure(`Error getting invoices: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Create a new invoice
   * @param req The API request
   * @returns The created invoice
   */
  private async createInvoice(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const invoiceData = req.body;
      
      // Validate request data
      const validator = this.createInvoiceValidator();
      const validationResult = validator.validate(invoiceData);
      
      if (!validationResult.isValid) {
        return failure(validationResult.errors[0].message);
      }
      
      // Create invoice
      const customerId = new UniqueEntityID(invoiceData.customerId);
      const subscriptionId = invoiceData.subscriptionId ? new UniqueEntityID(invoiceData.subscriptionId) : undefined;
      const dueDate = invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined;
      
      const createResult = await this.invoiceService.createInvoice(
        customerId,
        invoiceData.items,
        invoiceData.billingAddress,
        dueDate,
        subscriptionId
      );
      
      if (createResult.isFailure()) {
        return failure(createResult.error);
      }
      
      const invoice = createResult.value;
      
      // Return API response
      return success({
        id: invoice.id.toString(),
        message: 'Invoice created successfully',
        invoice: this.mapInvoiceToResponse(invoice)
      });
    } catch (error: unknown) {
      this.logger.error('Error creating invoice', error instanceof Error ? error : new Error(String(error)));
      return failure(`Error creating invoice: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Mark invoice as paid
   * @param req The API request
   * @returns Success or failure result
   */
  private async markInvoiceAsPaid(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const id = req.params?.id;
      const paymentData = req.body;
      
      if (!id) {
        return failure('Invoice ID is required');
      }
      
      if (!paymentData.paymentMethodId) {
        return failure('Payment method ID is required');
      }
      
      if (!paymentData.transactionId) {
        return failure('Transaction ID is required');
      }
      
      const invoiceId = new UniqueEntityID(id);
      const paymentDate = paymentData.paymentDate ? new Date(paymentData.paymentDate) : new Date();
      
      const result = await this.invoiceService.markInvoiceAsPaid(
        invoiceId,
        paymentDate,
        paymentData.paymentMethodId,
        paymentData.transactionId
      );
      
      if (result.isFailure()) {
        return failure(result.error);
      }
      
      return success({
        message: 'Invoice marked as paid successfully'
      });
    } catch (error: unknown) {
      this.logger.error('Error marking invoice as paid', error instanceof Error ? error : new Error(String(error)));
      return failure(`Error marking invoice as paid: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Cancel invoice
   * @param req The API request
   * @returns Success or failure result
   */
  private async cancelInvoice(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const id = req.params?.id;
      const reason = req.body?.reason;
      
      if (!id) {
        return failure('Invoice ID is required');
      }
      
      const invoiceId = new UniqueEntityID(id);
      const result = await this.invoiceService.cancelInvoice(invoiceId, reason);
      
      if (result.isFailure()) {
        return failure(result.error);
      }
      
      return success({
        message: 'Invoice cancelled successfully'
      });
    } catch (error: unknown) {
      this.logger.error('Error cancelling invoice', error instanceof Error ? error : new Error(String(error)));
      return failure(`Error cancelling invoice: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Send invoice
   * @param req The API request
   * @returns Success or failure result
   */
  private async sendInvoice(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const id = req.params?.id;
      
      if (!id) {
        return failure('Invoice ID is required');
      }
      
      const invoiceId = new UniqueEntityID(id);
      const result = await this.invoiceService.sendInvoice(invoiceId);
      
      if (result.isFailure()) {
        return failure(result.error);
      }
      
      return success({
        message: 'Invoice sent successfully'
      });
    } catch (error: unknown) {
      this.logger.error('Error sending invoice', error instanceof Error ? error : new Error(String(error)));
      return failure(`Error sending invoice: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Generate invoice PDF
   * @param req The API request
   * @returns The PDF data
   */
  private async generateInvoicePdf(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const id = req.params?.id;
      
      if (!id) {
        return failure('Invoice ID is required');
      }
      
      const invoiceId = new UniqueEntityID(id);
      const result = await this.invoiceService.generateInvoicePdf(invoiceId);
      
      if (result.isFailure()) {
        return failure(result.error);
      }
      
      const pdfData = result.value;
      
      // In a real implementation, we would set the appropriate headers
      // and return the PDF data directly
      return success({
        pdfData: Buffer.from(pdfData).toString('base64'),
        contentType: 'application/pdf'
      });
    } catch (error: unknown) {
      this.logger.error('Error generating invoice PDF', error instanceof Error ? error : new Error(String(error)));
      return failure(`Error generating invoice PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Process overdue invoices
   * @param req The API request
   * @returns Success or failure result
   */
  private async processOverdueInvoices(req: ApiRequest): Promise<Result<any, string>> {
    try {
      // This endpoint should only be accessible by admins
      // Authentication is handled by the router middleware
      
      const result = await this.invoiceService.processOverdueInvoices();
      
      if (result.isFailure()) {
        return failure(result.error);
      }
      
      const processedCount = result.value;
      
      return success({
        message: `Successfully processed ${processedCount} overdue invoices`
      });
    } catch (error: unknown) {
      this.logger.error('Error processing overdue invoices', error instanceof Error ? error : new Error(String(error)));
      return failure(`Error processing overdue invoices: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Map invoice domain model to API response
   * @param invoice The invoice domain model
   * @returns The API response
   */
  private mapInvoiceToResponse(invoice: InvoiceAggregate): any {
    return {
      id: invoice.id.toString(),
      customerId: invoice.customerId.toString(),
      subscriptionId: invoice.subscriptionId?.toString(),
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status.value,
      items: invoice.items.map((item: InvoiceItem) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount
      })),
      subtotal: invoice.subtotal,
      taxTotal: invoice.taxTotal,
      total: invoice.total,
      billingAddress: invoice.billingAddress,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      paymentDate: invoice.paymentDate?.toISOString(),
      paymentMethodId: invoice.paymentMethodId,
      transactionId: invoice.transactionId,
      notes: invoice.notes,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    };
  }
  
  /**
   * Create invoice validator
   * @returns The invoice validator
   */
  private createInvoiceValidator(): ObjectValidator<any> {
    const validator = this.validationService.createValidator<any>();
    
    validator.forField('customerId').required();
    validator.forField('items').required();
    validator.forField('billingAddress').required();
    
    // Validate each item in the items array
    validator.forField('items').validate((items: any[]) => {
      if (!Array.isArray(items) || items.length === 0) {
        return failure('At least one invoice item is required');
      }
      
      for (const item of items) {
        if (!item.description) {
          return failure('Item description is required');
        }
        
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          return failure('Item quantity must be a positive number');
        }
        
        if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
          return failure('Item unit price must be a non-negative number');
        }
      }
      
      return success(undefined);
    });
    
    return validator;
  }
}

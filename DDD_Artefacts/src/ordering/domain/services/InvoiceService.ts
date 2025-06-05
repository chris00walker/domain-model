import { Result, success, failure } from '../../../shared/core/Result';
import { IDomainEventPublisher } from '../../../shared/domain/events/IDomainEventPublisher';
import { Order } from '../aggregates/Order';
import { IOrderRepository } from '../repositories/IOrderRepository';
import { InvoiceGenerated } from '../events/InvoiceGenerated';
import { InvoicePaid } from '../events/InvoicePaid';
import { InvoiceCancelled } from '../events/InvoiceCancelled';
import { Clock, SystemClock } from '../../../shared/domain/Clock';
import { Money } from '../../../shared/domain/value-objects/Money';
import { RefundPolicyVO } from '../value-objects/RefundPolicyVO';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';

/**
 * Invoice data transfer object
 */
export interface InvoiceDTO {
  id: string;
  orderId: string;
  customerId: string;
  items: Array<{
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  dueDate: Date;
  issueDate: Date;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  paymentTerms: string;
  notes?: string;
}

/**
 * InvoiceService handles complex invoice operations that may involve
 * multiple aggregates or external services.
 */
export class InvoiceService {
  constructor(
    private orderRepository: IOrderRepository,
    private eventPublisher: IDomainEventPublisher,
    private clock: Clock = new SystemClock()
  ) {}

  /**
   * Generate an invoice for an order
   * @param orderId The order ID
   * @returns Result with the generated invoice
   */
  public async generateInvoice(orderId: string): Promise<Result<InvoiceDTO, string>> {
    try {
      // Get the order
      const orderResult = await this.orderRepository.findById(orderId);
      
      if (orderResult.isFailure()) {
        return failure(`Order not found: ${orderResult.error}`);
      }
      
      const order = orderResult.value;
      
      // Check if order can be invoiced
      if (!this.canGenerateInvoice(order)) {
        return failure(`Cannot generate invoice for order ${orderId} in its current state`);
      }
      
      // Generate invoice
      const invoice = this.createInvoiceFromOrder(order);
      
      // Publish domain event
      const invoiceGeneratedEvent = new InvoiceGenerated({
        invoiceId: invoice.id,
        orderId: invoice.orderId,
        customerId: invoice.customerId,
        totalAmount: invoice.totalAmount,
        currency: invoice.currency,
        dueDate: invoice.dueDate,
        occurredAt: this.clock.now()
      });
      
      this.eventPublisher.publish(invoiceGeneratedEvent);
      
      return success(invoice);
    } catch (error) {
      return failure(`Error generating invoice: ${error.message}`);
    }
  }

  /**
   * Mark an invoice as paid
   * @param invoiceId The invoice ID
   * @param paymentDetails Payment details
   * @returns Result indicating success or failure
   */
  public async markInvoiceAsPaid(
    invoiceId: string, 
    paymentDetails: { 
      paymentId: string; 
      amount: number; 
      currency: string; 
      paymentMethod: string; 
      paymentDate: Date;
    }
  ): Promise<Result<void, string>> {
    try {
      // In a real implementation, we would fetch the invoice from a repository
      // For now, we'll just publish the domain event
      
      const invoicePaidEvent = new InvoicePaid({
        invoiceId: invoiceId,
        paymentId: paymentDetails.paymentId,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        paymentMethod: paymentDetails.paymentMethod,
        paymentDate: paymentDetails.paymentDate,
        occurredAt: this.clock.now()
      });
      
      this.eventPublisher.publish(invoicePaidEvent);
      
      return success(undefined);
    } catch (error) {
      return failure(`Error marking invoice as paid: ${error.message}`);
    }
  }

  /**
   * Cancel an invoice
   * @param invoiceId The invoice ID
   * @param reason Cancellation reason
   * @returns Result indicating success or failure
   */
  public async cancelInvoice(invoiceId: string, reason: string): Promise<Result<void, string>> {
    try {
      // In a real implementation, we would fetch the invoice from a repository
      // For now, we'll just publish the domain event
      
      const invoiceCancelledEvent = new InvoiceCancelled({
        invoiceId: invoiceId,
        reason: reason,
        occurredAt: this.clock.now()
      });
      
      this.eventPublisher.publish(invoiceCancelledEvent);
      
      return success(undefined);
    } catch (error) {
      return failure(`Error cancelling invoice: ${error.message}`);
    }
  }

  /**
   * Calculate refund amount for an order based on refund policy
   * @param orderId The order ID
   * @param refundPolicy The refund policy to apply
   * @returns Result with the calculated refund amount
   */
  public async calculateRefundAmount(orderId: string, refundPolicy: RefundPolicyVO): Promise<Result<Money, string>> {
    try {
      // Get the order
      const orderResult = await this.orderRepository.findById(orderId);
      
      if (orderResult.isFailure()) {
        return failure(`Order not found: ${orderResult.error}`);
      }
      
      const order = orderResult.value;
      
      // Check if order is eligible for refund
      if (!refundPolicy.isEligibleForRefund(order, this.clock.now())) {
        return failure(`Order ${orderId} is not eligible for refund under the provided policy`);
      }
      
      // Calculate refund amount
      const refundAmount = refundPolicy.calculateRefundAmount(order, this.clock.now());
      
      // Create money value object
      const moneyResult = Money.create(refundAmount, order.currency);
      
      if (moneyResult.isFailure()) {
        return failure(`Failed to create money object: ${moneyResult.error}`);
      }
      
      return success(moneyResult.value);
    } catch (error) {
      return failure(`Error calculating refund amount: ${error.message}`);
    }
  }

  /**
   * Generate monthly statement for a customer
   * @param customerId The customer ID
   * @param month Month (1-12)
   * @param year Year (e.g., 2025)
   * @returns Result with the generated statement
   */
  public async generateMonthlyStatement(
    customerId: string, 
    month: number, 
    year: number
  ): Promise<Result<any, string>> {
    try {
      // Get all orders for the customer in the specified month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const ordersResult = await this.orderRepository.findByCustomerIdAndDateRange(
        customerId, 
        startDate, 
        endDate
      );
      
      if (ordersResult.isFailure()) {
        return failure(`Failed to fetch customer orders: ${ordersResult.error}`);
      }
      
      const orders = ordersResult.value;
      
      // Generate statement
      const statement = {
        customerId: customerId,
        statementId: new UniqueEntityID().toString(),
        period: {
          month: month,
          year: year,
          startDate: startDate,
          endDate: endDate
        },
        orders: orders.map(order => ({
          orderId: order.id.toString(),
          orderDate: order.createdAt,
          totalAmount: order.totalAmount,
          status: order.status
        })),
        summary: {
          totalOrders: orders.length,
          totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
          currency: orders.length > 0 ? orders[0].currency : 'BBD'
        },
        generatedAt: this.clock.now()
      };
      
      return success(statement);
    } catch (error) {
      return failure(`Error generating monthly statement: ${error.message}`);
    }
  }

  /**
   * Check if an invoice can be generated for an order
   * @param order The order
   * @returns True if invoice can be generated
   */
  private canGenerateInvoice(order: Order): boolean {
    // Only generate invoices for orders that are not cancelled
    // and have not been invoiced yet
    return order.status !== 'CANCELLED' && !order.isInvoiced;
  }

  /**
   * Create an invoice from an order
   * @param order The order
   * @returns The created invoice
   */
  private createInvoiceFromOrder(order: Order): InvoiceDTO {
    const now = this.clock.now();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30); // 30-day payment terms
    
    return {
      id: new UniqueEntityID().toString(),
      orderId: order.id.toString(),
      customerId: order.customerId,
      items: order.items.map(item => ({
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      })),
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      shippingAmount: order.shippingAmount,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      currency: order.currency,
      dueDate: dueDate,
      issueDate: now,
      status: 'ISSUED',
      paymentTerms: 'Net 30',
      notes: `Invoice for order ${order.id.toString()}`
    };
  }
}

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
import { OrderStatus } from '../value-objects/OrderStatus';

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
  /**
   * Helper method to determine if an order is eligible for refund based on policy
   * @param order The order to check
   * @param refundPolicy The refund policy to apply
   * @param currentDate The current date
   * @returns True if eligible for refund
   */
  private isEligibleForRefund(order: Order, refundPolicy: RefundPolicyVO, currentDate: Date): boolean {
    // Check if within refundable window
    const orderDate = order.createdAt;
    const daysSincePurchase = Math.floor((currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return refundPolicy.isRefundAllowed(daysSincePurchase);
  }
  
  /**
   * Calculate subtotal for an order (sum of line items)
   */
  private calculateSubtotal(order: Order): number {
    return order.items.reduce((sum, item) => {
      const totalResult = item.calculateTotal();
      return sum + (totalResult.isSuccess() ? totalResult.value.amount : 0);
    }, 0);
  }
  
  /**
   * Calculate tax amount for an order
   */
  private calculateTax(order: Order): number {
    // Apply a standard tax rate of 15% to the subtotal
    const subtotal = this.calculateSubtotal(order);
    return subtotal * 0.15;
  }
  
  /**
   * Calculate shipping amount for an order
   */
  private calculateShipping(order: Order): number {
    // Simple flat rate shipping
    return 15.00;
  }
  
  /**
   * Calculate discount amount for an order
   */
  private calculateDiscount(order: Order): number {
    // For simplicity, no discount in this implementation
    return 0;
  }
  
  /**
   * Calculate total amount for an order
   */
  private calculateTotal(order: Order): number {
    const subtotal = this.calculateSubtotal(order);
    const tax = this.calculateTax(order);
    const shipping = this.calculateShipping(order);
    const discount = this.calculateDiscount(order);
    
    return subtotal + tax + shipping - discount;
  }
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
      const invoiceGeneratedEvent = InvoiceGenerated.create(
        invoice.id,
        invoice.orderId,
        invoice.customerId,
        invoice.totalAmount,
        invoice.currency,
        invoice.dueDate
      );
      
      this.eventPublisher.publish(invoiceGeneratedEvent);
      
      return success(invoice);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Error generating invoice: ${errorMessage}`);
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
      
      const invoicePaidEvent = InvoicePaid.create(
        invoiceId,
        paymentDetails.paymentId,
        paymentDetails.amount,
        paymentDetails.currency,
        paymentDetails.paymentMethod,
        paymentDetails.paymentDate
      );
      
      this.eventPublisher.publish(invoicePaidEvent);
      
      return success(undefined);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Error marking invoice as paid: ${errorMessage}`);
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
      
      const invoiceCancelledEvent = InvoiceCancelled.create(
        invoiceId,
        reason
      );
      
      this.eventPublisher.publish(invoiceCancelledEvent);
      
      return success(undefined);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Error cancelling invoice: ${errorMessage}`);
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
      if (!this.isEligibleForRefund(order, refundPolicy, this.clock.now())) {
        return failure(`Order ${orderId} is not eligible for refund under the provided policy`);
      }
      
      // Calculate refund amount
      const refundAmount = refundPolicy.calculateRefundAmount(order.totalAmount);
      
      // Create money value object
      const moneyResult = Money.create(refundAmount, order.currency);
      
      if (moneyResult.isFailure()) {
        return failure(`Failed to create money object: ${moneyResult.error}`);
      }
      
      return success(moneyResult.value);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Error calculating refund amount: ${errorMessage}`);
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
          totalAmount: this.calculateTotal(order),
          status: order.status
        })),
        summary: {
          totalOrders: orders.length,
          totalAmount: orders.reduce((sum: number, order: Order) => sum + this.calculateTotal(order), 0),
          currency: orders.length > 0 ? orders[0].status.toString().split('_')[0] : 'BBD'
        },
        generatedAt: this.clock.now()
      };
      
      return success(statement);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Error generating monthly statement: ${errorMessage}`);
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
    return order.status !== OrderStatus.Cancelled && !this.hasInvoiceBeenGenerated(order.id.toString());
  }
  
  /**
   * Checks if an invoice has been generated for an order
   * This would typically query an invoice repository
   */
  private hasInvoiceBeenGenerated(orderId: string): boolean {
    // In a real implementation, we would check if an invoice exists for this order
    // For now, we'll just return false as a placeholder
    return false;
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
      customerId: order.customerId.toString(),
      items: order.items.map(item => ({
        productId: item.productId.toString(),
        description: item.name,
        quantity: item.quantity,
        unitPrice: item.price.amount,
        totalPrice: item.quantity * item.price.amount
      })),
      subtotal: this.calculateSubtotal(order),
      taxAmount: this.calculateTax(order),
      shippingAmount: this.calculateShipping(order),
      discountAmount: this.calculateDiscount(order),
      totalAmount: this.calculateTotal(order),
      currency: 'BBD', // Default currency
      dueDate: dueDate,
      issueDate: now,
      status: 'ISSUED',
      paymentTerms: 'Net 30',
      notes: `Invoice for order ${order.id.toString()}`
    };
  }
}

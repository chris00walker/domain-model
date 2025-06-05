// src/infra/Payment/StripeAdapter.ts
import { IPaymentService, PaymentResult, RefundResult } from '../../../src/domain/payment/IPaymentService';

// Mock interfaces to avoid direct dependencies during domain modeling
interface ConfigService {
  get<T>(key: string): T | undefined;
}

interface EventEmitter2 {
  emit(event: string, ...args: any[]): boolean;
}

// Mock event types until we fully migrate to DDD
class OrderPaid {
  static EVENT_NAME = 'order.paid';
  constructor(
    public orderId: string,
    public paymentId: string,
    public amount: number,
    public currency: string
  ) {}
}

class OrderPaymentFailed {
  static EVENT_NAME = 'order.payment.failed';
  constructor(
    public orderId: string,
    public reason: string,
    public attempt: number
  ) {}
}

// Mock Stripe interface for type safety without dependency
interface MockStripe {
  paymentIntents: {
    create(params: any): Promise<any>;
  };
  refunds: {
    create(params: any): Promise<any>;
  };
  webhooks: {
    constructEvent(payload: string | Buffer, signature: string, secret: string): any;
  };
}

/**
 * StripeAdapter implements the IPaymentService interface
 * This provides a concrete implementation of the payment service using Stripe
 */
export class StripeAdapter implements IPaymentService {
  private stripe!: MockStripe; // Using definite assignment assertion

  /**
   * Constructor for the StripeAdapter
   * @param configService Service to access configuration values
   * @param eventEmitter Service to emit domain events
   */
  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    // Initialize the mock implementation for domain modeling
    this.mockStripeImplementation();
  }
  
  /**
   * Sets up mock implementations for Stripe during domain modeling
   * This allows us to test the domain logic without external dependencies
   */
  private mockStripeImplementation() {
    this.stripe = {
      paymentIntents: {
        create: async (params: any) => ({ 
          id: `mock_pi_${Date.now()}`, 
          status: 'succeeded', 
          amount: params.amount, 
          currency: params.currency 
        })
      },
      refunds: {
        create: async (params: any) => ({ 
          id: `mock_re_${Date.now()}`,
          amount: params.amount,
          payment_intent: params.payment_intent
        })
      },
      webhooks: {
        constructEvent: (payload: string | Buffer, signature: string, secret: string) => ({ type: 'payment_intent.succeeded' })
      }
    };
  }

  /**
   * Implementation of IPaymentService.processPayment
   * Processes a payment via the Stripe API
   * 
   * @param amount The amount to charge (in dollars/main currency unit)
   * @param currency The currency code (e.g., 'usd', 'eur')
   * @param paymentMethod The payment method ID
   * @returns Promise resolving to payment result
   */
  async processPayment(
    amount: number,
    currency: string,
    paymentMethod: string
  ): Promise<PaymentResult> {
    try {
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        payment_method: paymentMethod,
        confirm: true
      });

      return {
        success: paymentIntent.status === 'succeeded',
        paymentId: paymentIntent.id,
        status: paymentIntent.status as any
      };
    } catch (error: any) {
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        error: error.message
      };
    }
  }
  
  /**
   * Implementation of IPaymentService.refundPayment
   * Processes a refund via the Stripe API
   * 
   * @param paymentId The payment intent ID to refund
   * @param amount Optional amount to refund (defaults to full amount)
   * @returns Promise resolving to refund result
   */
  async refundPayment(
    paymentId: string,
    amount?: number
  ): Promise<RefundResult> {
    try {
      const params: any = {
        payment_intent: paymentId,
      };

      if (amount) {
        params.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await this.stripe.refunds.create(params);
      
      return {
        success: true,
        refundId: refund.id
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify a webhook event from Stripe
   * This is not part of the IPaymentService interface but specific to Stripe
   * 
   * @param payload The webhook payload
   * @param signature The Stripe signature
   * @param webhookSecret The webhook secret key
   * @returns The verified event
   */
  verifyWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): any {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  }

  /**
   * Process a payment for an order (legacy method - will be deprecated)
   * This method will be refactored to use the IPaymentService interface
   */
  async processOrderPayment(
    orderId: string,
    amount: number,
    currency: string,
    paymentMethodId: string,
    customerEmail: string
  ): Promise<void> {
    const result = await this.processPayment(amount, currency, paymentMethodId);
    
    if (result.success) {
      // Payment succeeded, emit OrderPaid event
      this.eventEmitter.emit(
        OrderPaid.EVENT_NAME,
        new OrderPaid(
          orderId,
          result.paymentId,
          amount * 100, // Convert to cents
          currency
        )
      );
    } else {
      // Handle payment failure
      this.eventEmitter.emit(
        OrderPaymentFailed.EVENT_NAME,
        new OrderPaymentFailed(
          orderId,
          result.error || 'Payment processing failed',
          1 // attempt
        )
      );
    }
  }
}

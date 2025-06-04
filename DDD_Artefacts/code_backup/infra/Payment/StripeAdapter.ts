// These imports would be used in a NestJS application
// For this DDD migration, we'll use mock implementations
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { EventEmitter2 } from '@nestjs/event-emitter';

// Mock ConfigService for DDD migration
interface ConfigService {
  get<T>(key: string): T | undefined;
}

// Mock EventEmitter for DDD migration
interface EventEmitter2 {
  emit(event: string, ...args: any[]): boolean;
}
import Stripe from 'stripe';
import { OrderPaid } from '@ordering/domain/events/OrderPaid';
import { OrderPaymentFailed } from '@ordering/domain/events/OrderPaymentFailed';

// @Injectable() - removed for DDD migration
export class StripeAdapter {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2022-11-15',
      typescript: true,
    });
  }

  /**
   * Process a payment for an order
   * @param orderId The ID of the order
   * @param amount The amount to charge in the smallest currency unit (e.g., cents)
   * @param currency The currency code (e.g., 'usd', 'eur')
   * @param paymentMethodId The Stripe payment method ID
   * @param customerEmail The customer's email for receipts
   * @returns Promise that resolves when payment is processed
   */
  async processPayment(
    orderId: string,
    amount: number,
    currency: string,
    paymentMethodId: string,
    customerEmail: string
  ): Promise<void> {
    try {
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        payment_method: paymentMethodId,
        confirm: true,
        confirmation_method: 'manual',
        metadata: { orderId },
        receipt_email: customerEmail,
        off_session: true,
      });

      if (paymentIntent.status === 'succeeded') {
        // Payment succeeded, emit OrderPaid event
        this.eventEmitter.emit(
          OrderPaid.EVENT_NAME,
          new OrderPaid(
            orderId,
            paymentIntent.id,
            paymentIntent.amount,
            paymentIntent.currency
          )
        );
      } else {
        // Handle other statuses (e.g., requires_action, requires_payment_method)
        this.handlePaymentError(
          orderId,
          new Error(`Unexpected payment status: ${paymentIntent.status}`),
          1 // attempt
        );
      }
    } catch (error) {
      this.handlePaymentError(orderId, error, 1);
    }
  }

  /**
   * Handle payment errors and emit appropriate events
   */
  private handlePaymentError(
    orderId: string,
    error: any,
    attempt: number
  ): void {
    console.error(`Payment error for order ${orderId}:`, error);
    
    // Emit OrderPaymentFailed event
    this.eventEmitter.emit(
      OrderPaymentFailed.EVENT_NAME,
      new OrderPaymentFailed(
        orderId,
        error.message || 'Payment processing failed',
        attempt
      )
    );
  }

  /**
   * Refund a payment
   */
  async refundPayment(
    paymentIntentId: string,
    amount?: number
  ): Promise<Stripe.Refund> {
    const params: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      params.amount = amount;
    }

    return this.stripe.refunds.create(params);
  }

  /**
   * Verify a webhook event from Stripe
   */
  verifyWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  }
}

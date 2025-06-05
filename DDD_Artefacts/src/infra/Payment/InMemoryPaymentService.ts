import { IPaymentService, PaymentResult, RefundResult } from '../../domain/payment/IPaymentService';

export class InMemoryPaymentService implements IPaymentService {
  private payments: Record<string, { amount: number; currency: string; status: string }> = {};

  async processPayment(amount: number, currency: string, paymentMethod: string): Promise<PaymentResult> {
    const paymentId = `pay_${Date.now()}`;
    this.payments[paymentId] = { amount, currency, status: 'succeeded' };
    
    return {
      success: true,
      paymentId,
      status: 'succeeded'
    };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    if (!this.payments[paymentId]) {
      return { success: false, error: 'Payment not found' };
    }

    return {
      success: true,
      refundId: `re_${Date.now()}`
    };
  }
}

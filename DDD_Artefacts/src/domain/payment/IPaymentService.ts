export interface IPaymentService {
  processPayment(amount: number, currency: string, paymentMethod: string): Promise<PaymentResult>;
  refundPayment(paymentId: string, amount?: number): Promise<RefundResult>;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: 'succeeded' | 'failed' | 'pending';
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

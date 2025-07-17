import { Payment } from '../aggregates/Payment';
import { Result } from '@shared/core/Result';

export interface IPaymentRepository {
  findById(id: string): Promise<Result<Payment>>;
  save(payment: Payment): Promise<Result<void>>;
  findByOrderId(orderId: string): Promise<Result<Payment[]>>;
}

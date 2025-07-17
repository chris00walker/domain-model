import { PaymentMethod } from '../value-objects/PaymentMethod';
import { Result, success, failure } from '@shared/core/Result';

export class PaymentValidator {
  static validateMethod(method: PaymentMethod): Result<void, string> {
    const allowed = Object.values(PaymentMethod);
    if (!allowed.includes(method)) {
      return failure('Unsupported payment method');
    }
    return success(undefined);
  }
}

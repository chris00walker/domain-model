import { Payment } from '../../../DDD_Artefacts/src/payment_billing/domain/aggregates/Payment';
import { PaymentMethod } from '../../../DDD_Artefacts/src/payment_billing/domain/value-objects/PaymentMethod';
import { PaymentStatus } from '../../../DDD_Artefacts/src/payment_billing/domain/value-objects/PaymentStatus';
import { IPaymentRepository } from '../../../DDD_Artefacts/src/payment_billing/domain/repositories/IPaymentRepository';
import { Money } from '@shared/domain/value-objects/Money';
import { Result, success, failure } from '@shared/core/Result';

class InMemoryPaymentRepository implements IPaymentRepository {
  private store = new Map<string, Payment>();

  async findById(id: string): Promise<Result<any>> {
    const payment = this.store.get(id);
    return payment ? success(payment) : failure(new Error('not found'));
  }

  async save(payment: any): Promise<Result<void>> {
    if (this.store.has(payment.id)) {
      return failure(new Error('duplicate'));
    }
    this.store.set(payment.id, payment);
    return success(undefined);
  }

  async findByOrderId(orderId: string): Promise<Result<any[]>> {
    const payments = Array.from(this.store.values()).filter(p => p.orderId === orderId);
    return success(payments);
  }
}

describe('Payment aggregate', () => {
  test('creates a payment', () => {
    // Arrange
    const amountResult = Money.create(10, 'BBD');
    if (amountResult.isFailure()) throw new Error();
    const amount = amountResult.value;

    // Act
    const paymentResult = Payment.initiate('order-1', amount, PaymentMethod.Card);

    // Assert
    expect(paymentResult.isSuccess()).toBe(true);
  });

  test('repository rejects duplicate id', async () => {
    // Arrange
    const repo = new InMemoryPaymentRepository();
    const amountResult = Money.create(5, 'BBD');
    if (amountResult.isFailure()) throw new Error('Failed to create amount');
    const amount = amountResult.getValue();
    const paymentResult = Payment.initiate('order-2', amount, PaymentMethod.PayPal);
    if (paymentResult.isFailure()) throw new Error('Failed to create payment');
    const payment = paymentResult.getValue();

    // Act
    const first = await repo.save(payment);
    const duplicate = await repo.save(payment);

    // Assert
    expect(first.isSuccess()).toBe(true);
    expect(duplicate.isFailure()).toBe(true);
    if (duplicate.isFailure()) {
      expect(duplicate.getErrorValue().message).toBe('duplicate');
    }
  });

  test('refund after capture results in REFUNDED status', () => {
    // Arrange
    const amountResult = Money.create(20, 'BBD');
    if (amountResult.isFailure()) throw new Error('Failed to create amount');
    const amount = amountResult.getValue();
    const paymentResult = Payment.initiate('order-3', amount, PaymentMethod.Card);
    if (paymentResult.isFailure()) throw new Error('Failed to create payment');
    const payment = paymentResult.getValue();
    payment.capture('tx-1');
    const refundAmountResult = Money.create(20, 'BBD');
    if (refundAmountResult.isFailure()) throw new Error('Failed to create refund amount');
    const refundAmount = refundAmountResult.getValue();

    // Act
    const refundResult = payment.initiateRefund('refund-1', refundAmount);

    // Assert
    expect(refundResult.isSuccess()).toBe(true);
    expect(payment.status).toBe(PaymentStatus.Refunded);
  });

  test('cannot capture twice', () => {
    // Arrange
    const amountResult = Money.create(30, 'BBD');
    if (amountResult.isFailure()) throw new Error('Failed to create amount');
    const amount = amountResult.getValue();
    const paymentResult = Payment.initiate('order-4', amount, PaymentMethod.Card);
    if (paymentResult.isFailure()) throw new Error('Failed to create payment');
    const payment = paymentResult.getValue();
    payment.capture('tx-1');

    // Act
    const secondCapture = payment.capture('tx-2');

    // Assert
    expect(secondCapture.isFailure()).toBe(true);
  });

  test('cannot fail after capture', () => {
    // Arrange
    const amountResult = Money.create(40, 'BBD');
    if (amountResult.isFailure()) throw new Error('Failed to create amount');
    const amount = amountResult.getValue();
    const paymentResult = Payment.initiate('order-5', amount, PaymentMethod.Card);
    if (paymentResult.isFailure()) throw new Error('Failed to create payment');
    const payment = paymentResult.getValue();
    payment.capture('tx-1');

    // Act
    const failResult = payment.fail('late payment');

    // Assert
    expect(failResult.isFailure()).toBe(true);
  });

  test('initiate fails with missing orderId', () => {
    // Arrange
    const amountResult = Money.create(10, 'BBD');
    if (amountResult.isFailure()) throw new Error('Failed to create amount');
    const amount = amountResult.getValue();

    // Act
    const result = Payment.initiate(undefined as any, amount, PaymentMethod.Card);

    // Assert
    expect(result.isFailure()).toBe(true);
  });

  test('payment can fail while initiated', () => {
    // Arrange
    const amountResult = Money.create(12, 'BBD');
    if (amountResult.isFailure()) throw new Error('Failed to create amount');
    const amount = amountResult.getValue();
    const paymentResult = Payment.initiate('order-f1', amount, PaymentMethod.Card);
    if (paymentResult.isFailure()) throw new Error('Failed to create payment');
    const payment = paymentResult.getValue();

    // Act
    const res = payment.fail('declined');

    // Assert
    expect(res.isSuccess()).toBe(true);
    expect(payment.status).toBe(PaymentStatus.Failed);
  });

  test('refund requires captured status', () => {
    // Arrange
    const amountResult = Money.create(15, 'BBD');
    if (amountResult.isFailure()) throw new Error('Failed to create amount');
    const amount = amountResult.getValue();
    const paymentResult = Payment.initiate('order-r1', amount, PaymentMethod.Card);
    if (paymentResult.isFailure()) throw new Error('Failed to create payment');
    const payment = paymentResult.getValue();

    // Act
    const res = payment.initiateRefund('r1', amount);

    // Assert
    expect(res.isFailure()).toBe(true);
  });

  test('receive chargeback after capture', () => {
    // Arrange
    const amountResult = Money.create(5, 'BBD');
    if (amountResult.isFailure()) throw new Error('Failed to create amount');
    const amount = amountResult.getValue();
    const paymentResult = Payment.initiate('order-c1', amount, PaymentMethod.PayPal);
    if (paymentResult.isFailure()) throw new Error('Failed to create payment');
    const payment = paymentResult.getValue();
    payment.capture('tx-c1');
    const cbAmountResult = Money.create(5, 'BBD');
    if (cbAmountResult.isFailure()) throw new Error('Failed to create chargeback amount');
    const cbAmount = cbAmountResult.getValue();

    // Act
    const res = payment.receiveChargeback('cb1', cbAmount, 'fraud');

    // Assert
    expect(res.isSuccess()).toBe(true);
    expect(payment.status).toBe(PaymentStatus.Chargeback);
  });

  test('cannot receive chargeback before capture', () => {
    // Arrange
    const amountResult = Money.create(8, 'BBD');
    if (amountResult.isFailure()) throw new Error('Failed to create amount');
    const amount = amountResult.getValue();
    const paymentResult = Payment.initiate('order-c2', amount, PaymentMethod.PayPal);
    if (paymentResult.isFailure()) throw new Error('Failed to create payment');
    const payment = paymentResult.getValue();
    const cbAmountResult = Money.create(8, 'BBD');
    if (cbAmountResult.isFailure()) throw new Error('Failed to create chargeback amount');
    const cbAmount = cbAmountResult.getValue();

    // Act
    const res = payment.receiveChargeback('cb2', cbAmount, 'fraud');

    // Assert
    expect(res.isFailure()).toBe(true);
  });
});

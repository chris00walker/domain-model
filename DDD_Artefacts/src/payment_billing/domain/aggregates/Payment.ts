import { AggregateRoot } from '@shared/domain/base/AggregateRoot';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { PaymentCaptured, PaymentFailed, RefundInitiated, RefundCompleted, ChargebackReceived, OrderPaymentConfirmed } from '../events';
import { PaymentId, PaymentStatus, PaymentMethod } from '../value-objects';
import { Money } from '@shared/domain/value-objects/Money';
import { Clock, SystemClock } from '@shared/domain/Clock';

export interface PaymentProps {
  orderId: string;
  amount: Money;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Invariants:
 * - Payment amount must be greater than zero
 * - Status transitions follow lifecycle: Initiated -> Captured/Failed -> Refunded/Chargeback
 * - Captured payments cannot transition to Failed
 */
export class Payment extends AggregateRoot<PaymentProps> {
  private constructor(props: PaymentProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static initiate(
    orderId: string,
    amount: Money,
    method: PaymentMethod,
    clock: Clock = new SystemClock()
  ): Result<Payment> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: orderId, argumentName: 'orderId' },
      { argument: amount, argumentName: 'amount' },
      { argument: method, argumentName: 'method' }
    ]);
    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    const payment = new Payment(
      {
        orderId,
        amount,
        status: PaymentStatus.Initiated,
        method,
        createdAt: clock.now(),
        updatedAt: clock.now()
      },
      new UniqueEntityID()
    );
    return success(payment);
  }

  public capture(transactionId: string, clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status !== PaymentStatus.Initiated) {
      return failure('Only initiated payments can be captured');
    }

    this.props.status = PaymentStatus.Captured;
    this.props.transactionId = transactionId;
    this.props.updatedAt = clock.now();

    this.addDomainEvent(
      new PaymentCaptured(
        this.id.toString(),
        this.props.orderId,
        this.props.amount.amount,
        this.props.amount.currency,
        this.props.method,
        clock.now()
      )
    );

    this.addDomainEvent(
      new OrderPaymentConfirmed(
        this.props.orderId,
        this.id.toString(),
        this.props.amount.amount,
        this.props.amount.currency,
        clock.now()
      )
    );

    return success(undefined);
  }

  public fail(reason: string, clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status !== PaymentStatus.Initiated) {
      return failure('Only initiated payments can fail');
    }

    this.props.status = PaymentStatus.Failed;
    this.props.updatedAt = clock.now();

    this.addDomainEvent(
      new PaymentFailed(
        this.id.toString(),
        this.props.orderId,
        this.props.amount.amount,
        this.props.amount.currency,
        this.props.method,
        reason,
        clock.now()
      )
    );

    return success(undefined);
  }

  public initiateRefund(refundId: string, amount: Money, clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status !== PaymentStatus.Captured) {
      return failure('Only captured payments can be refunded');
    }

    this.props.status = PaymentStatus.Refunded;
    this.props.updatedAt = clock.now();

    this.addDomainEvent(
      new RefundInitiated(
        this.id.toString(),
        refundId,
        amount.amount,
        amount.currency,
        clock.now()
      )
    );

    this.addDomainEvent(
      new RefundCompleted(
        this.id.toString(),
        refundId,
        amount.amount,
        amount.currency,
        clock.now()
      )
    );

    return success(undefined);
  }

  public receiveChargeback(chargebackId: string, amount: Money, reason: string, clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status !== PaymentStatus.Captured) {
      return failure('Only captured payments can receive chargebacks');
    }

    this.props.status = PaymentStatus.Chargeback;
    this.props.updatedAt = clock.now();

    this.addDomainEvent(
      new ChargebackReceived(
        this.id.toString(),
        chargebackId,
        amount.amount,
        amount.currency,
        reason,
        clock.now()
      )
    );

    return success(undefined);
  }

  get paymentId(): PaymentId {
    return PaymentId.create(this.id.toString()).value;
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get amount(): Money {
    return this.props.amount;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get method(): PaymentMethod {
    return this.props.method;
  }

  get transactionId(): string | undefined {
    return this.props.transactionId;
  }
}

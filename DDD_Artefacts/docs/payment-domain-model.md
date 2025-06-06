# Payment Domain Model

The Payment bounded context handles payment processing, refunds, and chargebacks for orders. It emits domain events so other contexts (Ordering, Notification, Analytics) can react to payment outcomes.

## Aggregates

### Payment
Represents a payment attempt for an order.
- **Properties**: `paymentId`, `orderId`, `amount`, `status`, `method`, `transactionId`, `createdAt`, `updatedAt`
- **Invariants**:
  - Payment amount must be greater than zero
  - Valid state transitions: `INITIATED` → `CAPTURED`/`FAILED` → `REFUNDED`/`CHARGEBACK`
  - Captured payments cannot move to `FAILED`

## Value Objects
- `PaymentId` – unique identifier
- `PaymentStatus` – lifecycle states
- `PaymentMethod` – supported payment methods

## Domain Events
- `PaymentCaptured`
- `PaymentFailed`
- `RefundInitiated`
- `RefundCompleted`
- `ChargebackReceived`
- `OrderPaymentConfirmed`

## Repository Interface
`IPaymentRepository` defines persistence operations for `Payment` aggregates.

## Domain Services
`PaymentValidator` provides basic validation of payment methods.

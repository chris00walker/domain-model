import { InvoicePaid } from '../../../../src/ordering/domain/events/InvoicePaid';

describe('InvoicePaid Domain Event', () => {
  const invoiceId = 'invoice-123';
  const paymentId = 'payment-456';
  const amount = 99.99;
  const currency = 'USD';
  const paymentMethod = 'credit_card';
  const paymentDate = new Date('2025-06-05');

  describe('create static factory method', () => {
    it('should create a valid InvoicePaid event with the correct properties', () => {
      // Act
      const event = InvoicePaid.create(
        invoiceId,
        paymentId,
        amount,
        currency,
        paymentMethod,
        paymentDate
      );

      // Assert
      expect(event).toBeInstanceOf(InvoicePaid);
      expect(event.invoiceId).toBe(invoiceId);
      expect(event.paymentId).toBe(paymentId);
      expect(event.amount).toBe(amount);
      expect(event.currency).toBe(currency);
      expect(event.paymentMethod).toBe(paymentMethod);
      expect(event.paymentDate).toBe(paymentDate);
      expect(event.aggregateId).toBe(invoiceId);
      expect(event.eventId).toBeDefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
    });
  });

  describe('toPrimitives method', () => {
    it('should convert the event to a primitive object with all required properties', () => {
      // Arrange
      const event = InvoicePaid.create(
        invoiceId,
        paymentId,
        amount,
        currency,
        paymentMethod,
        paymentDate
      );

      // Act
      const primitives = event.toPrimitives();

      // Assert
      expect(primitives).toEqual({
        eventId: event.eventId,
        occurredOn: event.occurredOn,
        aggregateId: invoiceId,
        invoiceId: invoiceId,
        paymentId: paymentId,
        amount: amount,
        currency: currency,
        paymentMethod: paymentMethod,
        paymentDate: paymentDate.toISOString()
      });
    });
  });

  describe('fromPrimitives static method', () => {
    it('should recreate an event from primitive values', () => {
      // Arrange
      const occurredOn = new Date();
      const payload = {
        invoiceId: invoiceId,
        paymentId: paymentId,
        amount: amount,
        currency: currency,
        paymentMethod: paymentMethod,
        paymentDate: paymentDate.toISOString()
      };

      // Act
      const recreatedEvent = InvoicePaid.fromPrimitives(
        invoiceId,
        payload,
        occurredOn
      );

      // Assert
      expect(recreatedEvent).toBeInstanceOf(InvoicePaid);
      expect(recreatedEvent.invoiceId).toBe(invoiceId);
      expect(recreatedEvent.paymentId).toBe(paymentId);
      expect(recreatedEvent.amount).toBe(amount);
      expect(recreatedEvent.currency).toBe(currency);
      expect(recreatedEvent.paymentMethod).toBe(paymentMethod);
      expect(recreatedEvent.paymentDate).toEqual(paymentDate);
      expect(recreatedEvent.aggregateId).toBe(invoiceId);
      expect(recreatedEvent.occurredOn).toBe(occurredOn);
    });
  });
});

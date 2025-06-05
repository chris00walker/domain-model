import { InvoiceGenerated } from '../../../../src/ordering/domain/events/InvoiceGenerated';

describe('InvoiceGenerated Domain Event', () => {
  const invoiceId = 'invoice-123';
  const orderId = 'order-456';
  const customerId = 'customer-789';
  const totalAmount = 99.99;
  const currency = 'USD';
  const dueDate = new Date('2025-07-05');

  describe('create static factory method', () => {
    it('should create a valid InvoiceGenerated event with the correct properties', () => {
      // Act
      const event = InvoiceGenerated.create(
        invoiceId,
        orderId,
        customerId,
        totalAmount,
        currency,
        dueDate
      );

      // Assert
      expect(event).toBeInstanceOf(InvoiceGenerated);
      expect(event.invoiceId).toBe(invoiceId);
      expect(event.orderId).toBe(orderId);
      expect(event.customerId).toBe(customerId);
      expect(event.totalAmount).toBe(totalAmount);
      expect(event.currency).toBe(currency);
      expect(event.dueDate).toBe(dueDate);
      expect(event.aggregateId).toBe(invoiceId);
      expect(event.eventId).toBeDefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
    });
  });

  describe('toPrimitives method', () => {
    it('should convert the event to a primitive object with all required properties', () => {
      // Arrange
      const event = InvoiceGenerated.create(
        invoiceId,
        orderId,
        customerId,
        totalAmount,
        currency,
        dueDate
      );

      // Act
      const primitives = event.toPrimitives();

      // Assert
      expect(primitives).toEqual({
        eventId: event.eventId,
        occurredOn: event.occurredOn,
        aggregateId: invoiceId,
        invoiceId: invoiceId,
        orderId: orderId,
        customerId: customerId,
        totalAmount: totalAmount,
        currency: currency,
        dueDate: dueDate.toISOString()
      });
    });
  });

  describe('fromPrimitives static method', () => {
    it('should recreate an event from primitive values', () => {
      // Arrange
      const occurredOn = new Date();
      const payload = {
        invoiceId: invoiceId,
        orderId: orderId,
        customerId: customerId,
        totalAmount: totalAmount,
        currency: currency,
        dueDate: dueDate.toISOString()
      };

      // Act
      const recreatedEvent = InvoiceGenerated.fromPrimitives(
        invoiceId,
        payload,
        occurredOn
      );

      // Assert
      expect(recreatedEvent).toBeInstanceOf(InvoiceGenerated);
      expect(recreatedEvent.invoiceId).toBe(invoiceId);
      expect(recreatedEvent.orderId).toBe(orderId);
      expect(recreatedEvent.customerId).toBe(customerId);
      expect(recreatedEvent.totalAmount).toBe(totalAmount);
      expect(recreatedEvent.currency).toBe(currency);
      expect(recreatedEvent.dueDate).toEqual(dueDate);
      expect(recreatedEvent.aggregateId).toBe(invoiceId);
      expect(recreatedEvent.occurredOn).toBe(occurredOn);
    });
  });
});

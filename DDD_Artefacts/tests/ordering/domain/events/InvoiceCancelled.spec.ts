import { InvoiceCancelled } from '../../../../src/ordering/domain/events/InvoiceCancelled';

describe('InvoiceCancelled Domain Event', () => {
  const invoiceId = 'invoice-123';
  const reason = 'Customer requested cancellation';

  describe('create static factory method', () => {
    it('should create a valid InvoiceCancelled event with the correct properties', () => {
      // Act
      const event = InvoiceCancelled.create(invoiceId, reason);

      // Assert
      expect(event).toBeInstanceOf(InvoiceCancelled);
      expect(event.invoiceId).toBe(invoiceId);
      expect(event.reason).toBe(reason);
      expect(event.aggregateId).toBe(invoiceId);
      expect(event.eventId).toBeDefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
    });
  });

  describe('toPrimitives method', () => {
    it('should convert the event to a primitive object with all required properties', () => {
      // Arrange
      const event = InvoiceCancelled.create(invoiceId, reason);

      // Act
      const primitives = event.toPrimitives();

      // Assert
      expect(primitives).toEqual({
        eventId: event.eventId,
        occurredOn: event.occurredOn,
        aggregateId: invoiceId,
        invoiceId: invoiceId,
        reason: reason
      });
    });
  });

  describe('fromPrimitives static method', () => {
    it('should recreate an event from primitive values', () => {
      // Arrange
      const originalEvent = InvoiceCancelled.create(invoiceId, reason);
      const primitives = originalEvent.toPrimitives();
      const occurredOn = new Date();

      // Act
      const recreatedEvent = InvoiceCancelled.fromPrimitives(
        invoiceId,
        {
          invoiceId: invoiceId,
          reason: reason
        },
        occurredOn
      );

      // Assert
      expect(recreatedEvent).toBeInstanceOf(InvoiceCancelled);
      expect(recreatedEvent.invoiceId).toBe(invoiceId);
      expect(recreatedEvent.reason).toBe(reason);
      expect(recreatedEvent.aggregateId).toBe(invoiceId);
      expect(recreatedEvent.occurredOn).toBe(occurredOn);
    });
  });
});

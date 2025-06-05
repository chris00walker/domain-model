import { QualityCheckPassed } from '../../../../src/shipping/domain/events/QualityCheckPassed';

describe('QualityCheckPassed Domain Event', () => {
  const productId = 'product-123';
  const shipmentId = 'shipment-456';
  const checkerId = 'checker-789';
  const notes = 'Product meets all quality standards';

  describe('create static factory method', () => {
    it('should create a valid QualityCheckPassed event with the correct properties', () => {
      // Act
      const event = QualityCheckPassed.create(productId, shipmentId, checkerId, notes);

      // Assert
      expect(event).toBeInstanceOf(QualityCheckPassed);
      expect(event.productId).toBe(productId);
      expect(event.shipmentId).toBe(shipmentId);
      expect(event.checkerId).toBe(checkerId);
      expect(event.notes).toBe(notes);
      expect(event.aggregateId).toBe(productId);
      expect(event.eventId).toBeDefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should create a valid QualityCheckPassed event without optional notes', () => {
      // Act
      const event = QualityCheckPassed.create(productId, shipmentId, checkerId);

      // Assert
      expect(event).toBeInstanceOf(QualityCheckPassed);
      expect(event.productId).toBe(productId);
      expect(event.shipmentId).toBe(shipmentId);
      expect(event.checkerId).toBe(checkerId);
      expect(event.notes).toBeUndefined();
      expect(event.aggregateId).toBe(productId);
      expect(event.eventId).toBeDefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
    });
  });

  describe('toPrimitives method', () => {
    it('should convert the event to a primitive object with all required properties', () => {
      // Arrange
      const event = QualityCheckPassed.create(productId, shipmentId, checkerId, notes);

      // Act
      const primitives = event.toPrimitives();

      // Assert
      expect(primitives).toEqual({
        eventId: event.eventId,
        occurredOn: event.occurredOn,
        aggregateId: productId,
        productId: productId,
        shipmentId: shipmentId,
        checkerId: checkerId,
        notes: notes
      });
    });

    it('should convert the event to a primitive object without optional notes', () => {
      // Arrange
      const event = QualityCheckPassed.create(productId, shipmentId, checkerId);

      // Act
      const primitives = event.toPrimitives();

      // Assert
      expect(primitives).toEqual({
        eventId: event.eventId,
        occurredOn: event.occurredOn,
        aggregateId: productId,
        productId: productId,
        shipmentId: shipmentId,
        checkerId: checkerId,
        notes: undefined
      });
    });
  });

  describe('fromPrimitives static method', () => {
    it('should recreate an event from primitive values with all properties', () => {
      // Arrange
      const originalEvent = QualityCheckPassed.create(productId, shipmentId, checkerId, notes);
      const primitives = originalEvent.toPrimitives();
      const occurredOn = new Date();

      // Act
      const recreatedEvent = QualityCheckPassed.fromPrimitives(
        productId,
        {
          productId: productId,
          shipmentId: shipmentId,
          checkerId: checkerId,
          notes: notes
        },
        occurredOn
      );

      // Assert
      expect(recreatedEvent).toBeInstanceOf(QualityCheckPassed);
      expect(recreatedEvent.productId).toBe(productId);
      expect(recreatedEvent.shipmentId).toBe(shipmentId);
      expect(recreatedEvent.checkerId).toBe(checkerId);
      expect(recreatedEvent.notes).toBe(notes);
      expect(recreatedEvent.aggregateId).toBe(productId);
      expect(recreatedEvent.occurredOn).toBe(occurredOn);
    });

    it('should recreate an event from primitive values without optional notes', () => {
      // Arrange
      const originalEvent = QualityCheckPassed.create(productId, shipmentId, checkerId);
      const primitives = originalEvent.toPrimitives();
      const occurredOn = new Date();

      // Act
      const recreatedEvent = QualityCheckPassed.fromPrimitives(
        productId,
        {
          productId: productId,
          shipmentId: shipmentId,
          checkerId: checkerId
        },
        occurredOn
      );

      // Assert
      expect(recreatedEvent).toBeInstanceOf(QualityCheckPassed);
      expect(recreatedEvent.productId).toBe(productId);
      expect(recreatedEvent.shipmentId).toBe(shipmentId);
      expect(recreatedEvent.checkerId).toBe(checkerId);
      expect(recreatedEvent.notes).toBeUndefined();
      expect(recreatedEvent.aggregateId).toBe(productId);
      expect(recreatedEvent.occurredOn).toBe(occurredOn);
    });
  });
});

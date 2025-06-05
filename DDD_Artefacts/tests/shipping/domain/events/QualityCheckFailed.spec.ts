import { QualityCheckFailed } from '../../../../src/shipping/domain/events/QualityCheckFailed';

describe('QualityCheckFailed Domain Event', () => {
  const productId = 'product-123';
  const shipmentId = 'shipment-456';
  const checkerId = 'checker-789';
  const reason = 'Product does not meet quality standards';
  const severity = 'HIGH' as const;
  const quarantineRequired = true;

  describe('create static factory method', () => {
    it('should create a valid QualityCheckFailed event with the correct properties', () => {
      // Act
      const event = QualityCheckFailed.create(
        productId, 
        shipmentId, 
        checkerId, 
        reason, 
        severity, 
        quarantineRequired
      );

      // Assert
      expect(event).toBeInstanceOf(QualityCheckFailed);
      expect(event.productId).toBe(productId);
      expect(event.shipmentId).toBe(shipmentId);
      expect(event.checkerId).toBe(checkerId);
      expect(event.reason).toBe(reason);
      expect(event.severity).toBe(severity);
      expect(event.quarantineRequired).toBe(quarantineRequired);
      expect(event.aggregateId).toBe(productId);
      expect(event.eventId).toBeDefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should create a valid QualityCheckFailed event with quarantine not required', () => {
      // Act
      const event = QualityCheckFailed.create(
        productId, 
        shipmentId, 
        checkerId, 
        reason, 
        'LOW', 
        false
      );

      // Assert
      expect(event).toBeInstanceOf(QualityCheckFailed);
      expect(event.productId).toBe(productId);
      expect(event.shipmentId).toBe(shipmentId);
      expect(event.checkerId).toBe(checkerId);
      expect(event.reason).toBe(reason);
      expect(event.severity).toBe('LOW');
      expect(event.quarantineRequired).toBe(false);
      expect(event.aggregateId).toBe(productId);
    });
  });

  describe('toPrimitives method', () => {
    it('should convert the event to a primitive object with all required properties', () => {
      // Arrange
      const event = QualityCheckFailed.create(
        productId, 
        shipmentId, 
        checkerId, 
        reason, 
        severity, 
        quarantineRequired
      );

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
        reason: reason,
        severity: severity,
        quarantineRequired: quarantineRequired
      });
    });
  });

  describe('fromPrimitives static method', () => {
    it('should recreate an event from primitive values', () => {
      // Arrange
      const originalEvent = QualityCheckFailed.create(
        productId, 
        shipmentId, 
        checkerId, 
        reason, 
        severity, 
        quarantineRequired
      );
      const primitives = originalEvent.toPrimitives();
      const occurredOn = new Date();

      // Act
      const recreatedEvent = QualityCheckFailed.fromPrimitives(
        productId,
        {
          productId: productId,
          shipmentId: shipmentId,
          checkerId: checkerId,
          reason: reason,
          severity: severity,
          quarantineRequired: quarantineRequired
        },
        occurredOn
      );

      // Assert
      expect(recreatedEvent).toBeInstanceOf(QualityCheckFailed);
      expect(recreatedEvent.productId).toBe(productId);
      expect(recreatedEvent.shipmentId).toBe(shipmentId);
      expect(recreatedEvent.checkerId).toBe(checkerId);
      expect(recreatedEvent.reason).toBe(reason);
      expect(recreatedEvent.severity).toBe(severity);
      expect(recreatedEvent.quarantineRequired).toBe(quarantineRequired);
      expect(recreatedEvent.aggregateId).toBe(productId);
      expect(recreatedEvent.occurredOn).toBe(occurredOn);
    });

    it('should recreate an event with different severity levels', () => {
      // Test each severity level
      const severityLevels: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      
      severityLevels.forEach(severityLevel => {
        // Arrange
        const occurredOn = new Date();

        // Act
        const recreatedEvent = QualityCheckFailed.fromPrimitives(
          productId,
          {
            productId: productId,
            shipmentId: shipmentId,
            checkerId: checkerId,
            reason: reason,
            severity: severityLevel,
            quarantineRequired: severityLevel !== 'LOW'
          },
          occurredOn
        );

        // Assert
        expect(recreatedEvent).toBeInstanceOf(QualityCheckFailed);
        expect(recreatedEvent.severity).toBe(severityLevel);
        expect(recreatedEvent.quarantineRequired).toBe(severityLevel !== 'LOW');
      });
    });
  });
});

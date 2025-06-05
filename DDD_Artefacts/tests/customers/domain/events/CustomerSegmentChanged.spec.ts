import { CustomerSegmentChanged } from '../../../../src/customers/domain/events/CustomerSegmentChanged';
import { CustomerSegmentType } from '../../../../src/customers/domain/value-objects/CustomerSegmentType';
import { v4 as uuidv4 } from 'uuid';

describe('CustomerSegmentChanged', () => {
  const customerId = uuidv4();
  const previousSegmentType = CustomerSegmentType.DiasporaNewArrival;
  const newSegmentType = CustomerSegmentType.DiasporaEstablished;
  const reason = 'Increased engagement and purchase frequency';
  const occurredOn = new Date();
  const eventId = uuidv4();

  describe('create', () => {
    it('should create a valid CustomerSegmentChanged event with all properties', () => {
      const event = CustomerSegmentChanged.create(
        customerId,
        previousSegmentType,
        newSegmentType,
        reason,
        occurredOn,
        eventId
      );

      expect(event).toBeDefined();
      expect(event.aggregateId).toBe(customerId);
      expect(event.previousSegmentType).toBe(previousSegmentType);
      expect(event.newSegmentType).toBe(newSegmentType);
      expect(event.reason).toBe(reason);
      expect(event.occurredOn).toBe(occurredOn);
      expect(event.eventId).toBe(eventId);
    });

    it('should create a valid CustomerSegmentChanged event without optional reason', () => {
      const event = CustomerSegmentChanged.create(
        customerId,
        previousSegmentType,
        newSegmentType,
        undefined,
        occurredOn,
        eventId
      );

      expect(event).toBeDefined();
      expect(event.aggregateId).toBe(customerId);
      expect(event.previousSegmentType).toBe(previousSegmentType);
      expect(event.newSegmentType).toBe(newSegmentType);
      expect(event.reason).toBeUndefined();
      expect(event.occurredOn).toBe(occurredOn);
      expect(event.eventId).toBe(eventId);
    });

    it('should create a valid CustomerSegmentChanged event with default occurredOn and eventId', () => {
      const event = CustomerSegmentChanged.create(
        customerId,
        previousSegmentType,
        newSegmentType,
        reason
      );

      expect(event).toBeDefined();
      expect(event.aggregateId).toBe(customerId);
      expect(event.previousSegmentType).toBe(previousSegmentType);
      expect(event.newSegmentType).toBe(newSegmentType);
      expect(event.reason).toBe(reason);
      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.eventId).toBeDefined();
      expect(typeof event.eventId).toBe('string');
    });
  });

  describe('serialize and deserialize', () => {
    it('should correctly serialize to JSON', () => {
      const event = CustomerSegmentChanged.create(
        customerId,
        previousSegmentType,
        newSegmentType,
        reason,
        occurredOn,
        eventId
      );

      const serialized = event.serialize();

      expect(serialized).toBeDefined();
      expect(serialized).toHaveProperty('aggregateId', customerId);
      expect(serialized).toHaveProperty('previousSegmentType', previousSegmentType);
      expect(serialized).toHaveProperty('newSegmentType', newSegmentType);
      expect(serialized).toHaveProperty('reason', reason);
      expect(serialized).toHaveProperty('occurredOn', occurredOn.toISOString());
      expect(serialized).toHaveProperty('eventId', eventId);
    });

    it('should correctly deserialize from JSON', () => {
      const event = CustomerSegmentChanged.create(
        customerId,
        previousSegmentType,
        newSegmentType,
        reason,
        occurredOn,
        eventId
      );

      const serialized = event.serialize();
      const deserialized = CustomerSegmentChanged.deserialize(serialized);

      expect(deserialized).toBeDefined();
      expect(deserialized.aggregateId).toBe(customerId);
      expect(deserialized.previousSegmentType).toBe(previousSegmentType);
      expect(deserialized.newSegmentType).toBe(newSegmentType);
      expect(deserialized.reason).toBe(reason);
      expect(deserialized.occurredOn.toISOString()).toBe(occurredOn.toISOString());
      expect(deserialized.eventId).toBe(eventId);
    });

    it('should correctly deserialize from JSON without optional reason', () => {
      const event = CustomerSegmentChanged.create(
        customerId,
        previousSegmentType,
        newSegmentType,
        undefined,
        occurredOn,
        eventId
      );

      const serialized = event.serialize();
      const deserialized = CustomerSegmentChanged.deserialize(serialized);

      expect(deserialized).toBeDefined();
      expect(deserialized.aggregateId).toBe(customerId);
      expect(deserialized.previousSegmentType).toBe(previousSegmentType);
      expect(deserialized.newSegmentType).toBe(newSegmentType);
      expect(deserialized.reason).toBeUndefined();
      expect(deserialized.occurredOn.toISOString()).toBe(occurredOn.toISOString());
      expect(deserialized.eventId).toBe(eventId);
    });
  });

  describe('getEventName', () => {
    it('should return the correct event name', () => {
      const event = CustomerSegmentChanged.create(
        customerId,
        previousSegmentType,
        newSegmentType,
        reason
      );

      expect(event.getEventName()).toBe('CustomerSegmentChanged');
    });
  });
});

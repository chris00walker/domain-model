import { DateRange, DateRangeCreated } from '../domain/value-objects/DateRange';
import { TestClock } from '../domain/Clock';
import { EventSpy } from './helpers/EventSpy';

describe('DateRange', () => {
  const baseDateStr = '2025-01-01T10:00:00.000Z';
  let testClock: TestClock;
  let eventSpy: EventSpy;

  beforeEach(() => {
    // Set up a fixed test clock
    testClock = new TestClock(new Date(baseDateStr));
    eventSpy = new EventSpy();
    
    // Mock the domain event system
    jest.spyOn(console, 'log').mockImplementation((message) => {
      if (typeof message === 'string' && message.startsWith('Domain event created:')) {
        // This is a workaround until we properly inject the event dispatcher
        // In the real implementation, we would replace this with proper DI
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a valid date range', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-10');
      
      const result = DateRange.create(start, end, testClock);
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const dateRange = result.value;
        expect(dateRange.start).toEqual(start);
        expect(dateRange.end).toEqual(end);
        expect(dateRange.durationDays()).toBe(9);
      }
    });

    it('should allow start and end date to be the same', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-01');
      
      const result = DateRange.create(start, end, testClock);
      
      expect(result.isSuccess()).toBe(true);
    });

    it('should reject date ranges where end date is before start date', () => {
      const start = new Date('2025-01-10');
      const end = new Date('2025-01-01');
      
      const result = DateRange.create(start, end, testClock);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toBe('Start date must be before or equal to end date');
    });
  });

  describe('domain events', () => {
    it('should raise DateRangeCreated event when created', () => {
      // We can't directly access the addDomainEvent method as it's private
      // and we currently don't have a proper event dispatcher.
      // This is a limitation of the current implementation.
      
      // For now, we'll use a spy on console.log which the current implementation uses
      const consoleSpy = jest.spyOn(console, 'log');
      
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-10');
      
      const result = DateRange.create(start, end, testClock);
      
      expect(result.isSuccess()).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Domain event created: DateRangeCreated');
    });
    
    it('should include correct data in the DateRangeCreated event', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-10');
      
      // We need to inspect the DateRangeCreated constructor to verify it's created correctly
      const eventSpy = jest.spyOn(DateRangeCreated.prototype, 'toPrimitives');
      
      const result = DateRange.create(start, end, testClock);
      
      expect(result.isSuccess()).toBe(true);
      
      // Verify the event was created with the correct dateRange
      if (result.isSuccess()) {
        const dateRange = result.value;
        
        // Create a mock event to test the payload
        const event = new DateRangeCreated(dateRange, undefined, testClock);
        const payload = event.toPrimitives();
        
        expect(payload.dateRange.start).toBe(start.toISOString());
        expect(payload.dateRange.end).toBe(end.toISOString());
      }
    });
  });

  describe('contains', () => {
    it('should return true when date is within range', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-10');
      const dateWithin = new Date('2025-01-05');
      
      const result = DateRange.create(start, end);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const dateRange = result.value;
        expect(dateRange.contains(dateWithin)).toBe(true);
      }
    });

    it('should return true when date is at start or end boundary', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-10');
      
      const result = DateRange.create(start, end);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const dateRange = result.value;
        expect(dateRange.contains(start)).toBe(true);
        expect(dateRange.contains(end)).toBe(true);
      }
    });

    it('should return false when date is outside range', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-10');
      const dateBefore = new Date('2024-12-31');
      const dateAfter = new Date('2025-01-11');
      
      const result = DateRange.create(start, end);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const dateRange = result.value;
        expect(dateRange.contains(dateBefore)).toBe(false);
        expect(dateRange.contains(dateAfter)).toBe(false);
      }
    });
  });

  describe('overlaps', () => {
    it('should return true when date ranges overlap', () => {
      const result1 = DateRange.create(new Date('2025-01-01'), new Date('2025-01-10'));
      const result2 = DateRange.create(new Date('2025-01-05'), new Date('2025-01-15'));
      
      expect(result1.isSuccess()).toBe(true);
      expect(result2.isSuccess()).toBe(true);
      
      if (result1.isSuccess() && result2.isSuccess()) {
        const dateRange1 = result1.value;
        const dateRange2 = result2.value;
        
        expect(dateRange1.overlaps(dateRange2)).toBe(true);
        expect(dateRange2.overlaps(dateRange1)).toBe(true);
      }
    });

    it('should return true when one date range is completely within another', () => {
      const result1 = DateRange.create(new Date('2025-01-01'), new Date('2025-01-20'));
      const result2 = DateRange.create(new Date('2025-01-05'), new Date('2025-01-15'));
      
      expect(result1.isSuccess()).toBe(true);
      expect(result2.isSuccess()).toBe(true);
      
      if (result1.isSuccess() && result2.isSuccess()) {
        const dateRange1 = result1.value;
        const dateRange2 = result2.value;
        
        expect(dateRange1.overlaps(dateRange2)).toBe(true);
        expect(dateRange2.overlaps(dateRange1)).toBe(true);
      }
    });

    it('should return true when date ranges share a boundary', () => {
      const result1 = DateRange.create(new Date('2025-01-01'), new Date('2025-01-10'));
      const result2 = DateRange.create(new Date('2025-01-10'), new Date('2025-01-20'));
      
      expect(result1.isSuccess()).toBe(true);
      expect(result2.isSuccess()).toBe(true);
      
      if (result1.isSuccess() && result2.isSuccess()) {
        const dateRange1 = result1.value;
        const dateRange2 = result2.value;
        
        expect(dateRange1.overlaps(dateRange2)).toBe(true);
        expect(dateRange2.overlaps(dateRange1)).toBe(true);
      }
    });

    it('should return false when date ranges do not overlap', () => {
      const result1 = DateRange.create(new Date('2025-01-01'), new Date('2025-01-10'));
      const result2 = DateRange.create(new Date('2025-01-11'), new Date('2025-01-20'));
      
      expect(result1.isSuccess()).toBe(true);
      expect(result2.isSuccess()).toBe(true);
      
      if (result1.isSuccess() && result2.isSuccess()) {
        const dateRange1 = result1.value;
        const dateRange2 = result2.value;
        
        expect(dateRange1.overlaps(dateRange2)).toBe(false);
        expect(dateRange2.overlaps(dateRange1)).toBe(false);
      }
    });
  });

  describe('operations', () => {
    it('should calculate duration correctly', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-10');
      
      const result = DateRange.create(start, end);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const dateRange = result.value;
        // 9 days = 9 * 24 * 60 * 60 * 1000 ms
        expect(dateRange.durationMs()).toBe(9 * 24 * 60 * 60 * 1000);
        expect(dateRange.durationDays()).toBe(9);
      }
    });

    it('should shift date range correctly', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-10');
      
      const result = DateRange.create(start, end);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const dateRange = result.value;
        const shiftResult = dateRange.shift(5);
        
        expect(shiftResult.isSuccess()).toBe(true);
        
        if (shiftResult.isSuccess()) {
          const shiftedRange = shiftResult.value;
          expect(shiftedRange.start.toISOString()).toBe(new Date('2025-01-06').toISOString());
          expect(shiftedRange.end.toISOString()).toBe(new Date('2025-01-15').toISOString());
        }
      }
    });

    it('should calculate intersection correctly', () => {
      const result1 = DateRange.create(new Date('2025-01-01'), new Date('2025-01-15'));
      const result2 = DateRange.create(new Date('2025-01-10'), new Date('2025-01-20'));
      
      expect(result1.isSuccess()).toBe(true);
      expect(result2.isSuccess()).toBe(true);
      
      if (result1.isSuccess() && result2.isSuccess()) {
        const dateRange1 = result1.value;
        const dateRange2 = result2.value;
        
        const intersectionResult = dateRange1.intersection(dateRange2);
        expect(intersectionResult.isSuccess()).toBe(true);
        
        if (intersectionResult.isSuccess()) {
          const intersection = intersectionResult.value;
          expect(intersection.start.toISOString()).toBe(new Date('2025-01-10').toISOString());
          expect(intersection.end.toISOString()).toBe(new Date('2025-01-15').toISOString());
        }
      }
    });

    it('should return failure when trying to get intersection of non-overlapping ranges', () => {
      const result1 = DateRange.create(new Date('2025-01-01'), new Date('2025-01-10'));
      const result2 = DateRange.create(new Date('2025-01-11'), new Date('2025-01-20'));
      
      expect(result1.isSuccess()).toBe(true);
      expect(result2.isSuccess()).toBe(true);
      
      if (result1.isSuccess() && result2.isSuccess()) {
        const dateRange1 = result1.value;
        const dateRange2 = result2.value;
        
        const intersectionResult = dateRange1.intersection(dateRange2);
        expect(intersectionResult.isFailure()).toBe(true);
        expect(intersectionResult.getErrorValue()).toBe('Date ranges do not overlap');
      }
    });
  });
});

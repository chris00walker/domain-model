import { TimeSlot } from '../domain/value-objects/TimeSlot';
import { TestClock } from '../domain/Clock';

describe('TimeSlot', () => {
  const baseDateStr = '2025-01-01T10:00:00.000Z';
  let testClock: TestClock;

  beforeEach(() => {
    // Set up a fixed test clock
    testClock = new TestClock(new Date(baseDateStr));
  });

  describe('create', () => {
    it('should create a valid time slot', () => {
      const startTime = new Date(testClock.now().getTime() + 60 * 60 * 1000); // 1 hour from now
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
      
      const result = TimeSlot.create(startTime, endTime, true, testClock);
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const timeSlot = result.value;
        expect(timeSlot.startTime).toEqual(startTime);
        expect(timeSlot.endTime).toEqual(endTime);
        expect(timeSlot.durationMinutes).toBe(60);
      }
    });

    it('should reject time slots where start time is in the past', () => {
      const startTime = new Date(testClock.now().getTime() - 60 * 60 * 1000); // 1 hour ago
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
      
      const result = TimeSlot.create(startTime, endTime, true, testClock);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toBe('Start time cannot be in the past');
    });

    it('should accept time slots with past start time when validation is disabled', () => {
      const startTime = new Date(testClock.now().getTime() - 60 * 60 * 1000); // 1 hour ago
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
      
      const result = TimeSlot.create(startTime, endTime, false, testClock);
      
      expect(result.isSuccess()).toBe(true);
    });

    it('should reject time slots where end time is before start time', () => {
      const startTime = new Date(testClock.now().getTime() + 60 * 60 * 1000); // 1 hour from now
      const endTime = new Date(startTime.getTime() - 30 * 60 * 1000); // 30 minutes before start
      
      const result = TimeSlot.create(startTime, endTime, true, testClock);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toBe('Start time must be before end time');
    });
  });

  describe('isActive, isPending, isExpired', () => {
    it('should correctly identify active time slots', () => {
      // Create a time slot that starts 1 hour ago and ends 1 hour from now
      const startTime = new Date(testClock.now().getTime() - 60 * 60 * 1000);
      const endTime = new Date(testClock.now().getTime() + 60 * 60 * 1000);
      
      const result = TimeSlot.create(startTime, endTime, false, testClock);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const timeSlot = result.value;
        expect(timeSlot.isActive(testClock)).toBe(true);
        expect(timeSlot.isPending(testClock)).toBe(false);
        expect(timeSlot.isExpired(testClock)).toBe(false);
      }
    });

    it('should correctly identify pending time slots', () => {
      // Create a time slot that starts 1 hour from now and ends 2 hours from now
      const startTime = new Date(testClock.now().getTime() + 60 * 60 * 1000);
      const endTime = new Date(testClock.now().getTime() + 2 * 60 * 60 * 1000);
      
      const result = TimeSlot.create(startTime, endTime, true, testClock);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const timeSlot = result.value;
        expect(timeSlot.isActive(testClock)).toBe(false);
        expect(timeSlot.isPending(testClock)).toBe(true);
        expect(timeSlot.isExpired(testClock)).toBe(false);
      }
    });

    it('should correctly identify expired time slots', () => {
      // Create a time slot that started 2 hours ago and ended 1 hour ago
      const startTime = new Date(testClock.now().getTime() - 2 * 60 * 60 * 1000);
      const endTime = new Date(testClock.now().getTime() - 60 * 60 * 1000);
      
      const result = TimeSlot.create(startTime, endTime, false, testClock);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const timeSlot = result.value;
        expect(timeSlot.isActive(testClock)).toBe(false);
        expect(timeSlot.isPending(testClock)).toBe(false);
        expect(timeSlot.isExpired(testClock)).toBe(true);
      }
    });

    it('should reflect changes in time when clock advances', () => {
      // Create a time slot that starts 1 hour from now and ends 2 hours from now
      const startTime = new Date(testClock.now().getTime() + 60 * 60 * 1000);
      const endTime = new Date(testClock.now().getTime() + 2 * 60 * 60 * 1000);
      
      const result = TimeSlot.create(startTime, endTime, true, testClock);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const timeSlot = result.value;
        
        // Initially the time slot is pending
        expect(timeSlot.isPending(testClock)).toBe(true);
        
        // Advance clock by 90 minutes - time slot should now be active
        testClock.advanceTimeByMinutes(90);
        expect(timeSlot.isActive(testClock)).toBe(true);
        
        // Advance clock by 90 more minutes - time slot should now be expired
        testClock.advanceTimeByMinutes(90);
        expect(timeSlot.isExpired(testClock)).toBe(true);
      }
    });
  });
});

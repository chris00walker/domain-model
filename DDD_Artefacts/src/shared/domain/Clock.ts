/**
 * Clock interface for time-dependent operations
 * 
 * This abstraction allows for more testable code by making time-dependent
 * logic injectable and controllable in tests.
 */
export interface Clock {
  /**
   * Returns the current date and time
   */
  now(): Date;
}

/**
 * Default implementation of Clock that uses the system time
 */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

/**
 * Test implementation of Clock that returns a fixed time
 * which can be controlled for deterministic testing
 */
export class TestClock implements Clock {
  private currentTime: Date;

  constructor(initialTime?: Date) {
    this.currentTime = initialTime || new Date();
  }

  /**
   * Returns the current fixed time
   */
  now(): Date {
    return new Date(this.currentTime);
  }

  /**
   * Advances the clock by the specified number of milliseconds
   */
  advanceTime(milliseconds: number): void {
    this.currentTime = new Date(this.currentTime.getTime() + milliseconds);
  }

  /**
   * Advances the clock by the specified number of seconds
   */
  advanceTimeBySeconds(seconds: number): void {
    this.advanceTime(seconds * 1000);
  }

  /**
   * Advances the clock by the specified number of minutes
   */
  advanceTimeByMinutes(minutes: number): void {
    this.advanceTime(minutes * 60 * 1000);
  }

  /**
   * Advances the clock by the specified number of hours
   */
  advanceTimeByHours(hours: number): void {
    this.advanceTime(hours * 60 * 60 * 1000);
  }

  /**
   * Advances the clock by the specified number of days
   */
  advanceTimeByDays(days: number): void {
    this.advanceTime(days * 24 * 60 * 60 * 1000);
  }

  /**
   * Sets the current time to the specified date
   */
  setCurrentTime(date: Date): void {
    this.currentTime = new Date(date);
  }
}

import { DomainEvent } from '../../domain/events/DomainEvent';
import { EventSpy } from './EventSpy';

/**
 * Mock implementation of the domain events service for testing
 * 
 * This replaces the actual DomainEvents implementation for tests,
 * allowing verification of event dispatch without side effects.
 */
export class MockDomainEvents {
  private static eventSpy: EventSpy = new EventSpy();

  /**
   * Reset the event spy (typically done before each test)
   */
  public static reset(): void {
    this.eventSpy = new EventSpy();
  }

  /**
   * Get the current event spy instance
   */
  public static getSpy(): EventSpy {
    return this.eventSpy;
  }

  /**
   * Dispatch a domain event (captured by the spy)
   */
  public static dispatch(event: DomainEvent): void {
    this.eventSpy.capture(event);
  }
}

// Monkey patch console.log for DateRange's temporary event logging
// This is a workaround until we properly inject the event dispatcher
const originalConsoleLog = console.log;
console.log = function(...args: any[]) {
  const firstArg = args[0];
  
  // If it's a domain event log message, capture it
  if (typeof firstArg === 'string' && firstArg.startsWith('Domain event created:')) {
    // Don't log in tests
    return;
  }
  
  // Otherwise, pass through to original console.log
  originalConsoleLog.apply(console, args);
};

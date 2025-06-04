import { DomainEvent } from '../../domain/events/DomainEvent';

/**
 * EventSpy for testing domain events
 * 
 * This class acts as a test double that can capture domain events
 * to verify they were dispatched with the correct payload.
 */
export class EventSpy {
  private events: DomainEvent[] = [];

  /**
   * Captures a domain event
   */
  capture(event: DomainEvent): void {
    this.events.push(event);
  }

  /**
   * Counts the number of events of a given type
   */
  countEvents<T extends DomainEvent>(eventType: new (...args: any[]) => T): number {
    return this.getEvents(eventType).length;
  }

  /**
   * Gets all events of a specific type
   */
  getEvents<T extends DomainEvent>(eventType: new (...args: any[]) => T): T[] {
    return this.events.filter(event => event instanceof eventType) as T[];
  }

  /**
   * Gets the most recent event of a specific type
   */
  getLastEvent<T extends DomainEvent>(eventType: new (...args: any[]) => T): T | undefined {
    const events = this.getEvents(eventType);
    return events.length > 0 ? events[events.length - 1] : undefined;
  }

  /**
   * Clears all captured events
   */
  reset(): void {
    this.events = [];
  }
}

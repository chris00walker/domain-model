import { AggregateRoot } from '../base/AggregateRoot';
import { UniqueEntityID } from '../base/UniqueEntityID';
import { DomainEvent } from './DomainEvent';

/**
 * DomainEvents
 * 
 * A static class responsible for handling the dispatch and registration of domain events.
 * This is a critical part of implementing the Domain Events pattern in DDD, which enables:
 *  - Decoupling of aggregates
 *  - Cross-bounded context communication
 *  - Event-driven architecture
 * 
 * In a production system, this would typically be replaced with a more robust event bus/message broker,
 * but this implementation serves as a simple in-memory version for testing and demonstration purposes.
 */
export class DomainEvents {
  private static handlersMap: { [key: string]: any[] } = {};
  private static markedAggregates: AggregateRoot<any>[] = [];

  /**
   * Marks an aggregate for dispatch
   * Once an aggregate is marked, its events will be dispatched when dispatchEventsForAggregate is called
   */
  public static markAggregateForDispatch(aggregate: AggregateRoot<any>): void {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }

  /**
   * Dispatches all domain events for a specific aggregate
   * @param id - The unique ID of the aggregate to dispatch events for
   */
  public static dispatchEventsForAggregate(id: UniqueEntityID | string): void {
    // Convert string ID to UniqueEntityID if needed
    const aggregateId = typeof id === 'string' ? new UniqueEntityID(id) : id;
    const aggregate = this.findMarkedAggregateByID(aggregateId);

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate);
      aggregate.clearEvents();
      this.removeAggregateFromMarkedDispatchList(aggregate);
    }
  }

  /**
   * Registers a callback handler for domain events
   * @param callback - The function to be called when a domain event is dispatched
   */
  public static register(callback: (event: DomainEvent) => void): void {
    this.handlersMap['*'] = this.handlersMap['*'] || [];
    this.handlersMap['*'].push(callback);
  }

  /**
   * Registers a callback handler for a specific domain event type
   * @param eventClassName - The name of the event class to register for
   * @param callback - The function to be called when the specified event is dispatched
   */
  public static registerForEvent(eventClassName: string, callback: (event: DomainEvent) => void): void {
    this.handlersMap[eventClassName] = this.handlersMap[eventClassName] || [];
    this.handlersMap[eventClassName].push(callback);
  }

  /**
   * Clears all event handlers
   */
  public static clearHandlers(): void {
    this.handlersMap = {};
  }

  /**
   * Clears all marked aggregates
   */
  public static clearMarkedAggregates(): void {
    this.markedAggregates = [];
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<any>): void {
    aggregate.domainEvents.forEach((event: DomainEvent) => {
      this.dispatch(event);
    });
  }

  private static dispatch(event: DomainEvent): void {
    const eventClassName = event.constructor.name;

    // Call all generic handlers
    if (this.handlersMap['*']) {
      this.handlersMap['*'].forEach((handler) => {
        handler(event);
      });
    }

    // Call specific event handlers
    if (this.handlersMap[eventClassName]) {
      this.handlersMap[eventClassName].forEach((handler) => {
        handler(event);
      });
    }
  }

  private static findMarkedAggregateByID(id: UniqueEntityID): AggregateRoot<any> | undefined {
    return this.markedAggregates.find((aggregate) => {
      return aggregate.getId().equals(id);
    });
  }

  private static removeAggregateFromMarkedDispatchList(aggregate: AggregateRoot<any>): void {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate));
    if (index !== -1) {
      this.markedAggregates.splice(index, 1);
    }
  }
}

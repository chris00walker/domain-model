import { DomainEvent } from './DomainEvent';

/**
 * IDomainEventPublisher interface defines a contract for publishing domain events
 */
export interface IDomainEventPublisher {
  /**
   * Publish a domain event
   * @param event The domain event to publish
   */
  publish(event: DomainEvent): void;
  
  /**
   * Publish multiple domain events
   * @param events Array of domain events to publish
   */
  publishAll(events: DomainEvent[]): void;
}

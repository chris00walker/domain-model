import { DomainEvent } from '../../domain/events/DomainEvent';
import { Result } from '../../core/Result';

/**
 * Interface for publishing domain events
 */
export interface IEventPublisher {
  /**
   * Publish a domain event
   * @param event The domain event to publish
   */
  publishEvent(event: DomainEvent): Promise<Result<void, string>>;
}

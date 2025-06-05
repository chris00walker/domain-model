import { IDomainEvent } from '../../domain/events/IDomainEvent';
import { Result, success, failure } from '../../core/Result';
import { ILogger } from '../logging/LoggingService';
import { IMonitoringService, MetricType } from '../monitoring/MonitoringService';

/**
 * Event processing status
 */
export enum EventProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING'
}

/**
 * Processed event record interface
 */
export interface ProcessedEventRecord {
  eventId: string;
  eventType: string;
  status: EventProcessingStatus;
  processedAt: Date;
  retryCount: number;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Event handler function type
 */
export type EventHandlerFn<T extends IDomainEvent> = (event: T) => Promise<Result<void, string>>;

/**
 * Event handler registration interface
 */
export interface EventHandlerRegistration<T extends IDomainEvent> {
  eventType: string;
  handler: EventHandlerFn<T>;
  retryConfig?: RetryConfig;
}

/**
 * Retry configuration interface
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  backoffFactor: number;
  maxDelayMs: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffFactor: 2,
  maxDelayMs: 60000
};

/**
 * Event processing repository interface for tracking processed events
 */
export interface IEventProcessingRepository {
  /**
   * Save a processed event record
   * @param record The record to save
   */
  saveProcessedEvent(record: ProcessedEventRecord): Promise<Result<void, string>>;
  
  /**
   * Find a processed event by ID
   * @param eventId The event ID
   * @returns The processed event record if found
   */
  findProcessedEvent(eventId: string): Promise<Result<ProcessedEventRecord | null, string>>;
  
  /**
   * Update a processed event record
   * @param record The record to update
   */
  updateProcessedEvent(record: ProcessedEventRecord): Promise<Result<void, string>>;
  
  /**
   * Find failed events for retry
   * @param limit Maximum number of events to return
   * @returns Failed event records
   */
  findFailedEventsForRetry(limit: number): Promise<Result<ProcessedEventRecord[], string>>;
}

/**
 * In-memory event processing repository implementation
 */
export class InMemoryEventProcessingRepository implements IEventProcessingRepository {
  private readonly processedEvents: Map<string, ProcessedEventRecord> = new Map();
  
  /**
   * Save a processed event record
   * @param record The record to save
   */
  public async saveProcessedEvent(record: ProcessedEventRecord): Promise<Result<void, string>> {
    this.processedEvents.set(record.eventId, { ...record });
    return success(undefined);
  }
  
  /**
   * Find a processed event by ID
   * @param eventId The event ID
   * @returns The processed event record if found
   */
  public async findProcessedEvent(eventId: string): Promise<Result<ProcessedEventRecord | null, string>> {
    const record = this.processedEvents.get(eventId);
    return success(record ? { ...record } : null);
  }
  
  /**
   * Update a processed event record
   * @param record The record to update
   */
  public async updateProcessedEvent(record: ProcessedEventRecord): Promise<Result<void, string>> {
    if (!this.processedEvents.has(record.eventId)) {
      return failure(`Event with ID ${record.eventId} not found`);
    }
    
    this.processedEvents.set(record.eventId, { ...record });
    return success(undefined);
  }
  
  /**
   * Find failed events for retry
   * @param limit Maximum number of events to return
   * @returns Failed event records
   */
  public async findFailedEventsForRetry(limit: number): Promise<Result<ProcessedEventRecord[], string>> {
    const failedEvents = Array.from(this.processedEvents.values())
      .filter(e => e.status === EventProcessingStatus.FAILED)
      .slice(0, limit);
    
    return success(failedEvents.map(e => ({ ...e })));
  }
}

/**
 * Idempotent event handler service
 */
export class IdempotentEventHandlerService {
  private readonly handlers: Map<string, EventHandlerRegistration<any>> = new Map();
  
  constructor(
    private readonly eventProcessingRepository: IEventProcessingRepository,
    private readonly logger: ILogger,
    private readonly monitoringService: IMonitoringService
  ) {}
  
  /**
   * Register an event handler
   * @param eventType The event type
   * @param handler The event handler function
   * @param retryConfig Optional retry configuration
   */
  public registerHandler<T extends IDomainEvent>(
    eventType: string,
    handler: EventHandlerFn<T>,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
  ): void {
    this.handlers.set(eventType, {
      eventType,
      handler,
      retryConfig
    });
    
    this.logger.info(`Registered handler for event type: ${eventType}`);
  }
  
  /**
   * Handle an event with idempotency guarantees
   * @param event The event to handle
   * @returns Result indicating success or failure
   */
  public async handleEvent<T extends IDomainEvent>(event: T): Promise<Result<void, string>> {
    const eventId = this.getEventId(event);
    const eventType = event.eventType;
    
    // Start timer for metrics
    const endTimer = this.monitoringService.startTimer(`event_processing_duration`, {
      eventType
    });
    
    try {
      // Check if event has already been processed
      const existingRecordResult = await this.eventProcessingRepository.findProcessedEvent(eventId);
      
      if (existingRecordResult.isFailure()) {
        this.logger.error(`Failed to check for existing event: ${existingRecordResult.error}`);
        return failure(`Failed to check for existing event: ${existingRecordResult.error}`);
      }
      
      const existingRecord = existingRecordResult.value;
      
      // If event has already been processed successfully, skip processing
      if (existingRecord && existingRecord.status === EventProcessingStatus.COMPLETED) {
        this.logger.info(`Event ${eventId} of type ${eventType} already processed, skipping`);
        this.monitoringService.incrementCounter('event_already_processed', 1, { eventType });
        endTimer();
        return success(undefined);
      }
      
      // Get the handler for this event type
      const handlerRegistration = this.handlers.get(eventType);
      
      if (!handlerRegistration) {
        this.logger.warn(`No handler registered for event type: ${eventType}`);
        this.monitoringService.incrementCounter('event_no_handler', 1, { eventType });
        endTimer();
        return failure(`No handler registered for event type: ${eventType}`);
      }
      
      // Create or update processing record
      const processingRecord: ProcessedEventRecord = existingRecord || {
        eventId,
        eventType,
        status: EventProcessingStatus.PROCESSING,
        processedAt: new Date(),
        retryCount: 0
      };
      
      if (!existingRecord) {
        const saveResult = await this.eventProcessingRepository.saveProcessedEvent(processingRecord);
        
        if (saveResult.isFailure()) {
          this.logger.error(`Failed to save processing record: ${saveResult.error}`);
          endTimer();
          return failure(`Failed to save processing record: ${saveResult.error}`);
        }
      } else {
        processingRecord.status = EventProcessingStatus.PROCESSING;
        processingRecord.processedAt = new Date();
        
        const updateResult = await this.eventProcessingRepository.updateProcessedEvent(processingRecord);
        
        if (updateResult.isFailure()) {
          this.logger.error(`Failed to update processing record: ${updateResult.error}`);
          endTimer();
          return failure(`Failed to update processing record: ${updateResult.error}`);
        }
      }
      
      // Process the event
      this.logger.info(`Processing event ${eventId} of type ${eventType}`);
      this.monitoringService.incrementCounter('event_processing_started', 1, { eventType });
      
      const handlerResult = await handlerRegistration.handler(event);
      
      // Update processing record based on result
      if (handlerResult.isSuccess()) {
        processingRecord.status = EventProcessingStatus.COMPLETED;
        this.logger.info(`Successfully processed event ${eventId} of type ${eventType}`);
        this.monitoringService.incrementCounter('event_processing_succeeded', 1, { eventType });
      } else {
        processingRecord.status = EventProcessingStatus.FAILED;
        processingRecord.error = handlerResult.error;
        processingRecord.retryCount += 1;
        
        this.logger.error(`Failed to process event ${eventId} of type ${eventType}: ${handlerResult.error}`);
        this.monitoringService.incrementCounter('event_processing_failed', 1, { eventType });
      }
      
      processingRecord.processedAt = new Date();
      
      const updateResult = await this.eventProcessingRepository.updateProcessedEvent(processingRecord);
      
      if (updateResult.isFailure()) {
        this.logger.error(`Failed to update processing record: ${updateResult.error}`);
        endTimer();
        return failure(`Failed to update processing record: ${updateResult.error}`);
      }
      
      endTimer();
      
      if (handlerResult.isFailure()) {
        return failure(handlerResult.error);
      }
      
      return success(undefined);
    } catch (error) {
      this.logger.error(`Unexpected error handling event ${eventId} of type ${eventType}`, error);
      this.monitoringService.incrementCounter('event_processing_error', 1, { eventType });
      endTimer();
      return failure(`Unexpected error: ${error.message}`);
    }
  }
  
  /**
   * Retry failed events
   * @param limit Maximum number of events to retry
   * @returns Number of events retried
   */
  public async retryFailedEvents(limit: number = 10): Promise<Result<number, string>> {
    try {
      const failedEventsResult = await this.eventProcessingRepository.findFailedEventsForRetry(limit);
      
      if (failedEventsResult.isFailure()) {
        return failure(`Failed to fetch failed events: ${failedEventsResult.error}`);
      }
      
      const failedEvents = failedEventsResult.value;
      let retriedCount = 0;
      
      for (const record of failedEvents) {
        const handlerRegistration = this.handlers.get(record.eventType);
        
        if (!handlerRegistration) {
          this.logger.warn(`No handler registered for event type: ${record.eventType}`);
          continue;
        }
        
        // Check if max retries exceeded
        if (record.retryCount >= handlerRegistration.retryConfig!.maxRetries) {
          this.logger.warn(`Max retries exceeded for event ${record.eventId} of type ${record.eventType}`);
          continue;
        }
        
        // Mark as retrying
        record.status = EventProcessingStatus.RETRYING;
        await this.eventProcessingRepository.updateProcessedEvent(record);
        
        // TODO: In a real implementation, we would reconstruct the event from storage
        // For now, we'll just log that we would retry it
        this.logger.info(`Would retry event ${record.eventId} of type ${record.eventType}`);
        
        retriedCount++;
      }
      
      return success(retriedCount);
    } catch (error) {
      this.logger.error('Error retrying failed events', error);
      return failure(`Error retrying failed events: ${error.message}`);
    }
  }
  
  /**
   * Get a unique ID for an event
   * @param event The event
   * @returns The event ID
   */
  private getEventId(event: IDomainEvent): string {
    // In a real implementation, this would extract a unique ID from the event
    // For now, we'll use a combination of event type and timestamp
    return `${event.eventType}-${event.occurredAt.getTime()}`;
  }
}

/**
 * RabbitMQ event consumer for processing domain events from the message broker
 */
export class RabbitMQEventConsumer {
  constructor(
    private readonly idempotentEventHandlerService: IdempotentEventHandlerService,
    private readonly logger: ILogger,
    private readonly monitoringService: IMonitoringService
  ) {}
  
  /**
   * Start consuming events from a queue
   * @param queueName The queue name
   */
  public async startConsuming(queueName: string): Promise<Result<void, string>> {
    try {
      this.logger.info(`Starting to consume events from queue: ${queueName}`);
      
      // In a real implementation, this would connect to RabbitMQ and start consuming
      // For now, we'll just log that we would start consuming
      
      this.logger.info(`Successfully started consuming from queue: ${queueName}`);
      return success(undefined);
    } catch (error) {
      this.logger.error(`Failed to start consuming from queue: ${queueName}`, error);
      return failure(`Failed to start consuming from queue: ${queueName}: ${error.message}`);
    }
  }
  
  /**
   * Handle a message from RabbitMQ
   * @param message The message content
   * @param messageId The message ID
   * @param routingKey The routing key
   */
  public async handleMessage(message: string, messageId: string, routingKey: string): Promise<Result<void, string>> {
    try {
      this.logger.debug(`Received message ${messageId} with routing key ${routingKey}`);
      this.monitoringService.incrementCounter('rabbitmq_message_received', 1, { routingKey });
      
      // Parse the message as a domain event
      let event: IDomainEvent;
      
      try {
        const eventData = JSON.parse(message);
        
        // In a real implementation, we would deserialize the event properly
        // For now, we'll just assume the parsed JSON is our event
        event = eventData as IDomainEvent;
      } catch (error) {
        this.logger.error(`Failed to parse message as JSON: ${error.message}`);
        this.monitoringService.incrementCounter('rabbitmq_message_parse_error', 1, { routingKey });
        return failure(`Failed to parse message as JSON: ${error.message}`);
      }
      
      // Handle the event with idempotency
      const result = await this.idempotentEventHandlerService.handleEvent(event);
      
      if (result.isFailure()) {
        this.logger.error(`Failed to handle event: ${result.error}`);
        this.monitoringService.incrementCounter('rabbitmq_message_handling_error', 1, { 
          routingKey,
          eventType: event.eventType
        });
        return failure(result.error);
      }
      
      this.logger.debug(`Successfully handled message ${messageId}`);
      this.monitoringService.incrementCounter('rabbitmq_message_handled', 1, { 
        routingKey,
        eventType: event.eventType
      });
      
      return success(undefined);
    } catch (error) {
      this.logger.error(`Unexpected error handling message ${messageId}`, error);
      this.monitoringService.incrementCounter('rabbitmq_message_unexpected_error', 1, { routingKey });
      return failure(`Unexpected error: ${error.message}`);
    }
  }
}

/**
 * RabbitMQ event publisher for publishing domain events to the message broker
 */
export class RabbitMQEventPublisher {
  constructor(
    private readonly logger: ILogger,
    private readonly monitoringService: IMonitoringService
  ) {}
  
  /**
   * Publish an event to RabbitMQ
   * @param event The event to publish
   * @param exchange The exchange to publish to
   * @param routingKey The routing key
   */
  public async publishEvent(
    event: IDomainEvent,
    exchange: string,
    routingKey: string
  ): Promise<Result<void, string>> {
    try {
      this.logger.debug(`Publishing event of type ${event.eventType} to exchange ${exchange} with routing key ${routingKey}`);
      
      // In a real implementation, this would publish to RabbitMQ
      // For now, we'll just log that we would publish
      
      this.logger.info(`Successfully published event of type ${event.eventType}`);
      this.monitoringService.incrementCounter('rabbitmq_event_published', 1, { 
        eventType: event.eventType,
        exchange,
        routingKey
      });
      
      return success(undefined);
    } catch (error) {
      this.logger.error(`Failed to publish event of type ${event.eventType}`, error);
      this.monitoringService.incrementCounter('rabbitmq_event_publish_error', 1, { 
        eventType: event.eventType,
        exchange,
        routingKey
      });
      
      return failure(`Failed to publish event: ${error.message}`);
    }
  }
}

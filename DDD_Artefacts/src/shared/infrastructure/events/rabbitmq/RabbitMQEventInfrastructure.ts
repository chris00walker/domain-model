import { IEventConsumer, IEventPublisher } from '../EventHandlingInfrastructure';
import { DomainEvent } from '../../../domain/events/DomainEvent';
import { ILogger } from '../../logging/LoggingService';
import { IMonitoringService } from '../../monitoring/MonitoringService';
import { Result, success, failure } from '../../../core/Result';

/**
 * Configuration for RabbitMQ connection
 */
export interface RabbitMQConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  vhost: string;
  ssl: boolean;
  connectionTimeout: number;
  heartbeat: number;
}

/**
 * Configuration for RabbitMQ exchange
 */
export interface RabbitMQExchangeConfig {
  name: string;
  type: 'direct' | 'fanout' | 'topic' | 'headers';
  durable: boolean;
  autoDelete: boolean;
}

/**
 * Configuration for RabbitMQ queue
 */
export interface RabbitMQQueueConfig {
  name: string;
  durable: boolean;
  exclusive: boolean;
  autoDelete: boolean;
  deadLetterExchange?: string;
  messageTtl?: number;
}

/**
 * RabbitMQ connection manager
 * Handles connection, channel creation, and reconnection logic
 */
export class RabbitMQConnectionManager {
  private connection: any = null;
  private channel: any = null;
  private connecting: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 10;
  private readonly reconnectInterval: number = 5000; // 5 seconds
  
  constructor(
    private readonly config: RabbitMQConfig,
    private readonly logger: ILogger,
    private readonly monitoringService: IMonitoringService
  ) {}
  
  /**
   * Connect to RabbitMQ
   * @returns Result with channel or error
   */
  public async connect(): Promise<Result<any, string>> {
    if (this.channel && this.channel.isOpen) {
      return success(this.channel);
    }
    
    if (this.connecting) {
      // Wait for connection to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.connecting && this.channel) {
            clearInterval(checkInterval);
            resolve(success(this.channel));
          } else if (!this.connecting && !this.channel) {
            clearInterval(checkInterval);
            resolve(failure('Failed to connect to RabbitMQ'));
          }
        }, 100);
      });
    }
    
    this.connecting = true;
    
    try {
      // In a real implementation, this would use the amqplib package
      // For now, we'll just simulate a connection
      this.logger.info(`Connecting to RabbitMQ at ${this.config.host}:${this.config.port}...`);
      
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate connection success
      this.connection = { 
        createChannel: async () => {
          // Simulate channel creation
          await new Promise(resolve => setTimeout(resolve, 50));
          
          return {
            isOpen: true,
            assertExchange: async (name: string, type: string, options: any) => {
              this.logger.debug(`Asserting exchange: ${name}, type: ${type}`);
              return Promise.resolve();
            },
            assertQueue: async (name: string, options: any) => {
              this.logger.debug(`Asserting queue: ${name}`);
              return Promise.resolve({ queue: name });
            },
            bindQueue: async (queue: string, exchange: string, routingKey: string) => {
              this.logger.debug(`Binding queue ${queue} to exchange ${exchange} with routing key ${routingKey}`);
              return Promise.resolve();
            },
            publish: (exchange: string, routingKey: string, content: Buffer, options: any) => {
              this.logger.debug(`Publishing message to exchange ${exchange} with routing key ${routingKey}`);
              return true;
            },
            consume: async (queue: string, callback: (msg: any) => void, options: any) => {
              this.logger.debug(`Setting up consumer for queue: ${queue}`);
              return Promise.resolve({ consumerTag: `consumer-${Date.now()}` });
            },
            ack: (message: any) => {
              this.logger.debug('Message acknowledged');
            },
            nack: (message: any, allUpTo: boolean, requeue: boolean) => {
              this.logger.debug(`Message rejected, requeue: ${requeue}`);
            },
            close: async () => {
              this.logger.debug('Channel closed');
              return Promise.resolve();
            }
          };
        },
        on: (event: string, handler: () => void) => {
          // Handle connection events
        },
        close: async () => {
          this.logger.debug('Connection closed');
          return Promise.resolve();
        }
      };
      
      this.channel = await this.connection.createChannel();
      this.reconnectAttempts = 0;
      
      this.logger.info('Successfully connected to RabbitMQ');
      this.monitoringService.recordGauge('rabbitmq_connection_status', 1);
      
      // Set up connection event handlers
      this.setupConnectionEventHandlers();
      
      this.connecting = false;
      return success(this.channel);
    } catch (error) {
      this.connecting = false;
      this.monitoringService.recordGauge('rabbitmq_connection_status', 0);
      this.monitoringService.incrementCounter('rabbitmq_connection_failures', 1);
      
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`, error);
      
      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectInterval}ms`);
        
        setTimeout(() => {
          this.connect();
        }, this.reconnectInterval);
      }
      
      return failure(`Failed to connect to RabbitMQ: ${error.message}`);
    }
  }
  
  /**
   * Set up connection event handlers
   */
  private setupConnectionEventHandlers(): void {
    if (!this.connection) return;
    
    // Handle connection errors
    this.connection.on('error', (error: Error) => {
      this.logger.error(`RabbitMQ connection error: ${error.message}`, error);
      this.monitoringService.recordGauge('rabbitmq_connection_status', 0);
      this.monitoringService.incrementCounter('rabbitmq_connection_errors', 1);
    });
    
    // Handle connection close
    this.connection.on('close', () => {
      this.logger.warn('RabbitMQ connection closed');
      this.monitoringService.recordGauge('rabbitmq_connection_status', 0);
      
      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectInterval}ms`);
        
        setTimeout(() => {
          this.connect();
        }, this.reconnectInterval);
      }
    });
  }
  
  /**
   * Close the connection
   */
  public async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      
      this.logger.info('RabbitMQ connection closed');
      this.monitoringService.recordGauge('rabbitmq_connection_status', 0);
    } catch (error) {
      this.logger.error(`Error closing RabbitMQ connection: ${error.message}`, error);
    }
  }
}

/**
 * RabbitMQ event publisher
 * Publishes domain events to RabbitMQ
 */
export class RabbitMQEventPublisher implements IEventPublisher {
  private readonly exchangeConfig: RabbitMQExchangeConfig;
  
  constructor(
    private readonly connectionManager: RabbitMQConnectionManager,
    private readonly logger: ILogger,
    private readonly monitoringService: IMonitoringService,
    exchangeConfig?: RabbitMQExchangeConfig
  ) {
    // Default exchange configuration
    this.exchangeConfig = exchangeConfig || {
      name: 'domain-events',
      type: 'topic',
      durable: true,
      autoDelete: false
    };
  }
  
  /**
   * Initialize the publisher
   */
  public async initialize(): Promise<Result<void, string>> {
    try {
      const channelResult = await this.connectionManager.connect();
      
      if (channelResult.isFailure()) {
        return failure(channelResult.error);
      }
      
      const channel = channelResult.value;
      
      // Assert exchange
      await channel.assertExchange(
        this.exchangeConfig.name,
        this.exchangeConfig.type,
        {
          durable: this.exchangeConfig.durable,
          autoDelete: this.exchangeConfig.autoDelete
        }
      );
      
      this.logger.info(`RabbitMQ publisher initialized with exchange: ${this.exchangeConfig.name}`);
      return success(undefined);
    } catch (error) {
      this.logger.error(`Failed to initialize RabbitMQ publisher: ${error.message}`, error);
      return failure(`Failed to initialize RabbitMQ publisher: ${error.message}`);
    }
  }
  
  /**
   * Publish a domain event
   * @param event The domain event to publish
   */
  public async publishEvent(event: DomainEvent): Promise<Result<void, string>> {
    const startTime = Date.now();
    
    try {
      const channelResult = await this.connectionManager.connect();
      
      if (channelResult.isFailure()) {
        return failure(channelResult.error);
      }
      
      const channel = channelResult.value;
      
      // Create routing key from event name
      // Format: boundedContext.entityName.eventName
      // Example: order.order.orderCreated
      const routingKey = event.constructor.name
        .replace(/([a-z])([A-Z])/g, '$1.$2')
        .toLowerCase();
      
      // Serialize event
      const eventData = event.serialize();
      const messageContent = Buffer.from(JSON.stringify({
        id: event.id,
        occurredOn: event.occurredOn,
        eventName: event.constructor.name,
        data: eventData
      }));
      
      // Publish message
      const published = channel.publish(
        this.exchangeConfig.name,
        routingKey,
        messageContent,
        {
          persistent: true,
          contentType: 'application/json',
          contentEncoding: 'utf-8',
          messageId: event.id,
          timestamp: event.occurredOn.getTime(),
          headers: {
            'event-name': event.constructor.name,
            'bounded-context': event.constructor.name.split('.')[0]
          }
        }
      );
      
      if (!published) {
        this.logger.warn(`Message for event ${event.constructor.name} could not be published immediately`);
      }
      
      const duration = Date.now() - startTime;
      this.monitoringService.recordHistogram('rabbitmq_publish_duration_ms', duration);
      this.monitoringService.incrementCounter('rabbitmq_messages_published', 1, {
        event_type: event.constructor.name
      });
      
      this.logger.debug(`Published event ${event.constructor.name} with ID ${event.id}`);
      return success(undefined);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoringService.recordHistogram('rabbitmq_publish_duration_ms', duration, {
        error: 'true'
      });
      this.monitoringService.incrementCounter('rabbitmq_publish_errors', 1, {
        event_type: event.constructor.name
      });
      
      this.logger.error(`Failed to publish event ${event.constructor.name}: ${error.message}`, error);
      return failure(`Failed to publish event: ${error.message}`);
    }
  }
}

/**
 * RabbitMQ event consumer
 * Consumes domain events from RabbitMQ
 */
export class RabbitMQEventConsumer implements IEventConsumer {
  private readonly queueConfig: RabbitMQQueueConfig;
  private readonly exchangeConfig: RabbitMQExchangeConfig;
  private readonly deadLetterExchangeConfig: RabbitMQExchangeConfig;
  private consumerTag: string | null = null;
  
  constructor(
    private readonly connectionManager: RabbitMQConnectionManager,
    private readonly logger: ILogger,
    private readonly monitoringService: IMonitoringService,
    private readonly eventHandlerCallback: (eventName: string, eventData: any) => Promise<Result<void, string>>,
    queueConfig?: RabbitMQQueueConfig,
    exchangeConfig?: RabbitMQExchangeConfig
  ) {
    // Default queue configuration
    this.queueConfig = queueConfig || {
      name: 'domain-events-queue',
      durable: true,
      exclusive: false,
      autoDelete: false,
      deadLetterExchange: 'domain-events-dlx',
      messageTtl: 1000 * 60 * 60 * 24 // 24 hours
    };
    
    // Default exchange configuration
    this.exchangeConfig = exchangeConfig || {
      name: 'domain-events',
      type: 'topic',
      durable: true,
      autoDelete: false
    };
    
    // Dead letter exchange configuration
    this.deadLetterExchangeConfig = {
      name: this.queueConfig.deadLetterExchange || 'domain-events-dlx',
      type: 'topic',
      durable: true,
      autoDelete: false
    };
  }
  
  /**
   * Initialize the consumer
   * @param bindingKeys The routing keys to bind to
   */
  public async initialize(bindingKeys: string[] = ['#']): Promise<Result<void, string>> {
    try {
      const channelResult = await this.connectionManager.connect();
      
      if (channelResult.isFailure()) {
        return failure(channelResult.error);
      }
      
      const channel = channelResult.value;
      
      // Assert dead letter exchange
      await channel.assertExchange(
        this.deadLetterExchangeConfig.name,
        this.deadLetterExchangeConfig.type,
        {
          durable: this.deadLetterExchangeConfig.durable,
          autoDelete: this.deadLetterExchangeConfig.autoDelete
        }
      );
      
      // Assert main exchange
      await channel.assertExchange(
        this.exchangeConfig.name,
        this.exchangeConfig.type,
        {
          durable: this.exchangeConfig.durable,
          autoDelete: this.exchangeConfig.autoDelete
        }
      );
      
      // Assert queue with dead letter exchange
      await channel.assertQueue(
        this.queueConfig.name,
        {
          durable: this.queueConfig.durable,
          exclusive: this.queueConfig.exclusive,
          autoDelete: this.queueConfig.autoDelete,
          arguments: {
            'x-dead-letter-exchange': this.deadLetterExchangeConfig.name,
            'x-message-ttl': this.queueConfig.messageTtl
          }
        }
      );
      
      // Bind queue to exchange with routing keys
      for (const bindingKey of bindingKeys) {
        await channel.bindQueue(
          this.queueConfig.name,
          this.exchangeConfig.name,
          bindingKey
        );
      }
      
      this.logger.info(`RabbitMQ consumer initialized with queue: ${this.queueConfig.name}, binding keys: ${bindingKeys.join(', ')}`);
      return success(undefined);
    } catch (error) {
      this.logger.error(`Failed to initialize RabbitMQ consumer: ${error.message}`, error);
      return failure(`Failed to initialize RabbitMQ consumer: ${error.message}`);
    }
  }
  
  /**
   * Start consuming events
   */
  public async startConsuming(): Promise<Result<void, string>> {
    try {
      const channelResult = await this.connectionManager.connect();
      
      if (channelResult.isFailure()) {
        return failure(channelResult.error);
      }
      
      const channel = channelResult.value;
      
      // Set up consumer
      const consumeResult = await channel.consume(
        this.queueConfig.name,
        async (message: any) => {
          if (!message) {
            return;
          }
          
          const startTime = Date.now();
          
          try {
            // Parse message content
            const content = message.content.toString();
            const eventMessage = JSON.parse(content);
            
            const eventName = eventMessage.eventName;
            const eventData = eventMessage.data;
            
            this.logger.debug(`Received event ${eventName} with ID ${eventMessage.id}`);
            
            // Process event
            const result = await this.eventHandlerCallback(eventName, eventData);
            
            if (result.isSuccess()) {
              // Acknowledge message
              channel.ack(message);
              
              const duration = Date.now() - startTime;
              this.monitoringService.recordHistogram('rabbitmq_consume_duration_ms', duration, {
                event_type: eventName
              });
              this.monitoringService.incrementCounter('rabbitmq_messages_consumed', 1, {
                event_type: eventName
              });
            } else {
              // Reject message and requeue if it's not a permanent failure
              const isPermanentFailure = result.error.includes('permanent failure');
              channel.nack(message, false, !isPermanentFailure);
              
              const duration = Date.now() - startTime;
              this.monitoringService.recordHistogram('rabbitmq_consume_duration_ms', duration, {
                event_type: eventName,
                error: 'true'
              });
              this.monitoringService.incrementCounter('rabbitmq_message_processing_errors', 1, {
                event_type: eventName,
                permanent: isPermanentFailure ? 'true' : 'false'
              });
              
              this.logger.error(`Failed to process event ${eventName}: ${result.error}`);
            }
          } catch (error) {
            // Reject message and don't requeue if it's a parsing error
            channel.nack(message, false, false);
            
            const duration = Date.now() - startTime;
            this.monitoringService.recordHistogram('rabbitmq_consume_duration_ms', duration, {
              error: 'true'
            });
            this.monitoringService.incrementCounter('rabbitmq_message_parsing_errors', 1);
            
            this.logger.error(`Error processing message: ${error.message}`, error);
          }
        },
        {
          noAck: false
        }
      );
      
      this.consumerTag = consumeResult.consumerTag;
      
      this.logger.info(`Started consuming events from queue: ${this.queueConfig.name}`);
      this.monitoringService.recordGauge('rabbitmq_consumer_status', 1);
      
      return success(undefined);
    } catch (error) {
      this.monitoringService.recordGauge('rabbitmq_consumer_status', 0);
      this.logger.error(`Failed to start consuming events: ${error.message}`, error);
      return failure(`Failed to start consuming events: ${error.message}`);
    }
  }
  
  /**
   * Stop consuming events
   */
  public async stopConsuming(): Promise<Result<void, string>> {
    try {
      if (!this.consumerTag) {
        return success(undefined);
      }
      
      const channelResult = await this.connectionManager.connect();
      
      if (channelResult.isFailure()) {
        return failure(channelResult.error);
      }
      
      const channel = channelResult.value;
      
      // Cancel consumer
      await channel.cancel(this.consumerTag);
      this.consumerTag = null;
      
      this.logger.info(`Stopped consuming events from queue: ${this.queueConfig.name}`);
      this.monitoringService.recordGauge('rabbitmq_consumer_status', 0);
      
      return success(undefined);
    } catch (error) {
      this.logger.error(`Failed to stop consuming events: ${error.message}`, error);
      return failure(`Failed to stop consuming events: ${error.message}`);
    }
  }
}

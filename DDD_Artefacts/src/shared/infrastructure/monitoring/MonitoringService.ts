import { ILogger } from '../logging/LoggingService';

/**
 * Metric type enum
 */
export enum MetricType {
  COUNTER = 'COUNTER',
  GAUGE = 'GAUGE',
  HISTOGRAM = 'HISTOGRAM',
  SUMMARY = 'SUMMARY'
}

/**
 * Metric value interface
 */
export interface MetricValue {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

/**
 * Health status enum
 */
export enum HealthStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  DEGRADED = 'DEGRADED',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  message?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

/**
 * Health check function type
 */
export type HealthCheckFn = () => Promise<HealthCheckResult>;

/**
 * Monitoring service interface for cross-cutting monitoring concerns
 */
export interface IMonitoringService {
  /**
   * Record a metric
   * @param name The metric name
   * @param value The metric value
   * @param type The metric type
   * @param tags Optional tags for the metric
   */
  recordMetric(name: string, value: number, type: MetricType, tags?: Record<string, string>): void;
  
  /**
   * Increment a counter metric
   * @param name The metric name
   * @param value The amount to increment by (default: 1)
   * @param tags Optional tags for the metric
   */
  incrementCounter(name: string, value?: number, tags?: Record<string, string>): void;
  
  /**
   * Record a gauge metric
   * @param name The metric name
   * @param value The gauge value
   * @param tags Optional tags for the metric
   */
  recordGauge(name: string, value: number, tags?: Record<string, string>): void;
  
  /**
   * Record a histogram metric
   * @param name The metric name
   * @param value The histogram value
   * @param tags Optional tags for the metric
   */
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void;
  
  /**
   * Start a timer
   * @param name The timer name
   * @param tags Optional tags for the timer
   * @returns A function to stop the timer and record the duration
   */
  startTimer(name: string, tags?: Record<string, string>): () => void;
  
  /**
   * Register a health check
   * @param name The health check name
   * @param check The health check function
   */
  registerHealthCheck(name: string, check: HealthCheckFn): void;
  
  /**
   * Run all registered health checks
   * @returns The health check results
   */
  runHealthChecks(): Promise<HealthCheckResult[]>;
  
  /**
   * Get the overall health status
   * @returns The overall health status
   */
  getHealthStatus(): Promise<HealthStatus>;
}

/**
 * Base monitoring service implementation
 */
export abstract class BaseMonitoringService implements IMonitoringService {
  protected readonly healthChecks: Map<string, HealthCheckFn> = new Map();
  
  constructor(protected readonly logger: ILogger) {}
  
  /**
   * Record a metric
   * @param name The metric name
   * @param value The metric value
   * @param type The metric type
   * @param tags Optional tags for the metric
   */
  public abstract recordMetric(name: string, value: number, type: MetricType, tags?: Record<string, string>): void;
  
  /**
   * Increment a counter metric
   * @param name The metric name
   * @param value The amount to increment by (default: 1)
   * @param tags Optional tags for the metric
   */
  public incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.recordMetric(name, value, MetricType.COUNTER, tags);
  }
  
  /**
   * Record a gauge metric
   * @param name The metric name
   * @param value The gauge value
   * @param tags Optional tags for the metric
   */
  public recordGauge(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric(name, value, MetricType.GAUGE, tags);
  }
  
  /**
   * Record a histogram metric
   * @param name The metric name
   * @param value The histogram value
   * @param tags Optional tags for the metric
   */
  public recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric(name, value, MetricType.HISTOGRAM, tags);
  }
  
  /**
   * Start a timer
   * @param name The timer name
   * @param tags Optional tags for the timer
   * @returns A function to stop the timer and record the duration
   */
  public startTimer(name: string, tags?: Record<string, string>): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordHistogram(`${name}_duration_ms`, duration, tags);
    };
  }
  
  /**
   * Register a health check
   * @param name The health check name
   * @param check The health check function
   */
  public registerHealthCheck(name: string, check: HealthCheckFn): void {
    this.healthChecks.set(name, check);
  }
  
  /**
   * Run all registered health checks
   * @returns The health check results
   */
  public async runHealthChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    for (const [name, check] of this.healthChecks.entries()) {
      try {
        const result = await check();
        results.push(result);
      } catch (error) {
        this.logger.error(`Health check ${name} failed`, error);
        
        results.push({
          name,
          status: HealthStatus.DOWN,
          message: `Health check failed: ${error.message}`,
          timestamp: new Date()
        });
      }
    }
    
    return results;
  }
  
  /**
   * Get the overall health status
   * @returns The overall health status
   */
  public async getHealthStatus(): Promise<HealthStatus> {
    const results = await this.runHealthChecks();
    
    if (results.length === 0) {
      return HealthStatus.UNKNOWN;
    }
    
    if (results.some(r => r.status === HealthStatus.DOWN)) {
      return HealthStatus.DOWN;
    }
    
    if (results.some(r => r.status === HealthStatus.DEGRADED)) {
      return HealthStatus.DEGRADED;
    }
    
    return HealthStatus.UP;
  }
}

/**
 * In-memory monitoring service implementation
 */
export class InMemoryMonitoringService extends BaseMonitoringService {
  private readonly metrics: MetricValue[] = [];
  
  /**
   * Record a metric
   * @param name The metric name
   * @param value The metric value
   * @param type The metric type
   * @param tags Optional tags for the metric
   */
  public recordMetric(name: string, value: number, type: MetricType, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      tags,
      timestamp: new Date()
    });
    
    this.logger.debug(`Recorded metric: ${name} = ${value}`, {
      metricName: name,
      metricValue: value,
      metricType: type,
      metricTags: tags
    });
  }
  
  /**
   * Get all recorded metrics
   * @returns The recorded metrics
   */
  public getMetrics(): MetricValue[] {
    return [...this.metrics];
  }
  
  /**
   * Clear all recorded metrics
   */
  public clearMetrics(): void {
    this.metrics.length = 0;
  }
}

/**
 * Business metrics service for tracking domain-specific metrics
 */
export class BusinessMetricsService {
  constructor(
    private readonly monitoringService: IMonitoringService,
    private readonly boundedContext: string
  ) {}
  
  /**
   * Record an order metric
   * @param metricName The metric name
   * @param value The metric value
   * @param orderId The order ID
   * @param customerId The customer ID
   */
  public recordOrderMetric(metricName: string, value: number, orderId: string, customerId: string): void {
    this.monitoringService.recordMetric(`${this.boundedContext}.order.${metricName}`, value, MetricType.GAUGE, {
      orderId,
      customerId
    });
  }
  
  /**
   * Record a customer metric
   * @param metricName The metric name
   * @param value The metric value
   * @param customerId The customer ID
   */
  public recordCustomerMetric(metricName: string, value: number, customerId: string): void {
    this.monitoringService.recordMetric(`${this.boundedContext}.customer.${metricName}`, value, MetricType.GAUGE, {
      customerId
    });
  }
  
  /**
   * Record a product metric
   * @param metricName The metric name
   * @param value The metric value
   * @param productId The product ID
   */
  public recordProductMetric(metricName: string, value: number, productId: string): void {
    this.monitoringService.recordMetric(`${this.boundedContext}.product.${metricName}`, value, MetricType.GAUGE, {
      productId
    });
  }
  
  /**
   * Record a subscription metric
   * @param metricName The metric name
   * @param value The metric value
   * @param subscriptionId The subscription ID
   * @param customerId The customer ID
   */
  public recordSubscriptionMetric(metricName: string, value: number, subscriptionId: string, customerId: string): void {
    this.monitoringService.recordMetric(`${this.boundedContext}.subscription.${metricName}`, value, MetricType.GAUGE, {
      subscriptionId,
      customerId
    });
  }
  
  /**
   * Record a shipment metric
   * @param metricName The metric name
   * @param value The metric value
   * @param shipmentId The shipment ID
   * @param orderId The order ID
   */
  public recordShipmentMetric(metricName: string, value: number, shipmentId: string, orderId: string): void {
    this.monitoringService.recordMetric(`${this.boundedContext}.shipment.${metricName}`, value, MetricType.GAUGE, {
      shipmentId,
      orderId
    });
  }
  
  /**
   * Record an inventory metric
   * @param metricName The metric name
   * @param value The metric value
   * @param productId The product ID
   * @param warehouseId The warehouse ID
   */
  public recordInventoryMetric(metricName: string, value: number, productId: string, warehouseId: string): void {
    this.monitoringService.recordMetric(`${this.boundedContext}.inventory.${metricName}`, value, MetricType.GAUGE, {
      productId,
      warehouseId
    });
  }
  
  /**
   * Record a pricing metric
   * @param metricName The metric name
   * @param value The metric value
   * @param productId The product ID
   */
  public recordPricingMetric(metricName: string, value: number, productId: string): void {
    this.monitoringService.recordMetric(`${this.boundedContext}.pricing.${metricName}`, value, MetricType.GAUGE, {
      productId
    });
  }
  
  /**
   * Record a business process duration
   * @param processName The process name
   * @param durationMs The duration in milliseconds
   * @param tags Additional tags
   */
  public recordProcessDuration(processName: string, durationMs: number, tags?: Record<string, string>): void {
    this.monitoringService.recordHistogram(
      `${this.boundedContext}.process.${processName}_duration_ms`,
      durationMs,
      tags
    );
  }
  
  /**
   * Start timing a business process
   * @param processName The process name
   * @param tags Additional tags
   * @returns A function to stop the timer and record the duration
   */
  public timeProcess(processName: string, tags?: Record<string, string>): () => void {
    return this.monitoringService.startTimer(
      `${this.boundedContext}.process.${processName}`,
      tags
    );
  }
}

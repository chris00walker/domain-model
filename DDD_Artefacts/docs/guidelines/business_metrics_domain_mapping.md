---
title: "Business Metrics to Domain Model Mapping"
version: "1.0"
last_updated: "2025-06-06"
status: "Accepted"
contributors:
  - "Domain Team"
---

## Overview

This document maps the business metrics defined in the acceptance criteria to the domain model, ensuring that these critical performance indicators are properly represented in the ubiquitous language and can be measured within the system. It provides guidance on how each metric should be calculated, tracked, and reported, creating a direct connection between technical implementations and business outcomes.

## Strategic Importance

Proper representation of business metrics in the domain model provides several benefits:

1. **Business Alignment**: Directly connects technical implementation to business objectives
2. **Performance Monitoring**: Enables real-time tracking of business success metrics
3. **Decision Support**: Provides data for evidence-based business decisions
4. **Quality Assurance**: Ensures the system is meeting critical performance targets
5. **Stakeholder Communication**: Facilitates clear communication about system performance

## Business Metrics by Bounded Context

### 1. Catalog Authentication Context

| Business Metric                  | Target  | Domain Model Representation          | Implementation Status |
| -------------------------------- | ------- | ------------------------------------ | --------------------- |
| Authentication Scan Success Rate | ≥ 99.5% | Not implemented                      | Missing               |
| Counterfeit Detection Rate       | ≥ 98%   | Not implemented                      | Missing               |

#### Implementation Recommendations for Catalog Authentication

- Create `AuthenticationScan` entity with success/failure status
- Implement `AuthenticityVerificationService` to track scan results
- Add `CounterfeitDetection` value object to represent detection outcomes
- Create reporting service to calculate success rates over time

### 2. Pricing Context

| Business Metric              | Target  | Domain Model Representation          | Implementation Status |
| ---------------------------- | ------- | ------------------------------------ | --------------------- |
| Price Calculation Accuracy   | 100%    | Implied in `PriceCalculationService` | Partial               |
| Weighted Gross Margin        | ≥ 35%   | Implied in `MarginGuardRailService`  | Partial               |
| FX Risk Hedging Coverage     | ≥ 80%   | Not implemented                      | Missing               |

#### Implementation Recommendations for Pricing

- Enhance `PriceCalculationService` to track calculation accuracy
- Add explicit `Margin` value object with calculation methods
- Implement `MarginCalculationService` with weighted average capabilities
- Create `FXRiskHedgingService` to manage currency risk exposure
- Add domain events for margin violations and hedging coverage changes

### 3. Subscription Context

| Business Metric           | Target   | Domain Model Representation | Implementation Status |
| ------------------------- | -------- | --------------------------- | --------------------- |
| Churn Rate                | ≤ 5%     | Not explicitly tracked      | Missing               |
| MRR Growth                | ≥ 10%    | Not explicitly tracked      | Missing               |
| Customer Lifetime Value   | 4x CAC   | Not explicitly tracked      | Missing               |

#### Implementation Recommendations for Subscription

- Add `SubscriptionAnalyticsService` to calculate churn and growth metrics
- Implement `ChurnPredictionService` to identify at-risk subscriptions
- Create `SubscriptionRevenue` value object to track MRR
- Add domain events for Subscription lifecycle milestones
- Implement `CustomerLifetimeValueCalculator` service

### 4. Inventory Context

| Business Metric         | Target  | Domain Model Representation | Implementation Status |
| ----------------------- | ------- | --------------------------- | --------------------- |
| Inventory Accuracy      | ≥ 99.9% | Not explicitly tracked      | Missing               |
| Forecast Accuracy       | ≥ 85%   | Not implemented             | Missing               |
| Cold Chain Compliance   | ≥ 99.9% | Not implemented             | Missing               |

#### Implementation Recommendations for Inventory

- Create proper `Inventory` aggregate with reconciliation capabilities
- Implement `InventoryReconciliationService` to track accuracy
- Add `InventoryForecastService` with accuracy tracking
- Create `ColdChainMonitoring` service with compliance tracking
- Add domain events for compliance violations and accuracy issues
- Implement `InventoryLow` event as specified in the implementation plan
- Create `ProductSettingsVO` value object for Inventory configuration

### 5. Order Context

| Business Metric         | Target      | Domain Model Representation | Implementation Status |
| ----------------------- | ----------- | --------------------------- | --------------------- |
| Order Accuracy          | ≥ 99.9%     | Not explicitly tracked      | Missing               |
| On-Time Delivery        | ≥ 95%       | Not explicitly tracked      | Missing               |
| Order Processing Time   | ≤ 5 seconds | Not explicitly tracked      | Missing               |

#### Implementation Recommendations for Order

- Enhance `Order` aggregate with accuracy tracking
- Implement `DeliveryPerformanceService` to track on-time metrics
- Add `OrderProcessingMetrics` service to measure processing times
- Create domain events for SLA violations
- Implement reporting capabilities for these metrics

### 6. Catalog Context

| Business Metric      | Target  | Domain Model Representation | Implementation Status |
| -------------------- | ------- | --------------------------- | --------------------- |
| Data Completeness    | ≥ 98%   | Not explicitly tracked      | Missing               |
| Search Response Time | ≤ 500ms | Not implemented             | Missing               |

#### Implementation Recommendations for Catalog

- Add `ProductDataCompleteness` value object to track required fields
- Implement `ProductDataQualityService` to monitor completeness
- Create performance monitoring for search operations
- Add domain events for data quality thresholds
- Implement caching strategies for search optimization

### 7. Customer Context

| Business Metric         | Target | Domain Model Representation | Implementation Status |
| ----------------------- | ------ | --------------------------- | --------------------- |
| Segmentation Accuracy   | ≥ 90%  | Not explicitly tracked      | Missing               |
| Churn Reduction         | ≥ 30%  | Not implemented             | Missing               |
| Loyalty Program ROI     | ≥ 3:1  | Not implemented             | Missing               |

#### Implementation Recommendations for Customer

- Create `CustomerSegmentVerification` service to track accuracy
- Implement `ChurnAnalytics` service to measure reduction over time
- Add `LoyaltyProgramROI` calculator with investment/return tracking
- Create domain events for segment changes and loyalty milestones
- Implement reporting capabilities for Customer metrics
- Implement Customer Segment Extensions as specified in the implementation plan

### 8. Marketing Context

| Business Metric       | Target              | Domain Model Representation | Implementation Status |
| --------------------- | ------------------- | --------------------------- | --------------------- |
| Campaign ROI          | ≥ 25% improvement   | Not implemented             | Missing               |
| Content Engagement    | ≥ 30% improvement   | Not implemented             | Missing               |

#### Implementation Recommendations for Marketing

- Create `Campaign` aggregate with ROI tracking
- Implement `CampaignAnalyticsService` to calculate performance
- Add `ContentEngagementTracker` service
- Create domain events for campaign milestones and engagement thresholds
- Implement Customer Segment Webhooks as specified in the implementation plan
- Develop the Content Service Backend for cultural content storage/retrieval
- Implement reporting capabilities for marketing metrics

### 9. Payment Context

| Business Metric           | Target  | Domain Model Representation           | Implementation Status |
| ------------------------- | ------- | ------------------------------------- | --------------------- |
| Payment Success Rate      | ≥ 99.5% | Partially tracked in `PaymentService` | Partial               |
| Reconciliation Accuracy   | 100%    | Not explicitly tracked                | Missing               |

#### Implementation Recommendations for Payment

- Enhance `PaymentService` with explicit success tracking
- Create `PaymentReconciliation` aggregate
- Implement `ReconciliationService` with accuracy metrics
- Add domain events for reconciliation issues
- Create reporting capabilities for Payment metrics

### 10. Analytics Context

| Business Metric         | Target       | Domain Model Representation | Implementation Status |
| ----------------------- | ------------ | --------------------------- | --------------------- |
| Dashboard Response Time | ≤ 3 seconds  | Not implemented             | Missing               |
| Data Freshness          | ≤ 30 min lag | Not implemented             | Missing               |
| Query Performance       | ≤ 2 seconds  | Not implemented             | Missing               |

#### Implementation Recommendations for Analytics

- Implement `DataIngestionService` for fast data processing
- Create `MetricCalculationService` for efficient analytics
- Develop `VisualizationService` with performance optimization
- Add domain events for data update thresholds
- Build the Reporting Service specified in the implementation plan

## Implementation Patterns for Metrics

### Value Objects for Metrics

To properly represent business metrics in the domain model, we should create value objects that encapsulate the calculation and validation logic:

```typescript
// Example implementation for a metric value object
export class InventoryAccuracy extends ValueObject<InventoryAccuracyProps> {
  private constructor(props: InventoryAccuracyProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }

  get isWithinTarget(): boolean {
    return this.value >= 99.9;
  }

  get status(): MetricStatus {
    if (this.value >= 99.9) return MetricStatus.EXCELLENT;
    if (this.value >= 99.5) return MetricStatus.GOOD;
    if (this.value >= 99.0) return MetricStatus.WARNING;
    return MetricStatus.CRITICAL;
  }

  public static calculate(
    systemCount: number,
    actualCount: number
  ): Result<InventoryAccuracy> {
    if (systemCount < 0 || actualCount < 0) {
      return Result.fail<InventoryAccuracy>("Counts cannot be negative");
    }
    const accuracy = actualCount > 0 ? (1 - Math.abs(systemCount - actualCount) / actualCount) * 100 : 0;
    return Result.ok<InventoryAccuracy>(
      new InventoryAccuracy({ value: accuracy })
    );
  }
}
```

### Domain Services for Metric Calculation

Each bounded context should have dedicated services for calculating and tracking its metrics:

```typescript
// Example implementation for a metric calculation service
export interface SubscriptionMetricsService {
  calculateChurnRate(period: DateRange): Promise<ChurnRate>;
  calculateMRRGrowth(period: DateRange): Promise<MRRGrowth>;
  calculateCustomerLifetimeValue(customerId: CustomerId): Promise<CustomerLifetimeValue>;
  generateMetricsReport(period: DateRange): Promise<SubscriptionMetricsReport>;
}
```

### Domain Events for Metric Thresholds

Create domain events that are triggered when metrics cross important thresholds:

```typescript
// Example implementation for a metric threshold event
export class ChurnRateThresholdExceeded extends DomainEvent {
  constructor(
    public readonly churnRate: ChurnRate,
    public readonly period: DateRange
  ) {
    super({
      aggregateId: new UniqueEntityID('Subscription-metrics'),
      dateTimeOccurred: new Date()
    });
  }
}
```

### Repositories for Historical Metrics

Implement repositories to store historical metric data for trend analysis:

```typescript
// Example implementation for a metrics repository
export interface MetricsRepository {
  saveMetric<T extends Metric>(metric: T): Promise<void>;
  getMetricHistory<T extends Metric>(
    metricType: MetricType,
    period: DateRange
  ): Promise<T[]>;
  getLatestMetric<T extends Metric>(metricType: MetricType): Promise<T>;
}
```

## Metric Tracking System Architecture

### Metrics Dashboard and Visualization

Implement a metrics dashboard that visualizes the current status of all business metrics:

1. **Real-time Monitoring**: Show current values for all metrics with visual indicators for those outside target ranges.
2. **Trend Analysis**: Display historical trends for each metric over time.
3. **Drill-down Capability**: Allow users to explore detailed breakdowns of each metric.
4. **Alert Configuration**: Enable setting of custom alert thresholds beyond the standard targets.

### Integration with Domain Model

The metrics system should integrate with other parts of the domain model:

1. **Domain Events**: Subscribe to relevant domain events to update metrics in real-time
2. **Command Handlers**: Validate operations against metric targets (e.g., prevent actions that would breach margin floors)
3. **Query Services**: Provide read models optimized for metric calculation and reporting
4. **External Systems**: Export metrics to business intelligence tools for advanced analysis

### Metrics Data Flow

![Metrics Data Flow](../assets/metrics-data-flow.png)

1. **Event Collection**: Domain events trigger metric calculations
2. **Processing**: Raw events are processed into meaningful metrics
3. **Storage**: Metrics are stored for historical analysis
4. **Reporting**: Dashboards and reports display metrics to stakeholders
5. **Alerting**: Thresholds trigger notifications to appropriate teams

## Implementation Roadmap

### Phase 1: Core Metrics Foundation

1. Define value objects for all business metrics
2. Implement basic calculation services for each bounded context
3. Create repositories for metric storage
4. Establish domain events for threshold violations

### Phase 2: Metrics Integration

1. Connect metrics calculation to existing domain events
2. Implement real-time monitoring capabilities
3. Create basic dashboard for metric visualization
4. Integrate with existing reporting systems

### Phase 3: Advanced Analytics

1. Implement predictive analytics for key metrics
2. Create correlation analysis between different metrics
3. Develop automated recommendations based on metric trends
4. Implement machine learning models for metric optimization

## Relationship to Other Artifacts

| Related Artifact | Relationship |
|-----------------|---------------|
| Business Problem Acceptance Criteria | Source of metric targets and definitions |
| Domain Event Catalog | Events used to trigger metric calculations |
| Bounded Context Map | Organizational structure for metrics |
| Implementation Plan | Prioritization of metric implementation |
| ADRs | Technical decisions affecting metric collection |
| Analytics Domain Knowledge | Provides foundation for metrics processing and visualization |
| Ubiquitous Language Guidelines | Ensures consistent terminology in metric naming |

## Conclusion

Properly representing business metrics in the domain model is essential for ensuring that the system can effectively track and report on its performance against business goals. By implementing the recommendations in this document, we can create a comprehensive metrics system that is fully integrated with the domain model and provides valuable insights for business stakeholders.
*This document should be reviewed and updated as business metrics evolve. Last updated: 2025-06-06*

---

⚑ Related

- [Domain Glossary](../glossary.md)
- [Ubiquitous Language Evolution Process](./ubiquitous_language_evolution.md)

↩ [Back to Framework TOC](../README.md)

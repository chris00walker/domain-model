---
title: "Domain Events Business Mapping"
version: "2.0"
last_updated: "2025-06-06"
status: "Final"
---
<!-- MANUAL REVIEW NEEDED: Ensure all domain events follow entity-first, past-tense naming convention -->
<!-- NOTE: This file needs manual review to ensure all domain events follow entity-first, past-tense naming convention -->
##

title: "Domain Events Business Mapping"
version: "1.0"
last_updated: "2025-06-06"

## status: "Draft"

status: "Draft"
title: "Domain Events Business Mapping"
version: "1.0"
last_updated: "2025-06-06"
status: "Approved"
contributors:

- "Domain Team"

# Domain Events Business Mapping

## Overview

This document maps domain events to business processes, metrics, and value streams within the Elias Food Imports system. It illustrates how domain events serve as key integration points between bounded contexts and how they support critical business functions. By establishing this mapping, we ensure that our technical implementation through domain events properly supports business objectives and enables monitoring of key processes.

## Strategic Importance

Mapping domain events to business processes provides several critical benefits:

1. **Business Alignment**: Ensures technical events reflect meaningful business occurrences
2. **Process Visibility**: Enables monitoring and measurement of business processes
3. **Cross-Domain Integration**: Clarifies how different bounded contexts collaborate
4. **Impact Analysis**: Facilitates understanding of technical changes on business processes
5. **Metrics Foundation**: Provides the foundation for calculating key business metrics

## Business Process to Event Mappings

### Order Fulfillment Process

The Order fulfillment process encompasses activities from Order placement to delivery.

#### Key Business Steps and Corresponding Events

1. **Order Placement**
   - Business Step: Customer submits Order
   - Domain Event: `OrderPlaced`
   - Business Impact: Initiates fulfillment workflow
   - Metrics Affected: Order volume, conversion rate
2. **Payment Processing**
   - Business Step: Payment authorization and capture
   - Domain Events: `PaymentAuthorized`, `PaymentCaptured`
   - Business Impact: Revenue recognition
   - Metrics Affected: Payment success rate, average Order value
3. **Inventory Allocation**
   - Business Step: Reserved Inventory for Order
   - Domain Event: `InventoryAllocated`
   - Business Impact: Stock management
   - Metrics Affected: Inventory accuracy, stockout rate
4. **Order Fulfillment**
   - Business Step: Order items picked and packed
   - Domain Event: `OrderFulfilled`
   - Business Impact: Operational efficiency
   - Metrics Affected: Fulfillment time, picking accuracy
5. **Shipment Creation**
   - Business Step: Carrier selected and label created
   - Domain Event: `ShipmentCreated`
   - Business Impact: Shipping cost management
   - Metrics Affected: Shipping cost per Order
6. **Order Shipped**
   - Business Step: Order handed to carrier
   - Domain Event: `OrderShipped`
   - Business Impact: Customer satisfaction
   - Metrics Affected: On-time shipping rate
7. **Delivery Confirmation**
   - Business Step: Package delivered to Customer
   - Domain Event: `OrderDelivered`
   - Business Impact: Order cycle completion
   - Metrics Affected: On-time delivery rate, fulfillment cycle time

#### Process Visualization

```mermaid
sequenceDiagram
```

participant Customer
participant Order
participant Payment
participant Inventory
participant Shipping
Customer->>Order: Place Order
Note over Order: OrderPlaced
Order->>Payment: Request Payment
Note over Payment: PaymentAuthorized
Note over Payment: PaymentCaptured
Payment->>Order: Payment Confirmed
Order->>Inventory: Allocate Items
Note over Inventory: InventoryAllocated
Inventory->>Order: Items Reserved
Note over Order: OrderFulfilled
Order->>Shipping: Request Shipment
Note over Shipping: ShipmentCreated
Shipping->>Order: Shipment Confirmed
Note over Order: OrderShipped
Shipping->>Customer: Deliver Package
Note over Shipping: OrderDelivered

```
```

### Product Authentication Process

The Product Authentication process ensures the authenticity of imported food products.

#### Key Business Steps and Corresponding Events

1. **Authentication Request**
   - Business Step: Authentication initiated for Product
   - Domain Event: `ProductAuthenticationRequested`
   - Business Impact: Fraud prevention workflow initiation
   - Metrics Affected: Authentication attempt volume
2. **Authentication Verification**
   - Business Step: Verification of Product identifiers
   - Domain Event: `ProductAuthenticated` or `ProductAuthenticationFailed`
   - Business Impact: Product quality assurance
   - Metrics Affected: Authentication success rate, counterfeit detection rate
3. **Counterfeit Detection**
   - Business Step: Identification of counterfeit Product
   - Domain Event: `CounterfeitDetected`
   - Business Impact: Brand protection, regulatory compliance
   - Metrics Affected: Counterfeit detection rate, brand protection index
4. **Quarantine Process**
   - Business Step: Suspicious products isolated
   - Domain Event: `ProductQuarantined`
   - Business Impact: Quality control, liability mitigation
   - Metrics Affected: Quality control efficiency
5. **Authentication Resolution**
   - Business Step: Final determination of Product status
   - Domain Event: `AuthenticationResolved`
   - Business Impact: Supply chain integrity
   - Metrics Affected: Resolution time, Authentication accuracy

#### Process Visualization

```mermaid
sequenceDiagram
```

participant User
participant CatalogAuth
participant Inventory
participant Notification
User->>CatalogAuth: Scan Product
Note over CatalogAuth: ProductAuthenticationRequested
CatalogAuth->>CatalogAuth: Verify Product
alt Authentication Successful

```
        Note over CatalogAuth: ProductAuthenticated
        CatalogAuth->>User: Confirm Authentic
```

else Authentication Failed

```
        Note over CatalogAuth: ProductAuthenticationFailed
        CatalogAuth->>Inventory: Quarantine Product
        Note over Inventory: ProductQuarantined
        CatalogAuth->>Notification: Alert Quality Control
        Note over CatalogAuth: CounterfeitDetected
```

end
CatalogAuth->>CatalogAuth: Record Resolution
Note over CatalogAuth: AuthenticationResolved

```
```

### Subscription Management Process

The Subscription management process handles recurring orders and Customer Subscription lifecycles.

#### Key Business Steps and Corresponding Events

1. **Subscription Creation**
   - Business Step: Customer initiates Subscription
   - Domain Event: `SubscriptionCreated`
   - Business Impact: Recurring revenue stream established
   - Metrics Affected: New Subscription rate, MRR growth
2. **Subscription Activation**
   - Business Step: Initial Subscription Payment processed
   - Domain Event: `SubscriptionActivated`
   - Business Impact: Active Customer acquisition
   - Metrics Affected: Activation rate, Customer lifetime value
3. **Renewal Processing**
   - Business Step: Subscription period renews
   - Domain Events: `SubscriptionRenewalScheduled`, `SubscriptionRenewed`
   - Business Impact: Revenue continuity
   - Metrics Affected: Renewal rate, churn rate
4. **Payment Failure**
   - Business Step: Renewal Payment fails
   - Domain Event: `SubscriptionPaymentFailed`
   - Business Impact: Revenue risk
   - Metrics Affected: Payment failure rate, dunning effectiveness
5. **Subscription Modification**
   - Business Step: Customer changes Subscription
   - Domain Events: `SubscriptionUpgraded`, `SubscriptionDowngraded`, `SubscriptionProductsChanged`
   - Business Impact: Customer retention and expansion
   - Metrics Affected: Upgrade rate, average revenue per user
6. **Subscription Cancellation**
   - Business Step: Customer cancels Subscription
   - Domain Event: `SubscriptionCancelled`
   - Business Impact: Revenue loss
   - Metrics Affected: Cancellation rate, churn rate

#### Process Visualization

```mermaid
sequenceDiagram
```

participant Customer
participant Subscription
participant Payment
participant Inventory
participant Order
Customer->>Subscription: Create Subscription
Note over Subscription: SubscriptionCreated
Subscription->>Payment: Process Initial Payment
alt Payment Success

```
        Note over Subscription: SubscriptionActivated
```

else Payment Failure

```
        Note over Subscription: SubscriptionPaymentFailed
```

end
loop Every Subscription Period

```
        Subscription->>Subscription: Check Renewal Due
        Note over Subscription: SubscriptionRenewalScheduled
        Subscription->>Payment: Process Renewal Payment
        alt Payment Success
            Note over Subscription: SubscriptionRenewed
            Subscription->>Order: Generate Recurring Order
            Note over Order: RecurringOrderCreated
            Order->>Inventory: Allocate Products
            Note over Inventory: InventoryAllocated
        else Payment Failure
            Note over Subscription: SubscriptionPaymentFailed
            Subscription->>Customer: Notify Payment Issue
        end
```

end
Customer->>Subscription: Cancel Subscription
Note over Subscription: SubscriptionCancelled

```
```

### Inventory Management Process

The Inventory management process ensures Product availability and optimal stock levels.

#### Key Business Steps and Corresponding Events

1. **Inventory Receipt**
   - Business Step: New Inventory arrives at warehouse
   - Domain Event: `InventoryReceived`
   - Business Impact: Increased Product availability
   - Metrics Affected: Inventory levels, days of supply
2. **Quality Control**
   - Business Step: Incoming Inventory inspection
   - Domain Events: `InventoryInspected`, `QualityIssueDetected`
   - Business Impact: Product quality assurance
   - Metrics Affected: Quality acceptance rate, defect rate
3. **Cold Chain Verification**
   - Business Step: Temperature-controlled Inventory validation
   - Domain Events: `ColdChainVerified`, `ColdChainViolationDetected`
   - Business Impact: Food safety compliance
   - Metrics Affected: Cold chain compliance rate, spoilage rate
4. **Inventory Allocation**
   - Business Step: Inventory reserved for orders
   - Domain Event: `InventoryAllocated`
   - Business Impact: Order fulfillment capability
   - Metrics Affected: Fill rate, allocation accuracy
5. **Stock Adjustment**
   - Business Step: Inventory counts reconciled
   - Domain Events: `InventoryAdjusted`, `InventoryReconciled`
   - Business Impact: Financial accuracy
   - Metrics Affected: Inventory accuracy, shrinkage rate
6. **Low Stock Detection**
   - Business Step: Inventory falls below threshold
   - Domain Event: `LowStockDetected`
   - Business Impact: Replenishment trigger
   - Metrics Affected: Stockout rate, replenishment efficiency

#### Process Visualization

```mermaid
sequenceDiagram
```

participant Supplier
participant Receiving
participant QualityControl
participant Inventory
participant Order
Supplier->>Receiving: Deliver Products
Receiving->>Inventory: Register Receipt
Note over Inventory: InventoryReceived
Inventory->>QualityControl: Request Inspection
QualityControl->>QualityControl: Inspect Items
alt Quality Acceptable

```
        Note over QualityControl: InventoryInspected
        QualityControl->>Inventory: Approve for Stock
        alt Cold Chain Product
            QualityControl->>QualityControl: Verify Temperature Log
            alt Temperature Within Range
                Note over QualityControl: ColdChainVerified
            else Temperature Out of Range
                Note over QualityControl: ColdChainViolationDetected
                QualityControl->>Inventory: Quarantine Items
            end
        end
```

else Quality Issues

```
        Note over QualityControl: QualityIssueDetected
        QualityControl->>Inventory: Reject Items
```

end
Order->>Inventory: Request Products
Inventory->>Inventory: Reserve Stock
Note over Inventory: InventoryAllocated
Inventory->>Inventory: Update Count
Note over Inventory: InventoryAdjusted

```
```

## Domain Events to Business Metrics Mapping

This section maps key domain events to business metrics they directly support or influence, illustrating how our event-driven architecture enables business performance monitoring.

### Catalog Authentication Metrics

| Business Metric | Definition | Related Domain Events | Calculation |
|------------------|------------|------------------------|-------------|
| Authentication Scan Success Rate | Percentage of scans that successfully verify Product authenticity | `ProductAuthenticationRequested`, `ProductAuthenticated`, `ProductAuthenticationFailed` | (`ProductAuthenticated` count / `ProductAuthenticationRequested` count) × 100% |
| Counterfeit Detection Rate | Percentage of scans that identify counterfeit products | `ProductAuthenticationRequested`, `CounterfeitDetected` | (`CounterfeitDetected` count / `ProductAuthenticationRequested` count) × 100% |
| Authentication Resolution Time | Average time from Authentication request to resolution | `ProductAuthenticationRequested`, `AuthenticationResolved` | Average time difference between paired events |
| Authentication Scan Volume | Total number of Authentication scans | `ProductAuthenticationRequested` | Count of events in time period |

### Order Fulfillment Metrics

| Business Metric | Definition | Related Domain Events | Calculation |
|------------------|------------|------------------------|-------------|
| Order Accuracy | Percentage of orders fulfilled correctly | `OrderPlaced`, `OrderRejected`, `OrderModified` | ((`OrderPlaced` - `OrderRejected` - `OrderModified`) / `OrderPlaced`) × 100% |
| On-Time Delivery Rate | Percentage of orders delivered within promised timeframe | `OrderShipped`, `OrderDelivered` | Count of `OrderDelivered` within promised time / Count of `OrderShipped` |
| Order Processing Time | Average time from Order placement to fulfillment | `OrderPlaced`, `OrderFulfilled` | Average time difference between paired events |
| Fill Rate | Percentage of items fulfilled from available Inventory | `InventoryAllocated`, `BackorderCreated` | (`InventoryAllocated` items / (`InventoryAllocated` items + `BackorderCreated` items)) × 100% |

### Subscription Metrics

| Business Metric | Definition | Related Domain Events | Calculation |
|------------------|------------|------------------------|-------------|
| Churn Rate | Percentage of subscribers who cancel in a period | `SubscriptionCancelled`, total active subscriptions | (`SubscriptionCancelled` count / total active subscriptions) × 100% |
| Monthly Recurring Revenue (MRR) | Predictable monthly revenue from subscriptions | `SubscriptionCreated`, `SubscriptionUpgraded`, `SubscriptionDowngraded`, `SubscriptionCancelled` | Sum of all Subscription values from relevant events |
| Renewal Rate | Percentage of subscriptions successfully renewed | `SubscriptionRenewalScheduled`, `SubscriptionRenewed` | (`SubscriptionRenewed` count / `SubscriptionRenewalScheduled` count) × 100% |
| Customer Lifetime Value | Predicted revenue from a subscriber over their lifetime | `SubscriptionCreated`, `SubscriptionRenewed`, `SubscriptionUpgraded`, `SubscriptionDowngraded` | Complex calculation based on Subscription value and duration |

### Inventory Metrics

| Business Metric | Definition | Related Domain Events | Calculation |
|------------------|------------|------------------------|-------------|
| Inventory Accuracy | Percentage match between system and physical counts | `InventoryReceived`, `InventoryAdjusted`, `InventoryReconciled` | (1 - (sum of adjustment quantities / total Inventory)) × 100% |
| Cold Chain Compliance Rate | Percentage of temperature-sensitive items with maintained cold chain | `ColdChainVerified`, `ColdChainViolationDetected` | (`ColdChainVerified` count / (`ColdChainVerified` + `ColdChainViolationDetected`)) × 100% |
| Stockout Rate | Percentage of items unavailable when ordered | `LowStockDetected`, `StockoutDetected` | `StockoutDetected` count / total SKUs × 100% |
| Inventory Turnover | Rate at which Inventory is sold and replaced | `InventoryReceived`, `InventoryAllocated` | Cost of goods sold / average Inventory value |

## Implementation Recommendations

### Event Stream Processing for Business Metrics

To effectively use domain events for business metrics calculation, we recommend implementing:

1. **Event Stream Processing Platform**: Utilize a stream processing solution (e.g., Kafka Streams, Apache Flink) to:
   - Calculate real-time metrics from domain events
   - Generate aggregated views of business performance
   - Detect anomalies and trends in business processes
2. **Event Schema Registry**: Maintain a central schema registry to:
   - Enforce consistent event structure across contexts
   - Support schema evolution while preserving backward compatibility
   - Enable reliable metric calculation across system versions
3. **Business Metric Dashboards**: Create executive and operational dashboards that:
   - Visualize metrics derived from domain events
   - Support drill-down from high-level metrics to underlying events
   - Enable comparison against business goals and historical performance

### Business Process Monitoring

To leverage domain events for business process monitoring:

1. **Process Correlation IDs**: Include correlation IDs in related events to:
   - Track complete business processes across bounded contexts
   - Calculate end-to-end process metrics
   - Identify bottlenecks in cross-context workflows
2. **Event Timeline Analysis**: Implement tools for visualizing event timelines to:
   - Analyze process execution sequences
   - Identify delays and anomalies in business processes
   - Support root cause analysis for process failures
3. **Business Activity Monitoring**: Create real-time monitoring for critical business processes:
   - Set up alerts for process deviations and SLA violations
   - Track key performance indicators derived from event streams
   - Monitor process health across bounded contexts

### Implementation Strategy for Common Business Scenarios

#### Monitoring Order Fulfillment Efficiency

```typescript
// Example Event Handler for Order Processing Time Calculation
class OrderProcessingTimeCalculator {
  calculateProcessingTime(events: DomainEvent[]): Map<string, number> {
```

const orderPlacedEvents = events.filter(e => e.type === 'OrderPlaced');
const orderFulfilledEvents = events.filter(e => e.type === 'OrderFulfilled');
const processingTimes = new Map<string, number>();
orderPlacedEvents.forEach(placedEvent => {

```
      const orderId = placedEvent.payload.orderId;
      const fulfilledEvent = orderFulfilledEvents.find(e =>
        e.payload.orderId === orderId);
      if (fulfilledEvent) {
        const processingTime =
          fulfilledEvent.timestamp.getTime() - placedEvent.timestamp.getTime();
        processingTimes.set(orderId, processingTime / (1000 * 60)); // Convert to minutes
      }
```

});
return processingTimes;

```
  }
  calculateAverageProcessingTime(processingTimes: Map<string, number>): number {
```

if (processingTimes.size === 0) return 0;
const sum = Array.from(processingTimes.values())

```
      .reduce((total, time) => total + time, 0);
```

return sum / processingTimes.size;

```
  }
}
```

#### Tracking Subscription Health

```typescript
// Example Event Handler for Churn Rate Calculation
class SubscriptionHealthMonitor {
  calculateChurnRate(events: DomainEvent[], timeframe: TimeFrame): number {
```

const startDate = timeframe.startDate;
const endDate = timeframe.endDate;
// Count active subscriptions at start
const activeAtStart = this.countActiveSubscriptions(events, startDate);
// Count cancellations during period
const cancellations = events

```
      .filter(e => e.type === 'SubscriptionCancelled')
      .filter(e => e.timestamp >= startDate && e.timestamp <= endDate)
      .length;
```

return activeAtStart > 0 ? (cancellations / activeAtStart) * 100 : 0;

```
  }
  private countActiveSubscriptions(events: DomainEvent[], date: Date): number {
```

// Count created before date
const created = events

```
      .filter(e => e.type === 'SubscriptionCreated')
      .filter(e => e.timestamp <= date)
      .length;
```

// Count cancelled before date
const cancelled = events

```
      .filter(e => e.type === 'SubscriptionCancelled')
      .filter(e => e.timestamp <= date)
      .length;
```

return created - cancelled;

```
  }
}
```

## Relationship to Other Artifacts

| Related Artifact | Relationship |
|-----------------|---------------|
| Domain Event Naming Analysis | Provides naming conventions for the events mapped in this document |
| Ubiquitous Language Guidelines | Ensures business terminology consistency in event definitions |
| Business Metrics Domain Mapping | Expands on metrics derived from events with implementation details |
| Value Objects Analysis | Many events contain value objects that represent important business concepts |
| API Design Guidelines | APIs often trigger or respond to the domain events described here |
| Bounded Context Map | Shows relationships between contexts that exchange the mapped events |

## Conclusion

This Domain Events Business Mapping establishes clear connections between technical implementation (domain events) and business objectives (processes and metrics). By maintaining these mappings as the system evolves, we ensure that our event-driven architecture continues to support business goals effectively and enables accurate business process monitoring.
Domain events serve as the foundational building blocks for tracking business performance, enabling both technical teams and business stakeholders to speak a common language when discussing system behavior and business outcomes.
*This document should be reviewed and updated as the domain model evolves. Last updated: 2025-06-06*

---

⚑ Related

- [Domain Glossary](../glossary.md)
- [Ubiquitous Language Evolution Process](./ubiquitous_language_evolution.md)

↩ [Back to Framework TOC](../README.md)

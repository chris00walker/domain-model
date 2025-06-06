# Domain Events Business Mapping

## Purpose

This document maps domain events to their business significance in the Elias Food Imports domain model. It helps ensure that domain events are properly understood and used in the context of the ubiquitous language.

## Domain Events by Bounded Context

### Customer Context

| Domain Event | Business Significance | Related Business Metrics | Consumers |
|--------------|------------------------|--------------------------|-----------|
| CustomerCreated | Represents the acquisition of a new customer | Customer acquisition rate | Marketing, Sales, Subscription |
| CustomerUpdated | Captures changes to customer information | Data completeness (≥98%) | All contexts |
| CustomerAddressChanged | Tracks changes to delivery locations | - | Order, Shipping |
| CustomerTypeChanged | Reflects changes in customer segmentation | Segmentation accuracy (≥90%) | Marketing, Pricing |

### Subscription Context

| Domain Event | Business Significance | Related Business Metrics | Consumers |
|--------------|------------------------|--------------------------|-----------|
| SubscriptionCreated | Represents new recurring revenue | MRR growth (≥10%) | Finance, Marketing |
| SubscriptionCancelled | Indicates potential churn | Churn rate (≤5%) | Customer Retention, Marketing |
| SubscriptionPaused | Temporary halt of subscription | Churn risk indicator | Customer Retention |
| SubscriptionResumed | Re-engagement of paused subscription | Retention success rate | Marketing, Finance |
| SubscriptionRenewed | Successful retention of customer | Customer lifetime value | Finance, Marketing |

### Order Context

| Domain Event | Business Significance | Related Business Metrics | Consumers |
|--------------|------------------------|--------------------------|-----------|
| OrderPlaced | New transaction initiated | Order volume, Average order value | Inventory, Finance |
| OrderFulfilled | Order ready for delivery | Order fulfillment rate | Shipping, Customer |
| OrderCancelled | Lost transaction | Cancellation rate | Inventory, Finance |
| OrderShipped | Order in transit | On-time delivery (≥95%) | Customer, Shipping |
| LineItemAddedToOrder | Product added to transaction | Cart size metrics | Inventory, Pricing |
| LineItemRemovedFromOrder | Product removed from transaction | Cart abandonment metrics | Marketing, Inventory |

### Pricing Context

| Domain Event | Business Significance | Related Business Metrics | Consumers |
|--------------|------------------------|--------------------------|-----------|
| PriceCalculated | Final price determined for customer | Price calculation accuracy (100%) | Order, Customer |
| DiscountApplied | Special pricing applied | Discount effectiveness | Marketing, Finance |
| ProductPriceChanged | Base price update | Weighted gross margin (≥35%) | Catalog, Order |
| MarginThresholdViolated | Pricing below profit threshold | Margin violation incidents | Finance, Management |

### Catalog Context

| Domain Event | Business Significance | Related Business Metrics | Consumers |
|--------------|------------------------|--------------------------|-----------|
| ProductCreated | New product available for sale | Catalog growth rate | Marketing, Pricing |
| ProductUpdated | Product information changed | Data completeness (≥98%) | All contexts |
| ProductRetired | Product no longer available | Product lifecycle metrics | Inventory, Marketing |
| ProductCategoryAssigned | Product organization updated | Catalog organization metrics | Search, Marketing |

## Missing Domain Events

The following domain events should be implemented to better reflect important business state changes:

### Customer Context

- **CustomerSegmentChanged**: Critical for personalized marketing and pricing
- **CustomerLoyaltyStatusChanged**: Impacts customer benefits and pricing
- **CustomerChurnRiskIdentified**: Triggers retention workflows

### Subscription Context

- **SubscriptionFrequencyChanged**: Affects delivery scheduling and revenue forecasting
- **SubscriptionUpgraded**: Positive revenue impact
- **SubscriptionDowngraded**: Potential churn risk indicator
- **SubscriptionBundleChanged**: Impacts product demand forecasting

### Order Context

- **OrderDelivered**: Confirms successful fulfillment
- **OrderReturned**: Negative customer experience indicator
- **OrderPaymentConfirmed**: Revenue recognition trigger

### Pricing Context

- **PromotionalPriceActivated**: Special pricing period begins
- **PromotionalPriceDeactivated**: Special pricing period ends
- **FXRateUpdated**: Impacts international pricing
- **CostPriceChanged**: Affects margin calculations

### Catalog Context

- **ProductInventoryLevelChanged**: Stock level indicator
- **ProductAuthenticityVerified**: Quality assurance milestone
- **ProductCounterfeitDetected**: Security and quality alert

## Business Metrics Connection

Domain events play a crucial role in measuring and monitoring business metrics defined in the acceptance criteria:

### Catalog Authentication Context

- **Authentication scan success rate (≥99.5%)**: Measured through ProductAuthenticityVerified events
- **Counterfeit detection rate (≥98%)**: Measured through ProductCounterfeitDetected events

### Pricing Context

- **Price calculation accuracy (100%)**: Verified through PriceCalculated events
- **Weighted gross margin (≥35%)**: Monitored via MarginThresholdViolated events
- **FX risk hedging coverage (≥80%)**: Tracked through FXRateUpdated events

### Subscription Context

- **Churn rate (≤5%)**: Calculated from SubscriptionCancelled events
- **MRR growth (≥10%)**: Derived from SubscriptionCreated and SubscriptionCancelled events
- **Customer lifetime value**: Analyzed using subscription lifecycle events

### Order Context

- **Order accuracy (≥99.9%)**: Measured through order fulfillment events
- **On-time delivery (≥95%)**: Tracked via OrderShipped and OrderDelivered events
- **Order processing time (≤5 seconds)**: Measured between OrderPlaced and subsequent events

## Event Documentation Template

For consistent documentation, each domain event should include:

```typescript
/**
 * Event: [Event Name]
 * 
 * Business Significance:
 * [Explanation of why this event matters to the business]
 * 
 * Related Business Metrics:
 * [Metrics this event helps measure]
 * 
 * Consumed By:
 * [Bounded contexts or systems that react to this event]
 * 
 * Related Business Rules:
 * [Business rules triggered by or relevant to this event]
 */
```

## Implementation Recommendations

1. **Standardize Event Documentation**: Add business significance documentation to all domain events
2. **Implement Missing Events**: Prioritize events that support critical business metrics
3. **Add Metrics Tracking**: Enhance event handlers to update business metrics
4. **Review Event Flow**: Ensure events properly flow between bounded contexts
5. **Validate with Domain Experts**: Confirm event naming and significance with business stakeholders

## Conclusion

Domain events are not just technical constructs but represent significant moments in business processes. By properly mapping domain events to their business significance, we ensure that the domain model accurately reflects the business domain and supports the measurement of critical business metrics.

---
*This document should be reviewed and updated as the domain model evolves. Last updated: 2025-06-04*

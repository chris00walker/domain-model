---
title: Subscription Domain Knowledge
status: active
owner: Subscription Team
last_updated: 2025-06-06
---

# Subscription Domain

## Domain Overview

<!-- GAP_IMPLEMENTED: Subscription Lifecycle Management | High | High | High -->
<!-- stub for "Subscription Lifecycle Management" gap in the subscription context -->

<!-- GAP_IMPLEMENTED: Usage-Based Billing | Medium | High | Medium -->
<!-- stub for "Usage-Based Billing" gap in the subscription context -->

The Subscription domain manages recurring product deliveries and relationships between Elias Food Imports and its customers. It handles the entire subscription lifecycle, including creation, modification, fulfillment, billing, and cancellation. This domain is strategically important as it represents a growing revenue stream and builds long-term customer relationships.

## Strategic Classification

**Classification**: Core Domain

**Justification**: Subscriptions provide predictable recurring revenue, higher customer lifetime value, and a competitive advantage through personalized curation of specialty food products.

## Core Domain Concepts

### Subscription
A recurring arrangement for the delivery of products at defined intervals, with customizable parameters and preferences.

### Subscription Plan
A template defining the structure, benefits, and pricing model of a subscription offering.

### Billing Cycle
The recurring period for which a customer is charged for their subscription.

### Delivery Schedule
The recurring pattern of when products from a subscription will be delivered.

### Curation
The process of selecting products for a subscription based on customer preferences and seasonal availability.

## Business Rules

1. All subscriptions must have a defined billing frequency and delivery schedule.
2. Subscriptions can be paused for a maximum of 90 days before requiring reactivation.
3. Changes to a subscription take effect on the next billing cycle unless explicitly requested for immediate processing.
4. Customers must receive notification at least 3 days before a subscription renewal.
5. Subscription discounts are applied based on subscription longevity and tier.
6. Substitutions for out-of-stock items must honor customer preferences and dietary restrictions.
7. Cancellations before a billing cycle completes must be prorated according to the defined refund policy.
8. "Surprise me" subscriptions must never include previously delivered items within a 3-month period unless requested.
9. Seasonal collections must be curated at least 1 month before their availability date.
10. Free shipping applies to all subscriptions with monthly value exceeding the defined threshold.

## Domain Events

### SubscriptionCreated
- **Description**: Emitted when a new subscription is created.
- **Payload**:
  - subscriptionId: string
  - customerId: string
  - plan: SubscriptionPlanType
  - status: SubscriptionStatus
  - startDate: DateTime
  - billingFrequency: BillingFrequency
  - totalValue: Money
  - items: SubscriptionItemSummary[]
- **Consumers**: Order, Payment, Customer, Notification

### SubscriptionModified
- **Description**: Emitted when subscription parameters are changed.
- **Payload**:
  - subscriptionId: string
  - customerId: string
  - modificationType: ModificationType
  - changes: SubscriptionChange[]
  - effectiveDate: DateTime
  - nextBillingDate: DateTime
- **Consumers**: Order, Payment, Notification, Analytics

### SubscriptionPaused
- **Description**: Emitted when a subscription is temporarily paused.
- **Payload**:
  - subscriptionId: string
  - customerId: string
  - pauseStart: DateTime
  - expectedResumeDate: DateTime
  - reason: PauseReason (optional)
- **Consumers**: Payment, Notification, Analytics

### SubscriptionCancelled
- **Description**: Emitted when a subscription is cancelled.
- **Payload**:
  - subscriptionId: string
  - customerId: string
  - cancellationDate: DateTime
  - reason: CancellationReason (optional)
  - refundAmount: Money (optional)
- **Consumers**: Payment, Customer, Notification, Analytics

### SubscriptionRenewed
- **Description**: Emitted when a subscription billing cycle renews.
- **Payload**:
  - subscriptionId: string
  - customerId: string
  - renewalDate: DateTime
  - nextBillingDate: DateTime
  - amountCharged: Money
  - paymentStatus: PaymentStatus
- **Consumers**: Payment, Order, Notification, Analytics

### DeliveryScheduled
- **Description**: Emitted when a subscription delivery is scheduled.
- **Payload**:
  - subscriptionId: string
  - deliveryId: string
  - scheduledDate: DateTime
  - items: SubscriptionItemSummary[]
  - shippingAddress: Address
  - specialInstructions: string (optional)
- **Consumers**: Order, Shipping, Notification

### CurationCompleted
- **Description**: Emitted when product curation for a subscription is completed.
- **Payload**:
  - subscriptionId: string
  - curatedBy: string
  - curatedProducts: CuratedProductSummary[]
  - curationDate: DateTime
  - forDeliveryDate: DateTime
- **Consumers**: Order, Catalog, Analytics

## Aggregates

### SubscriptionAggregate
- **Root Entity**: Subscription
- **Description**: Manages the complete lifecycle of a customer subscription.
- **Invariants**:
  - A subscription must always have a valid status.
  - A subscription cannot be paused for more than 90 consecutive days.
  - Billing frequency and delivery frequency must be compatible.
  - Total subscription value must reflect all items, discounts, and shipping costs.
- **Commands**:
  - CreateSubscription(customerId, plan, items, preferences)
  - ModifySubscription(changes)
  - PauseSubscription(startDate, endDate)
  - ResumeSubscription()
  - CancelSubscription(reason)
  - AddItem(item)
  - RemoveItem(itemId)
  - ProcessRenewal()
  - ApplyDiscount(discountId)

### SubscriptionPlanAggregate
- **Root Entity**: SubscriptionPlan
- **Description**: Defines the structure and rules for subscription offerings.
- **Invariants**:
  - Plan pricing must be consistent with associated products and discount tiers.
  - Plans must have at least one supported delivery frequency.
  - Plan customization options must be valid for all included product categories.
- **Commands**:
  - CreatePlan(name, description, basePrice, features)
  - ModifyPlan(changes)
  - ActivatePlan()
  - DeactivatePlan()
  - AddProductCategory(categoryId)
  - RemoveProductCategory(categoryId)
  - SetDiscountTiers(tiers)

### DeliveryScheduleAggregate
- **Root Entity**: DeliverySchedule
- **Description**: Manages the scheduling and fulfillment of subscription deliveries.
- **Invariants**:
  - Deliveries cannot be scheduled on blackout dates.
  - Delivery dates must respect minimum preparation time.
  - Address changes require minimum advance notice before next delivery.
- **Commands**:
  - CreateSchedule(subscriptionId, frequency, preferences)
  - ScheduleDelivery(date)
  - ModifyDeliveryDate(deliveryId, newDate)
  - CancelDelivery(deliveryId)
  - UpdateDeliveryAddress(address)
  - AddDeliveryInstructions(instructions)

## Entities

### Subscription
- **Identifier**: subscriptionId
- **Attributes**:
  - customerId: string
  - plan: SubscriptionPlanReference
  - status: SubscriptionStatus (ACTIVE, PAUSED, CANCELLED, PENDING)
  - startDate: DateTime
  - endDate: DateTime (optional)
  - billingFrequency: BillingFrequency
  - nextBillingDate: DateTime
  - deliveryFrequency: DeliveryFrequency
  - nextDeliveryDate: DateTime
  - totalValue: Money
  - discount: DiscountInfo (optional)
  - items: SubscriptionItem[]
  - preferences: SubscriptionPreferences
  - paymentMethod: PaymentMethodReference
  - shippingAddress: Address
  - lastModified: DateTime
- **Methods**:
  - addItem(item): void
  - removeItem(itemId): void
  - calculateTotalValue(): Money
  - pause(startDate, endDate): void
  - resume(): void
  - cancel(reason): void
  - changeFrequency(newFrequency): void
  - isEligibleForDiscount(): boolean
  - applyDiscount(discount): void
  - processRenewal(): RenewalResult

### SubscriptionPlan
- **Identifier**: planId
- **Attributes**:
  - name: string
  - description: string
  - isActive: boolean
  - basePrice: Money
  - allowedFrequencies: BillingFrequency[]
  - minimumCommitment: integer (months)
  - features: PlanFeature[]
  - discountTiers: DiscountTier[]
  - eligibleCategories: string[]
  - creationDate: DateTime
  - lastModified: DateTime
- **Methods**:
  - calculatePriceWithDiscount(frequency, tenure): Money
  - isEligibleForCategory(categoryId): boolean
  - activate(): void
  - deactivate(): void
  - addFeature(feature): void
  - removeFeature(featureId): void

### SubscriptionItem
- **Identifier**: itemId
- **Attributes**:
  - productId: string
  - quantity: integer
  - unitPrice: Money
  - isCustomizable: boolean
  - allowSubstitution: boolean
  - frequency: DeliveryFrequency (optional)
  - addedDate: DateTime
- **Methods**:
  - getTotalPrice(): Money
  - increaseQuantity(amount): void
  - decreaseQuantity(amount): void
  - canBeSubstituted(): boolean
  - matchesPreferences(preferences): boolean

### Delivery
- **Identifier**: deliveryId
- **Attributes**:
  - subscriptionId: string
  - scheduledDate: DateTime
  - status: DeliveryStatus
  - items: DeliveryItem[]
  - trackingInfo: TrackingInfo (optional)
  - shippingAddress: Address
  - specialInstructions: string (optional)
  - createdAt: DateTime
- **Methods**:
  - isReadyForFulfillment(): boolean
  - markAsShipped(trackingInfo): void
  - markAsDelivered(): void
  - reschedule(newDate): void
  - addSpecialInstructions(instructions): void

## Value Objects

### BillingFrequency
- **Attributes**:
  - type: FrequencyType (WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, SEMIANNUALLY, ANNUALLY)
  - interval: integer
  - description: string
- **Validation**:
  - Type must be one of the defined FrequencyType enum values
  - Interval must be positive

### DeliveryFrequency
- **Attributes**:
  - type: FrequencyType
  - interval: integer
  - weekdaysOnly: boolean
  - description: string
- **Validation**:
  - Type must be one of the defined FrequencyType enum values
  - Interval must be positive

### SubscriptionPreferences
- **Attributes**:
  - dietaryRestrictions: string[]
  - allergens: string[]
  - preferredProducts: string[]
  - excludedProducts: string[]
  - tasteProfile: TasteProfile
  - substitutionPreference: SubstitutionPreference
  - giftWrapping: boolean
  - sustainabilityPreference: SustainabilityLevel
- **Validation**:
  - Dietary restrictions and allergens must be from approved lists
  - Preferred and excluded products must exist in catalog
  - Taste profile must contain valid ratings
  
### DeliveryWindow
- **Attributes**:
  - dayOfWeek: DayOfWeek[]
  - startTime: Time
  - endTime: Time
  - blackoutDates: Date[]
- **Validation**:
  - End time must be after start time
  - Day of week must be valid
  - Time range must be at least 2 hours

### PlanFeature
- **Attributes**:
  - featureId: string
  - name: string
  - description: string
  - isHighlighted: boolean
- **Validation**:
  - Feature name and description cannot be empty

### DiscountTier
- **Attributes**:
  - tenure: integer (months)
  - discountPercentage: Percentage
  - description: string
- **Validation**:
  - Tenure must be positive
  - Discount percentage must be between 0 and 100

### CurationPreference
- **Attributes**:
  - curationType: CurationType (EXPERT_CHOICE, AI_RECOMMENDED, SURPRISE_ME, CUSTOMER_SELECTED)
  - theme: string (optional)
  - maximumPreviouslyIncludedItems: integer
  - regionPreferences: string[]
  - seasonalPreference: boolean
- **Validation**:
  - Curation type must be from defined enum
  - Maximum previously included items must be non-negative

## Domain Services

### SubscriptionBillingService
- **Responsibility**: Manages billing operations for subscriptions
- **Operations**:
  - processRenewal(subscriptionId): BillingResult
  - calculateNextBillingDate(subscription): DateTime
  - applyDiscounts(subscription): DiscountResult
  - createInvoice(subscription): Invoice
  - handleFailedPayment(subscription): RecoveryAction
  - determineProration(subscription, changeDate): Money

### CurationService
- **Responsibility**: Creates personalized product selections for subscriptions
- **Operations**:
  - curateProducts(subscriptionId, deliveryDate): CuratedProductSelection
  - getRecommendations(customerPreferences, history): ProductRecommendation[]
  - checkInventoryAvailability(products): AvailabilityResult
  - generateSeasonalSelection(season, preferences): ProductSelection
  - handleOutOfStockSubstitutions(unavailableItems, preferences): SubstitutionResult

### DeliverySchedulingService
- **Responsibility**: Manages delivery timing and logistics
- **Operations**:
  - generateDeliverySchedule(subscription): DeliverySchedule
  - findOptimalDeliveryDate(frequency, preferences): DateTime
  - checkDeliveryAvailability(date, postalCode): boolean
  - rescheduleDeliveryDates(subscriptionId, newFrequency): RescheduleResult
  - generatePickList(deliveries): PickList
  
### SubscriptionAnalyticsService
- **Responsibility**: Provides insights on subscription performance and customer behavior
- **Operations**:
  - calculateChurnProbability(subscription): Percentage
  - identifyUpgradeOpportunities(subscriptionId): UpgradeOpportunity[]
  - analyzeSubscriptionPerformance(timeRange): PerformanceMetrics
  - trackProductPopularity(periodStart, periodEnd): PopularityRanking
  - generateRetentionReport(cohort): RetentionReport

## Integration Points

### Customer Context
- **Integration Type**: Customer-Supplier Relationship
- **Data Exchange**:
  - Customer profiles, preferences, and segments
  - Subscription history for customer records
- **Communication Mechanism**:
  - REST API for customer data retrieval
  - Domain events for customer status changes
- **Consistency Requirements**: Strong consistency for customer identity, eventual consistency for preference updates

### Catalog Context
- **Integration Type**: Conformist
- **Data Exchange**:
  - Product availability and details
  - Product categories and attributes for curation
- **Communication Mechanism**:
  - GraphQL API for product queries
  - Event subscription for product changes
- **Consistency Requirements**: Eventually consistent with periodic synchronization

### Payment Context
- **Integration Type**: Customer-Supplier Relationship
- **Data Exchange**:
  - Payment methods and processing
  - Billing history and status
- **Communication Mechanism**:
  - Domain events for payment requests and confirmations
  - REST API for payment status inquiries
- **Consistency Requirements**: Strong consistency for payment processing

### Order Context
- **Integration Type**: Partnership
- **Data Exchange**:
  - Conversion of subscription deliveries to orders
  - Order fulfillment status updates
- **Communication Mechanism**:
  - Domain events for delivery scheduling
  - REST API for order creation
- **Consistency Requirements**: Strong consistency for order creation

### Inventory Context
- **Integration Type**: Open Host Service
- **Data Exchange**:
  - Product availability checks
  - Inventory allocation for subscription items
- **Communication Mechanism**:
  - REST API for availability checks
  - Event subscription for low inventory notifications
- **Consistency Requirements**: Near real-time consistency for inventory checks

### Notification Context
- **Integration Type**: Published Language
- **Data Exchange**:
  - Subscription status changes
  - Delivery notifications
  - Renewal reminders
- **Communication Mechanism**:
  - Domain events for notification triggers
- **Consistency Requirements**: Eventual consistency acceptable

## Implementation Considerations

### CQRS Pattern

The Subscription domain is well-suited for Command Query Responsibility Segregation (CQRS) due to the difference between its write and read operations:

- **Command Side**: Focused on subscription lifecycle management (create, modify, pause, cancel)
- **Query Side**: Optimized for various read models (customer portal views, analytics dashboards, operational reports)

Implementation approach:
- Separate command and query models
- Event sourcing for subscription state changes
- Denormalized read models for specific query needs

### Eventual Consistency

Subscription state changes should be propagated to other contexts with appropriate eventual consistency mechanisms:

- Real-time updates for critical operations (payment processing)
- Batch processing for non-critical updates (analytics)
- Event-driven synchronization for dependent contexts

### Caching Strategy

Implement a multi-level caching strategy:

- Cache subscription plans and their features (rarely changing)
- Time-limited caching for subscription details (moderately changing)
- No caching for real-time status information (frequently changing)

### Performance Optimizations

Optimize for the following scenarios:

- Bulk renewal processing for monthly/annual subscription cohorts
- Product curation algorithm efficiency
- Delivery scheduling optimization across geographic regions

### Testing Approach

Implement comprehensive testing focusing on:

- Business rule validation through domain model tests
- Integration tests for context boundaries
- Performance tests for bulk operations
- State transition tests for subscription lifecycle

## Success Metrics

### Business Metrics

- **Subscription Growth Rate**: ≥ 15% quarter-over-quarter
- **Churn Rate**: ≤ 5% monthly
- **Average Subscription Lifetime**: ≥ 12 months
- **Monthly Recurring Revenue (MRR)**: ≥ 10% growth month-over-month
- **Customer Lifetime Value**: ≥ $1,200
- **Subscription Modification Rate**: ≤ 20% of active subscriptions per month

### Technical Metrics

- **Renewal Processing Time**: ≤ 5 seconds per subscription
- **Curation Algorithm Performance**: ≤ 2 seconds for recommendations
- **Subscription API Response Time**: ≤ 300ms for 95th percentile
- **System Availability**: ≥ 99.95% uptime
- **Event Processing Latency**: ≤ 500ms for critical events
- **Data Consistency Lag**: ≤ 2 minutes between contexts

### User Experience Metrics

- **Subscription Setup Time**: ≤ 3 minutes from start to confirmation
- **Customer Satisfaction Score**: ≥ 4.5/5 for subscription management
- **Self-Service Rate**: ≥ 95% of modifications without customer service
- **First-Time Success Rate**: ≥ 98% for subscription operations
- **Support Ticket Rate**: ≤ 2% of active subscriptions monthly

---

*This document represents the strategic domain knowledge for the Subscription bounded context within Elias Food Imports' domain model. It serves as the authoritative source for implementation guidance, business rules, and architectural decisions related to the subscription management domain.*

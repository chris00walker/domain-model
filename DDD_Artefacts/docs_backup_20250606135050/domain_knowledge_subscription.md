# Subscription Domain Knowledge

## Domain Overview
The Subscription domain is identified as a **core domain** with high strategic priority for Elias Food Imports. It enables recurring revenue streams, enhances customer retention, and provides a stable cash flow foundation for the business. The subscription model also reinforces EFI's premium positioning through tiered service offerings.

## Strategic Importance
- Establishes predictable recurring revenue streams
- Increases customer lifetime value and retention
- Creates opportunities for premium service tiers
- Provides stable cash flow foundation
- Enables deeper customer relationships and data collection

## Core Concepts

### Subscription Tier
Levels of subscription service offered to customers:
- **Basic**: Entry-level subscription with minimal benefits
  - Free shipping on orders over $50
  - Monthly curated product recommendations
  - 5% discount on recurring orders
- **Premium**: Mid-tier subscription with enhanced benefits
  - Free shipping on all orders
  - Bi-weekly curated product recommendations
  - 10% discount on recurring orders
  - Early access to new products
  - Quarterly specialty product sample
- **VIP**: Top-tier subscription with premium benefits
  - Free priority shipping on all orders
  - Weekly curated product recommendations
  - 15% discount on recurring orders
  - Early access to new products and limited editions
  - Monthly specialty product box
  - Personal concierge for product recommendations

### Subscription State
The current status of a customer's subscription:
- **Active**: Subscription is current and benefits are available
- **PastDue**: Payment has failed but benefits still available (grace period)
- **Suspended**: Benefits unavailable due to payment failure beyond grace period
- **Canceled**: Subscription terminated by customer
- **Expired**: Subscription ended without renewal

### Billing Cycle
The frequency at which subscription fees are charged:
- **Monthly**: Charged every 30 days
- **Quarterly**: Charged every 90 days (with 5% discount)
- **Annual**: Charged every 365 days (with 15% discount)

### Subscription Box
A recurring product delivery associated with premium subscription tiers:
- **Quarterly Sampler**: For Premium tier (value: $25)
- **Monthly Specialty Box**: For VIP tier (value: $45)

## Business Rules

### Subscription Lifecycle Rules
1. **Grace Period**: 8 days of continued service after failed payment
2. **Payment Retry Sequence**: Retry failed payments on days 1, 3, 5, and 8
3. **Suspension Notification**: Customer must be notified 24 hours before suspension
4. **Reactivation Window**: Suspended subscriptions can be reactivated within 30 days
5. **Tier Change Timing**: Tier upgrades take effect immediately; downgrades at next billing cycle
6. **Cancellation Policy**: Customers can cancel at any time; benefits continue until end of paid period

### Billing Rules
1. **Prorated Billing**: Tier upgrades trigger immediate prorated charges
2. **Refund Policy**: No refunds for cancellations; service continues until end of paid period
3. **Payment Method Update**: Updating payment method triggers immediate verification charge
4. **Discount Stacking**: Subscription discounts do not stack with promotional discounts
5. **Failed Payment Limit**: After 4 failed payment attempts, subscription is suspended
6. **Billing Cycle Discount**: Longer billing cycles receive discounts (5% quarterly, 15% annual)

### Benefit Allocation Rules
1. **Tier-Based Allocation**: Benefits are strictly tied to subscription tier
2. **Immediate Activation**: Benefits activate immediately upon successful payment
3. **Grace Period Benefits**: Full benefits continue during grace period
4. **Suspension Deactivation**: All benefits deactivate during suspension
5. **Household Limit**: Benefits apply to a single household (max 5 users)
6. **B2B Scaling**: Business subscriptions scale benefits by size tier

## Domain Events

### SubscriptionCreated
- **Trigger**: New subscription is established
- **Data**: SubscriptionID, CustomerID, Tier, BillingCycle, StartDate
- **Consumers**: Customer, Pricing, Notification domains

### SubscriptionStateChanged
- **Trigger**: Subscription transitions to a new state
- **Data**: SubscriptionID, OldState, NewState, ChangeReason, Timestamp
- **Consumers**: Customer, Pricing, Notification domains

### PaymentFailed
- **Trigger**: Subscription payment attempt fails
- **Data**: SubscriptionID, PaymentID, FailureReason, RetryAttempt, NextRetryDate
- **Consumers**: Notification, Payment Retry Workflow

### PaymentSucceeded
- **Trigger**: Subscription payment is successful
- **Data**: SubscriptionID, PaymentID, Amount, NextBillingDate
- **Consumers**: Customer, Billing domains

### SubscriptionTierChanged
- **Trigger**: Customer changes subscription tier
- **Data**: SubscriptionID, OldTier, NewTier, ChangeReason, ProratedCharge
- **Consumers**: Pricing, Customer, Notification domains

### BillingCycleChanged
- **Trigger**: Customer changes billing frequency
- **Data**: SubscriptionID, OldCycle, NewCycle, EffectiveDate
- **Consumers**: Billing, Customer domains

## Aggregates and Entities

### Subscription (Aggregate Root)
- **Properties**: SubscriptionID, CustomerID, Tier, State, BillingCycle, StartDate, NextBillingDate
- **Behavior**: Manages subscription lifecycle and state transitions
- **Invariants**: Must have valid customer; Must have valid tier; Must have valid payment method

### SubscriptionTier (Entity)
- **Properties**: TierID, Name, MonthlyPrice, QuarterlyPrice, AnnualPrice, Benefits
- **Behavior**: Defines available benefits and pricing for a subscription level
- **Invariants**: Higher tiers must include all benefits of lower tiers; Prices must follow discount rules

### PaymentSchedule (Entity)
- **Properties**: ScheduleID, SubscriptionID, BillingCycle, NextBillingDate, LastBillingDate
- **Behavior**: Manages the timing of recurring payments
- **Invariants**: NextBillingDate must be after LastBillingDate; BillingCycle must be valid

### SubscriptionBenefit (Entity)
- **Properties**: BenefitID, Name, Description, Value, ApplicableTiers
- **Behavior**: Defines a specific benefit available to subscribers
- **Invariants**: Must be assigned to at least one tier; Must have quantifiable value

## Value Objects

### SubscriptionState
- **Properties**: State (enum)
- **Validation**: Must be one of the defined states

### BillingCycleType
- **Properties**: Type (enum), DurationInDays, DiscountPercentage
- **Validation**: Must be one of the defined cycle types

### SubscriptionPeriod
- **Properties**: StartDate, EndDate
- **Validation**: EndDate must be after StartDate; Period must align with billing cycle

### PaymentRetrySchedule
- **Properties**: RetryAttempts, RetryIntervals
- **Validation**: Maximum 4 retry attempts; Intervals must follow business rules

## Domain Services

### SubscriptionLifecycleService
- **Responsibility**: Manages subscription state transitions
- **Key Methods**: CreateSubscription, ChangeState, ProcessPaymentResult, HandleCancellation
- **Dependencies**: Subscription, PaymentGateway

### BillingService
- **Responsibility**: Manages subscription billing and payment processing
- **Key Methods**: ProcessPayment, ScheduleNextBilling, CalculateProratedAmount
- **Dependencies**: PaymentGateway, Subscription

### BenefitAllocationService
- **Responsibility**: Manages the allocation of benefits based on subscription tier
- **Key Methods**: AllocateBenefits, DeactivateBenefits, VerifyBenefitEligibility
- **Dependencies**: Subscription, SubscriptionTier, Customer

### RetentionService
- **Responsibility**: Implements strategies to prevent churn and encourage renewals
- **Key Methods**: IdentifyChurnRisk, ApplyRetentionStrategy, TrackRetentionMetrics
- **Dependencies**: Subscription, Customer, Analytics

## Integration Points

### With Customer Domain
- Customer domain provides customer information for subscription creation
- Subscription domain updates customer status based on subscription state
- Shared concepts: Customer, CustomerTier

### With Pricing Domain
- Pricing domain provides tier pricing information
- Subscription domain provides discount eligibility information
- Shared concepts: DiscountEligibility, SubscriptionTier

### With Order Domain
- Subscription domain provides benefit eligibility information for orders
- Order domain provides purchase history for subscription recommendations
- Shared concepts: OrderDiscount, ShippingBenefit

### With Catalog Domain
- Catalog domain provides product information for subscription boxes
- Subscription domain provides eligibility for early access to new products
- Shared concepts: Product, ProductCategory

## Implementation Recommendations

1. Implement the subscription state machine using the State pattern
2. Use the Observer pattern for subscription state change notifications
3. Implement a robust retry mechanism for failed payments
4. Use the Strategy pattern for different benefit allocation strategies
5. Implement idempotent payment processing to prevent double-charging
6. Use domain events for cross-bounded context communication
7. Implement a Command pattern for subscription lifecycle operations

# Subscription Management Context Glossary

Generated: 2025-07-21T12:19:38-03:00

## Purpose

This glossary defines terms specific to the Subscription Management bounded context, focusing on recurring revenue, customer lifecycle management, and subscription-based business model operations.

## Context Overview

- **Business Purpose**: Manage recurring subscriptions for B2C customers with tiered plans and benefits

- **Core Responsibility**: Subscription lifecycle from sign-up to cancellation

- **Key Metrics**: MRR growth ≥8% MoM, GM ≥40-45% by tier, churn ≤5%

- **Integration Points**: Customer Management, Payment & Billing, Order Management, Pricing & Promotions

## Aggregates

### SubscriptionAggregate

- **Definition**: Root aggregate managing the complete subscription lifecycle and state

- **Implementation**: `SubscriptionAggregate` extends AggregateRoot

- **Responsibilities**:

  - Subscription status management (active, paused, cancelled, expired)

  - Benefit allocation and tracking

  - Renewal cycle management

  - Upgrade/downgrade processing

- **Business Rules**:

  - Can only be paused for maximum 90 consecutive days

  - Changes take effect on next billing cycle unless immediate processing requested

  - Must maintain minimum margin requirements per tier

- **Related Terms**: SubscriptionStatus, SubscriptionPlan, SubscriptionBenefit

### SubscriptionPlan

- **Definition**: Immutable template defining subscription tier characteristics and pricing

- **Implementation**: `SubscriptionPlan` aggregate root

- **Properties**:

  - Tier (Basic, Premium, VIP)

  - Pricing structure and frequency options

  - Included benefits and credit amounts

  - Target margin requirements

- **Business Rules**:

  - Basic ≥40% GM, Premium ≥42% GM, VIP ≥45% GM

  - Must be available within defined date ranges

  - Benefits cannot exceed margin floor

- **Related Terms**: SubscriptionTier, SubscriptionFrequency, SubscriptionBenefit

### SubscriptionBundle

- **Definition**: Curated product collection for subscription deliveries

- **Implementation**: `SubscriptionBundle` aggregate root

- **Responsibilities**:

  - Product curation for subscription tiers

  - Seasonal and preference-based customization

  - Inventory allocation for subscription orders

- **Business Rules**:

  - Must maintain tier-appropriate product mix

  - Cannot exceed subscription plan budget

  - Must respect customer dietary preferences and restrictions

- **Related Terms**: ProductId, SubscriptionItem, CurationEngine

## Value Objects

### SubscriptionStatus

- **Definition**: Current state of a subscription in its lifecycle

- **Implementation**: `SubscriptionStatus` value object with enum

- **Valid States**:

  - **ACTIVE**: Subscription is current and deliveries are scheduled

  - **PAUSED**: Temporarily suspended, can be resumed within 90 days

  - **CANCELLED**: Permanently ended, no future deliveries

  - **EXPIRED**: Ended due to non-payment or term completion

- **State Transitions**:

  - ACTIVE ↔ PAUSED (bidirectional)

  - ACTIVE → CANCELLED (permanent)

  - ACTIVE → EXPIRED (system-initiated)

  - PAUSED → CANCELLED (customer-initiated)

- **Business Rules**: Paused subscriptions auto-expire after 90 days

### SubscriptionTier

- **Definition**: Service level classification determining pricing and benefits

- **Implementation**: `SubscriptionTier` value object with enum

- **Tiers**:

  - **BASIC**: Entry-level tier with standard benefits

  - **PREMIUM**: Mid-tier with enhanced benefits and discounts

  - **VIP**: Premium tier with maximum benefits and exclusive access

- **Business Impact**:

  - Determines pricing structure and margin requirements

  - Controls benefit allocation and credit amounts

  - Influences product curation and delivery frequency options

- **Related Terms**: SubscriptionPlan, PricingTier, SubscriptionBenefit

### SubscriptionFrequency

- **Definition**: Delivery and billing cycle timing for subscriptions

- **Implementation**: `SubscriptionFrequency` value object with enum

- **Options**:

  - **WEEKLY**: Every 7 days

  - **BIWEEKLY**: Every 14 days

  - **MONTHLY**: Every 30 days

- **Business Rules**:

  - Frequency affects pricing (weekly premium, monthly discount)

  - Cannot change frequency more than once per billing cycle

  - Inventory planning based on frequency distribution

- **Related Terms**: BillingCycle, DeliverySchedule, SubscriptionPlan

### SubscriptionBenefit

- **Definition**: Specific advantage or perk provided to subscription customers

- **Implementation**: `SubscriptionBenefit` value object

- **Benefit Types**:

  - **DISCOUNT**: Percentage or fixed amount discount on orders

  - **FREE_SHIPPING**: Waived delivery charges

  - **EARLY_ACCESS**: Priority access to new products or sales

  - **INCLUDED_PRODUCT**: Free items included in deliveries

  - **STORE_CREDIT**: Monthly credit balance for additional purchases

  - **SPECIAL_SERVICE**: Exclusive services (personal shopper, custom curation)

- **Business Rules**:

  - Benefits must not violate margin floor requirements

  - Credit amounts reset monthly and don't roll over

  - Early access limited to 48-hour window before general availability

- **Related Terms**: SubscriptionTier, BenefitCredit, DiscountPercentage

### SubscriptionItem

- **Definition**: Individual product within a subscription bundle

- **Implementation**: `SubscriptionItem` value object

- **Properties**:

  - Product reference and quantity

  - Substitution preferences

  - Customization options

- **Business Rules**:

  - Quantity must be positive integer

  - Substitutions require customer approval

  - Total item value cannot exceed subscription budget

- **Related Terms**: ProductId, SubscriptionBundle, ProductSubstitution

## Domain Services

### SubscriptionEngine

- **Definition**: Core business service managing subscription lifecycle operations

- **Implementation**: `SubscriptionEngine` domain service (TO BE IMPLEMENTED)

- **Responsibilities**:

  - Sign-up processing with tier validation

  - Upgrade/downgrade logic with proration calculations

  - Benefit calculation and application

  - Renewal processing and payment coordination

- **Business Logic**:

  - Validates margin requirements for tier changes

  - Calculates prorated charges for mid-cycle changes

  - Applies tier-appropriate benefits and discounts

  - Coordinates with BillingIntegrator for payment processing

- **Related Terms**: SubscriptionAggregate, SubscriptionPlan, BillingIntegrator

### BillingIntegrator

- **Definition**: Service coordinating subscription billing with external payment systems

- **Implementation**: `BillingIntegrator` domain service (TO BE IMPLEMENTED)

- **Responsibilities**:

  - Stripe subscription API coordination

  - Payment retry logic for failed renewals

  - Billing cycle management

  - Invoice generation for subscription charges

- **Integration Points**:

  - Stripe Subscription API for recurring payments

  - Payment & Billing context for transaction processing

  - Billing & Invoicing context for invoice generation

- **Related Terms**: PaymentCaptured, PaymentFailed, RenewalInvoice, StripeSubscription

## Domain Events

### SubscriptionCreated

- **Definition**: Published when a new subscription is successfully created

- **Implementation**: `SubscriptionCreated` extends DomainEvent

- **Payload**: Subscription ID, customer ID, plan details, start date

- **Consumers**: Notifications, Analytics, Billing, Customer Management

- **Business Impact**: Triggers welcome sequence, billing setup, analytics tracking

### SubscriptionRenewed

- **Definition**: Published when a subscription successfully renews for next billing cycle

- **Implementation**: `SubscriptionRenewed` extends DomainEvent

- **Payload**: Subscription ID, customer ID, renewal date, new end date

- **Consumers**: Notifications, Loyalty, Analytics, Order Management

- **Business Impact**: Triggers delivery scheduling, loyalty point allocation

### SubscriptionCancelled

- **Definition**: Published when a subscription is permanently cancelled

- **Implementation**: `SubscriptionCancelled` extends DomainEvent

- **Payload**: Subscription ID, customer ID, cancellation date, reason

- **Consumers**: Customer Management, Analytics, Customer Success

- **Business Impact**: Triggers retention workflows, churn analysis, exit surveys

### SubscriptionPaused

- **Definition**: Published when a subscription is temporarily suspended

- **Implementation**: `SubscriptionPaused` extends DomainEvent

- **Payload**: Subscription ID, customer ID, pause date, expected resume date

- **Consumers**: Order Management, Notifications, Customer Success

- **Business Impact**: Stops delivery scheduling, triggers check-in workflows

### SubscriptionResumed

- **Definition**: Published when a paused subscription is reactivated

- **Implementation**: `SubscriptionResumed` extends DomainEvent

- **Payload**: Subscription ID, customer ID, resume date, next billing date

- **Consumers**: Order Management, Notifications, Analytics

- **Business Impact**: Resumes delivery scheduling, updates customer status

### SubscriptionUpgraded

- **Definition**: Published when a subscription tier is upgraded

- **Implementation**: `SubscriptionUpgraded` extends DomainEvent (TO BE IMPLEMENTED)

- **Payload**: Subscription ID, previous tier, new tier, effective date, proration amount

- **Consumers**: Pricing & Promotions, Analytics, Notifications

- **Business Impact**: Triggers benefit updates, pricing adjustments, upsell tracking

### SubscriptionPaymentFailed

- **Definition**: Published when subscription renewal payment fails

- **Implementation**: `SubscriptionPaymentFailed` extends DomainEvent (TO BE IMPLEMENTED)

- **Payload**: Subscription ID, payment attempt, failure reason, retry count

- **Consumers**: Notifications, Customer Success, Billing

- **Business Impact**: Triggers retry workflows, dunning management, customer outreach

## Repository Interfaces

### ISubscriptionRepository

- **Definition**: Persistence contract for subscription aggregates

- **Implementation**: `ISubscriptionRepository` interface

- **Standard Operations**:

  - `findById(id: UniqueEntityID): Promise<SubscriptionAggregate | null>`

  - `save(subscription: SubscriptionAggregate): Promise<void>`

  - `findByCustomerId(customerId: CustomerId): Promise<SubscriptionAggregate[]>`

- **Specialized Queries**:

  - `findActiveSubscriptions(): Promise<SubscriptionAggregate[]>`

  - `findSubscriptionsDueForRenewal(date: Date): Promise<SubscriptionAggregate[]>`

  - `findPausedSubscriptionsNearExpiry(): Promise<SubscriptionAggregate[]>`

- **Business Rules**: All operations return Result pattern for error handling

## Business Rules & Constraints

### Subscription Lifecycle Rules

1. **Pause Limitations**: Maximum 90 consecutive days before auto-expiry

2. **Change Timing**: Tier changes effective next billing cycle unless immediate processing requested

3. **Notification Requirements**: 3-day advance notice before renewal charges

4. **Margin Enforcement**: All tiers must maintain minimum GM requirements

### Benefit Allocation Rules

1. **Credit Limits**: Store credit resets monthly, no rollover

2. **Discount Stacking**: Only one discount type per order

3. **Early Access**: 48-hour exclusive window before general availability

4. **Shipping Benefits**: Free shipping applies to subscription deliveries only

### Payment & Billing Rules

1. **Retry Logic**: 3 attempts with exponential backoff for failed payments

2. **Proration**: Mid-cycle changes prorated to next billing date

3. **Grace Period**: 7-day grace period before subscription suspension

4. **Refund Policy**: Prorated refunds for downgrades, no refunds for cancellations

## Integration Patterns

### Inbound Events (Consumed)

- **PaymentCaptured** (Payment & Billing) → Activate or renew subscription

- **PaymentFailed** (Payment & Billing) → Trigger retry workflow

- **CustomerUpdated** (Customer Management) → Sync profile changes

- **ProductDiscontinued** (Product Catalog) → Handle substitutions

### Outbound Events (Published)

- **SubscriptionCreated** → Multiple consumers for onboarding

- **SubscriptionRenewed** → Order Management for delivery scheduling

- **SubscriptionCancelled** → Customer Success for retention

- **DeliveryScheduled** → Order Management for fulfillment

### Service Dependencies

- **Customer Management**: Customer validation and profile data

- **Payment & Billing**: Payment processing and billing cycles

- **Product Catalog**: Product availability and pricing

- **Pricing & Promotions**: Discount calculations and margin validation

## Anti-Corruption Patterns

### Stripe Integration

- **StripeSubscription** → Internal `SubscriptionAggregate`

- **StripeCustomer** → Internal `CustomerId`

- **StripePlan** → Internal `SubscriptionPlan`

- **StripeInvoice** → Internal `RenewalInvoice`

### Legacy System Integration

- **Old Subscription IDs** → New `UniqueEntityID` format

- **Previous Tier Names** → Standardized tier enum values

- **Historical Billing Data** → Current invoice structure

## Context Boundaries

### What's Inside This Context

- Subscription lifecycle management

- Tier and benefit administration

- Renewal and billing cycle coordination

- Customer subscription preferences

### What's Outside This Context

- Payment processing (Payment & Billing context)

- Product catalog management (Product Catalog context)

- Order fulfillment (Order Management context)

- Customer profile management (Customer Management context)

### Integration Points

- **Customer Management**: Customer validation and profile sync

- **Payment & Billing**: Payment processing and invoice generation

- **Order Management**: Delivery scheduling and fulfillment

- **Product Catalog**: Product availability and substitutions

- **Pricing & Promotions**: Discount calculations and pricing rules

This glossary ensures consistent terminology within the Subscription Management context while maintaining clear boundaries and integration patterns with other bounded contexts.

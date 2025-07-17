# Subscriptions Bounded Context

## Overview
The Subscriptions bounded context manages recurring product deliveries for Elias Food Imports customers. It handles subscription creation, billing cycles, product selection changes, and automatic order generation.

## Core Domain Concepts
- **Subscription**: A recurring arrangement for product delivery at specified intervals
- **SubscriptionStatus**: Tracks the state of a subscription (ACTIVE, PAUSED, CANCELLED)
- **BillingCycle**: Defines when and how often a customer is billed

## Aggregates
- **SubscriptionAggregate**: Root entity that manages the lifecycle of a subscription

## Value Objects
- **SubscriptionId**: Uniquely identifies a subscription
- **SubscriptionPlan**: Defines the terms, duration, and pricing of a subscription
- **DeliverySchedule**: Defines the frequency and timing of deliveries
- **BillingDetails**: Contains payment method and billing information

## Domain Events
- **SubscriptionCreated**: Raised when a new subscription is created
- **SubscriptionActivated**: Raised when a subscription becomes active
- **SubscriptionPaused**: Raised when a subscription is temporarily paused
- **SubscriptionCancelled**: Raised when a subscription is cancelled
- **SubscriptionRenewed**: Raised when a subscription billing cycle renews
- **SubscriptionModified**: Raised when subscription details are changed

## Dependencies
- **Shared Kernel**: Core domain components, Result pattern, Guard clauses
- **Customer Context**: Customer information and preferences
- **Catalog Context**: Product information and availability
- **Ordering Context**: Order generation for subscription deliveries
- **Invoicing Context**: Invoice generation for subscription billing
- **Payment Context**: Payment processing for subscription charges

## Integration Configuration

### Event Publishing
```typescript
// Configuration for publishing domain events
{
  "eventBus": {
    "type": "rabbitmq",
    "exchange": "elias.events",
    "routingKeyPrefix": "subscriptions"
  }
}
```

### Event Subscriptions
```typescript
// Events consumed from other contexts
{
  "subscriptions": [
    {
      "source": "payment",
      "event": "PaymentFailed",
      "handler": "SubscriptionPaymentHandler"
    },
    {
      "source": "catalog",
      "event": "ProductDiscontinued",
      "handler": "SubscriptionProductHandler"
    },
    {
      "source": "customer",
      "event": "CustomerDeactivated",
      "handler": "SubscriptionCustomerHandler"
    }
  ]
}
```

### Scheduled Jobs
```typescript
// Configuration for scheduled subscription tasks
{
  "scheduledJobs": [
    {
      "name": "subscription-renewal-check",
      "schedule": "0 0 * * *", // Daily at midnight
      "handler": "SubscriptionRenewalJob"
    },
    {
      "name": "upcoming-delivery-notification",
      "schedule": "0 9 * * *", // Daily at 9 AM
      "handler": "DeliveryNotificationJob"
    },
    {
      "name": "failed-payment-retry",
      "schedule": "0 */4 * * *", // Every 4 hours
      "handler": "PaymentRetryJob"
    }
  ]
}
```

### API Endpoints
- `POST /api/subscriptions`: Create a new subscription
- `GET /api/subscriptions`: List subscriptions with optional filters
- `GET /api/subscriptions/{id}`: Get subscription details
- `PUT /api/subscriptions/{id}/pause`: Pause a subscription
- `PUT /api/subscriptions/{id}/resume`: Resume a paused subscription
- `PUT /api/subscriptions/{id}/cancel`: Cancel a subscription
- `PUT /api/subscriptions/{id}/products`: Update products in a subscription
- `GET /api/subscriptions/customer/{customerId}`: Get subscriptions for a specific customer

## Environment Variables
- `SUBSCRIPTION_RENEWAL_ADVANCE_DAYS`: Days before renewal to process subscription
- `SUBSCRIPTION_PAYMENT_RETRY_COUNT`: Number of payment retry attempts
- `SUBSCRIPTION_PAYMENT_RETRY_INTERVAL_HOURS`: Hours between payment retry attempts
- `SUBSCRIPTION_DISCOUNT_PERCENTAGE`: Default discount percentage for subscription products

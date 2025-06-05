# Domain Event Catalog

## Overview
This catalog documents the domain events that facilitate communication between bounded contexts in the Elias Food Imports system. Domain events represent significant occurrences within a domain that other domains might need to react to, enabling loose coupling between bounded contexts while maintaining system consistency.

## Event Format Standard

All domain events in the EFI system follow this standard format:

```typescript
interface DomainEvent {
  eventId: string;            // Unique identifier for the event instance
  eventType: string;          // The type of event (e.g., "PriceChanged")
  aggregateId: string;        // ID of the aggregate that emitted the event
  aggregateType: string;      // Type of the aggregate (e.g., "Product")
  timestamp: Date;            // When the event occurred
  version: number;            // Event schema version
  data: any;                  // Event-specific payload
  metadata: {                 // Additional contextual information
    correlationId?: string;   // For tracking related events
    causationId?: string;     // ID of event that caused this event
    userId?: string;          // User who triggered the action
  }
}
```

## Core Domain Events

### Pricing Domain Events

#### PriceChanged
- **Description**: Triggered when a product's price is modified
- **Data Payload**:
  ```typescript
  {
    productId: string;
    oldPrice: Money;
    newPrice: Money;
    changeReason: string;
    changedBy: string;
    effectiveDate: Date;
  }
  ```
- **Consumers**: Catalog, Order, Inventory domains
- **Business Impact**: Affects product display, order calculations, inventory valuation

#### MarginFloorBreached
- **Description**: Triggered when a calculated price falls below minimum acceptable margin
- **Data Payload**:
  ```typescript
  {
    productId: string;
    calculatedPrice: Money;
    minimumAllowedPrice: Money;
    customerTier: string;
    breachPercentage: number;
  }
  ```
- **Consumers**: Notification, Approval Workflow
- **Business Impact**: Requires management intervention to approve or reject pricing

#### PromotionalCampaignCreated
- **Description**: Triggered when a new promotional campaign is established
- **Data Payload**:
  ```typescript
  {
    campaignId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    discountType: string;
    discountAmount: number;
    eligibleProducts: string[];
    eligibleCategories: string[];
  }
  ```
- **Consumers**: Catalog, Marketing, Analytics domains
- **Business Impact**: Affects product pricing display and marketing activities

### Subscription Domain Events

#### SubscriptionCreated
- **Description**: Triggered when a new subscription is established
- **Data Payload**:
  ```typescript
  {
    subscriptionId: string;
    customerId: string;
    tier: string;
    billingCycle: string;
    startDate: Date;
    initialPaymentId: string;
  }
  ```
- **Consumers**: Customer, Pricing, Notification domains
- **Business Impact**: Activates subscription benefits and billing cycle

#### SubscriptionStateChanged
- **Description**: Triggered when a subscription transitions to a new state
- **Data Payload**:
  ```typescript
  {
    subscriptionId: string;
    oldState: string;
    newState: string;
    changeReason: string;
    timestamp: Date;
    affectedBenefits: string[];
  }
  ```
- **Consumers**: Customer, Pricing, Notification domains
- **Business Impact**: May activate/deactivate benefits or trigger customer communications

#### PaymentFailed
- **Description**: Triggered when a subscription payment attempt fails
- **Data Payload**:
  ```typescript
  {
    subscriptionId: string;
    paymentId: string;
    failureReason: string;
    retryAttempt: number;
    nextRetryDate: Date;
  }
  ```
- **Consumers**: Notification, Payment Retry Workflow
- **Business Impact**: Initiates payment retry sequence and customer notifications

### Catalog Authentication Domain Events

#### ProductAuthenticated
- **Description**: Triggered when a product successfully passes authentication check
- **Data Payload**:
  ```typescript
  {
    productId: string;
    tokenId: string;
    verificationTimestamp: Date;
    verificationMethod: string;
    customerId: string;
    verificationCount: number;
  }
  ```
- **Consumers**: Customer, Analytics, Notification domains
- **Business Impact**: Confirms product authenticity to customer, updates verification statistics

#### AuthenticationFailed
- **Description**: Triggered when a product fails authentication check
- **Data Payload**:
  ```typescript
  {
    productId: string;
    tokenId: string;
    failureReason: string;
    verificationAttempt: number;
    customerId: string;
    suspiciousIndicators: string[];
  }
  ```
- **Consumers**: Fraud Prevention, Customer Service, Notification domains
- **Business Impact**: May trigger fraud investigation or customer support intervention

#### TokenGenerated
- **Description**: Triggered when a new authentication token is created
- **Data Payload**:
  ```typescript
  {
    tokenId: string;
    tokenType: string;
    productSku: string;
    batchId: string;
    generationTimestamp: Date;
    assignedProducer: string;
  }
  ```
- **Consumers**: Inventory, Producer Portal domains
- **Business Impact**: Enables token application to physical products

## Supporting Domain Events

### Customer Domain Events

#### CustomerTierChanged
- **Description**: Triggered when a customer's tier classification changes
- **Data Payload**:
  ```typescript
  {
    customerId: string;
    oldTier: string;
    newTier: string;
    changeReason: string;
    effectiveDate: Date;
  }
  ```
- **Consumers**: Pricing, Subscription, Order domains
- **Business Impact**: Affects pricing rules, available subscription tiers, and order options

#### CustomerPreferencesUpdated
- **Description**: Triggered when a customer updates their preferences
- **Data Payload**:
  ```typescript
  {
    customerId: string;
    updatedPreferences: {
      category: string;
      preferences: any;
    }[];
    timestamp: Date;
  }
  ```
- **Consumers**: Catalog, Marketing, Recommendation Engine
- **Business Impact**: Affects product recommendations and marketing targeting

### Order Domain Events

#### OrderPlaced
- **Description**: Triggered when a customer places a new order
- **Data Payload**:
  ```typescript
  {
    orderId: string;
    customerId: string;
    orderItems: {
      productId: string;
      quantity: number;
      price: Money;
    }[];
    totalAmount: Money;
    placedDate: Date;
    shippingAddress: Address;
  }
  ```
- **Consumers**: Inventory, Fulfillment, Customer domains
- **Business Impact**: Initiates order fulfillment process and inventory adjustments

#### OrderStatusChanged
- **Description**: Triggered when an order's status changes
- **Data Payload**:
  ```typescript
  {
    orderId: string;
    oldStatus: string;
    newStatus: string;
    changeReason: string;
    timestamp: Date;
  }
  ```
- **Consumers**: Customer, Notification, Analytics domains
- **Business Impact**: Triggers customer notifications and updates order tracking

### Inventory Domain Events

#### ProductStockChanged
- **Description**: Triggered when a product's stock level changes
- **Data Payload**:
  ```typescript
  {
    productId: string;
    oldQuantity: number;
    newQuantity: number;
    changeReason: string;
    warehouseId: string;
    timestamp: Date;
  }
  ```
- **Consumers**: Catalog, Order, Analytics domains
- **Business Impact**: Affects product availability and may trigger reordering

#### LowStockThresholdReached
- **Description**: Triggered when a product's stock falls below reorder threshold
- **Data Payload**:
  ```typescript
  {
    productId: string;
    currentStock: number;
    threshold: number;
    warehouseId: string;
    suggestedReorderQuantity: number;
  }
  ```
- **Consumers**: Purchasing, Notification domains
- **Business Impact**: Initiates reordering process to prevent stockouts

## Cross-Domain Event Flows

### Subscription Creation Flow
1. `CustomerTierChanged` (Customer Domain)
2. `SubscriptionCreated` (Subscription Domain)
3. `PaymentSucceeded` (Subscription Domain)
4. `CustomerPreferencesUpdated` (Customer Domain)

### Product Authentication Flow
1. `TokenGenerated` (Catalog Authentication Domain)
2. `ProductReceived` (Inventory Domain)
3. `ProductAuthenticated` (Catalog Authentication Domain)
4. `ProductStockChanged` (Inventory Domain)

### Order Processing Flow
1. `OrderPlaced` (Order Domain)
2. `ProductStockChanged` (Inventory Domain)
3. `OrderStatusChanged` (Order Domain)
4. `PaymentProcessed` (Payment Domain)
5. `OrderStatusChanged` (Order Domain)

### Dynamic Pricing Flow
1. `LowStockThresholdReached` (Inventory Domain)
2. `PriceChanged` (Pricing Domain)
3. `PromotionalCampaignCreated` (Pricing Domain)
4. `ProductUpdated` (Catalog Domain)

## Implementation Guidelines

### Event Publishing
- Use the outbox pattern to ensure reliable event publishing
- Implement idempotent event handlers to prevent duplicate processing
- Include versioning in event schemas to support evolution

### Event Subscription
- Use the subscription manager pattern to track event subscriptions
- Implement retry mechanisms for failed event processing
- Use dead letter queues for events that cannot be processed

### Monitoring and Debugging
- Log all event publications and consumptions
- Implement event tracing through correlation IDs
- Create dashboards for monitoring event flows and backlogs

## Event Schema Evolution

When evolving event schemas:
1. Only add new fields, never remove or rename existing fields
2. Increment the version number when adding fields
3. Ensure consumers can handle missing fields in older versions
4. Maintain backward compatibility for at least two versions

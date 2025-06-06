# Context→Event Flow Diagram

This diagram visualizes the flow of key domain events across bounded contexts in the Elias Food Imports system, showing how events trigger actions and subsequent events in different contexts.

## Order Processing Flow

```mermaid
sequenceDiagram
    participant Customer as Customer Context
    participant Order as Order Context
    participant Payment as Payment Context
    participant Inventory as Inventory Context
    participant Shipping as Shipping Context
    participant Notification as Notification Context
    
    Order->>Order: OrderPlaced
    Order->>Inventory: OrderPlaced
    Inventory->>Inventory: InventoryReserved
    Inventory->>Order: InventoryReserved
    Order->>Payment: OrderPlaced
    Payment->>Payment: PaymentCaptured
    Payment->>Order: OrderPaymentConfirmed
    Order->>Order: OrderFulfilled
    Order->>Shipping: OrderFulfilled
    Shipping->>Shipping: ShipmentScheduled
    Shipping->>Shipping: ShipmentLabelGenerated
    Shipping->>Shipping: ShipmentPickedUp
    Shipping->>Order: OrderShipped
    Shipping->>Customer: OrderShipped
    Shipping->>Notification: OrderShipped
    Shipping->>Shipping: ShipmentDelivered
    Shipping->>Order: OrderDelivered
    Shipping->>Customer: OrderDelivered
    Shipping->>Notification: OrderDelivered
```

## Product Authentication Flow

```mermaid
sequenceDiagram
    participant CatalogAuth as Catalog Authentication Context
    participant Catalog as Catalog Context
    participant Inventory as Inventory Context
    participant Security as Security Context
    participant Notification as Notification Context
    
    CatalogAuth->>CatalogAuth: ProductAuthenticationRequested
    CatalogAuth->>CatalogAuth: ProductAuthenticated
    CatalogAuth->>Catalog: ProductAuthenticated
    CatalogAuth->>Notification: ProductAuthenticated
    
    alt Counterfeit Detected
        CatalogAuth->>CatalogAuth: CounterfeitDetected
        CatalogAuth->>Security: CounterfeitDetected
        CatalogAuth->>Notification: CounterfeitDetected
        Security->>Inventory: CounterfeitDetected
    end
```

## Subscription Management Flow

```mermaid
sequenceDiagram
    participant Customer as Customer Context
    participant Subscription as Subscription Context
    participant Payment as Payment Context
    participant Order as Order Context
    participant Notification as Notification Context
    
    Customer->>Subscription: CustomerRegistered
    Subscription->>Subscription: SubscriptionCreated
    Subscription->>Customer: SubscriptionCreated
    Subscription->>Notification: SubscriptionCreated
    
    loop Recurring Billing
        Subscription->>Subscription: SubscriptionRenewed
        Subscription->>Payment: SubscriptionRenewed
        Payment->>Payment: PaymentCaptured
        Payment->>Subscription: PaymentCaptured
        Subscription->>Order: SubscriptionRenewed
        Order->>Order: OrderPlaced
        Subscription->>Notification: SubscriptionRenewed
    end
    
    alt Payment Failure
        Payment->>Payment: PaymentFailed
        Payment->>Subscription: SubscriptionPaymentFailed
        Subscription->>Notification: SubscriptionPaymentFailed
        Subscription->>Customer: SubscriptionPaymentFailed
    end
```

## Customer Engagement Flow

```mermaid
sequenceDiagram
    participant Customer as Customer Context
    participant Marketing as Marketing Context
    participant Order as Order Context
    participant Review as Review Context
    participant Analytics as Analytics Context
    
    Marketing->>Marketing: CampaignLaunched
    Marketing->>Customer: CustomerEngagementRecorded
    Customer->>Order: OrderPlaced
    Order->>Order: OrderDelivered
    Order->>Review: OrderDelivered
    Review->>Review: ReviewSubmitted
    Review->>Catalog: ReviewSubmitted
    Review->>Analytics: ReviewSubmitted
    Analytics->>Analytics: BusinessMetricCalculated
    Analytics->>Marketing: BusinessMetricCalculated
    Marketing->>Customer: CustomerSegmentAssigned
```

## Inventory Management Flow

```mermaid
sequenceDiagram
    participant Inventory as Inventory Context
    participant Catalog as Catalog Context
    participant Analytics as Analytics Context
    participant Notification as Notification Context
    
    Inventory->>Inventory: ProductInventoryLevelChanged
    Inventory->>Catalog: ProductInventoryLevelChanged
    Inventory->>Analytics: ProductInventoryLevelChanged
    
    alt Low Stock
        Inventory->>Inventory: LowStockThresholdReached
        Inventory->>Notification: LowStockThresholdReached
    end
    
    Inventory->>Inventory: InventoryReceived
    Inventory->>Catalog: InventoryReceived
    Inventory->>Analytics: InventoryReceived
```

This diagram illustrates the key event flows across bounded contexts in the Elias Food Imports system. It shows how events originate in one context and trigger actions and subsequent events in other contexts, creating a chain of business processes that implement the system's requirements.

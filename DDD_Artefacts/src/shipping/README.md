# Shipping Bounded Context

## Overview
The Shipping bounded context manages the logistics of delivering products from Elias Food Imports to customers. It handles shipment creation, tracking, carrier integration, quality verification, and delivery confirmation.

## Core Domain Concepts
- **Shipment**: A package or set of packages to be delivered to a customer
- **ShipmentStatus**: Tracks the state of a shipment through the delivery process
- **Carrier**: External shipping provider that handles physical delivery
- **QualityVerification**: Process to ensure products meet quality standards before shipping
- **Quarantine**: Isolation of products that fail quality checks

## Aggregates
- **ShipmentAggregate**: Root entity that manages the lifecycle of a shipment

## Value Objects
- **TrackingNumber**: Uniquely identifies a shipment for tracking purposes
- **ShipmentStatus**: Represents the possible states of a shipment (CREATED, SCHEDULED, LABEL_GENERATED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, EXCEPTION, RETURNED, CANCELLED)
- **DeliveryAddress**: Contains validated address information for delivery
- **ShippingLabel**: Contains formatted information for printing shipping labels
- **QuarantineStatus**: Represents the quarantine state of a product during quality verification

## Domain Events
- **ShipmentCreated**: Raised when a new shipment is created
- **ShipmentStatusChanged**: Raised when a shipment's status changes
- **ShipmentLabelGenerated**: Raised when a shipping label is generated
- **ShipmentDelivered**: Raised when a shipment is delivered
- **ShipmentException**: Raised when there's a problem with delivery
- **QualityCheckPassed**: Triggered when a product passes quality verification
- **QualityCheckFailed**: Triggered when a product fails quality verification

## Dependencies
- **Shared Kernel**: Core domain components, Result pattern, Guard clauses
- **Order Context**: Order information for shipment creation
- **Customer Context**: Customer address and contact information
- **Inventory Context**: Product information for customs documentation
- **Notification Context**: Shipment status changes trigger notifications

## Integration Configuration

### Event Publishing
```typescript
// Configuration for publishing domain events
{
  "eventBus": {
    "type": "rabbitmq",
    "exchange": "elias.events",
    "routingKeyPrefix": "shipping"
  }
}
```

### Event Subscriptions
```typescript
// Events consumed from other contexts
{
  "subscriptions": [
    {
      "source": "ordering",
      "event": "OrderConfirmed",
      "handler": "ShipmentCreationHandler"
    },
    {
      "source": "ordering",
      "event": "OrderCancelled",
      "handler": "ShipmentCancellationHandler"
    },
    {
      "source": "inventory",
      "event": "InventoryAllocated",
      "handler": "UpdateShipmentInventoryHandler"
    }
  ]
}
```

### External Integrations
```typescript
// Carrier API configurations
{
  "carriers": [
    {
      "name": "FedEx",
      "apiEndpoint": "https://api.fedex.com/v1",
      "authType": "oauth2",
      "rateLimitPerMinute": 100
    },
    {
      "name": "DHL",
      "apiEndpoint": "https://api.dhl.com/shipping/v2",
      "authType": "apiKey",
      "rateLimitPerMinute": 60
    },
    {
      "name": "UPS",
      "apiEndpoint": "https://onlinetools.ups.com/api",
      "authType": "oauth2",
      "rateLimitPerMinute": 120
    }
  ]
}
```

### API Endpoints
- `POST /api/shipments`: Create a new shipment
- `GET /api/shipments`: List shipments with optional filters
- `GET /api/shipments/{id}`: Get shipment details
- `GET /api/shipments/tracking/{trackingNumber}`: Get tracking information
- `PUT /api/shipments/{id}/status`: Update shipment status
- `POST /api/shipments/{id}/label`: Generate shipping label
- `GET /api/shipments/order/{orderId}`: Get shipments for a specific order
- `POST /api/quality-checks`: Record a quality check result
- `GET /api/quality-checks/{productId}`: Get quality check history for a product
- `POST /api/quarantine/{productId}/release`: Release a product from quarantine

## Quality Verification Workflow

The Quality Verification Workflow is a critical process that ensures all products meet Elias Food Imports' strict quality standards before being shipped to customers.

### Process Flow

1. Products are selected for quality verification based on:
   - Random sampling
   - High-value items
   - Products with previous quality issues
   - Products from new suppliers

2. Quality checkers perform verification against established criteria:
   - Visual inspection
   - Packaging integrity
   - Expiration dates
   - Temperature requirements
   - Authentication verification

3. Outcomes:
   - **Pass**: Product continues through the shipping process
   - **Fail**: Product is quarantined for further inspection or return

### Quarantine Process

When a product fails quality verification:
1. The product is marked with a `QuarantineStatus`
2. The reason for quarantine is documented
3. The product is physically moved to a quarantine area
4. A `QualityCheckFailed` event is published
5. Depending on severity, additional actions may be taken:
   - LOW: Minor issues, may be resolved quickly
   - MEDIUM: Requires investigation
   - HIGH: Serious quality concerns
   - CRITICAL: Potential safety issues, may require regulatory reporting

### Release from Quarantine

Products can be released from quarantine after:
1. Issues are resolved
2. Secondary inspection passes
3. Proper documentation is completed

## Environment Variables
- `DEFAULT_CARRIER`: Default shipping carrier to use
- `SHIPPING_LABEL_FORMAT`: Format for shipping labels (PDF, ZPL)
- `TRACKING_UPDATE_INTERVAL`: Interval for polling tracking updates in minutes
- `CUSTOMS_DOCUMENTATION_REQUIRED`: Whether customs documentation is required (true/false)
- `SHIPPING_SERVICE_PORT`: Port for the shipping service API (default: 3003)
- `CARRIER_API_KEY`: API key for carrier integration
- `QUALITY_CHECK_SAMPLE_RATE`: Percentage of products to randomly check (default: 10)
- `QUARANTINE_NOTIFICATION_EMAIL`: Email to notify for quarantined products

# Shipping Bounded Context

## Overview
The Shipping bounded context manages the logistics of delivering products from Elias Food Imports to customers. It handles shipment creation, tracking, carrier integration, and delivery confirmation.

## Core Domain Concepts
- **Shipment**: A package or set of packages to be delivered to a customer
- **ShipmentStatus**: Tracks the state of a shipment through the delivery process
- **Carrier**: External shipping provider that handles physical delivery

## Aggregates
- **ShipmentAggregate**: Root entity that manages the lifecycle of a shipment

## Value Objects
- **TrackingNumber**: Uniquely identifies a shipment for tracking purposes
- **ShipmentStatus**: Represents the possible states of a shipment (CREATED, SCHEDULED, LABEL_GENERATED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, EXCEPTION, RETURNED, CANCELLED)
- **DeliveryAddress**: Contains validated address information for delivery
- **ShippingLabel**: Contains formatted information for printing shipping labels

## Domain Events
- **ShipmentCreated**: Raised when a new shipment is created
- **ShipmentStatusChanged**: Raised when a shipment's status changes
- **ShipmentLabelGenerated**: Raised when a shipping label is generated
- **ShipmentDelivered**: Raised when a shipment is delivered
- **ShipmentException**: Raised when there's a problem with delivery

## Dependencies
- **Shared Kernel**: Core domain components, Result pattern, Guard clauses
- **Order Context**: Order information for shipment creation
- **Customer Context**: Customer address and contact information
- **Inventory Context**: Product information for customs documentation

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

## Environment Variables
- `DEFAULT_CARRIER`: Default shipping carrier to use
- `SHIPPING_LABEL_FORMAT`: Format for shipping labels (PDF, ZPL)
- `TRACKING_UPDATE_INTERVAL`: Interval for polling tracking updates in minutes
- `CUSTOMS_DOCUMENTATION_REQUIRED`: Whether customs documentation is required (true/false)

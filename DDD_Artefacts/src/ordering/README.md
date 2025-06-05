# Ordering Bounded Context

## Overview
The Ordering bounded context is the core domain of Elias Food Imports, handling the creation, processing, and fulfillment of customer orders for imported food products. It manages the entire order lifecycle from initial placement to fulfillment.

## Core Domain Concepts
- **Order**: A request from a customer to purchase products
- **OrderLine**: Individual product items within an order
- **OrderStatus**: Tracks the state of an order through its lifecycle

## Aggregates
- **OrderAggregate**: Root entity that manages the lifecycle of an order

## Value Objects
- **OrderNumber**: Uniquely identifies an order in the system
- **OrderStatus**: Represents the possible states of an order
- **RefundPolicyVO**: Encapsulates the rules and conditions for processing refunds
- **ShippingDetails**: Contains shipping information for an order

## Domain Events
- **OrderCreated**: Raised when a new order is created
- **OrderConfirmed**: Raised when an order is confirmed
- **OrderShipped**: Raised when an order is shipped
- **OrderDelivered**: Raised when an order is delivered
- **OrderCancelled**: Raised when an order is cancelled
- **InvoiceGenerated**: Raised when an invoice is generated for an order
- **InvoicePaid**: Raised when an invoice for an order is paid
- **InvoiceCancelled**: Raised when an invoice for an order is cancelled

## Dependencies
- **Shared Kernel**: Core domain components, Result pattern, Guard clauses
- **Customer Context**: Customer information and validation
- **Catalog Context**: Product information and availability
- **Inventory Context**: Stock verification and reservation
- **Pricing Context**: Price calculation and discounts
- **Invoicing Context**: Invoice generation and tracking
- **Shipping Context**: Shipment creation and tracking

## Integration Configuration

### Event Publishing
```typescript
// Configuration for publishing domain events
{
  "eventBus": {
    "type": "rabbitmq",
    "exchange": "elias.events",
    "routingKeyPrefix": "ordering"
  }
}
```

### Event Subscriptions
```typescript
// Events consumed from other contexts
{
  "subscriptions": [
    {
      "source": "inventory",
      "event": "ProductStockChanged",
      "handler": "OrderInventoryHandler"
    },
    {
      "source": "payment",
      "event": "PaymentReceived",
      "handler": "OrderPaymentHandler"
    },
    {
      "source": "shipping",
      "event": "ShipmentStatusChanged",
      "handler": "OrderShipmentHandler"
    },
    {
      "source": "invoicing",
      "event": "InvoicePaid",
      "handler": "OrderInvoiceHandler"
    }
  ]
}
```

### API Endpoints
- `POST /api/orders`: Create a new order
- `GET /api/orders`: List orders with optional filters
- `GET /api/orders/{id}`: Get order details
- `PUT /api/orders/{id}/confirm`: Confirm an order
- `PUT /api/orders/{id}/cancel`: Cancel an order
- `GET /api/orders/customer/{customerId}`: Get orders for a specific customer
- `GET /api/orders/status/{status}`: Get orders by status

## Environment Variables
- `ORDER_NUMBER_PREFIX`: Prefix for order numbers (default: "EFI-ORD")
- `ORDER_EXPIRY_MINUTES`: Time in minutes before unconfirmed orders expire
- `DEFAULT_REFUND_WINDOW_DAYS`: Default refund window in days (default: 30)
- `MINIMUM_ORDER_AMOUNT`: Minimum order amount required

# Invoicing Bounded Context

## Overview
The Invoicing bounded context is responsible for managing the lifecycle of invoices within Elias Food Imports. It handles invoice creation, payment tracking, sending notifications, and managing overdue invoices.

## Core Domain Concepts
- **Invoice**: A financial document requesting payment for products or services
- **InvoiceStatus**: Tracks the state of an invoice (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
- **InvoiceItem**: Individual line items on an invoice

## Aggregates
- **InvoiceAggregate**: Root entity that manages the lifecycle of an invoice

## Value Objects
- **InvoiceStatus**: Represents the possible states of an invoice
- **InvoiceNumber**: Uniquely identifies an invoice in the system

## Domain Events
- **InvoiceCreated**: Raised when a new invoice is created
- **InvoiceSent**: Raised when an invoice is sent to a customer
- **InvoicePaid**: Raised when an invoice is marked as paid
- **InvoiceOverdue**: Raised when an invoice becomes overdue
- **InvoiceCancelled**: Raised when an invoice is cancelled

## Dependencies
- **Shared Kernel**: Core domain components, Result pattern, Guard clauses
- **Customer Context**: Customer information for billing
- **Payment Context**: Payment processing and verification
- **Subscription Context**: Subscription details for recurring invoices

## Integration Configuration

### Event Publishing
```typescript
// Configuration for publishing domain events
{
  "eventBus": {
    "type": "rabbitmq",
    "exchange": "elias.events",
    "routingKeyPrefix": "invoicing"
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
      "event": "PaymentReceived",
      "handler": "InvoicePaymentHandler"
    },
    {
      "source": "subscription",
      "event": "SubscriptionRenewed",
      "handler": "SubscriptionInvoiceHandler"
    }
  ]
}
```

### API Endpoints
- `POST /api/invoices`: Create a new invoice
- `GET /api/invoices`: List invoices with optional filters
- `GET /api/invoices/{id}`: Get invoice details
- `PUT /api/invoices/{id}/send`: Send an invoice to customer
- `PUT /api/invoices/{id}/pay`: Mark an invoice as paid
- `PUT /api/invoices/{id}/cancel`: Cancel an invoice
- `GET /api/invoices/status/{status}`: Get invoices by status

## Environment Variables
- `INVOICE_NUMBER_PREFIX`: Prefix for invoice numbers (default: "EFI-INV")
- `INVOICE_PAYMENT_TERMS_DAYS`: Default payment terms in days (default: 30)
- `INVOICE_OVERDUE_CHECK_INTERVAL`: Interval for checking overdue invoices in minutes

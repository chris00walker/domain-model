# Ordering Bounded Context

## Domain Description

The Ordering bounded context manages all aspects related to orders in the Elias Food Imports (EFI) system. It handles order creation, processing, fulfillment, and the overall order lifecycle.

## Key Concepts

### Order Lifecycle

An order in EFI goes through several states during its lifecycle:

1. **Created**: Initial state when a customer places an order
2. **Paid**: Customer has made payment for the order
3. **Processing**: Order is being prepared for fulfillment
4. **Fulfilled**: Order has been assembled and is ready for shipment
5. **Shipped**: Order has been dispatched for delivery
6. **Delivered**: Order has successfully reached the customer
7. **Cancelled**: Order has been cancelled
8. **Refunded**: Payment has been returned to the customer

### Order Composition

An order consists of:
- Customer information
- Line items (products being purchased)
- Shipping details
- Billing details
- Status information
- Tracking data

## Domain Model

### Aggregate Roots

#### Order

The main entity representing a customer's order.

```typescript
class Order extends AggregateRoot<OrderProps> {
  // Order implementation
}
```

Key properties:
- `orderId`: Unique identifier
- `customerId`: Reference to the customer making the order
- `items`: Collection of ordered items
- `status`: Current state of the order
- `shippingAddress`: Where to deliver the order
- `billingAddress`: Where to send the invoice
- `createdAt`: When the order was created
- `updatedAt`: When the order was last modified

Key methods:
- `addItem()`: Add a product to the order
- `removeItem()`: Remove a product from the order
- `calculateTotal()`: Calculate the total cost of the order
- `confirmPayment()`: Mark the order as paid
- `fulfill()`: Mark the order as fulfilled
- `cancel()`: Cancel the order

### Value Objects

#### OrderItem

Represents a line item in an order.

```typescript
class OrderItem extends ValueObject<OrderItemProps> {
  // OrderItem implementation
}
```

Properties:
- `productId`: Reference to the product
- `name`: Product name
- `price`: Price of the product
- `quantity`: Number of units ordered
- `sku`: Stock keeping unit
- `imageUrl`: Optional image reference

Methods:
- `updateQuantity()`: Change the quantity
- `calculateTotal()`: Calculate the total cost for this item

#### OrderStatus

Enum representing the different states of an order.

```typescript
enum OrderStatus {
  Created = 'CREATED',
  Paid = 'PAID',
  Processing = 'PROCESSING',
  Fulfilled = 'FULFILLED',
  Shipped = 'SHIPPED',
  Delivered = 'DELIVERED',
  Cancelled = 'CANCELLED',
  Refunded = 'REFUNDED'
}
```

Helper functions:
- `isTerminalStatus()`: Checks if a status is terminal (no further changes expected)
- `getNextStatus()`: Determines the next logical status in the workflow

### Domain Events

#### OrderCreated

Event triggered when a new order is created.

```typescript
class OrderCreated extends DomainEvent {
  // OrderCreated implementation
}
```

## Business Rules

1. An order must be associated with a valid customer
2. An order must have at least one item
3. Order items must have positive quantities
4. Item prices cannot be negative
5. Order status transitions must follow the defined workflow
6. Only orders in specific states can be cancelled:
   - Created
   - Paid
   - Processing
7. Payment confirmation is only valid for orders in the Created state
8. Fulfillment is only valid for orders in the Paid state

## Integration Points

- **Customer Bounded Context**: Orders reference customers by ID
- **Catalog Bounded Context**: Order items reference products by ID
- **Payment Bounded Context**: Payment confirmation affects order status
- **Subscription Bounded Context**: Subscriptions generate recurring orders

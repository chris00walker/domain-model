# Order Management Context Glossary

Generated: 2025-07-21T12:19:38-03:00

## Purpose

This glossary defines terms specific to the Order Management bounded context, focusing on order lifecycle, fulfillment coordination, and customer order experiences.

## Context Overview

- **Business Purpose**: Manage complete order lifecycle from cart to fulfillment

- **Core Responsibility**: Order processing, validation, and fulfillment coordination

- **Key Metrics**: Order success rate ≥99%, Processing time <2 hours, Fulfillment accuracy ≥98%

- **Integration Points**: Customer Management, Inventory Management, Payment & Billing, Shipping & Fulfillment

## Aggregates

### Order

- **Definition**: Central aggregate representing a customer's purchase request with all associated items and fulfillment requirements

- **Implementation**: `Order` class extends AggregateRoot

- **Properties**:

  - **orderId**: Unique order identifier

  - **customerId**: Reference to ordering customer

  - **orderItems**: Collection of ordered products with quantities

  - **orderStatus**: Current lifecycle status

  - **shippingAddress**: Delivery destination

  - **billingAddress**: Payment address

  - **orderTotal**: Total order value including taxes and fees

  - **placedAt**: Order creation timestamp

  - **expectedDeliveryDate**: Estimated delivery date

- **Responsibilities**:

  - Order lifecycle management (placed → confirmed → fulfilled → delivered)

  - Item quantity and availability validation

  - Total calculation including taxes, fees, and discounts

  - Shipping and delivery coordination

  - Order modification and cancellation handling

- **Business Rules**:

  - Orders cannot be modified after confirmation

  - Cancellation allowed only before fulfillment starts

  - All items must be available before confirmation

  - Total must match sum of items plus applicable fees

- **Related Terms**: OrderId, OrderStatus, OrderItem, OrderTotal

### Cart

- **Definition**: Pre-order aggregate representing customer's intended purchases before checkout

- **Implementation**: `Cart` class extends AggregateRoot

- **Properties**:

  - **cartId**: Unique cart identifier

  - **customerId**: Cart owner (optional for guest carts)

  - **cartItems**: Collection of products with quantities

  - **createdAt**: Cart creation timestamp

  - **lastModifiedAt**: Last update timestamp

  - **expiresAt**: Cart expiration time

- **Responsibilities**:

  - Item collection and quantity management

  - Price calculation and updates

  - Cart persistence across sessions

  - Conversion to order at checkout

- **Business Rules**:

  - Guest carts expire after 24 hours

  - Registered user carts persist for 30 days

  - Items automatically removed if unavailable

  - Price updates reflected in real-time

- **Related Terms**: CartId, CartItem, CartExpiration, GuestCart

## Value Objects

### OrderId

- **Definition**: Unique identifier for orders across all EFI systems

- **Implementation**: `OrderId` value object

- **Format**: Human-readable format (e.g., "EFI-2025-001234")

- **Generation**: Sequential with year prefix for easy reference

- **Usage**: Customer communication, tracking, and internal references

- **Business Rules**:

  - Globally unique across all order types

  - Immutable once assigned

  - Human-readable for customer service

- **Related Terms**: Order, UniqueEntityID

### OrderStatus

- **Definition**: Current state of order in its lifecycle

- **Implementation**: `OrderStatus` enum

- **States**:

  - **PENDING**: Order created, awaiting payment confirmation

  - **CONFIRMED**: Payment confirmed, ready for fulfillment

  - **PROCESSING**: Items being picked and prepared

  - **SHIPPED**: Order dispatched for delivery

  - **DELIVERED**: Successfully delivered to customer

  - **CANCELLED**: Order cancelled before fulfillment

  - **RETURNED**: Order returned after delivery

- **State Transitions**:

  - PENDING → CONFIRMED (payment successful)

  - CONFIRMED → PROCESSING (fulfillment started)

  - PROCESSING → SHIPPED (items dispatched)

  - SHIPPED → DELIVERED (delivery confirmed)

  - Any state → CANCELLED (before shipping)

  - DELIVERED → RETURNED (return processed)

- **Business Rules**:

  - Status changes trigger domain events

  - Some transitions are irreversible

  - Status determines available actions

- **Related Terms**: OrderStatusChanged, OrderLifecycle

### OrderItem

- **Definition**: Individual product within an order with quantity and pricing information

- **Implementation**: `OrderItem` value object

- **Properties**:

  - **productId**: Reference to ordered product

  - **productName**: Product name at time of order

  - **quantity**: Ordered quantity

  - **unitPrice**: Price per unit at time of order

  - **totalPrice**: Quantity × unit price

  - **specialInstructions**: Customer notes for this item

- **Business Rules**:

  - Quantity must be positive integer

  - Prices captured at order time (immutable)

  - Product information frozen for order history

  - Special instructions limited to 500 characters

- **Related Terms**: Product, Quantity, UnitPrice, SpecialInstructions

### OrderTotal

- **Definition**: Complete financial breakdown of order cost

- **Implementation**: `OrderTotal` value object

- **Components**:

  - **subtotal**: Sum of all item prices

  - **taxAmount**: Applicable taxes (VAT, etc.)

  - **shippingFee**: Delivery charges

  - **handlingFee**: Processing charges

  - **discountAmount**: Applied discounts/coupons

  - **totalAmount**: Final amount to be charged

- **Calculation Rules**:

  - Subtotal = sum of (quantity × unit price) for all items

  - Tax calculated based on customer location and product type

  - Shipping fee based on weight, distance, and delivery speed

  - Total = subtotal + tax + shipping + handling - discounts

- **Business Rules**:

  - All amounts in BBD (Barbados Dollar)

  - Calculations rounded to 2 decimal places

  - Negative totals not allowed

- **Related Terms**: Money, TaxCalculation, ShippingFee, Discount

### DeliveryWindow

- **Definition**: Time range when customer expects to receive their order

- **Implementation**: `DeliveryWindow` value object

- **Properties**:

  - **startTime**: Earliest delivery time

  - **endTime**: Latest delivery time

  - **deliveryDate**: Target delivery date

  - **timeZone**: Delivery location timezone

- **Business Rules**:

  - Window must be at least 2 hours wide

  - Cannot be in the past

  - Must align with delivery service availability

  - Customer can modify until order ships

- **Related Terms**: DeliveryDate, TimeSlot, DeliverySchedule

## Domain Services

### OrderValidationService

- **Definition**: Service ensuring order integrity and business rule compliance

- **Implementation**: `OrderValidationService` domain service

- **Responsibilities**:

  - Product availability verification

  - Customer eligibility validation

  - Address and delivery zone verification

  - Order total calculation validation

- **Validation Rules**:

  - All items must be in stock

  - Customer must have valid payment method

  - Delivery address must be in service area

  - Order total must meet minimum requirements

- **Related Terms**: ProductAvailability, CustomerEligibility, DeliveryZone

### OrderPricingService

- **Definition**: Service managing order pricing, taxes, and fee calculations

- **Implementation**: `OrderPricingService` domain service

- **Responsibilities**:

  - Real-time price calculation

  - Tax computation based on location

  - Shipping fee calculation

  - Discount and coupon application

- **Pricing Rules**:

  - Prices include VAT for Barbados customers

  - Volume discounts for bulk orders

  - Free shipping over minimum threshold

  - Dynamic pricing based on demand

- **Related Terms**: PriceCalculation, TaxCalculation, VolumeDiscount

### OrderFulfillmentCoordinator

- **Definition**: Service coordinating order fulfillment across multiple systems

- **Implementation**: `OrderFulfillmentCoordinator` domain service

- **Responsibilities**:

  - Inventory reservation and allocation

  - Picking list generation

  - Shipping method selection

  - Delivery scheduling coordination

- **Coordination Rules**:

  - Reserve inventory immediately upon confirmation

  - Optimize picking routes for efficiency

  - Select shipping method based on urgency and cost

  - Schedule delivery within customer's preferred window

- **Related Terms**: InventoryReservation, PickingList, ShippingMethod

## Domain Events

### OrderPlaced

- **Definition**: Published when customer successfully places an order

- **Implementation**: `OrderPlaced` extends DomainEvent

- **Payload**: Order ID, customer ID, order items, total amount, timestamp

- **Consumers**: Payment & Billing, Inventory Management, Analytics, Notifications

- **Business Impact**: Triggers payment processing, inventory reservation, customer notifications

### OrderConfirmed

- **Definition**: Published when order payment is confirmed and order moves to fulfillment

- **Implementation**: `OrderConfirmed` extends DomainEvent

- **Payload**: Order ID, customer ID, confirmed items, delivery details, timestamp

- **Consumers**: Inventory Management, Shipping & Fulfillment, Customer Notifications

- **Business Impact**: Starts fulfillment process, updates inventory, notifies customer

### OrderStatusChanged

- **Definition**: Published when order status transitions to new state

- **Implementation**: `OrderStatusChanged` extends DomainEvent

- **Payload**: Order ID, previous status, new status, change reason, timestamp

- **Consumers**: Customer Notifications, Analytics, Customer Service, Shipping

- **Business Impact**: Triggers status-specific workflows, customer communications

### OrderCancelled

- **Definition**: Published when order is cancelled before fulfillment

- **Implementation**: `OrderCancelled` extends DomainEvent

- **Payload**: Order ID, customer ID, cancellation reason, refund amount, timestamp

- **Consumers**: Payment & Billing, Inventory Management, Customer Notifications

- **Business Impact**: Triggers refund processing, inventory release, customer communication

### OrderItemAdded

- **Definition**: Published when item is added to cart or order (before confirmation)

- **Implementation**: `OrderItemAdded` extends DomainEvent

- **Payload**: Cart/Order ID, product ID, quantity, customer ID, timestamp

- **Consumers**: Product Catalog, Analytics, Recommendation Engine

- **Business Impact**: Updates product popularity, triggers recommendations

### OrderDelivered

- **Definition**: Published when order is successfully delivered to customer

- **Implementation**: `OrderDelivered` extends DomainEvent

- **Payload**: Order ID, delivery address, delivery timestamp, delivery confirmation

- **Consumers**: Customer Notifications, Analytics, Customer Service, Reviews

- **Business Impact**: Completes order lifecycle, triggers review requests, updates metrics

## Repository Interfaces

### IOrderRepository

- **Definition**: Persistence contract for order aggregates

- **Implementation**: `IOrderRepository` interface

- **Standard Operations**:

  - `findById(id: OrderId): Promise<Order | null>`

  - `save(order: Order): Promise<void>`

  - `findByCustomerId(customerId: CustomerId): Promise<Order[]>`

- **Specialized Queries**:

  - `findByStatus(status: OrderStatus): Promise<Order[]>`

  - `findByDateRange(start: Date, end: Date): Promise<Order[]>`

  - `findPendingOrders(): Promise<Order[]>`

  - `findOrdersForFulfillment(): Promise<Order[]>`

- **Business Rules**: All operations return Result pattern for error handling

### ICartRepository

- **Definition**: Persistence contract for cart aggregates

- **Implementation**: `ICartRepository` interface

- **Standard Operations**:

  - `findById(id: CartId): Promise<Cart | null>`

  - `save(cart: Cart): Promise<void>`

  - `findByCustomerId(customerId: CustomerId): Promise<Cart | null>`

- **Specialized Queries**:

  - `findExpiredCarts(): Promise<Cart[]>`

  - `findAbandonedCarts(hours: number): Promise<Cart[]>`

  - `findGuestCarts(): Promise<Cart[]>`

- **Business Rules**: Support both persistent and session-based storage

## Business Rules & Constraints

### Order Placement Rules

1. **Minimum Order Value**: $25 BBD for delivery orders

2. **Product Availability**: All items must be in stock at confirmation

3. **Customer Verification**: Email verification required for first-time customers

4. **Address Validation**: Delivery address must be in service area

5. **Payment Method**: Valid payment method required before confirmation

### Order Modification Rules

1. **Modification Window**: Changes allowed only before order confirmation

2. **Item Changes**: Add/remove items, modify quantities

3. **Address Changes**: Shipping address can be updated before fulfillment

4. **Cancellation**: Free cancellation before fulfillment starts

5. **Post-Confirmation**: No modifications after payment confirmation

### Fulfillment Rules

1. **Processing Time**: Orders confirmed before 2 PM ship same day

2. **Cold Chain**: Perishable items require refrigerated transport

3. **Fragile Handling**: Special packaging for fragile items

4. **Delivery Windows**: 2-hour delivery windows during business hours

5. **Delivery Attempts**: Maximum 3 delivery attempts before return

### Pricing Rules

1. **Price Lock**: Prices locked at cart creation for 30 minutes

2. **Tax Calculation**: VAT applied based on customer location

3. **Shipping Fees**: Based on weight, distance, and delivery speed

4. **Volume Discounts**: Automatic application for qualifying orders

5. **Currency**: All prices in BBD (Barbados Dollar)

## Integration Patterns

### Inbound Events (Consumed)

- **CustomerRegistered** (Customer Management) → Enable order placement

- **PaymentProcessed** (Payment & Billing) → Confirm order and start fulfillment

- **InventoryUpdated** (Inventory Management) → Update product availability

- **ShipmentDispatched** (Shipping & Fulfillment) → Update order status to shipped

### Outbound Events (Published)

- **OrderPlaced** → Payment & Billing for payment processing

- **OrderConfirmed** → Inventory Management for stock allocation

- **OrderStatusChanged** → Customer Notifications for status updates

- **OrderDelivered** → Analytics for completion metrics

### Service Dependencies

- **Product Catalog Service**: Product information and availability

- **Customer Service**: Customer validation and preferences

- **Inventory Service**: Stock levels and reservations

- **Pricing Service**: Current prices and discounts

- **Tax Service**: Tax calculation based on location

- **Shipping Service**: Delivery options and costs

## Anti-Corruption Patterns

### External E-commerce Platform Integration

- **Shopify Order** → Internal `Order` aggregate with platform-specific metadata

- **WooCommerce Cart** → Internal `Cart` with WordPress user mapping

- **Magento Order Item** → Internal `OrderItem` with catalog synchronization

### Legacy Order System

- **Old Order Numbers** → New `OrderId` format with mapping table

- **Previous Status Codes** → New `OrderStatus` enum values

- **Historical Pricing** → Current pricing structure with legacy price preservation

### Payment Gateway Integration

- **Stripe Payment Intent** → Internal payment confirmation events

- **PayPal Transaction** → Internal payment processing workflow

- **Square Payment** → Internal order confirmation trigger

## Context Boundaries

### What's Inside This Context

- Order lifecycle management (placement to delivery)

- Cart management and checkout process

- Order validation and business rule enforcement

- Order pricing and total calculation

- Fulfillment coordination and status tracking

### What's Outside This Context

- Product catalog and inventory management

- Customer identity and profile management

- Payment processing and financial transactions

- Physical fulfillment and shipping operations

- Marketing campaigns and promotions

### Integration Points

- **Customer Management**: Customer validation and profile information

- **Product Catalog**: Product details, pricing, and availability

- **Inventory Management**: Stock levels and reservation

- **Payment & Billing**: Payment processing and confirmation

- **Shipping & Fulfillment**: Delivery scheduling and tracking

- **Analytics**: Order metrics and business intelligence

## Performance Considerations

### Scalability Patterns

- **Order Sharding**: Partition orders by date or customer segment

- **Cart Session Storage**: Use Redis for cart persistence

- **Event Sourcing**: Consider for order audit trail

- **CQRS**: Separate read/write models for order queries

### Caching Strategy

- **Product Availability**: Cache stock levels for cart validation

- **Pricing Data**: Cache prices and tax rates

- **Customer Data**: Cache customer preferences and addresses

- **Delivery Options**: Cache shipping methods and costs

This glossary ensures consistent terminology within the Order Management context while maintaining clear boundaries and integration patterns with other bounded contexts.

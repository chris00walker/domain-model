---
title: Shopping Cart Domain Knowledge
status: draft
owner: @domain-architecture-team
reviewers: @Product-team, @tech-lead
last_updated: 2025-06-10
---

# Shopping Cart Domain

## Table of Contents
- [Domain Overview](#domain-overview)
- [Strategic Importance](#strategic-importance)
- [Core Domain Concepts](#core-domain-concepts)
- [Business Rules](#business-rules)
- [Domain Events](#domain-events)

<!-- GAP_IMPLEMENTED: Dedicated Cart Context -->
<!-- stub for "Dedicated Cart Context" gap in the shopping-cart context -->

## Domain Overview

The Shopping Cart domain is responsible for managing the temporary storage and manipulation of products that customers intend to purchase from Elias Food Imports. This domain handles the pre-[[Order]] phase of the [[Customer]] journey, allowing customers to collect products, modify quantities, apply promotional codes, and initiate the checkout process. The Shopping Cart domain serves as a critical bridge between [[Product]] browsing and [[Order]] creation, enabling a seamless transition from [[Product]] selection to purchase commitment.

Currently, cart functionality is embedded within the [[Order]] context rather than existing as a separate bounded context, which has been identified as a significant gap in the domain model. This document outlines the proposed implementation of a dedicated Shopping Cart context to address this gap.

## Strategic Importance

**Classification**: Supporting Domain

**Justification**: While the Shopping Cart domain is essential to the [[Customer]] experience and directly impacts conversion rates, it primarily serves to facilitate the core [[Order]] domain by preparing the necessary data for [[Order]] creation. It is a well-understood pattern in e-commerce systems with established solutions, making it a supporting domain rather than a core differentiator for Elias Food Imports.

## Core Domain Concepts

### Shopping Cart
A temporary container that holds products a [[Customer]] is considering for purchase, including quantities, customizations, and [[Pricing]] information.

### Cart Item
An individual [[Product]] entry within a shopping cart, containing [[Product]] details, quantity, [[Pricing]], and customization information.

### Cart Session
A time-bound interaction period during which a [[Customer]] adds and modifies items in their cart, typically associated with a browser session or user account.

### Abandoned Cart
A shopping cart that contains items but has not been converted to an [[Order]] within a defined timeframe, representing a potential recovery opportunity.

### [[Inventory]] Reservation
A temporary hold placed on [[Inventory]] items when they are added to a cart, ensuring availability during the shopping session.

### Cart Recovery
The process of re-engaging customers who have abandoned their carts, typically through notifications or incentives.

### Guest Cart
A shopping cart associated with a non-authenticated user, which may later be transferred to a registered user account.

### Cart Merger
The process of combining items from a guest cart with an existing cart when a user logs in.

## Business Rules

This section outlines the business rules governing the Shopping Cart domain. These rules ensure data integrity, enforce business policies, and maintain consistency across the system.

<!-- GAP_IMPLEMENTED: Cart Reservation System -->
<!-- stub for "Cart Reservation System" gap in the shopping-cart context -->

### 1. Cart Creation and Management

These rules govern the lifecycle of a shopping cart, from creation to expiration.

1. A shopping cart is automatically created when a [[Customer]] adds their first [[Product]].
2. Each cart must be associated with either a registered user or a guest session.
3. Cart sessions expire after 72 hours of inactivity for guest users.
4. Registered users' carts persist indefinitely until checkout or explicit removal.
5. A user can have only one active cart at a time.
6. When a guest user logs in, their cart items must be merged with any existing cart for that user.
7. Maximum number of unique products in a cart is limited to 50 items.

### 2. Cart Items and [[Inventory]]

Rules for managing [[Product]] items within the cart and their relationship with [[Inventory]].

1. Adding an item to the cart must check [[Product]] availability before confirming addition.
2. Items added to the cart create a temporary [[Inventory]] reservation for 30 minutes.
3. [[Inventory]] reservations are automatically extended during active cart sessions.
4. If a [[Product]] becomes unavailable while in the cart, the [[Customer]] must be notified.
5. For perishable products, estimated shelf life information must be displayed in the cart.
6. Products with special handling requirements (refrigeration, fragile) must be flagged in the cart.
7. Cart items requiring [[Authentication]] must display verification status.

### 3. [[Pricing]] and Promotions

Rules related to [[Pricing]] calculations and promotional offers in the cart context.

1. [[Product]] prices in the cart reflect the price at the time of addition.
2. Price changes during the session must be highlighted to the [[Customer]].
3. Promotional codes can be applied to the entire cart or specific eligible items.
4. Multiple promotions can be applied if they don't conflict with each other.
5. The system must automatically apply the most advantageous combination of promotions.
6. Volume discounts must be automatically calculated based on quantity.
7. Currency conversion rates for international customers must be updated in real-time.
8. B2B customers may see different [[Pricing]] based on their organization tier.

### 4. Cart Interactions

Rules governing user interactions with the cart and its contents.

1. Quantity changes must validate against [[Inventory]] and maximum [[Order]] constraints.
2. Removing an item releases its [[Inventory]] reservation.
3. Customers can save items for later, moving them from the active cart to a wishlist.
4. The cart must recalculate totals after any modification.
5. Estimated shipping costs and delivery dates must be displayed based on cart contents.
6. Tax calculations must be performed based on shipping destination and [[Product]] categories.
7. For international orders, customs and import fees estimates must be provided.

### 5. Abandoned Cart Recovery

Rules for identifying and managing abandoned shopping carts.

1. Carts are considered abandoned after 4 hours of inactivity with items present.
2. Abandoned cart recovery emails can be sent at 4, 24, and 48-hour intervals.
3. Recovery incentives (discounts, free shipping) can be offered based on cart value.
4. Abandoned cart analytics must track recovery rate and effectiveness of incentives.
5. Registered users' abandoned carts must be visible when they log in again.
6. Abandoned cart recovery must respect [[Customer]] communication preferences.

### 6. Checkout Process

Rules that apply when a [[Customer]] initiates the checkout process.

1. Initiating checkout must verify all items are still available.
2. [[Inventory]] reservations are extended during the checkout process.
3. Cart contents are locked during checkout to prevent concurrent modifications.
4. Failed checkout attempts must return the [[Customer]] to an editable cart state.
5. Successful checkout converts the cart to an [[Order]] and releases the cart session.
6. After checkout, the cart data must be preserved for analytics but marked as converted.

## Domain Events

| Event | Trigger | Key Data | Consumer Contexts |
|-------|---------|----------|-------------------|
| CartCreated | New cart is created | cartId, customerId, sessionId | Analytics, [[Customer]] |
| CartItemAdded | [[Product]] added to cart | cartId, productId, quantity | [[Inventory]], Analytics, Marketing, [[Catalog]] |
| CartItemRemoved | [[Product]] removed from cart | cartId, productId, quantity | [[Inventory]], Analytics, Marketing |
| CartItemQuantityChanged | Item quantity updated | cartId, productId, old/new quantity | [[Inventory]], Analytics |
| CartAbandoned | Cart inactive beyond threshold | cartId, customerId, totalValue | Marketing, Analytics, [[Inventory]] |
| CartRecovered | Activity on abandoned cart | cartId, recoverySource | Marketing, Analytics, [[Customer]] |
| CartCheckoutStarted | Checkout process begins | cartId, totalValue, itemCount | [[Order]], [[Payment]], Analytics |
| CartCheckoutCompleted | Checkout successfully completes | cartId, orderId, totalValue | [[Order]], [[Inventory]], Analytics, [[Customer]] |

### Event Details

### CartCreated

**Description**: Triggered when a new shopping cart is created for a [[Customer]].

**Payload**:
```typescript
interface CartCreatedEvent {
  cartId: string;
  customerId?: string; // Optional, may be null for guest carts
  sessionId: string;
  createdAt: Date;
  source: CartCreationSource; // WEB, MOBILE_APP, KIOSK, etc.
}
```

**Producer Context**: Shopping Cart

**Consumer Contexts**:
- **Analytics**: To track cart creation metrics
- **[[Customer]]**: To associate cart with [[Customer]] profile

### CartItemAdded

**Description**: Triggered when a [[Product]] is added to a shopping cart.

**Payload**:
```typescript
interface CartItemAddedEvent {
  cartId: string;
  cartItemId: string;
  productId: string;
  quantity: number;
  unitPrice: Money;
  customizations?: ProductCustomization[];
  addedAt: Date;
}
```

**Producer Context**: Shopping Cart

**Consumer Contexts**:
- **[[Inventory]]**: To create temporary [[Inventory]] reservation
- **Analytics**: To track [[Product]] interest and cart addition metrics
- **Marketing**: To inform personalization engines
- **[[Catalog]]**: To update [[Product]] popularity metrics

### CartItemRemoved

**Description**: Triggered when a [[Product]] is removed from a shopping cart.

**Payload**:
```typescript
interface CartItemRemovedEvent {
  cartId: string;
  cartItemId: string;
  productId: string;
  quantity: number;
  removedAt: Date;
  reason?: CartItemRemovalReason; // USER_ACTION, INVENTORY_UNAVAILABLE, SESSION_EXPIRED, etc.
}
```

**Producer Context**: Shopping Cart

**Consumer Contexts**:
- **[[Inventory]]**: To release temporary [[Inventory]] reservation
- **Analytics**: To track cart removal patterns
- **Marketing**: To inform abandonment recovery systems

### CartItemQuantityChanged

**Description**: Triggered when the quantity of a [[Product]] in the cart is modified.

**Payload**:
```typescript
interface CartItemQuantityChangedEvent {
  cartId: string;
  cartItemId: string;
  productId: string;
  oldQuantity: number;
  newQuantity: number;
  changedAt: Date;
}
```

**Producer Context**: Shopping Cart

**Consumer Contexts**:
- **[[Inventory]]**: To adjust temporary [[Inventory]] reservation
- **Analytics**: To track quantity change patterns

### CartAbandoned

**Description**: Triggered when a cart with items has been inactive for a defined period.

**Payload**:
```typescript
interface CartAbandonedEvent {
  cartId: string;
  customerId?: string;
  sessionId: string;
  totalValue: Money;
  itemCount: number;
  abandonedAt: Date;
  lastActivityAt: Date;
  cartItems: Array<{
    productId: string;
    quantity: number;
    unitPrice: Money;
  }>;
}
```

**Producer Context**: Shopping Cart

**Consumer Contexts**:
- **Marketing**: To trigger abandoned cart recovery workflows
- **Analytics**: To track abandonment metrics
- **[[Inventory]]**: To manage reservation expirations

### CartRecovered

**Description**: Triggered when a previously abandoned cart shows new activity.

**Payload**:
```typescript
interface CartRecoveredEvent {
  cartId: string;
  customerId?: string;
  recoveredAt: Date;
  previouslyAbandonedAt: Date;
  recoverySource: RecoverySource; // EMAIL, NOTIFICATION, DIRECT_RETURN, etc.
  recoveryPromotionId?: string;
}
```

**Producer Context**: Shopping Cart

**Consumer Contexts**:
- **Marketing**: To track recovery campaign effectiveness
- **Analytics**: To update abandonment metrics
- **[[Customer]]**: To update [[Customer]] engagement metrics

### CartCheckoutStarted

**Description**: Triggered when a [[Customer]] initiates the checkout process.

**Payload**:
```typescript
interface CartCheckoutStartedEvent {
  cartId: string;
  customerId?: string;
  sessionId: string;
  totalValue: Money;
  itemCount: number;
  startedAt: Date;
  estimatedShippingCost: Money;
  estimatedTax: Money;
  appliedPromotions: PromotionApplication[];
}
```

**Producer Context**: Shopping Cart

**Consumer Contexts**:
- **[[Order]]**: To prepare for [[Order]] creation
- **[[Payment]]**: To initialize [[Payment]] options
- **Analytics**: To track checkout initiation metrics

### CartCheckoutCompleted

**Description**: Triggered when a checkout process successfully completes, converting the cart to an [[Order]].

**Payload**:
```typescript
interface CartCheckoutCompletedEvent {
  cartId: string;
  orderId: string;
  customerId?: string;
  sessionId: string;
  completedAt: Date;
  totalValue: Money;
  paymentMethodType: PaymentMethodType;
}
```

**Producer Context**: Shopping Cart

**Consumer Contexts**:
- **[[Order]]**: To create a new [[Order]]
- **[[Inventory]]**: To convert temporary reservations to [[Order]] allocations
- **Analytics**: To track conversion metrics
- **[[Customer]]**: To update purchase history

## Value Objects

### CartId
- **Type**: String (UUID)
- **Invariants**: Must be a valid UUID v4
- **Description**: Unique identifier for a shopping cart instance

### SessionId
- **Type**: String (UUID)
- **Invariants**: Must be a valid UUID v4
- **Description**: Tracks the user's session across requests

### Money
- **Type**: Value Object
- **Attributes**: 
  - amount: number (positive, with 2 decimal places)
  - currency: string (ISO 4217 currency code)
- **Methods**: 
  - add(other: Money): Money
  - multiply(factor: number): Money
  - format(): string

### ProductCustomization
- **Type**: Value Object
- **Attributes**:
  - optionId: string
  - optionName: string
  - selectedValue: string
  - additionalCost: Money

## Aggregates and Entities

### ShoppingCart Aggregate

**Attributes**:

| Attribute | Type | Description |
|----------|------|-------------|
| id | CartId | Unique identifier for the shopping cart |
| customerId | CustomerId | Reference to the [[Customer]] who owns the cart (null for guest carts) |
| sessionId | SessionId | Identifier for the user's session |
| status | CartStatus | Current status of the cart (ACTIVE, ABANDONED, CHECKOUT, CONVERTED) |
| items | CartItem[] | Collection of products in the cart |
| createdAt | Date | Date and time when the cart was created |
| lastModifiedAt | Date | Date and time of the last cart modification |
| expiresAt | Date | Expiration time for guest carts |
| appliedPromotions | PromotionApplication[] | Promotions applied to the cart |
| subtotal | Money | Sum of all item prices before discounts |
| discountTotal | Money | Total discount amount from all applied promotions |
| taxTotal | Money | Total tax amount based on items and shipping location |
| shippingTotal | Money | Estimated shipping cost |
| grandTotal | Money | Final total including all items, discounts, taxes, and shipping |

**Invariants**:

1. Cart must have a valid identifier
2. Cart must be associated with either a [[Customer]] ID or session ID
3. Cart total must equal the sum of all item totals minus discounts plus taxes and shipping
4. Cart must not contain more than the maximum allowed number of unique products
5. Cart status transitions must follow the defined state machine

**Commands**:

| Command | Parameters | Description |
|---------|------------|-------------|
| AddItem | productId, quantity, customizations | Adds a [[Product]] to the cart |
| RemoveItem | cartItemId | Removes a [[Product]] from the cart |
| UpdateItemQuantity | cartItemId, newQuantity | Changes quantity of a [[Product]] |
| ApplyPromotion | promotionCode | Applies a promotion code to the cart |
| RemovePromotion | promotionId | Removes a promotion from the cart |
| MergeCart | sourceCartId | Merges items from another cart |
| StartCheckout | | Initiates the checkout process |
| AbandonCart | | Marks the cart as abandoned |
| RecoverCart | | Recovers an abandoned cart |
| ExpireCart | | Expires a cart and releases reservations |

**Methods**:

```typescript
class ShoppingCart {
  public constructor(id: CartId, sessionId: SessionId, customerId?: CustomerId) {
    // Implementation
  }

  public addItem([[Product]]: [[Product]], quantity: number, customizations?: ProductCustomization[]): void {
    // Validation logic
    // Check [[Inventory]] availability
    // Create [[Inventory]] reservation
    // Add item to cart
    // Recalculate totals
    // Emit CartItemAdded event
  }

  public removeItem(cartItemId: CartItemId): void {
    // Find item
    // Remove item
    // Release [[Inventory]] reservation
    // Recalculate totals
    // Emit CartItemRemoved event
  }

  public updateItemQuantity(cartItemId: CartItemId, newQuantity: number): void {
    // Find item
    // Validate quantity
    // Update [[Inventory]] reservation
    // Update item quantity
    // Recalculate totals
    // Emit CartItemQuantityChanged event
  }

  public applyPromotion(promotionCode: string): void {
    // Validate promotion
    // Apply promotion rules
    // Recalculate totals
    // Emit PromotionApplied event
  }

  public startCheckout(): void {
    // Validate cart state
    // Lock cart for modifications
    // Extend [[Inventory]] reservations
    // Emit CartCheckoutStarted event
  }

  public completeCheckout(orderId: OrderId): void {
    // Update cart status
    // Associate with [[Order]]
    // Emit CartCheckoutCompleted event
  }

  public abandonCart(): void {
    // Update cart status
    // Emit CartAbandoned event
  }

  public recoverCart(): void {
    // Update cart status
    // Refresh [[Inventory]] reservations
    // Emit CartRecovered event
  }

  private recalculateTotals(): void {
    // Calculate subtotal from items
    // Apply promotion discounts
    // Calculate taxes
    // Calculate shipping
    // Update grand total
  }
}
```

### CartItem Entity

**Attributes**:

| Attribute | Type | Description |
|----------|------|-------------|
| id | CartItemId | Unique identifier for the cart item |
| cartId | CartId | Reference to the parent cart |
| productId | ProductId | Reference to the [[Product]] |
| quantity | number | Quantity of the [[Product]] |
| unitPrice | Money | Price per unit at time of addition |
| totalPrice | Money | Price × quantity |
| customizations | ProductCustomization[] | [[Product]] customizations |
| addedAt | Date | Date and time when the item was added |
| lastModifiedAt | Date | Date and time of the last modification |
| inventoryReservationId | string | Reference to temporary [[Inventory]] reservation |

**Invariants**:

1. Quantity must be greater than zero
2. Total price must equal quantity × unit price
3. [[Product]] must be available in the [[Catalog]]

**Methods**:

```typescript
class CartItem {
  public constructor(cartId: CartId, [[Product]]: [[Product]], quantity: number, customizations?: ProductCustomization[]) {
    // Validation and initialization
  }

  public updateQuantity(newQuantity: number): void {
    // Validate quantity
    // Update quantity
    // Recalculate total price
  }

  public updateCustomizations(customizations: ProductCustomization[]): void {
    // Update customizations
    // Update price if necessary
  }

  public refreshPrice(currentProductPrice: Money): void {
    // Update unit price to current price
    // Recalculate total price
  }
}
```

### Value Objects

#### CartId
```typescript
class CartId {
  private readonly id: string;
  
  constructor(id: string) {
    // Validation
    this.id = id;
  }
  
  public toString(): string {
    return this.id;
  }
}
```

#### CartItemId
```typescript
class CartItemId {
  private readonly id: string;
  
  constructor(id: string) {
    // Validation
    this.id = id;
  }
  
  public toString(): string {
    return this.id;
  }
}
```

#### SessionId
```typescript
class SessionId {
  private readonly id: string;
  
  constructor(id: string) {
    // Validation
    this.id = id;
  }
  
  public toString(): string {
    return this.id;
  }
}
```

#### CartStatus
```typescript
enum CartStatus {
  ACTIVE = 'ACTIVE',
  ABANDONED = 'ABANDONED',
  CHECKOUT = 'CHECKOUT',
  CONVERTED = 'CONVERTED',
  EXPIRED = 'EXPIRED'
}
```

#### PromotionApplication
```typescript
interface PromotionApplication {
  promotionId: string;
  promotionCode: string;
  promotionType: PromotionType;
  discountAmount: Money;
  appliedAt: Date;
  expiresAt?: Date;
}
```

#### ProductCustomization
```typescript
interface ProductCustomization {
  customizationType: string;
  options: string[];
  additionalPrice?: Money;
}
```

#### InventoryReservation
```typescript
interface InventoryReservation {
  reservationId: string;
  productId: string;
  quantity: number;
  expiresAt: Date;
}
```

## Domain Services

### CartManagementService

**Responsibilities**:
- Creating new shopping carts
- Retrieving existing carts by ID, [[Customer]] ID, or session ID
- Managing cart expiration and cleanup
- Handling cart merging when a guest user logs in
- Tracking and managing abandoned carts

**Methods**:
```typescript
interface CartManagementService {
  createCart(sessionId: string, customerId?: string): ShoppingCart;
  getCartById(cartId: string): ShoppingCart;
  getActiveCartByCustomerId(customerId: string): ShoppingCart;
  getActiveCartBySessionId(sessionId: string): ShoppingCart;
  mergeGuestCartIntoCustomerCart(guestCartId: string, customerCartId: string): ShoppingCart;
  identifyAbandonedCarts(inactivityThreshold: Duration): ShoppingCart[];
  expireInactiveCarts(expirationThreshold: Duration): number;
  cleanupConvertedCarts(retentionPeriod: Duration): number;
}
```

### InventoryReservationService

**Responsibilities**:
- Creating temporary [[Inventory]] reservations for cart items
- Extending reservations during active sessions
- Releasing reservations when items are removed or carts expire
- Converting reservations to [[Order]] allocations during checkout
- Handling [[Inventory]] conflicts when availability changes

**Methods**:
```typescript
interface InventoryReservationService {
  reserveInventory(productId: string, quantity: number, duration: Duration): InventoryReservation;
  extendReservation(reservationId: string, duration: Duration): boolean;
  releaseReservation(reservationId: string): void;
  convertReservationToOrderAllocation(reservationId: string, orderId: string): void;
  handleInventoryConflict(cartId: string, productId: string): void;
}
```

### CartPricingService

**Responsibilities**:
- Calculating cart item prices based on current [[Product]] [[Pricing]]
- Applying promotions and discounts to the cart
- Calculating taxes based on products and shipping location
- Estimating shipping costs based on cart contents and destination
- Handling currency conversion for international customers

**Methods**:
```typescript
interface CartPricingService {
  calculateItemPrice(productId: string, quantity: number, customizations?: ProductCustomization[]): Money;
  refreshCartPrices(cartId: string): void;
  applyPromotionToCart(cartId: string, promotionCode: string): PromotionApplication;
  removePromotionFromCart(cartId: string, promotionId: string): void;
  calculateTaxes(cartId: string, shippingAddressId?: string): Money;
  estimateShippingCost(cartId: string, shippingAddressId?: string): Money;
  convertCurrency(amount: Money, targetCurrency: Currency): Money;
}
```

### CartRecoveryService

**Responsibilities**:
- Identifying abandoned carts eligible for recovery
- Generating recovery incentives based on cart value and [[Customer]] history
- Tracking recovery attempts and success rates
- Managing recovery campaign scheduling

**Methods**:
```typescript
interface CartRecoveryService {
  identifyRecoverableCarts(thresholdDays: number): ShoppingCart[];
  generateRecoveryIncentive(cartId: string): Promotion;
  trackRecoveryAttempt(cartId: string, channelType: string): void;
  recordSuccessfulRecovery(cartId: string, recoverySource: RecoverySource): void;
  scheduleRecoveryAttempt(cartId: string, delayHours: number): void;
}
```

### CheckoutPreparationService

**Responsibilities**:
- Validating cart contents before checkout
- Locking cart for checkout process
- Preparing cart data for [[Order]] creation
- Handling checkout failures and retries
- Coordinating with [[Payment]] and [[Order]] services during checkout

**Methods**:
```typescript
interface CheckoutPreparationService {
  validateCartForCheckout(cartId: string): ValidationResult;
  lockCartForCheckout(cartId: string): boolean;
  prepareCartForOrderCreation(cartId: string): CheckoutData;
  handleCheckoutFailure(cartId: string, reason: string): void;
  completeCheckout(cartId: string, orderId: string): void;
}
```

## Administrative Capabilities

### Admin Application Services

#### CartConfigurationAdminService

**Responsibility**: Manages system-wide shopping cart configuration and policies

**Operations**:
- Configure cart expiration timeframes and policies
- Define [[Inventory]] reservation rules and durations
- Set cart item limits and validation rules
- Configure cart merger strategies and rules
- Manage cart-related feature flags and system parameters

**Authorization**: Requires `cart:config:manage` permission

#### CartOperationsAdminService

**Responsibility**: Provides administrative control over shopping cart operations

**Operations**:
- View and search [[Customer]] carts across the system
- Manually extend cart expiration for specific customers
- Override [[Inventory]] reservation constraints when necessary
- Force-release [[Inventory]] reservations in exceptional cases
- Assist customers with cart recovery and troubleshooting

**Authorization**: Requires `cart:operations:manage` permission

#### CartPromotionAdminService

**Responsibility**: Manages the application of promotions and discounts to shopping carts

**Operations**:
- Override promotion code validation rules
- Apply manual discounts to [[Customer]] carts
- Configure promotion stacking and priority rules
- Manage promotion application constraints
- Generate one-time use promotion codes for [[Customer]] service

**Authorization**: Requires `cart:promotion:manage` permission

### Admin Read Models

#### CartAnalyticsDashboardModel

**Purpose**: Provides insights into shopping cart metrics and [[Customer]] behavior

**Key Metrics**:
- Cart creation and conversion rates
- Average cart value and item count
- Cart abandonment rates and patterns
- Promotion usage and effectiveness
- Cart session duration and interaction metrics

#### CartPerformanceDashboardModel

**Purpose**: Monitors the technical performance of the shopping cart system

**Key Metrics**:
- Cart operation response times
- [[Inventory]] reservation success rates
- Cart database query performance
- API endpoint usage and performance
- Error rates and types by operation

#### CartAnomalyDetectionDashboardModel

**Purpose**: Identifies unusual patterns or potential issues in shopping cart behavior

**Key Metrics**:
- Unusual cart abandonment patterns
- Suspicious promotion usage patterns
- [[Inventory]] reservation anomalies
- Cart session outliers
- Potential system abuse indicators

### Admin Domain Events

#### CartConfigurationModifiedByAdmin

**Payload**:
```json
{
  "eventId": "uuid",
  "timestamp": "ISO-8601 datetime",
  "adminUserId": "string",
  "configType": "string",
  "previousConfiguration": {
    "cartExpirationHours": "integer",
    "inventoryReservationMinutes": "integer",
    "maxCartItems": "integer",
    "maxQuantityPerItem": "integer",
    "guestCartEnabled": "boolean"
  },
  "newConfiguration": {
    "cartExpirationHours": "integer",
    "inventoryReservationMinutes": "integer",
    "maxCartItems": "integer",
    "maxQuantityPerItem": "integer",
    "guestCartEnabled": "boolean"
  },
  "reason": "string",
  "effectiveDate": "ISO-8601 datetime"
}
```

#### CartInventoryReservationOverriddenByAdmin

**Payload**:
```json
{
  "eventId": "uuid",
  "timestamp": "ISO-8601 datetime",
  "adminUserId": "string",
  "cartId": "string",
  "customerId": "string",
  "productId": "string",
  "quantity": "integer",
  "previousReservationStatus": "string",
  "newReservationStatus": "string",
  "overrideReason": "string",
  "expirationTime": "ISO-8601 datetime",
  "inventoryImpact": {
    "warehouseId": "string",
    "availableQuantityBefore": "integer",
    "availableQuantityAfter": "integer"
  }
}
```

#### CartPromotionManuallyAppliedByAdmin

**Payload**:
```json
{
  "eventId": "uuid",
  "timestamp": "ISO-8601 datetime",
  "adminUserId": "string",
  "cartId": "string",
  "customerId": "string",
  "promotionId": "string",
  "promotionCode": "string",
  "promotionType": "string",
  "discountAmount": {
    "value": "decimal",
    "currency": "string"
  },
  "originalCartTotal": {
    "value": "decimal",
    "currency": "string"
  },
  "newCartTotal": {
    "value": "decimal",
    "currency": "string"
  },
  "reason": "string",
  "customerServiceTicketId": "string",
  "expirationTime": "ISO-8601 datetime"
}
```

## Integration Points

### [[Catalog]] Context

**Integration Type**: Synchronous API Calls

**Purpose**:
- Retrieve [[Product]] information when items are added to the cart
- Validate [[Product]] availability and current [[Pricing]]
- Get [[Product]] attributes for display in the cart
- Retrieve [[Product]] images and descriptions

**Data Exchanged**:
- [[Product]] IDs, names, descriptions
- [[Product]] [[Pricing]] and discount information
- [[Product]] availability status
- [[Product]] attributes (size, weight, perishability, etc.)

**Integration Patterns**:
- Repository pattern for [[Product]] data access
- Caching of frequently accessed [[Product]] data
- Eventual consistency for [[Product]] updates

### [[Inventory]] Context

**Integration Type**: Synchronous API Calls + Event-Based

**Purpose**:
- Create temporary [[Inventory]] reservations when items are added to cart
- Extend or release reservations based on cart activity
- Convert reservations to [[Order]] allocations during checkout
- Handle [[Inventory]] conflicts when [[Product]] availability changes

**Data Exchanged**:
- [[Product]] IDs and quantities
- Reservation IDs and expiration times
- [[Inventory]] availability status
- Batch and expiration information for perishable items

**Integration Patterns**:
- Transactional outbox pattern for reliability
- Reservation time-to-live (TTL) management
- Compensating transactions for failed reservations

### [[Customer]] Context

**Integration Type**: Synchronous API Calls + Event-Based

**Purpose**:
- Associate carts with [[Customer]] profiles
- Retrieve [[Customer]] preferences and settings
- Access shipping addresses for cost estimation
- Merge guest carts with [[Customer]] carts upon login
- Track [[Customer]] cart behavior for personalization

**Data Exchanged**:
- [[Customer]] IDs and session IDs
- [[Customer]] preferences and settings
- Shipping address information
- [[Customer]] segment information

**Integration Patterns**:
- [[Customer]] identity resolution
- Event sourcing for [[Customer]] behavior tracking
- Anti-corruption layer for [[Customer]] data translation

### [[Order]] Context (Example Implementation)

**Integration Type**: Event-Based

**Purpose**:
- Convert carts to orders during checkout
- Transfer cart data to create new orders
- Handle [[Order]] creation failures

**Data Exchanged**:
- Complete cart contents and [[Pricing]]
- Applied promotions and discounts
- Shipping and tax estimates
- [[Customer]] information

**Integration Patterns**:
- Saga pattern for checkout process
- Domain events for state transitions
- Idempotent operations for reliability

### Marketing Context

**Integration Type**: Event-Based

**Purpose**:
- Apply and validate promotion codes
- Track cart activity for marketing analytics
- Trigger abandoned cart recovery workflows
- Personalize cart recommendations

**Data Exchanged**:
- Cart contents and [[Customer]] behavior
- Promotion codes and rules
- Abandonment status and recovery attempts
- Personalization data

**Integration Patterns**:
- Publish-subscribe for cart events
- Scheduled jobs for abandonment detection
- Analytics event streams

### [[Payment]] Context

**Integration Type**: Synchronous API Calls

**Purpose**:
- Retrieve available [[Payment]] methods during checkout
- Validate [[Payment]] method availability based on cart contents
- Calculate [[Payment]]-specific discounts (e.g., for specific credit cards)

**Data Exchanged**:
- Cart total and currency
- Available [[Payment]] methods
- [[Payment]]-specific promotions

**Integration Patterns**:
- Facade pattern for [[Payment]] gateway abstraction
- Strategy pattern for different [[Payment]] methods

### Analytics Context

**Integration Type**: Event-Based

**Purpose**:
- Track cart creation, modification, and conversion metrics
- Monitor abandonment rates and recovery effectiveness
- Analyze [[Product]] popularity and cart composition
- Measure promotion effectiveness

**Data Exchanged**:
- Cart events and timestamps
- Cart contents and values
- [[Customer]] segments and behaviors
- Conversion and abandonment metrics

**Integration Patterns**:
- Event streaming for real-time analytics
- Data lake integration for historical analysis
- Aggregated metrics publication

## Implementation Guidelines

This section provides technical guidance for implementing the Shopping Cart domain while adhering to the established architecture and design principles.

### Architecture

#### 1. Microservices Design
- **Bounded Context**: Implement the Shopping Cart as a dedicated microservice with clearly defined boundaries
- **Database Per Service**: Use a dedicated database schema or collection for cart data
- **API Gateway**: Expose cart functionality through a well-defined API gateway

#### 2. Data Management
- **Redis Caching**: Use Redis for high-performance cart storage with TTL-based expiration
- **Event Sourcing**: Consider event sourcing for audit trails and cart history
- **Data Partitioning**: Implement sharding by [[Customer]] ID for horizontal scaling

#### 3. Performance Optimization
- **Lazy Loading**: Load cart details on-demand to improve initial load times
- **Bulk Operations**: Support batch operations for cart updates
- **Caching Strategy**: Implement multi-level caching with appropriate TTLs

### Security

#### 1. [[Authentication]] & Authorization
- **JWT Tokens**: Use stateless [[Authentication]] with short-lived tokens
- **Role-Based Access**: Implement fine-grained access control for cart operations
- **CSRF Protection**: Protect against cross-site request forgery attacks

#### 2. Data Protection
- **PII Encryption**: Encrypt personally identifiable information at rest and in transit
- **Input Validation**: Validate all input data to prevent injection attacks
- **Rate Limiting**: Implement request throttling to prevent abuse

### Integration Patterns

#### 1. Synchronous Communication
- **REST/GraphQL**: Use for real-time operations where immediate feedback is required
- **gRPC**: Consider for performance-critical internal service communication

#### 2. Asynchronous Communication
- **Event-Driven Architecture**: Use domain events for eventual consistency
- **Message Brokers**: Implement using Kafka or RabbitMQ for reliable event delivery
- **Saga Pattern**: Use for managing distributed transactions across services

### Monitoring & Observability

#### 1. Logging
- **Structured Logging**: Use JSON-formatted logs with consistent field names
- **Correlation IDs**: Include request correlation for distributed tracing
- **Log Levels**: Implement appropriate log levels (DEBUG, INFO, WARN, ERROR)

#### 2. Metrics
- **Key Performance Indicators**:
  - Cart creation/abandonment rates
  - Average items per cart
  - Checkout conversion rates
  - API response times
- **Monitoring**: Set up alerts for abnormal patterns

### Testing Strategy

#### 1. Unit Testing
- **Domain Logic**: Test all business rules and validations
- **Value Objects**: Ensure immutability and validation logic
- **Edge Cases**: Cover boundary conditions and error scenarios

#### 2. Integration Testing
- **Service Boundaries**: Test interactions with other bounded contexts
- **Database Operations**: Verify data consistency and transaction handling
- **External Services**: Mock external dependencies for reliable tests

#### 3. Performance Testing
- **Load Testing**: Simulate peak traffic conditions
- **Stress Testing**: Identify breaking points and resource constraints
- **Endurance Testing**: Verify system stability under sustained load

### Deployment Strategy

#### 1. CI/CD Pipeline
- **Automated Testing**: Run all tests on every commit
- **Blue/Green Deployments**: Enable zero-downtime deployments
- **Feature Flags**: Support gradual feature rollouts

#### 2. Scalability
- **Horizontal Scaling**: Design for stateless services
- **Database Scaling**: Implement read replicas and connection pooling
- **Caching**: Use distributed caches to reduce database load

### Future Considerations

#### 1. Scalability Enhancements
- **Sharding Strategy**: Plan for data partitioning at scale
- **CQRS Optimization**: Separate read and write models for complex queries
- **Event Sourcing**: Consider for comprehensive audit trails

#### 2. Resilience Improvements
- **Circuit Breakers**: Prevent cascading failures
- **Retry Policies**: Implement exponential backoff for transient failures
- **Bulkhead Pattern**: Isolate failures to prevent system-wide impact

#### 3. Extensibility
- **Plugin Architecture**: Support for custom promotions and validators
- **Webhooks**: Allow external systems to subscribe to cart events
- **Custom Workflows**: Support for domain-specific cart behaviors

*   Cart creation and modification events
*   Checkout funnel metrics
*   Abandonment and recovery statistics

**Integration Methods**:

*   Asynchronous event streaming
*   Batch processing for historical data

3. **Scalability Considerations**
   - Design for horizontal scalability to handle traffic spikes
   - Implement distributed locking for concurrent cart modifications
   - Use read replicas for high-traffic periods
   - Consider regional deployment for global customers

4. **Caching Strategy**
   - Cache [[Product]] information to reduce [[Catalog]] service calls
   - Implement multi-level caching (local and distributed)
   - Use cache invalidation strategies for price and [[Inventory]] updates
   - Pre-calculate and cache shipping and tax estimates

### Technical Implementation

1. **API Design**
   - Implement RESTful APIs for cart operations
   - Use GraphQL for flexible cart data retrieval
   - Implement websockets for real-time cart updates
   - Version all APIs to support gradual client updates

2. **Event Schema**
   - Design event schemas with backward compatibility
   - Include correlation IDs for distributed tracing
   - Implement event versioning strategy
   - Document event contracts for consumers

3. **Security Measures**
   - Implement cart token validation to prevent unauthorized access
   - Encrypt sensitive cart data ([[Payment]] info, personal details)
   - Implement rate limiting for cart operations
   - Use CSRF protection for cart modifications

4. **Performance Optimization**
   - Batch database operations for cart updates
   - Implement lazy loading for cart details
   - Use optimistic concurrency control for cart modifications
   - Implement connection pooling for database access

### Food-Specific Considerations

1. **Perishable Item Handling**
   - Display estimated shelf life for perishable products in cart
   - Implement warnings for items with short shelf life
   - Track temperature requirements for cold chain products
   - Highlight special handling requirements

2. **Allergen Management**
   - Display allergen warnings based on [[Customer]] profile
   - Implement cross-contamination warnings for certain combinations
   - Allow filtering cart items by allergen content
   - Provide substitution recommendations for allergen-containing products

3. **Regulatory Compliance**
   - Implement age verification for restricted products
   - Display country-specific regulatory information
   - Handle import restrictions for international orders
   - Manage special labeling requirements

4. **Specialty Food Presentation**
   - Include origin and provenance information in cart display
   - Show [[Authentication]] status for premium products
   - Display pairing recommendations for complementary products
   - Include cultural context for specialty items

### Implementation Phases

1. **Phase 1: Core Cart Functionality** (1-2 months)
   - Basic cart operations (create, add, remove, update)
   - Session management and persistence
   - Basic [[Pricing]] calculations
   - Integration with [[Catalog]] and [[Inventory]] contexts

2. **Phase 2: Enhanced Cart Features** (1-2 months)
   - Promotion and discount application
   - Tax and shipping calculations
   - Guest cart to [[Customer]] cart conversion
   - Cart merging functionality

3. **Phase 3: Checkout Integration** (1-2 months)
   - Checkout process implementation
   - [[Order]] creation integration
   - [[Payment]] method integration
   - [[Inventory]] reservation management

4. **Phase 4: Abandoned Cart Recovery** (1 month)
   - Abandonment detection algorithms
   - Recovery workflow implementation
   - Incentive generation system
   - Analytics integration

5. **Phase 5: Optimization and Scaling** (Ongoing)
   - Performance optimization
   - Scalability improvements
   - Advanced analytics integration
   - A/B testing framework

### Testing Strategy

1. **Unit Testing**
   - Test all cart operations and business rules
   - Implement property-based testing for complex calculations
   - Mock external context dependencies
   - Achieve >90% code coverage

2. **Integration Testing**
   - Test integration with [[Catalog]], [[Inventory]], and [[Order]] contexts
   - Implement contract testing with consumer contexts
   - Test event production and consumption
   - Verify data consistency across contexts

3. **Performance Testing**
   - Load test with simulated peak traffic (holiday shopping)
   - Measure response times for critical operations
   - Test cache efficiency and hit rates
   - Verify scaling capabilities

4. **User Acceptance Testing**
   - Test complete [[Customer]] journeys
   - Verify cart display and usability
   - Test edge cases like network interruptions
   - Validate mobile and desktop experiences

### Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Cart Abandonment Rate | ≤ 20% | (Abandoned carts / Total carts created) × 100 |
| Cart Recovery Rate | ≥ 25% | (Recovered carts / Abandoned carts) × 100 |
| Cart to [[Order]] Conversion | ≥ 40% | (Carts converted to orders / Total carts with items) × 100 |
| Average Items Per Cart | ≥ 3.5 | Sum of items across all carts / Number of carts |
| Cart API Response Time | ≤ 200ms (p95) | 95th percentile of API response time |
| Cart Update Success Rate | ≥ 99.9% | (Successful updates / Total update attempts) × 100 |
| [[Inventory]] Reservation Accuracy | ≥ 99.5% | (Accurate reservations / Total reservations) × 100 |
| Promotion Application Accuracy | 100% | (Correctly applied promotions / Total promotions applied) × 100 |

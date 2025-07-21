# Shopping Cart Context Glossary

Generated: 2025-07-21T13:40:29-03:00

## Purpose

This glossary defines terms specific to the Shopping Cart bounded context, focusing on cart management, item selection, and pre-checkout customer experience for authentic Levantine and Mediterranean products.

## Context Overview

- **Business Purpose**: Provide seamless shopping experience with cart management and checkout preparation
- **Core Responsibility**: Cart state management, item calculations, and checkout preparation
- **Key Metrics**: Cart abandonment <65%, Add-to-cart rate ≥8%, Conversion rate ≥3.5%
- **Integration Points**: Product Catalog, Pricing & Promotions, Customer Management, Order Management

## Aggregates

### ShoppingCart

- **Definition**: Central aggregate representing a customer's shopping cart with items, calculations, and session management
- **Implementation**: `ShoppingCart` class extends AggregateRoot
- **Properties**:
  - **cartId**: Unique cart identifier
  - **customerId**: Reference to cart owner (if logged in)
  - **sessionId**: Session identifier for anonymous carts
  - **cartItems**: Collection of items in cart
  - **subtotal**: Total before taxes and discounts
  - **discounts**: Applied discounts and promotions
  - **taxes**: Tax calculations
  - **shippingCost**: Estimated shipping cost
  - **totalAmount**: Final cart total
  - **currency**: Cart currency
  - **createdDate**: When cart was created
  - **lastModified**: Last modification timestamp
  - **expirationDate**: When cart expires
  - **status**: Current cart status
  - **savedForLater**: Items saved for later purchase
  - **appliedCoupons**: Applied coupon codes
- **Responsibilities**:
  - Cart item management and calculations
  - Discount and promotion application
  - Cart persistence and session management
  - Checkout preparation and validation
- **Business Rules**:
  - Anonymous carts expire after 30 days
  - Logged-in customer carts persist indefinitely
  - Prices and availability verified before checkout
  - Cart totals recalculated on any change
- **Related Terms**: CartId, CartItem, CartStatus, CartCalculations

### CartItem

- **Definition**: Aggregate representing individual product item within shopping cart with quantity and customizations
- **Implementation**: `CartItem` class extends AggregateRoot
- **Properties**:
  - **cartItemId**: Unique cart item identifier
  - **cartId**: Reference to parent cart
  - **productId**: Reference to product
  - **productName**: Product name (cached for performance)
  - **productImage**: Product image URL (cached)
  - **quantity**: Requested quantity
  - **unitPrice**: Price per unit
  - **listPrice**: Original list price
  - **discountAmount**: Discount applied to item
  - **netPrice**: Final price after discounts
  - **lineTotal**: Total for this line item
  - **addedDate**: When item was added to cart
  - **lastModified**: Last modification timestamp
  - **customizations**: Product customizations or options
  - **availability**: Current availability status
  - **estimatedDelivery**: Estimated delivery date
- **Responsibilities**:
  - Individual item quantity and pricing management
  - Product customization tracking
  - Availability verification
  - Line total calculation
- **Business Rules**:
  - Quantity must be positive integer
  - Availability verified before checkout
  - Prices updated when product prices change
  - Customizations affect pricing and availability
- **Related Terms**: CartItemId, ProductCustomization, ItemAvailability, LineTotal

## Value Objects

### CartId

- **Definition**: Unique identifier for shopping carts
- **Implementation**: `CartId` value object
- **Format**: UUID-based string identifier
- **Usage**: Internal tracking, session management, customer references
- **Business Rules**:
  - Globally unique across all carts
  - Immutable once assigned
  - Used for cart persistence and recovery
- **Related Terms**: ShoppingCart, UniqueEntityID

### CartStatus

- **Definition**: Current status of shopping cart in customer journey
- **Implementation**: `CartStatus` enum
- **Statuses**:
  - **ACTIVE**: Cart actively being used by customer
  - **ABANDONED**: Cart abandoned by customer
  - **SAVED**: Cart saved by customer for later
  - **CHECKOUT_INITIATED**: Customer started checkout process
  - **CHECKOUT_COMPLETED**: Cart converted to order
  - **EXPIRED**: Cart expired due to inactivity
  - **MERGED**: Cart merged with another cart
  - **ARCHIVED**: Cart archived for historical purposes
- **Status Transitions**:
  - ACTIVE → ABANDONED (customer leaves without action)
  - ACTIVE → SAVED (customer saves cart)
  - ACTIVE → CHECKOUT_INITIATED (customer starts checkout)
  - CHECKOUT_INITIATED → CHECKOUT_COMPLETED (order placed)
  - Any status → EXPIRED (expiration time reached)
- **Business Rules**:
  - Status changes trigger analytics events
  - Abandoned carts eligible for recovery campaigns
  - Expired carts cleaned up automatically
  - Completed carts archived for reference
- **Related Terms**: CartLifecycle, CartAbandonment, CheckoutConversion

### CartCalculations

- **Definition**: Comprehensive calculations for cart totals, taxes, and discounts
- **Implementation**: `CartCalculations` value object
- **Properties**:
  - **subtotal**: Sum of all line totals before discounts
  - **itemDiscounts**: Total item-level discounts
  - **cartDiscounts**: Cart-level discounts and promotions
  - **totalDiscounts**: Total discount amount
  - **taxableAmount**: Amount subject to tax
  - **taxAmount**: Total tax amount
  - **shippingCost**: Shipping cost estimate
  - **handlingFee**: Any handling fees
  - **totalAmount**: Final cart total
  - **savings**: Total customer savings
- **Business Rules**:
  - Calculations performed in specific order
  - Tax calculated on post-discount amounts
  - Shipping calculated based on items and destination
  - All amounts rounded to currency precision
- **Related Terms**: TaxCalculation, DiscountApplication, ShippingCalculation

### ProductCustomization

- **Definition**: Customer-selected options and customizations for cart items
- **Implementation**: `ProductCustomization` value object
- **Properties**:
  - **customizationType**: Type of customization
  - **customizationValue**: Selected value or option
  - **priceAdjustment**: Price adjustment for customization
  - **availabilityImpact**: Impact on product availability
  - **deliveryImpact**: Impact on delivery time
- **Customization Types**:
  - **SIZE**: Product size selection
  - **WEIGHT**: Product weight selection
  - **PACKAGING**: Packaging options
  - **GIFT_WRAP**: Gift wrapping options
  - **PERSONALIZATION**: Personalized messages or engraving
  - **BUNDLE_SELECTION**: Bundle component selection
- **Business Rules**:
  - Customizations must be valid for product
  - Price adjustments calculated automatically
  - Availability verified for customized products
  - Delivery impact communicated to customer
- **Related Terms**: ProductOptions, CustomizationPricing, ProductVariants

### CouponApplication

- **Definition**: Application of coupon codes and promotional discounts to cart
- **Implementation**: `CouponApplication` value object
- **Properties**:
  - **couponCode**: Applied coupon code
  - **couponType**: Type of coupon discount
  - **discountAmount**: Discount amount applied
  - **discountPercentage**: Discount percentage (if applicable)
  - **minimumPurchase**: Minimum purchase requirement
  - **maximumDiscount**: Maximum discount limit
  - **applicableItems**: Items eligible for discount
  - **applicationDate**: When coupon was applied
  - **expirationDate**: Coupon expiration date
- **Business Rules**:
  - Coupons validated before application
  - Only valid, non-expired coupons accepted
  - Minimum purchase requirements enforced
  - Maximum discount limits applied
- **Related Terms**: CouponValidation, DiscountLimits, PromotionalOffers

## Domain Services

### CartManagementService

- **Definition**: Service managing cart operations and lifecycle
- **Implementation**: `CartManagementService` domain service
- **Responsibilities**:
  - Cart creation and initialization
  - Item addition, removal, and quantity updates
  - Cart merging for logged-in customers
  - Cart cleanup and expiration management
- **Management Rules**:
  - Anonymous carts converted when customer logs in
  - Duplicate items consolidated automatically
  - Cart state validated before operations
  - Expired carts cleaned up regularly
- **Related Terms**: CartOperations, CartMerging, CartCleanup

### PricingCalculationService

- **Definition**: Service managing cart pricing calculations and updates
- **Implementation**: `PricingCalculationService` domain service
- **Responsibilities**:
  - Real-time price calculation and updates
  - Discount and promotion application
  - Tax calculation based on customer location
  - Shipping cost estimation
- **Calculation Rules**:
  - Prices updated when product prices change
  - Discounts applied in order of precedence
  - Taxes calculated based on shipping address
  - Shipping costs estimated based on items and location
- **Related Terms**: PriceUpdates, DiscountApplication, TaxCalculation

### CartValidationService

- **Definition**: Service validating cart contents and checkout readiness
- **Implementation**: `CartValidationService` domain service
- **Responsibilities**:
  - Product availability verification
  - Inventory level checking
  - Shipping address validation
  - Payment method verification
- **Validation Rules**:
  - All items must be available for purchase
  - Quantities must not exceed inventory
  - Shipping address must be valid and serviceable
  - Payment method must be valid and authorized
- **Related Terms**: AvailabilityCheck, InventoryValidation, CheckoutValidation

## Domain Events

### ItemAddedToCart

- **Definition**: Published when customer adds item to shopping cart
- **Implementation**: `ItemAddedToCart` extends DomainEvent
- **Payload**: Cart ID, customer ID, product ID, quantity, unit price, timestamp
- **Consumers**: Analytics, Recommendations, Inventory Management, Marketing
- **Business Impact**: Customer behavior tracking, inventory reservation, recommendation updates

### CartAbandoned

- **Definition**: Published when customer abandons cart without completing purchase
- **Implementation**: `CartAbandoned` extends DomainEvent
- **Payload**: Cart ID, customer ID, cart value, abandonment reason, items, timestamp
- **Consumers**: Marketing, Analytics, Customer Recovery, Recommendations
- **Business Impact**: Recovery campaign triggers, abandonment analysis, customer insights

### CheckoutInitiated

- **Definition**: Published when customer begins checkout process
- **Implementation**: `CheckoutInitiated` extends DomainEvent
- **Payload**: Cart ID, customer ID, cart total, item count, checkout method, timestamp
- **Consumers**: Order Management, Analytics, Inventory Management, Fraud Detection
- **Business Impact**: Order preparation, inventory reservation, conversion tracking

### CouponApplied

- **Definition**: Published when customer applies coupon code to cart
- **Implementation**: `CouponApplied` extends DomainEvent
- **Payload**: Cart ID, customer ID, coupon code, discount amount, timestamp
- **Consumers**: Analytics, Marketing, Pricing & Promotions, Customer Management
- **Business Impact**: Promotion tracking, customer engagement, discount analysis

## Repository Interfaces

### IShoppingCartRepository

- **Definition**: Persistence contract for shopping cart aggregates
- **Implementation**: `IShoppingCartRepository` interface
- **Standard Operations**:
  - `findById(id: CartId): Promise<ShoppingCart | null>`
  - `save(cart: ShoppingCart): Promise<void>`
  - `findByCustomerId(customerId: CustomerId): Promise<ShoppingCart | null>`
- **Specialized Queries**:
  - `findBySessionId(sessionId: string): Promise<ShoppingCart | null>`
  - `findAbandonedCarts(abandonedSince: Date): Promise<ShoppingCart[]>`
  - `findExpiredCarts(): Promise<ShoppingCart[]>`
  - `findActiveCartsForCustomer(customerId: CustomerId): Promise<ShoppingCart[]>`
- **Business Rules**: All operations return Result pattern for error handling

### ICartItemRepository

- **Definition**: Persistence contract for cart item aggregates
- **Implementation**: `ICartItemRepository` interface
- **Standard Operations**:
  - `findById(id: CartItemId): Promise<CartItem | null>`
  - `save(item: CartItem): Promise<void>`
  - `findByCartId(cartId: CartId): Promise<CartItem[]>`
- **Specialized Queries**:
  - `findByProductId(productId: ProductId): Promise<CartItem[]>`
  - `findHighValueItems(minValue: number): Promise<CartItem[]>`
  - `findItemsNeedingUpdate(): Promise<CartItem[]>`
  - `findCustomizedItems(): Promise<CartItem[]>`
- **Business Rules**: Items linked to parent carts

## Business Rules & Constraints

### Cart Management Rules

1. **Session Handling**: Anonymous carts linked to sessions, customer carts persistent
2. **Item Limits**: Maximum number of items per cart enforced
3. **Quantity Limits**: Maximum quantity per item enforced
4. **Expiration Policy**: Cart expiration times based on customer status
5. **Merge Logic**: Cart merging rules when anonymous customer logs in

### Pricing and Calculation Rules

1. **Real-time Updates**: Prices updated in real-time with product changes
2. **Discount Precedence**: Clear order of discount application
3. **Tax Calculation**: Accurate tax calculation based on shipping address
4. **Rounding Rules**: Consistent rounding rules for all calculations
5. **Currency Handling**: Proper currency conversion and display

### Validation Rules

1. **Availability Checking**: Product availability verified before checkout
2. **Inventory Validation**: Quantities validated against available inventory
3. **Address Validation**: Shipping addresses validated for serviceability
4. **Payment Validation**: Payment methods validated before processing
5. **Business Rules**: All business rules validated before order creation

## Integration Patterns

### Inbound Events (Consumed)

- **ProductPriceUpdated** (Pricing & Promotions) → Update cart item prices
- **ProductAvailabilityChanged** (Inventory Management) → Update item availability
- **CustomerLoggedIn** (Customer Management) → Merge anonymous cart
- **PromotionActivated** (Marketing) → Apply eligible promotions

### Outbound Events (Published)

- **ItemAddedToCart** → Analytics for behavior tracking
- **CheckoutInitiated** → Order Management for order preparation
- **CartAbandoned** → Marketing for recovery campaigns
- **CouponApplied** → Pricing & Promotions for usage tracking

### Service Dependencies

- **Product Service**: Product information and availability
- **Pricing Service**: Current pricing and discount calculations
- **Inventory Service**: Stock levels and availability
- **Customer Service**: Customer information and preferences
- **Shipping Service**: Shipping cost calculations

## Anti-Corruption Patterns

### Product Catalog Integration

- **Product Data Response** → Internal cart item format
- **Price Information** → Internal pricing structure
- **Availability Status** → Internal availability format

### Pricing Service Integration

- **Discount Calculation Result** → Internal discount format
- **Tax Calculation Response** → Internal tax structure
- **Shipping Cost Response** → Internal shipping format

## Context Boundaries

### What's Inside This Context

- Shopping cart creation and management
- Cart item addition, removal, and updates
- Cart calculations and pricing
- Coupon application and validation
- Checkout preparation and validation

### What's Outside This Context

- Product catalog management
- Inventory stock management
- Order processing and fulfillment
- Payment processing
- Customer account management

### Integration Points

- **Product Catalog**: Product information and availability
- **Pricing & Promotions**: Current pricing and discount rules
- **Customer Management**: Customer information and preferences
- **Order Management**: Cart conversion to orders
- **Inventory Management**: Stock levels and reservations

This glossary ensures consistent terminology within the Shopping Cart context while maintaining clear boundaries and integration patterns with other bounded contexts.

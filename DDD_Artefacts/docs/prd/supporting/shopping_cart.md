# Shopping Cart

[RELATED: ADR-002, ADR-004, ADR-007, ADR-008, ADR-012]
[CONTEXT: Supporting]
[STATUS: Draft]
[VERSION: 1.0.0]
[OWNER: @commerce-platform]

## 1. Business Context

- **Purpose**: Provide customers with a persistent, real-time cart that bridges browsing and order creation, ensuring seamless checkout and accurate inventory reservation.
- **Business Capabilities**:
  - Temporary product holding & quantity management
  - Real-time price & promotion calculation
  - Inventory reservation & release
  - Cart session persistence (guest & logged-in)
  - Abandoned-cart recovery hooks
- **Success Metrics**:
  - Cart → order conversion rate ≥ 25 %
  - Abandoned-cart recovery uplift ≥ 5 % of lost revenue
  - Cart update latency ≤ 200 ms (P95)
  - Zero oversell incidents due to cart reservations
- **Domain Experts**:
<!--- agents:
  - role: VP eCommerce
  - role: Head of CX
  - role: Inventory Manager
  - role: Pricing Analyst
-->

## 2. Domain Model

- **Key Entities**: `ShoppingCart`, `CartItem`, `CartSession`, `InventoryReservation`, `SavedItem`, `PromotionSnapshot`
- **Aggregates**:
  - `ShoppingCart` (root) → owns `CartItem` & `InventoryReservation`
- **Value Objects**: `Money`, `Quantity`, `ProductRef`, `Discount`
- **Domain Services**: `CartPricingService`, `ReservationService`, `CartMerger`
- **Domain Events**: `CartCreated`, `ItemAddedToCart`, `CartUpdated`, `CartAbandoned`, `CartConvertedToOrder`

## 3. Functional Requirements

### 3.1 Cart Creation & Management

- **FR-1**: As a shopper, I want a cart created automatically when I add the first item so that I can review my selections.
  - **Acceptance Criteria**:
    - [ ] Cart created with unique ID & session association
    - [ ] Initial `CartCreated` event published

- **FR-2**: As a shopper, I can modify quantities or remove items so that my cart reflects my intent.
  - **Acceptance Criteria**:
    - [ ] Quantity updates validate against available stock & max 50 SKUs per cart
    - [ ] Inventory reservations updated atomically

### 3.2 Inventory Reservation

- **FR-3**: The system must reserve inventory for 30 min when an item is added.
  - **Acceptance Criteria**:
    - [ ] Reservation extended with each cart update
    - [ ] Reservation released on item removal or cart abandonment
  - **Dependencies**: Inventory & Shelf-Life context

### 3.3 Pricing & Promotions

- **FR-4**: Cart must display current price, promotions, tax, and estimated shipping.
  - **Acceptance Criteria**:
    - [ ] Price snapshot captured at add-to-cart time
    - [ ] Re-price items if price changes > 1 %
    - [ ] Apply best combination of eligible promotions (Pricing & Promotions context)

### 3.4 Cart Checkout Bridge

- **FR-5**: On checkout, cart converts into an Order within 2 s.
  - **Acceptance Criteria**:
    - [ ] `CartConvertedToOrder` event published with orderId
    - [ ] All reservations confirmed as InventoryReserved

### 3.5 Abandoned Cart Recovery

- **FR-6**: If a cart is inactive for 4 h, mark as abandoned and emit event.
  - **Acceptance Criteria**:
    - [ ] Scheduler flags abandoned carts
    - [ ] `CartAbandoned` event published for Notifications & Marketing

### 3.6 Business Rules

- Cart auto-creates on first item add; each user maintains exactly one active cart.
- Guest cart merges with existing user cart on login.
- Maximum 50 unique products per cart; quantity updates validate against stock.
- Adding an item creates a 30-minute inventory reservation that extends with cart activity; released on removal, checkout, or abandonment.
- Price snapshot locks at add-to-cart; items re-priced if price changes > 1 % or promotions update.
- Currency conversion, volume discounts, and best-promotion combination applied automatically.
- Cart is marked **abandoned** after 4 h inactivity and emits `CartAbandoned`; recovery workflows may merge carts.
- Checkout locks the cart, verifies availability, confirms reservations, and emits `CartCheckoutStarted` followed by `CartCheckoutCompleted`.
- Inventory reservations expire after 72 h of cart inactivity.
- Cold-chain items show shelf-life and temperature indicators; restricted items require authentication verification.
- Cart totals must equal sum of item totals ‑ discounts + taxes + shipping.

## 4. Integration Points

### 4.1 Published Events

- `CartCreated` → **Consumers**: AnalyticsReporting
- `ItemAddedToCart` → **Consumers**: InventoryShelfLife, AnalyticsReporting
- `CartItemRemoved` → **Consumers**: InventoryShelfLife, AnalyticsReporting
- `CartUpdated` → **Consumers**: AnalyticsReporting
- `CartAbandoned` → **Consumers**: NotificationsAlerts, Marketing
- `CartRecovered` → **Consumers**: MarketingManagement, AnalyticsReporting
- `CartCheckoutStarted` → **Consumers**: OrderManagement, PaymentBilling, AnalyticsReporting
- `CartCheckoutCompleted` / `CartConvertedToOrder` → **Consumers**: OrderManagement, InventoryShelfLife
- `CartReservationExpired` → **Consumers**: InventoryWarehouse, InventoryShelfLife

### 4.2 Consumed Events

- `ProductPriceChanged` (PricingPromotions) → Re-price affected cart items
- `PromotionUpdated` (PricingPromotions) → Re-evaluate promotions for active carts
- `InventoryReserved` (InventoryShelfLife) → Confirm reservation status before checkout
- `InventoryAdjusted` (InventoryWarehouse) → Validate item availability, auto-remove if out-of-stock
- `CustomerLoggedIn` (CustomerManagement) → Trigger cart merge
- `OrderCancelled` (OrderManagement) → Optionally restore items to cart

### 4.3 APIs/Services

- **REST/GraphQL**: `/cart`, `/cart/items`, `/cart/merge`, `/cart/checkout`
- **gRPC**: `ReservationService` for high-volume reservation checks
- **External Services**: Stripe Checkout session for payment intent pre-auth

## 5. Non-Functional Requirements

- **Performance**: Add/remove item call P95 ≤ 200 ms
- **Scalability**: Support 20 k concurrent carts; 5 M active carts persisted
- **Security**: Guest carts use signed, encrypted cookies; user carts tied to userId; TLS 1.2+
- **Reliability**: 99.95 % uptime; reservation scheduler retries with exponential back-off
- **Maintainability**: Domain logic 80 % unit-test coverage; Responsibility segregation (CQRS) per ADR-004

## 6. Implementation Roadmap

### Phase 1 – Core Cart (Weeks 1-2)

1. Implement `ShoppingCart` aggregate with reservation events.
2. REST/GraphQL endpoints for cart CRUD.
3. Emit `CartCreated`, `ItemAddedToCart`, `CartUpdated` events.

### Phase 2 – Pricing & Promotions (Weeks 3-4)

1. Integrate pricing service and promotion engine.
2. Support currency conversion and volume discounts.
3. Add `CartUpdated` with price deltas.

### Phase 3 – Checkout Integration (Weeks 5-6)

1. Lock cart during checkout; emit `CartCheckoutStarted`.
2. Create `Order` via Order Management; confirm reservations.
3. Emit `CartCheckoutCompleted`.

### Phase 4 – Recovery & Analytics (Weeks 7-8)

1. Scheduler for abandonment detection; send recovery events.
2. Implement recovery email pipeline and success tracking.

### Phase 5 – Optimisation & Scaling (Weeks 9+)

1. Performance tuning and CQRS read models per ADR-004.
2. Add Redis caching and horizontal scaling tests.
3. Introduce A/B testing of promo strategies.

## 7. Testing & Validation Strategy

- **Unit Tests**: Cart invariants, reservation logic, promotion calculations.
- **Integration Tests**: Cross-context flows with Inventory, Pricing, Order.
- **Performance Tests**: P95 add/remove ≤ 200 ms at 5 k RPS.
- **Security Tests**: Cookie encryption, TLS enforcement, abuse rate-limiting.
- **User Acceptance Tests**: Guest cart merge, recovery emails, mobile UX.
- **CI/CD Gates**: 80 % coverage, SAST/DAST, dependency scanning per ADR-012.

## 8. Open Questions

- [ ] Should we support multi-cart per user for B2B bulk orders?
- [ ] Is 30-min reservation duration optimal during peak season?

## 9. Out of Scope

- Payment authorization flow (covered in Payment & Billing)
- B2B quote generation (Sales & Quoting context)

## 10. References

- ADR-007: Hexagonal Modular Monolith
- ADR-004: CQRS Implementation Strategy
- Shopping Cart Domain Rules
- Context Map (context_map.puml)












## Event Storm Updates

### 2025-07-24

**New Events**
- CartAbandoned
- CartSavedForLater
- CartReactivated
- CartConvertedToOrder
- CartSharedWithFriend
- CartUpdated
- CartItemRemoved
- CartCleared

**New Commands**
- SendAbandonedCartNotification
- SaveCartForLater
- ReactivateCart
- ConvertCartToOrder
- ShareCartWithFriend
- UpdateCart
- RemoveItemFromCart
- ClearCart

## Event Storm Updates

### 2025-07-24

**New Events**
- CartAbandoned
- CartReviewed
- CartReturned
- CartCheckoutInitiated
- CartSavedForLater
- CartReviewedWithSentimentAnalysis
- CartRefundProcessed
- CartPromoted

**New Commands**
- SubmitCartReview
- SaveCartForLater
- AnalyzeCartReviewSentiment
- PromoteCart

## Event Storm Updates

### 2025-07-24

**New Events**
- CartUpdated
- CartAbandoned
- CartCheckedOut
- CartShared
- CartReactivated

**New Commands**
- UpdateCart
- CheckoutCart
- ShareCart
- ReactivateCart

## Event Storm Updates

### 2025-07-24

**New Events**
- CartUpdated
- CartAbandoned
- CartReviewed
- CartShared
- CartSavedForLater
- CartConverted
- CartFeedbackSubmitted
- CartNotificationSent

**New Commands**
- UpdateCart
- TrackAbandonedCart
- SubmitCartReview
- ShareCart
- SaveCartForLater
- ConvertCartToOrder
- SubmitCartFeedback
- SendCartNotification

## Event Storm Updates

### 2025-07-24

**New Events**
- ShoppingCartAbandoned
- CartReturned
- CartCheckoutCompleted
- ShoppingCartSavedForLater
- ShoppingCartDiscountApplied
- ShoppingCartItemAdded
- ShoppingCartItemRemoved

**New Commands**
- AbandonShoppingCart
- CompleteCartCheckout
- SaveCartForLater
- ApplyDiscountToCart
- AddItemToCart
- RemoveItemFromCart

## Event Storm Updates

### 2025-07-24

**New Events**
- CartUpdated
- CartAbandoned
- CartReviewed
- CartCheckedOut
- CartItemRemoved
- CartSavedForLater
- CartFeedbackSubmitted
- CartSecurityAlert

**New Commands**
- UpdateCart
- SubmitCartReview
- CheckoutCart
- RemoveItemFromCart
- SaveCartForLater
- SubmitCartFeedback
- TriggerCartSecurityAlert

## Event Storm Updates

### 2025-07-23

**New Events**
- CartUpdated
- CartReviewed
- CartAbandoned
- CartCheckedOut
- CartItemQuantityUpdated
- CartReviewSubmitted
- CartCleared
- CartFraudDetected

**New Commands**
- UpdateCart
- SubmitCartReview
- MarkCartAsAbandoned
- CheckoutCart
- UpdateCartItemQuantity
- ClearCart

## Event Storm Updates

### 2025-07-23

**New Events**
- CartAbandoned
- CartReviewed
- CartCleared
- CartFinalized
- CartUpdated
- CartReviewedWithSentimentAnalysis
- CartShared
- CartDiscountApplied

**New Commands**
- MarkCartAsAbandoned
- SubmitCartReview
- ClearCart
- FinalizeCart
- UpdateCart
- SubmitCartReviewWithSentiment
- ShareCart
- ApplyCartDiscount

## Event Storm Updates

### 2025-07-23

**New Events**
- CartAbandoned
- CartRecoveryInitiated
- CartRecovered
- CartShared
- CartRecoveryFailed
- CartDiscountApplied
- CartReturned
- CartSubscriptionCreated

**New Commands**
- InitiateCartRecovery
- CompleteCartRecovery
- ShareCart
- AttemptCartRecovery
- ApplyCartDiscount
- ProcessCartReturn
- CreateCartSubscription

## Event Storm Updates

### 2025-07-23

**New Events**
- CartAbandoned
- CartConverted
- CartReviewed
- CartShared
- CartUpdated
- CartSavedForLater
- CartRated
- CartReminderSent

**New Commands**
- TrackAbandonedCart
- SubmitCartReview
- ShareCart
- UpdateCart
- SaveCartForLater
- RateCart
- SendCartReminder

## Event Storm Updates

### 2025-07-23

**New Events**
- CartAbandoned

**New Commands**
- NotifyCartAbandonment

## Event Storm Updates

### 2025-07-23

**New Events**
- ColdChainComplianceVerified
- ColdChainViolationReported
- ColdChainTemperatureAlert
- ColdChainComplianceAlertTriggered
- ColdChainIntegrityBreachDetected
- ColdChainMonitoringInitiated
- ColdChainAuditCompleted
- ColdChainTemperatureStabilityConfirmed

**New Commands**
- VerifyColdChainCompliance
- ReportColdChainViolation
- SendColdChainTemperatureAlert
- TriggerColdChainComplianceAlert
- DetectColdChainIntegrityBreach
- InitiateColdChainMonitoring
- CompleteColdChainAudit
- ConfirmColdChainTemperatureStability

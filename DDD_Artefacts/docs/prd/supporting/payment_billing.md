# Payment & Billing

[RELATED: ADR-002, ADR-004, ADR-005, ADR-008, ADR-009, ADR-012]
[CONTEXT: Supporting]
[STATUS: Draft]
[VERSION: 1.0.0]
[OWNER: @finance-platform]

## 1. Business Context

- **Purpose**: Securely process payments, refunds, and settlements while ensuring PCI-DSS compliance, accurate financial reporting, and positive customer experience.
- **Business Capabilities**:
  - Multi-method payment authorization & capture (card, PayPal, ACH)
  - Refund and chargeback handling with evidence workflows
  - Multi-currency pricing & settlement
  - Daily reconciliation and financial reporting
  - Fraud detection & risk scoring hand-off
- **Success Metrics**:
  - Payment success rate ≥ 95 %
  - Chargeback ratio < 0.4 % of monthly transactions
  - Reconciliation accuracy 100 % daily; discrepancies resolved < €100 within 24 h
  - Average payment API latency ≤ 300 ms (P95)
- **Domain Experts**: Finance Controller, Risk Analyst, Payment Gateway Lead

## 2. Domain Model

- **Key Entities**: `Payment`, `PaymentMethod`, `Transaction`, `Refund`, `Chargeback`, `Settlement`
- **Aggregates**:
  - `Payment` (root) → owns transactions, refunds, chargebacks
- **Value Objects**: `Money`, `Currency`, `PaymentStatus`, `VerificationData`
- **Domain Services**: `GatewayAdapter`, `FraudCheckService`, `ReconciliationService`
- **Domain Events**: `PaymentAuthorized`, `PaymentCaptured`, `PaymentFailed`, `RefundProcessed`, `ChargebackInitiated`, `SettlementReceived`

## 3. Functional Requirements

### 3.1 Payment Authorization & Capture

- **FR-1**: As a customer, I can pay with supported methods so that my order is confirmed.
  - **Acceptance Criteria**:
    - [ ] PSD2/SCA enforced for EU cards
    - [ ] 3 payment attempts max before failure
    - [ ] `PaymentCaptured` event on success

### 3.2 Refund Management

- **FR-2**: Finance team can issue full or partial refunds within policy rules.
  - **Acceptance Criteria**:
    - [ ] Manager approval for partial refunds > €500
    - [ ] `RefundProcessed` event emitted with reason code

### 3.3 Chargeback Handling

- **FR-3**: System tracks chargebacks and evidence submission.
  - **Acceptance Criteria**:
    - [ ] 7-business-day response window timer
    - [ ] Status transitions: `initiated → evidence_submitted → resolved`

### 3.4 Multi-Currency Support

- **FR-4**: Prices and settlements convert using daily FX rates.
  - **Acceptance Criteria**:
    - [ ] FX rates updated 00:05 UTC; stored in `ExchangeRate` table

### 3.5 Financial Reconciliation

- **FR-5**: Auto-reconcile processor settlements with internal ledgers daily.
  - **Acceptance Criteria**:
    - [ ] Discrepancy report generated; alert if > €100

### 3.6 Business Rules

- Payment amounts must exactly match Order totals (zero tolerance).
- Payment capture only after `InventoryReserved` confirmation.
- Payments over €5,000 require two-factor verification and manager approval.
- Maximum of 3 payment attempts before marking the payment as permanently failed.
- Strong Customer Authentication (PSD2) enforced for EU customers.
- Card data must never be stored on internal systems; tokenization required.
- Refund amounts cannot exceed the original captured amount; partial refunds > €500 require manager approval.
- Automatic full refunds allowed within 30 days of purchase; beyond that require manual review.
- Chargeback cases must receive a first response within 7 business days and include delivery evidence.
- Daily reconciliation must achieve 100 % accuracy; discrepancies > €100 must be resolved within 24 h.

## 4. Integration Points

### 4.1 Published Events

- `PaymentAuthorized` → **Consumers**: OrderManagement, InventoryShelfLife
- `PaymentCaptured` → **Consumers**: OrderManagement, AnalyticsReporting, InventoryShelfLife
- `PaymentFailed` → **Consumers**: OrderManagement, NotificationsAlerts
- `RefundProcessed` → **Consumers**: ReturnsMgmt, AnalyticsReporting
- `RefundCompleted` → **Consumers**: ReturnsMgmt, CustomerManagement
- `ChargebackInitiated` → **Consumers**: RiskManagement, NotificationsAlerts
- `SettlementReceived` → **Consumers**: FinanceAccounting, AnalyticsReporting

### 4.2 Consumed Events

- `OrderPlaced` (OrderManagement) → initiate payment authorization
- `OrderCancelled` (OrderManagement) → trigger refund if captured
- `InventoryReserved` (InventoryShelfLife) → allow capture post-reservation
- `ProductReturned` (ReturnsMgmt) → initiate refund workflow
- `ShipmentCreated` (ShippingFulfillment) → freeze chargeback risk window

### 4.3 APIs/Services

- **REST/GraphQL**: `/payments`, `/payments/{id}/refund`, `/payment-methods`
- **gRPC**: `GatewayProxy` service for high throughput auth/capture
- **External Services**: Stripe, Adyen, Fraud Scoring API

## 5. Non-Functional Requirements

- **Performance**: Auth API P95 ≤ 300 ms; capture batch latency ≤ 2 s
- **Scalability**: 50 k transactions/day; burst 1 k TPM during promos
- **Security**: PCI-DSS Level 1; tokenization; TLS1.3; ADR-009 compliance
- **Reliability**: 99.95 % uptime; transactional outbox for events
- **Maintainability**: Gateway adapters behind interface; contract tests per provider

## 6. Implementation Roadmap

### Phase 1 – Core Payment Infrastructure (Weeks 1-3)

1. Implement `GatewayAdapter` abstractions with Stripe sandbox.
2. Build `/payments` REST endpoints for auth/capture/refund.
3. Emit `PaymentAuthorized`, `PaymentCaptured`, `PaymentFailed` events.
4. Integrate basic fraud scoring API.

### Phase 2 – Reconciliation & Multi-Currency (Weeks 4-6)

1. Automate daily settlement imports and discrepancy reports.
2. Implement FX rate micro-service and store rates in `ExchangeRate` table.
3. Support multi-currency amounts in `Money` value object.

### Phase 3 – Chargeback & Risk Analytics (Weeks 7-9)

1. Add chargeback workflows and `ChargebackInitiated` event handling.
2. Automate evidence gathering and submission to gateways.
3. Create Grafana dashboards for chargeback ratio and risk scores.

### Phase 4 – Optimisation & Scale (Weeks 10-12)

1. Introduce gRPC `GatewayProxy` for high-throughput capture.
2. Tune DB indexes and caching per ADR-011 to reach 1 k TPM burst.
3. Implement predictive gateway routing based on success rate analytics.

## 7. Testing & Validation Strategy

- **Unit Tests**: Value object validation, payment state transitions, refund calculations.
- **Integration Tests**: End-to-end flows with Stripe/Adyen test gateways and Inventory context.
- **Performance Tests**: Auth API P95 ≤ 300 ms at 100 TPS; capture batch latency ≤ 2 s.
- **Security Tests**: PCI-DSS compliance checks, SCA enforcement, tokenization verification.
- **User Acceptance Tests**: Finance team validates reconciliation reports and refund workflows.
- **CI/CD Gates**: 80 % code coverage, static analysis, dependency scanning per ADR-012.

## 8. Open Questions

- [ ] Should we onboard local wallets (Apple Pay, Google Pay) in Phase-1?
- [ ] Preferred fraud platform: build vs SaaS (e.g., Signifyd)?

## 9. Out of Scope

- Subscription recurring billing (handled by Subscriptions context)
- Promotions & discount calculation (Pricing & Promotions context)

## 10. References

- ADR-009: Data Protection Strategy
- ADR-005: Distributed Transaction Strategy
- ADR-008: Event-Driven Communication
- Context Map (context_map.puml)

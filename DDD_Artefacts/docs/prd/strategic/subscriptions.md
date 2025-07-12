# Subscriptions

[RELATED: ADR-002, ADR-004, ADR-005, ADR-008, ADR-011, ADR-012]
[CONTEXT: Strategic]
[STATUS: Draft]
[VERSION: 1.0.0]
[OWNER: @growth-team]

## 1. Business Context
- **Purpose**: Manage the full subscription lifecycle for B2C customers, delivering recurring revenue via tiered plans while ensuring target margins and exceptional customer experience.

- **Business Capabilities**:
  - **Plan Management**: Define and update tiered subscription plans (Basic, Premium, VIP)
  - **Subscription Lifecycle**: Sign-up, renewals, upgrades, downgrades, cancellations
  - **Benefit Allocation**: Apply basket credit, store-wide discount, and perks on every order
  - **Billing Integration**: Orchestrate recurring payments with Stripe and handle payment failures
  - **Margin Monitoring**: Enforce target GM floor per tier and auto-adjust perks if margins erode

- **Success Metrics**:
  - **Revenue & Margin**:
    - Monthly-recurring-revenue (MRR) growth ≥ 8 % MoM
    - Maintain GM ≥ 40 % (Basic), ≥ 42 % (Premium), ≥ 45 % (VIP)
  - **Retention**:
    - Renewal success rate ≥ 85 %
    - Monthly churn ≤ 5 %
    - Net Revenue Retention ≥ 110 %
  - **Acquisition & Upsell**:
    - Conversion from trial to paid ≥ 25 %
    - Upgrade rate (Basic→Premium / Premium→VIP) ≥ 10 %
  - **Operational Efficiency**:
    - Subscription creation time < 3 s
    - Failed-payment recovery ≥ 70 % within 7 days

- **Domain Experts**:
  - Head of Growth (P&L owner)
  - Subscription Product Manager
  - Finance Ops (billing & compliance)
  - Customer Success Lead

## 2. Domain Model
- **Key Entities**:
  - `SubscriptionPlan`: Tier definition (price, credit, perks, target margin)
  - `Subscription`: Active agreement between EFI and customer
  - `SubscriberAccount`: Customer profile with subscription status
  - `BenefitCredit`: Basket credit balance
  - `RenewalInvoice`: Billing record for each renewal cycle

- **Aggregates**:
  - `Subscription` (root): Manages lifecycle, status, benefit balance, renewals
  - `SubscriptionPlan` (reference): Immutable tier catalog

- **Value Objects**:
  - `PlanTier`: Basic | Premium | VIP
  - `CreditBalance`: Remaining basket credit (BBD)
  - `RenewalSchedule`: Next renewal date & frequency
  - `DiscountRule`: Store-wide percentage discount

- **Domain Services**:
  - `SubscriptionEngine`: Handles sign-up, upgrade/downgrade logic and proration
  - `BillingIntegrator`: Coordinates payments with Stripe via Payment context
  - `RenewalScheduler`: Queues and executes renewal jobs
  - `BenefitAllocator`: Applies monthly basket credit & discounts to orders

- **Domain Events**:
  - `SubscriptionCreated`
  - `SubscriptionRenewed`
  - `SubscriptionCancelled`
  - `SubscriptionUpgraded`
  - `SubscriptionPaymentFailed`

## 3. Functional Requirements
### 3.1 Plan Management
- **FR-1**: As a Product Manager, I can create and modify subscription plans
  - Accepts price, credit amount, discount %, perks, target margin
  - Version all plan changes for auditability

### 3.2 Sign-Up & Checkout
- **FR-2**: As a Shopper, I can purchase a subscription during checkout
  - Integrates with Shopping Cart for plan selection
  - Enforces immediate payment capture

### 3.3 Renewal & Billing
- **FR-3**: The system automatically renews subscriptions on the renewal date
  - Generates `RenewalInvoice` and triggers payment via Billing context (Stripe)
  - On failure, retries 3 times with exponential back-off then fires `SubscriptionPaymentFailed`

### 3.4 Benefit Allocation
- **FR-4**: Monthly basket credit and discount perks are allocated on renewal
  - Credits appear in customer wallet and expire after 30 days if unused

### 3.5 Lifecycle Changes
- **FR-5**: Subscribers can upgrade, downgrade or cancel at any time
  - Prorate remaining credit and fees according to plan rules

### 3.6 Business Rules
- All subscriptions must have a defined billing frequency and delivery schedule.
- Subscriptions may be paused for a maximum of 90 consecutive days before reactivation is required.
- Subscription changes take effect on the next billing cycle unless immediate processing is explicitly requested.
- Customers must receive a notification at least 3 days before renewal.
- Subscription discounts are applied based on subscriber longevity and tier.
- Substitutions for out-of-stock items must respect customer preferences and dietary restrictions.
- Early cancellations are prorated according to the subscription refund policy.
- "Surprise me" plans must not repeat items delivered within the past 3 months unless requested.
- Seasonal collections must be curated at least 1 month before availability.
- Free shipping applies when monthly subscription value exceeds the defined threshold.

## 4. Integration Points
### 4.1 Published Events
- `SubscriptionCreated` → Consumers: Notifications, Analytics, Billing
- `SubscriptionRenewed` → Consumers: Notifications, Loyalty, Analytics
- `SubscriptionCancelled` → Consumers: Customer Management, Analytics
- `SubscriptionUpgraded` → Consumers: Pricing & Promotions, Analytics
- `SubscriptionPaymentFailed` → Consumers: NotificationsAlerts, Customer Success
- `DeliveryScheduled` → Consumers: Order Management, Shipping Fulfillment, Notifications
- `CurationCompleted` → Consumers: Order Management, Product Catalog, Analytics

### 4.2 Consumed Events
- `PaymentCaptured` (Payment/Billing) → Activate or renew subscription
- `PaymentFailed` (Payment/Billing) → Trigger retry workflow & status update
- `CustomerUpdated` (Customer Management) → Sync profile changes

### 4.3 APIs/Services
- **REST/GraphQL** `/subscriptions`, `/plans`, `/benefits`
- **gRPC** RenewalScheduler service for high-volume renewal processing
- **External** Stripe Subscription API

## 5. Non-Functional Requirements
- **Performance**: Handle 1000 concurrent sign-ups; renewal job latency < 500 ms per record
- **Scalability**: Support 100 k active subscribers with horizontal scaling
- **Security & Compliance**: PCI-DSS (payments), GDPR (data), local auto-renewal laws
- **Reliability**: 99.95 % uptime; renewal job retry with transactional outbox
- **Observability**: Emit metrics (MRR, churn, renewal failures) to Prometheus; alert on SLA breach

## 6. Implementation Roadmap
### Phase 1 – Foundation (Weeks 1-4)
1. Deliver subscription plan catalog and CRUD APIs.
2. Implement basic sign-up & checkout integration.
3. Enable renewal scheduler job with stub billing integration.

### Phase 2 – Automated Billing & Notifications (Weeks 5-8)
1. Integrate Billing context for payment capture and retries.
2. Add renewal and pre-charge notifications.
3. Provide self-service upgrade, downgrade, and cancellation flows.

### Phase 3 – Personalisation & Analytics (Weeks 9-12)
1. Implement preference-based curation & delivery scheduling.
2. Emit churn, MRR, and cohort metrics to Analytics.
3. Launch loyalty benefit experiments tied to tenure.

### Phase 4 – Optimisation & Scale (Weeks 13-16)
1. Optimise renewal batch processing for 100 k+ subscribers.
2. Introduce AI churn-prediction into retention campaigns.
3. Harden SLAs and perform load testing & chaos drills.

## 7. Testing & Validation Strategy
- **Unit Tests**: Plan validation, lifecycle state transitions, billing calculations.
- **Integration Tests**: Verify flows with Billing, Customer, Notifications contexts.
- **Performance Tests**: Renewal job ≤ 500 ms per record at 100 k volume.
- **Security Tests**: PCI-DSS compliance, GDPR data handling, RBAC enforcement.
- **User Acceptance Tests**: End-to-end sign-up, renewal, upgrade, cancellation with domain experts.
- **CI/CD Gates**: 80 % code coverage, static analysis, and security scanning per ADR-012.

## 8. Open Questions
- What is the proration policy for mid-cycle upgrades/downgrades across currencies?
- Should we enable gift subscriptions and if so, how to handle benefit allocation?
- Do we support subscription pause/suspend workflows in v1?

## 9. Out of Scope
- Physical order fulfillment (handled by Shipping & Fulfillment)
- Loyalty point accrual outside subscription perks (Marketing Management context)
- Corporate/B2B subscription plans (future roadmap)

## 10. References
- ADR-005: Distributed Transaction Strategy
- ADR-008: Event-Driven Communication
- EFI Revenue & Pricing Strategy (§2a Subscription Price Ladder)
- Context Map (context_map.puml)




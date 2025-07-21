# Pricing & Promotions

[RELATED: ADR-002, ADR-004, ADR-008, ADR-011]
[CONTEXT: Core]
[STATUS: Draft]
[VERSION: 1.0.0]
[OWNER: @pricing-team]

## 1. Business Context

- **Purpose**: The Pricing & Promotions context implements EFI's revenue optimization strategy through dynamic pricing, promotional campaigns, and margin protection across all customer segments and sales channels.

- **Business Capabilities**:
  - **Revenue Stream Management**: Support for B2C, B2B, wholesale, and importer FOB contracts with appropriate pricing strategies
  - **Dynamic Pricing**: Implement time-based and inventory-age based pricing using formula D(t,d,p) = 1 – β × (1–d) + γ × (1–p) × (1 – d) + γ × (1 – p) × (t/T)
  - **Segment-Specific Pricing**: Enforce tiered pricing for Guest, Retail, Commercial, Wholesale, and Importer segments
  - **Subscription Management**: Administer Basic (BBD 60), Premium (BBD 90), and VIP (BBD 180) subscription tiers
  - **Promotional Governance**: Manage promotions with strict one-promo-per-order rule and margin protection
  - **Margin Protection**: Enforce gross margin floors by segment (40% retail, 30% commercial, 25% wholesale, 30% importer FOB)

- **Success Metrics**:
  - **Financial Performance**:
    - Achieve gross margin targets by segment (40% Retail, 30% Commercial, 25% Wholesale, 30% Importer FOB)
    - Maintain pocket gross margin above 70% for retail, 30% for commercial, 25% for wholesale, and 30% for importers
  - **Inventory Efficiency**:
    - Clear ≥ 90% of slow-moving SKUs through dynamic markdowns (T = 45 days)
    - Maintain sell-through rate ≥ 95% before product expiration
  - **Customer Metrics**:
    - Achieve 15% upgrade rate from Basic to Premium subscriptions
    - Increase ARPU by ≥ 20% through commercial volume grid
  - **Operational**:
    - Limit discount leakage to ≤ 5% in Q1 for importer contracts
    - Maintain price competitiveness within top 3 competitors

- **Domain Experts**:
  - CFO (Ultimate Approver)
  - Pricing Manager (Primary Owner)
  - Category Managers
  - Financial Analysts
  - Marketing Team

## 2. Domain Model

- **Key Entities**:
  - `PricingRule`: Business rules for price calculations by segment and product category
  - `Promotion`: Time-bound offers and discounts with eligibility criteria
  - `PriceList`: Customer/segment-specific pricing matrices
  - `SubscriptionTier`: Configuration for Basic, Premium, VIP tiers
  - `CostStructure`: Product cost components and mark-up rules
  - `PriceChangeLog`: Audit trail of all price modifications

- **Aggregates**:
  - `PricingRule` (root): Manages price calculation rules and validations
  - `Promotion` (root): Handles promotional campaigns and their constraints
  - `SubscriptionPlan` (root): Manages subscription tiers and benefits

- **Value Objects**:
  - `Price`: Monetary value with BBD currency handling
  - `Discount`: Percentage or fixed amount reductions with guardrails
  - `TieredPricing`: Volume-based pricing tiers for commercial customers
  - `Schedule`: Time-based activation windows for promotions
  - `EligibilityCriteria`: Rules for promotion qualification
  - `MarkdownParameters`: Configuration for β (0.4), γ (0.5), T (45 days)

- **Domain Services**:
  - `PricingEngine`: Implements D(t,d,p) formula for dynamic pricing
  - `PromotionApplier`: Enforces one-promo-per-order rule and margin protection
  - `MarginProtector`: Ensures all prices maintain minimum gross margins
  - `SubscriptionManager`: Handles subscription tier benefits and pricing
  - `PriceOptimizer`: Adjusts prices to meet business objectives

- **Domain Events**:
  - `PriceChanged`: When a product's price is updated
  - `PromotionActivated/Updated/Ended`: For promotion lifecycle events
  - `SubscriptionUpgraded`: When a customer moves between tiers
  - `MarkdownTriggered`: For automatic price reductions on aging inventory
  - `MarginViolationDetected`: When pricing would violate margin rules

## 3. Functional Requirements

### 3.1 Dynamic Pricing & Markdowns

- **FR-1**: As a Pricing Manager, I want to implement dynamic markdowns for aging inventory
  - **Acceptance Criteria**:
    - [ ] Apply D(t,d,p) formula with β=0.4, γ=0.5, T=45 days
    - [ ] Respect segment-specific gross margin floors
    - [ ] Clear ≥ 90% of slow-moving SKUs without GM breach
    - [ ] Log all markdowns with justification
  - **Dependencies**: [Inventory Management, Product Catalog]

### 3.2 Promotional Campaigns

- **FR-2**: As a Marketing Manager, I want to create targeted promotions
  - **Acceptance Criteria**:
    - [ ] Enforce one-promo-per-order rule
    - [ ] Support segment-specific offers (Diaspora, Expats, etc.)
    - [ ] Prevent stacking that would violate margin rules
    - [ ] Track promotion performance by segment
  - **Dependencies**: [Order Management, Customer Management]

### 3.3 Subscription Management

- **FR-3**: As a Product Manager, I want to manage subscription tiers
  - **Acceptance Criteria**:
    - [ ] Support Basic (BBD 60), Premium (BBD 90), VIP (BBD 180) tiers
    - [ ] Provide appropriate basket credits (BBD 60/95/200)
    - [ ] Enable tier-specific perks and discounts
    - [ ] Track upgrade/downgrade paths
  - **Dependencies**: [Billing, Customer Management]

### 3.4 Business Rules

- All prices must maintain the minimum margin requirements specified for their product category.
- Import cost changes must trigger automatic price recalculation.
- Currency exchange rates must be updated at least daily for accurate pricing.
- Subscription products must apply the appropriate discount tier based on subscription duration.
- When multiple promotions could apply to a product, the most beneficial to the customer must be selected.
- Premium customer segments may receive special pricing based on their tier.
- Bulk purchase discounts must be calculated on a sliding scale based on volume.
- Price changes exceeding 15% require management approval before taking effect.
- Seasonal products may have dynamic pricing based on availability and demand.
- Historical pricing data must be maintained for trend analysis and reporting.

## 4. Integration Points

### 4.1 Published Events

- `PriceChanged`: When a product's price is updated
  - Payload: { productId, oldPrice, newPrice, effectiveDate, changeReason, userId, marginImpact }
  - Consumers: [Product Catalog, Order Management, Analytics]
- `PromotionActivated`: When a new promotion becomes active
  - Payload: { promotionId, name, type, discount, segments, startDate, endDate, terms, tbiCard }
  - Consumers: [E-commerce, POS, Marketing, Analytics]
- `MarginAlert`: When pricing approaches margin floor
  - Payload: { productId, currentPrice, floorPrice, marginPct, segment }
  - Consumers: [Finance, Management]
- `PriceCalculated`: Emitted when a product price is calculated for a specific context
  - Payload: { productId, calculatedPrice, basePrice, appliedRules, customerSegment, calculationContext }
  - Consumers: [Order Management, Product Catalog, Analytics]
- `PriceRuleActivated`: Emitted when a pricing rule becomes active
  - Payload: { ruleId, ruleType, effectiveFrom, effectiveTo, affectedProductIds }
  - Consumers: [Product Catalog, Marketing]
- `ImportCostUpdated`: Emitted when import costs change for a product
  - Payload: { productId, previousCost, newCost, costComponents, effectiveDate }
  - Consumers: [Pricing (internal), Reporting]

### 4.2 Consumed Events

- `InventoryLevelChanged`: From Inventory Management
  - Source: Inventory Context
  - Action: Trigger markdown pricing for aging inventory
- `OrderPlaced`: From Order Management
  - Source: Order Management Context
  - Action: Track promotion performance and update demand forecasts
- `SubscriptionChanged`: From Subscriptions
  - Source: Subscriptions Context
  - Action: Apply appropriate tier pricing and benefits

### 4.3 APIs/Services

- **REST/GraphQL**: Pricing & Promotions API
  - `/pricing/calculate`: Real-time price calculation
  - `/promotions/validate`: Check promotion eligibility
  - `/subscriptions/benefits`: Get current tier benefits
- **gRPC**: High-volume pricing service
  - Supports 1000+ QPS with <100ms latency
- **External Services**:
  - Competitor price monitoring (for D(t,d,p) inputs)
  - Market data feeds (for demand signals)

## 5. Non-Functional Requirements

- **Performance**:
  - Price calculations complete in < 100ms (P99)
  - Support 1000+ price updates per minute
  - Handle 10x normal load during flash sales
- **Scalability**:
  - Support 100,000+ SKUs with individual rules
  - Process pricing updates with zero downtime
  - Scale horizontally for peak periods
- **Security**:
  - Role-based access control (RBAC) for all pricing changes
  - Audit logging of all price modifications
  - CFO approval required for pricing below floor
- **Reliability**:
  - 99.99% uptime for pricing services
  - Automatic failover for critical components
  - Data consistency across all pricing dimensions
- **Compliance**:
  - Adhere to BBD pricing regulations
  - Maintain audit trail for all pricing decisions
  - Document all pricing algorithms and rules

## 6. Open Questions

- [ ] How should we handle price adjustments during system outages?
- [ ] What's the process for emergency price overrides during supply chain disruptions?
- [ ] How frequently should we review and update the D(t,d,p) parameters?

## 7. Out of Scope

- Direct integration with payment processors (handled by Payment context)
- Tax calculation (handled by Order Management context)
- Customer loyalty program mechanics (handled by Customer Management context)
- Physical price tag generation (handled by Store Operations context)

## 8. References

- ADR-002: Domain Event Design Patterns
- ADR-004: CQRS Implementation Strategy
- ADR-008: Event-Driven Communication Between Bounded Contexts
- ADR-011: Multi-Layered Caching Strategy
- EFI Revenue & Pricing Strategy Document (5-revenue-&-pricing.md)
- Context Map (context_map.puml)

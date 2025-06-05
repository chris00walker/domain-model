# Pricing Domain Knowledge

## Domain Overview
The Pricing domain is identified as a **core domain** with the highest strategic priority for Elias Food Imports. It directly impacts revenue generation, supports the premium positioning strategy, and enables complex multi-tier pricing that differentiates EFI in the marketplace.

## Strategic Importance
- Direct revenue impact through optimized pricing strategies
- Enables premium positioning through value-based pricing
- Supports multi-tier customer segmentation
- Protects margins while allowing promotional flexibility
- Facilitates dynamic pricing for inventory management

## Core Concepts

### Pricing Tier
A classification of customers that determines which pricing rules apply to them:
- **Guest**: Unregistered, first-time customers
- **Retail**: Registered individual consumers (B2C)
- **Commercial**: Food trucks, small restaurants, and other small B2B customers
- **Wholesale**: Mini-markets, larger establishments with bulk purchasing
- **Importer**: Regional importers purchasing at FOB (Free On Board) prices

### Revenue Stream
A distinct source of revenue with its own pricing mechanism and target customer segments:
1. **Guest One-Off Orders**: Single purchases by unregistered customers
2. **B2C Subscriptions**: Recurring subscription services for consumers
3. **Commercial Orders**: Orders from food trucks and limited-service restaurants
4. **Wholesale Supply**: Bulk orders from mini-markets and larger establishments
5. **Importer FOB Contracts**: Export contracts for regional importers
6. **Near-Expiry Flash Sales**: Time-sensitive discounted sales for inventory management

### Pricing Mechanism
Methods used to determine prices:
- **Fixed List Price**: Standard catalog prices with optional promotional adjustments
- **Tiered Flat Rate**: Subscription-based pricing with different service levels
- **Volume Grid**: Pricing that changes based on order quantity
- **Negotiated List**: Customized pricing established through negotiation
- **FOB Pricing**: Export pricing with specific markup structure
- **Dynamic Markdown**: Formula-based pricing for time-sensitive inventory

### Markup Structure
The percentage added to the cost to determine the selling price:
- **Guest/Unregistered**: 150% base markup, 15% max discount, 135% floor GM
- **Retail (Logged-in)**: 150% base markup, 20% max discount, 130% floor GM
- **Commercial**: 125% base markup, 25% max discount, 100% floor GM
- **Wholesale**: 100% base markup, 30% max discount, 70% floor GM
- **Importer (FOB)**: 60% base markup, 15% max discount, 30% floor GM

### Margin Floor
The minimum acceptable gross margin for a transaction, below which the system should prevent the sale or trigger a review. Critical for maintaining business profitability.

### Dynamic Pricing Formula
Mathematical formula for calculating discounts on time-sensitive inventory:
- **D(t,d,p) = 1 – β × (1–d) + γ × (1–p)(1 – d) + γ × (1 – p) × (t/T)**
  - β = 0.4
  - γ = 0.5
  - T = 45 days
  - t = time remaining before expiry
  - d = demand factor
  - p = profitability factor

## Business Rules

### Pricing Governance Rules
1. **Margin Floor Enforcement**: System must prevent sales below the established margin floor for each customer tier
2. **Promotion Stacking Limit**: Only one promotional discount can be applied to a single order
3. **Dynamic Pricing Freeze**: Dynamic pricing algorithms are frozen if Pocket GM falls below floor for two consecutive weeks
4. **Price Change Authorization**: Price changes exceeding 10% require manager approval
5. **Tier-Specific Pricing**: Each customer tier must have its own pricing configuration
6. **Promotional Duration Limits**: Promotions cannot exceed 30 days without executive review

### Promotional Rules
1. **Seasonal Promotion Calendar**: Maximum of 6 major promotional periods per year
2. **Product Category Limits**: No more than 30% of a category can be on promotion simultaneously
3. **New Product Protection**: New products cannot be discounted within first 60 days
4. **Premium Product Protection**: Authenticated premium products have restricted promotion eligibility
5. **Promotion Stacking Prevention**: System must prevent multiple promotions from applying to the same order
6. **Margin Protection**: All promotions must respect the margin floor rules

## Domain Events

### PriceChanged
- **Trigger**: Price of a product is modified
- **Data**: ProductID, OldPrice, NewPrice, ChangeReason, ChangedBy
- **Consumers**: Catalog, Order, Inventory domains

### MarginFloorBreached
- **Trigger**: Calculated price falls below minimum acceptable margin
- **Data**: ProductID, CalculatedPrice, MinimumAllowedPrice, CustomerTier
- **Consumers**: Notification, Approval Workflow

### PromotionalCampaignCreated
- **Trigger**: New promotional campaign is established
- **Data**: CampaignID, StartDate, EndDate, DiscountType, DiscountAmount, EligibleProducts
- **Consumers**: Catalog, Marketing, Analytics domains

### PricingRuleViolated
- **Trigger**: Pricing rule is broken or exception occurs
- **Data**: RuleID, ViolationType, AffectedProducts, RecommendedAction
- **Consumers**: Notification, Approval Workflow

### DynamicPricingFrozen
- **Trigger**: System freezes dynamic pricing due to margin violations
- **Data**: ReasonCode, AffectedCategories, FreezeStartDate, EstimatedThawDate
- **Consumers**: Inventory, Analytics, Executive Dashboard

## Aggregates and Entities

### PricingRule (Aggregate Root)
- **Properties**: RuleID, RuleType, Conditions, Actions, Priority, EffectiveDate, ExpirationDate
- **Behavior**: Evaluates if a pricing scenario meets rule conditions and applies appropriate actions
- **Invariants**: Rules cannot contradict higher priority rules; Rules must respect margin floors

### PricingStrategy (Entity)
- **Properties**: StrategyID, StrategyType, Parameters, ApplicableCustomerTiers
- **Behavior**: Encapsulates algorithm for calculating prices in specific contexts
- **Invariants**: Must produce prices above margin floor; Must be assigned to at least one customer tier

### PromotionalCampaign (Aggregate Root)
- **Properties**: CampaignID, Name, StartDate, EndDate, DiscountType, DiscountAmount, EligibleProducts
- **Behavior**: Manages lifecycle of a time-bound promotional offering
- **Invariants**: Cannot overlap with more than 2 other campaigns; Cannot discount products below margin floor

### CustomerTierPricing (Entity)
- **Properties**: TierID, BaseMarkup, MaximumDiscount, MarginFloor
- **Behavior**: Stores tier-specific pricing parameters
- **Invariants**: MarginFloor must be less than BaseMarkup; MaximumDiscount cannot allow prices below MarginFloor

## Value Objects

### PricingTier
- **Properties**: TierID, TierName, TierDescription
- **Validation**: Must match one of the defined tiers in the system

### MarkupPercentage
- **Properties**: Value (decimal)
- **Validation**: Must be positive; Cannot exceed 200%

### DiscountPercentage
- **Properties**: Value (decimal)
- **Validation**: Must be between 0% and 50%; Cannot result in price below margin floor

### PriceModifier
- **Properties**: ModifierType, Value, Reason
- **Validation**: Must result in final price above margin floor

## Domain Services

### PriceCalculationService
- **Responsibility**: Computes final prices based on applicable strategies
- **Key Methods**: CalculatePrice, ApplyDiscounts, ValidatePrice
- **Dependencies**: PricingRules, CustomerTiers, PromotionalCampaigns

### MarginGuardRailService
- **Responsibility**: Enforces margin floor constraints
- **Key Methods**: ValidateMargin, CalculateMargin, HandleMarginViolation
- **Dependencies**: CustomerTierPricing, CostOfGoodsSold

### PromotionStackingService
- **Responsibility**: Enforces the one-promo-per-order rule
- **Key Methods**: ValidatePromotionStack, SelectBestPromotion
- **Dependencies**: PromotionalCampaigns, OrderItems

### PricingGovernanceService
- **Responsibility**: Monitors and enforces pricing policies
- **Key Methods**: MonitorMarginCompliance, FreezeUnfreezeAlgorithms
- **Dependencies**: Analytics, PricingRules

## Integration Points

### With Catalog Domain
- Pricing domain provides product prices to Catalog
- Catalog provides product information needed for pricing calculations
- Shared concepts: Product, ProductCategory

### With Order Domain
- Pricing domain calculates final order prices
- Order domain provides order context for price calculations
- Shared concepts: OrderItem, Discount

### With Customer Domain
- Customer domain provides customer tier information
- Pricing domain uses customer tier to determine applicable pricing rules
- Shared concepts: CustomerTier, CustomerSegment

### With Subscription Domain
- Pricing domain provides subscription tier pricing
- Subscription domain provides subscription context for recurring billing
- Shared concepts: SubscriptionTier, BillingCycle

## Implementation Recommendations

1. Implement pricing rules as a rule engine with configurable conditions and actions
2. Use the Strategy pattern for different pricing calculation algorithms
3. Implement margin floor validation as a domain service with clear error handling
4. Use domain events for cross-bounded context communication about price changes
5. Implement the Specification pattern for complex pricing rule conditions
6. Use Value Objects for all pricing components to ensure validation
7. Implement a Command pattern for price modifications that require approval

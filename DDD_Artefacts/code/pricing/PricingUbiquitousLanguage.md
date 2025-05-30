# Pricing Domain Ubiquitous Language

This document defines the shared language used by business stakeholders and technical teams when discussing pricing concepts within the Elias Food Imports (EFI) system.

## Core Concepts

### Pricing Tier
A classification of customers that determines which pricing rules apply to them. Defined tiers are:
- **Guest**: Unregistered, first-time customers
- **Retail**: Registered individual consumers (B2C)
- **Commercial**: Food trucks, small restaurants, and other small B2B customers
- **Wholesale**: Mini-markets, larger establishments with bulk purchasing
- **Importer**: Regional importers purchasing at FOB (Free On Board) prices

### Revenue Stream
A distinct source of revenue for the business with its own pricing mechanism and target customer segments. The defined streams are:
1. **Guest One-Off Orders**: Single purchases by unregistered customers
2. **B2C Subscriptions**: Recurring subscription services for consumers
3. **Commercial Orders**: Orders from food trucks and limited-service restaurants
4. **Wholesale Supply**: Bulk orders from mini-markets and larger establishments
5. **Importer FOB Contracts**: Export contracts for regional importers
6. **Near-Expiry Flash Sales**: Time-sensitive discounted sales for inventory management

### Pricing Mechanism
The method used to determine the price for a product or service:
- **Fixed List Price**: Standard catalog prices with optional promotional adjustments
- **Tiered Flat Rate**: Subscription-based pricing with different service levels
- **Volume Grid**: Pricing that changes based on order quantity
- **Negotiated List**: Customized pricing established through negotiation
- **FOB Pricing**: Export pricing with specific markup structure
- **Dynamic Markdown**: Formula-based pricing for time-sensitive inventory

### Markup
The percentage added to the cost to determine the selling price. Each tier has defined markup ranges:
- **Guest/Unregistered**: 150% base markup, 15% max discount, 135% floor GM
- **Retail (Logged-in)**: 150% base markup, 20% max discount, 130% floor GM
- **Commercial**: 125% base markup, 25% max discount, 100% floor GM
- **Wholesale**: 100% base markup, 30% max discount, 70% floor GM
- **Importer (FOB)**: 60% base markup, 15% max discount, 30% floor GM

### Subscription Tier
Levels of subscription service offered to customers:
- **Basic**: Entry-level subscription with basic benefits
- **Premium**: Mid-tier subscription with enhanced benefits
- **VIP**: Top-tier subscription with premium benefits and services

### Gross Margin (GM)
The difference between revenue and cost of goods sold (COGS), expressed as a percentage of revenue. Also referred to as "Pocket GM" when accounting for direct costs and discounts.

### Margin Floor
The minimum acceptable gross margin for a transaction, below which the system should prevent the sale or trigger a review.

### Dynamic Pricing Formula
A mathematical formula used to calculate discounts for time-sensitive inventory:
- **D(t,d,p) = 1 – β × (1–d) + γ × (1–p)(1 – d) + γ × (1 – p) × (t/T)**
  - β = 0.4
  - γ = 0.5
  - T = 45 days
  - t = time remaining before expiry
  - d = demand factor
  - p = profitability factor

### Promotional Campaign
A time-bound modification to normal pricing rules designed to achieve specific business objectives.

### Pricing Governance
The set of rules and procedures that ensure pricing decisions maintain profitability. Key aspects include:
- Freezing dynamic pricing if Pocket GM falls below floor for two consecutive weeks
- One-promo-per-order rule to prevent discount stacking
- Evidence-level scoring of pricing experiments

## Value Objects

### PricingTier
Represents the customer classification for pricing purposes.

### MarkupPercentage
Represents the percentage added to cost to determine selling price, with validation rules.

### DiscountPercentage
Represents the percentage reduction from list price, with validation rules.

### PriceModifier
Represents an adjustment (usually a reduction) to a base price.

### SubscriptionTier
Represents the level of subscription service.

## Entities and Aggregates

### PricingRule
Defines conditions under which specific pricing calculations apply.

### PricingStrategy
Represents a method for calculating prices based on specific rules and contexts.

### SegmentPricingConfig
Configuration for pricing rules specific to a customer segment.

### PromotionalCampaign
A time-bound set of pricing modifications to achieve business objectives.

## Domain Services

### PriceCalculationService
Service that computes final prices based on applicable strategies.

### MarginGuardRailService
Service that enforces margin floor constraints.

### PromotionStackingService
Service that enforces the one-promo-per-order rule.

### PricingGovernanceService
Service that monitors and enforces pricing policies.

## Domain Events

### PriceChanged
Event triggered when a price is modified.

### MarginFloorBreached
Event triggered when a price falls below the minimum acceptable margin.

### PromotionalCampaignCreated
Event triggered when a new promotional campaign is established.

### PricingRuleViolated
Event triggered when a pricing rule is broken.

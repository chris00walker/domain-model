# Pricing Domain Invariants and Business Rules

This document outlines the critical invariants and business rules that must be enforced within the pricing domain, based on the Elias Food Imports (EFI) business model.

## Core Invariants

### 1. Margin Floor Protection
- Each pricing tier has a minimum gross margin (floor) that must be maintained
- Guest/Unregistered: ≥ 135% floor GM
- Retail (Logged-in): ≥ 130% floor GM
- Commercial: ≥ 100% floor GM (targeting ≥ 30% GM)
- Wholesale: ≥ 70% floor GM (targeting ≥ 25% GM)
- Importer (FOB): ≥ 30% floor GM
- System must prevent pricing that would violate these margin floors

### 2. Discount Limits
- Each tier has a maximum allowable discount:
  - Guest/Unregistered: 15% max discount
  - Retail (Logged-in): 20% max discount
  - Commercial: 25% max discount
  - Wholesale: 30% max discount
  - Importer (FOB): 15% max discount
- Discounts cannot exceed these limits for their respective tiers

### 3. One-Promo-Per-Order Rule
- Only one promotional code or discount can be applied to an order
- Stacking of multiple discounts is explicitly prohibited
- System must enforce this restriction at the order level

### 4. Dynamic Pricing Formula Constraints
- The dynamic markdown formula D(t,d,p) must operate within segment GM floors
- Parameters must be maintained as specified: β = 0.4, γ = 0.5, T = 45 days
- Variables t (time), d (demand), and p (profitability) must be validated

### 5. Subscription Pricing Integrity
- Subscription tiers must maintain minimum GM targets:
  - Basic: ≥ 40% GM
  - Premium: ≥ 42% GM
  - VIP: ≥ 45% GM

## Business Rules

### 1. Pricing Governance Procedure
- If Pocket GM falls below floor for two consecutive weeks:
  - The dynamic-pricing engine must be automatically frozen
  - Pricing changes can only resume after formal CFO-approved review
  - System must track weekly GM metrics to enforce this rule

### 2. Subscription Price Ladder
- Basic tier: BBD 60 monthly fee, BBD 60 basket credit, 5% store-wide discount
- Premium tier: BBD 90 monthly fee, BBD 95 basket credit, 8% store-wide discount
- VIP tier: BBD 180 monthly fee, BBD 200 basket credit, free delivery, early access

### 3. VIP Benefits Cost Control
- Total perk spend must not exceed 10% of incremental VIP GM
- System must cap benefits and track their cost impact

### 4. Evidence-Based Pricing Decisions
- Each pricing experiment must be scored on a 1-5 scale based on supporting data
- Experiments must be prioritized based on these evidence scores

### 5. Mark-Up Calculation Rules
- Mark-up is applied to (COGS + Fulfillment cost)
- For retail: (COGS + Fulfillment) / 0.60
- For commercial: (COGS + Fulfillment) / 0.70
- For wholesale: (COGS + Fulfillment) / 0.75

### 6. Pricing Review Cadence
- Monthly: Review dashboard; flag KPI drift > 10%
- Quarterly: Renegotiate suppliers/3PL when 3-mo volume ↑ 25%
- Board Review: Highlight KPI variance > 10% or leakage > 5% revenue

## Validation Requirements

### 1. Price Modifications
- Any price change must be validated against margin floors
- Discount applications must be checked against maximum allowed percentages
- All pricing calculations must use standardized rounding rules

### 2. Promotion Validation
- Promotions must have defined start and end dates
- Promotion details must include affected products/categories and discount amount
- System must validate that promotions don't violate margin floors

### 3. Subscription Tier Changes
- Tier changes must recalculate applicable benefits and pricing
- System must validate that the new tier's GM requirements are maintained

### 4. Dynamic Pricing Validation
- The dynamic pricing formula must be validated with current inventory data
- System must ensure time-sensitive discounts don't violate margin floors
- Formula application must respect the pricing governance rules

## Monitoring Requirements

### 1. Margin Tracking
- System must track actual margins vs. floor margins
- Alerts must be generated when margins approach floor thresholds

### 2. Discount Leakage
- Total discount impact must be tracked and reported
- System must flag when leakage exceeds 5% of revenue

### 3. Promotional Performance
- Each promotion's performance must be tracked against expected outcomes
- System must calculate ROI for promotional activities

### 4. Pricing Governance Compliance
- Compliance with the one-promo-per-order rule must be monitored
- Violations of pricing rules must be logged and reported

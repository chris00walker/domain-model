# Elias Food Imports - Enhanced Ubiquitous Language Glossary

## Introduction

This enhanced glossary serves as the definitive reference for domain terminology used throughout the Elias Food Imports system. It establishes a common language that bridges business stakeholders and technical teams, ensuring consistent understanding across all documentation, code, and communication.

## Core Domain Terms

### Customer Segments

- **Diaspora Household (HH)**: Families with cultural ties to Lebanon/Mediterranean seeking authentic ingredients for home cooking.
- **Expat Resident**: Long-term international residents in Barbados interested in accessing familiar foods from their home countries.
- **Indigenous Foodie Family**: Local Barbadian families interested in exploring Levantine/Mediterranean cuisines.
- **Tourist**: Short-term visitors staying in AirBnBs or vacation rentals seeking authentic culinary experiences.
- **Food Truck Operator**: Mobile food vendors requiring specialty ingredients for their menu offerings.
- **Specialty Mini-Market**: Small retail stores focusing on ethnic/imported foods for resale.
- **Limited-Service Restaurant**: Quick-service dining establishments offering Mediterranean menu items.
- **Full-Service Restaurant**: Traditional sit-down restaurants requiring larger quantities of specialty ingredients.
- **Hotel Restaurant**: Food service operations within hotels catering to international guests.
- **Private Chef**: Independent culinary professionals preparing meals for private clients.

### Products & Inventory

- **SKU**: Stock Keeping Unit - unique identifier for each product variant in the catalog.
- **QR Provenance**: QR code system for tracking product origin and authenticity through the supply chain.
- **Home Bundle**: Subscription box containing staple Mediterranean ingredients for regular household use.
- **Explore Bundle**: Subscription box with rotating discovery items introducing customers to new products.
- **Sampler Kit**: Small, affordable product samples for trial before committing to full-size purchases.
- **Cold Chain**: Temperature-controlled supply chain ensuring product quality and safety.
- **Authenticity Token**: Digital certificate verifying product origin and authenticity.
- **Product Category**: Hierarchical classification system organizing products (e.g., Oils, Spices, Grains).
- **Product Badge**: Visual indicator of product attributes (e.g., "New," "Best Seller," "On Sale").
- **Stock Level**: Current inventory quantity available for a specific product.
- **Reorder Point**: Inventory threshold triggering automatic replenishment.

### Business Metrics

- **AOV**: Average Order Value (Target: BBD 300+).
- **CAC**: Customer Acquisition Cost (Max: BBD 20 retail, BBD 50 food-trucks).
- **LTV**: Customer Lifetime Value (Target: 4x CAC).
- **GMV**: Gross Merchandise Value - total sales volume before deductions.
- **Churn Rate**: Monthly customer attrition (Target: ≤3% for subscribers, ≤5% overall).
- **MRR**: Monthly Recurring Revenue from subscription services (Target: ≥10% growth).
- **Weighted Gross Margin**: Profit margin weighted by product sales volume (Target: ≥35%).
- **FX Risk Hedging Coverage**: Percentage of foreign exchange risk protected (Target: ≥80%).
- **Inventory Accuracy**: Percentage match between system inventory and physical count (Target: ≥99.9%).
- **Forecast Accuracy**: Precision of inventory demand predictions (Target: ≥85%).
- **Campaign ROI**: Return on investment for marketing campaigns (Target: ≥25% improvement).

### Order Processing

- **SLA**: Service Level Agreement (e.g., 48h delivery, 95% on-time).
- **FOB**: Free On Board - shipping term where seller loads goods on transport.
- **Order Status**: Current state of an order (Created, Paid, Processing, Fulfilled, Cancelled).
- **Order Accuracy**: Percentage of orders fulfilled without errors (Target: ≥99.9%).
- **On-Time Delivery**: Percentage of orders delivered within promised timeframe (Target: ≥95%).
- **Order Processing Time**: Duration from order placement to ready-for-fulfillment (Target: ≤5 seconds).
- **Fulfillment Center**: Physical location where orders are assembled and dispatched.
- **Shipping Option**: Delivery method choice offered to customers (Standard, Express, Pickup).
- **Shipment Tracking**: System for monitoring order location during delivery process.

### Payment & Pricing

- **3D Secure**: Payment authentication protocol for secure online transactions.
- **Payment Gateway**: Third-party service processing electronic payments.
- **Transaction**: Individual payment processing event with unique identifier.
- **Refund**: Return of funds to customer for returned or cancelled orders.
- **Chargeback**: Forced refund initiated by customer's bank or credit card company.
- **Pricing Tier**: Customer segment-specific pricing structure.
- **Markup Percentage**: Amount added to cost price to determine selling price.
- **Discount Percentage**: Reduction applied to standard price during promotions.
- **Margin Floor**: Minimum acceptable profit margin for any product (varies by segment).
- **Promotional Campaign**: Time-limited special pricing or offer for specific products.
- **Dynamic Pricing**: Algorithmic price adjustments based on demand, inventory, and other factors.
- **Price Calculation Service**: System component determining final prices based on multiple factors.

### Subscription Management

- **Subscription Plan**: Defined offering with specific frequency, products, and pricing.
- **Subscription Status**: Current state of a subscription (Active, Paused, Cancelled).
- **Subscription Frequency**: Recurring delivery schedule (Weekly, Bi-weekly, Monthly).
- **Subscription Tier**: Service level determining benefits and pricing (Basic, Premium, Elite).
- **Subscription Benefit**: Advantage provided to subscribers (Free shipping, Discounts, Early access).
- **Recurring Payment**: Automated billing for subscription services.
- **Next Delivery Date**: Scheduled date for upcoming subscription order fulfillment.
- **Subscription Modification**: Customer-initiated changes to subscription parameters.
- **Subscription Bundle**: Predefined collection of products offered as a subscription package.

### Compliance & Security

- **HACCP**: Hazard Analysis Critical Control Point - food safety management system.
- **ISO 22000**: Food safety management standard for organizations in the food chain.
- **FSMA**: Food Safety Modernization Act - US regulatory standard.
- **ANVISA**: Brazilian Health Regulatory Agency standards.
- **WCAG**: Web Content Accessibility Guidelines ensuring digital accessibility.
- **PCI DSS**: Payment Card Industry Data Security Standard for handling cardholder data.
- **GDPR/CCPA**: Data privacy regulations requiring explicit user consent for data collection.
- **Cold Chain Compliance**: Adherence to temperature control requirements (Target: ≥99.9%).
- **Audit Trail**: Chronological record of system activities for security and compliance verification.

### Marketing & Analytics

- **RAG**: Retrieval-Augmented Generation for AI-powered content creation.
- **Customer Behavior Analytics**: Analysis of shopping patterns and preferences.
- **Segmentation Accuracy**: Precision of customer classification algorithms (Target: ≥90%).
- **Content Engagement**: Customer interaction with marketing materials (Target: ≥30% improvement).
- **Abandoned Cart**: Shopping session where items were added but purchase not completed.
- **Sentiment Analysis**: Automated evaluation of customer feedback emotional tone.
- **Personalization**: Tailoring of content and recommendations to individual customers.

## Domain Model Components

### Bounded Contexts

1. **Customer Context**: Manages customer profiles, segmentation, and preferences.
2. **Catalog Context**: Handles product information, categorization, and search functionality.
3. **Catalog Authentication Context**: Verifies product authenticity and origin tracking.
4. **Ordering Context**: Processes order creation, validation, and fulfillment.
5. **Pricing Context**: Calculates prices and enforces pricing rules and promotions.
6. **Subscription Context**: Manages recurring orders and subscription lifecycle.
7. **Inventory Context**: Tracks stock levels, forecasting, and replenishment.
8. **Marketing Context**: Handles campaigns, promotions, and customer engagement.
9. **Payment Context**: Processes financial transactions and payment security.

### Aggregates

- **Customer**: Root entity managing customer information and behavior.
- **Product**: Root entity for product details, variants, and categorization.
- **Order**: Root entity coordinating the order fulfillment process.
- **Subscription**: Root entity managing recurring order lifecycle.
- **SubscriptionPlan**: Root entity defining subscription offerings and rules.
- **SubscriptionBundle**: Root entity for predefined product collections offered as subscriptions.
- **PromotionalCampaign**: Root entity for time-limited special offers.
- **InventoryItem**: Root entity tracking product availability and location.

### Domain Events

- **CustomerCreated**: Triggered when a new customer account is established.
- **CustomerUpdated**: Triggered when customer information is modified.
- **ProductCreated**: Triggered when a new product is added to the catalog.
- **InventoryAdjusted**: Triggered when product stock levels change.
- **PriceChanged**: Triggered when a product's price is modified.
- **OrderCreated**: Triggered when a customer places a new order.
- **OrderCancelled**: Triggered when an order is cancelled.
- **OrderPaid**: Triggered when payment for an order is received.
- **OrderPaymentFailed**: Triggered when a payment attempt is unsuccessful.
- **OrderFulfilled**: Triggered when an order is prepared and shipped.
- **SubscriptionCreated**: Triggered when a customer initiates a new subscription.
- **SubscriptionCancelled**: Triggered when a subscription is terminated.
- **SubscriptionPaused**: Triggered when a subscription is temporarily suspended.
- **SubscriptionResumed**: Triggered when a paused subscription is reactivated.
- **SubscriptionRenewed**: Triggered when a subscription period is extended.
- **SubscriptionEdited**: Triggered when subscription parameters are modified.
- **PricingRuleViolated**: Triggered when a pricing constraint is breached.
- **PromotionalCampaignCreated**: Triggered when a new promotion is established.
- **MarginFloorBreached**: Triggered when pricing falls below minimum margin requirements.

### Value Objects

- **Money**: Immutable representation of monetary amounts with currency.
- **Address**: Immutable representation of physical location with validation.
- **ContactInfo**: Immutable collection of customer contact methods.
- **CustomerId**: Unique identifier for customer entities.
- **ProductId**: Unique identifier for product entities.
- **OrderId**: Unique identifier for order entities.
- **SubscriptionId**: Unique identifier for subscription entities.
- **CustomerType**: Enumeration of customer segments.
- **SubscriptionFrequency**: Delivery cadence for recurring orders.
- **SubscriptionTier**: Service level classification for subscriptions.
- **SubscriptionBenefit**: Advantage provided to subscription customers.
- **PricingTier**: Customer segment-specific pricing structure.
- **MarkupPercentage**: Amount added to cost to determine selling price.
- **DiscountPercentage**: Reduction applied to standard price.
- **Quantity**: Amount of product with unit of measure.
- **TimeSlot**: Delivery or pickup time window.

### Domain Services

- **CustomerFactory**: Creates appropriate customer types based on segment.
- **PricingGovernanceService**: Enforces pricing rules and constraints.
- **MarginGuardRailService**: Ensures prices maintain minimum profit margins.
- **PromotionStackingService**: Manages application of multiple concurrent promotions.
- **PriceCalculationService**: Determines final prices using applicable rules.
- **OrderService**: Coordinates order processing workflow.

### Repositories

- **CustomerRepository**: Persists and retrieves customer aggregates.
- **ProductRepository**: Persists and retrieves product aggregates.
- **OrderRepository**: Persists and retrieves order aggregates.
- **SubscriptionRepository**: Persists and retrieves subscription aggregates.
- **SubscriptionBundleRepository**: Persists and retrieves subscription bundle aggregates.

### Policies

- **Pricing Policy**: Ensures minimum margins (40% retail, 30% commercial, 25% wholesale).
- **Inventory Policy**: Maintains minimum stock levels and reorder points.
- **Payment Policy**: Enforces 3D Secure and PCI compliance.
- **Delivery Policy**: Ensures SLA compliance for order fulfillment.
- **Subscription Policy**: Governs subscription lifecycle and billing rules.

---
*This document is a living artifact that evolves with the domain. Last updated: 2025-06-05*

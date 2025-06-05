# Domain Terms in Product Requirements

## Purpose

This document maps key domain terms from our ubiquitous language glossary to their specific usage in the product requirements document. This mapping helps ensure that business requirements are properly aligned with the domain model implementation and that terminology is used consistently across all artifacts.

## Mapping by Bounded Context

### 1. Customer Context

| Domain Term | Product Requirements Reference | Usage Context |
|-------------|--------------------------------|--------------|
| Customer | Section 1.2: "Customer registration and profile management" | Core entity representing users of the system |
| Diaspora Household | Section 1.2.1: "Target customer segments" | B2C customer segment with cultural ties to Lebanon/Mediterranean |
| Expat Resident | Section 1.2.1: "Target customer segments" | B2C customer segment of international residents in Barbados |
| Indigenous Foodie | Section 1.2.1: "Target customer segments" | B2C customer segment of local families exploring Mediterranean cuisine |
| Food Truck Operator | Section 1.2.2: "B2B customer segments" | B2B customer segment requiring specialty ingredients |
| Limited-Service Restaurant | Section 1.2.2: "B2B customer segments" | B2B customer segment for quick-service establishments |
| CustomerCreated | Section 1.3.1: "Customer lifecycle events" | Domain event triggered on successful registration |
| CustomerUpdated | Section 1.3.2: "Profile management" | Domain event triggered when profile information changes |
| ContactInfo | Section 1.2.3: "Customer data requirements" | Value object containing customer contact methods |
| CustomerType | Section 1.2.1-1.2.2: "Customer segments" | Enumeration of customer segments for classification |

### 2. Catalog Context

| Domain Term | Product Requirements Reference | Usage Context |
|-------------|--------------------------------|--------------|
| Product | Section 2.1: "Product catalog management" | Core entity representing items for sale |
| SKU | Section 2.1.2: "Product identification" | Unique identifier for product variants |
| Product Category | Section 2.1.3: "Catalog organization" | Hierarchical classification of products |
| Product Badge | Section 2.1.5: "Product display attributes" | Visual indicator of product attributes (e.g., "New") |
| ProductCreated | Section 2.2.1: "Catalog management events" | Domain event triggered when new product is added |
| PriceChanged | Section 2.2.3: "Price update events" | Domain event triggered when product price changes |
| Stock Level | Section 2.3.1: "Inventory tracking" | Current available quantity of a product |
| InventoryAdjusted | Section 2.3.2: "Inventory events" | Domain event triggered when stock levels change |

### 3. Catalog Authentication Context

| Domain Term | Product Requirements Reference | Usage Context |
|-------------|--------------------------------|--------------|
| QR Provenance | Section 3.1: "Product authentication mechanisms" | System for tracking product origin via QR codes |
| Authenticity Token | Section 3.1.2: "Digital authentication" | Digital certificate verifying product authenticity |
| Authentication Scan | Section 3.1.3: "Authentication process" | Process of verifying product authenticity |
| Counterfeit Detection | Section 3.1.4: "Security measures" | System for identifying fake products |
| Supply Chain Transparency | Section 3.2: "Supply chain visibility" | Tracking products from source to customer |

### 4. Pricing Context

| Domain Term | Product Requirements Reference | Usage Context |
|-------------|--------------------------------|--------------|
| Pricing Rule | Section 4.1: "Pricing governance" | Rules determining how prices are calculated |
| Margin Floor | Section 4.1.2: "Margin protection" | Minimum acceptable profit margin |
| MarginFloorBreached | Section 4.1.3: "Pricing alerts" | Event triggered when price falls below minimum margin |
| Pricing Tier | Section 4.2: "Customer segment pricing" | Segment-specific pricing structure |
| PricingGovernanceService | Section 4.1: "Pricing governance" | Service enforcing pricing rules |
| MarginGuardRailService | Section 4.1.2: "Margin protection" | Service ensuring margins stay within limits |
| Promotional Campaign | Section 4.3: "Promotional pricing" | Time-limited special pricing or offers |
| PromotionalCampaignCreated | Section 4.3.1: "Promotion events" | Event triggered when new promotion is established |
| Dynamic Pricing | Section 4.4: "Price optimization" | Algorithmic price adjustments based on factors |
| FX Risk Hedging | Section 4.5: "Currency management" | Protection against currency exchange fluctuations |

### 5. Subscription Context

| Domain Term | Product Requirements Reference | Usage Context |
|-------------|--------------------------------|--------------|
| Subscription | Section 5.1: "Subscription service" | Core entity for recurring orders |
| Subscription Plan | Section 5.1.1: "Subscription offerings" | Defined offering with frequency, products, pricing |
| Subscription Bundle | Section 5.1.2: "Bundle options" | Predefined collection of products as subscription |
| Home Bundle | Section 5.1.2: "Bundle options" | Subscription with staple Mediterranean ingredients |
| Explore Bundle | Section 5.1.2: "Bundle options" | Subscription with rotating discovery items |
| Subscription Status | Section 5.2: "Subscription lifecycle" | Current state of a subscription |
| SubscriptionCreated | Section 5.2.1: "Subscription events" | Event triggered when subscription is created |
| SubscriptionCancelled | Section 5.2.1: "Subscription events" | Event triggered when subscription is terminated |
| SubscriptionPaused | Section 5.2.1: "Subscription events" | Event triggered when subscription is suspended |
| SubscriptionResumed | Section 5.2.1: "Subscription events" | Event triggered when subscription is reactivated |
| SubscriptionRenewed | Section 5.2.1: "Subscription events" | Event triggered when subscription period extends |
| Churn Rate | Section 5.3: "Subscription metrics" | Monthly customer attrition rate |
| MRR | Section 5.3: "Subscription metrics" | Monthly Recurring Revenue from subscriptions |

### 6. Order Context

| Domain Term | Product Requirements Reference | Usage Context |
|-------------|--------------------------------|--------------|
| Order | Section 6.1: "Order management" | Core entity for customer purchases |
| Order Status | Section 6.1.2: "Order lifecycle" | Current state of an order |
| OrderCreated | Section 6.1.3: "Order events" | Event triggered when order is placed |
| OrderCancelled | Section 6.1.3: "Order events" | Event triggered when order is cancelled |
| OrderPaid | Section 6.1.3: "Order events" | Event triggered when payment is received |
| OrderPaymentFailed | Section 6.1.3: "Order events" | Event triggered when payment fails |
| OrderFulfilled | Section 6.1.3: "Order events" | Event triggered when order is shipped |
| Order Accuracy | Section 6.2: "Order metrics" | Percentage of orders without errors |
| On-Time Delivery | Section 6.2: "Order metrics" | Percentage of orders delivered on schedule |
| Order Processing Time | Section 6.2: "Order metrics" | Duration from order placement to fulfillment |
| SLA | Section 6.3: "Service level agreements" | Promised delivery timeframes and standards |

### 7. Inventory Context

| Domain Term | Product Requirements Reference | Usage Context |
|-------------|--------------------------------|--------------|
| Inventory | Section 7.1: "Inventory management" | Tracking of product availability |
| Stock Level | Section 7.1.1: "Inventory tracking" | Current available quantity of a product |
| Reorder Point | Section 7.1.2: "Inventory replenishment" | Threshold triggering automatic reordering |
| Inventory Forecast | Section 7.1.3: "Demand planning" | Prediction of future inventory needs |
| Inventory Accuracy | Section 7.2: "Inventory metrics" | Match between system and physical inventory |
| Forecast Accuracy | Section 7.2: "Inventory metrics" | Precision of inventory demand predictions |
| Cold Chain | Section 7.3: "Special handling" | Temperature-controlled supply chain |
| Cold Chain Compliance | Section 7.3.1: "Compliance metrics" | Adherence to temperature requirements |
| Warehouse | Section 7.4: "Facilities management" | Physical location for inventory storage |

### 8. Marketing Context

| Domain Term | Product Requirements Reference | Usage Context |
|-------------|--------------------------------|--------------|
| Campaign | Section 8.1: "Marketing campaigns" | Coordinated promotional activities |
| Customer Targeting | Section 8.1.2: "Audience segmentation" | Selection of customers for specific campaigns |
| Campaign ROI | Section 8.2: "Marketing metrics" | Return on investment for marketing activities |
| Content Engagement | Section 8.2: "Marketing metrics" | Customer interaction with marketing materials |
| Abandoned Cart | Section 8.3: "Conversion optimization" | Incomplete purchase sessions |
| Personalization | Section 8.4: "Customer experience" | Tailoring content to individual customers |
| RAG | Section 8.5: "AI-powered marketing" | Retrieval-Augmented Generation for content |
| Sentiment Analysis | Section 8.6: "Customer feedback" | Evaluation of customer feedback tone |

### 9. Payment Context

| Domain Term | Product Requirements Reference | Usage Context |
|-------------|--------------------------------|--------------|
| Payment | Section 9.1: "Payment processing" | Financial transaction for order |
| Payment Gateway | Section 9.1.1: "Payment providers" | Third-party service processing payments |
| Transaction | Section 9.1.2: "Transaction management" | Individual payment processing event |
| Refund | Section 9.1.3: "Refund processing" | Return of funds to customer |
| Chargeback | Section 9.1.4: "Dispute management" | Forced refund initiated by bank |
| 3D Secure | Section 9.2: "Payment security" | Authentication protocol for transactions |
| Payment Success Rate | Section 9.3: "Payment metrics" | Percentage of successful payment attempts |
| Reconciliation | Section 9.4: "Financial reporting" | Matching payment records with bank statements |
| PCI DSS | Section 9.2.1: "Compliance standards" | Payment Card Industry Data Security Standard |

## Terminology Consistency Analysis

### Consistent Terminology

The following terms are used consistently across both the product requirements document and domain model:

- Customer (core entity)
- Product (core entity)
- Order (core entity)
- Subscription (core entity)
- All customer segment types
- Most domain events (OrderCreated, SubscriptionCancelled, etc.)

### Inconsistent Terminology

The following terms show inconsistencies between the product requirements document and domain model:

1. **User vs. Customer**: The product requirements document occasionally uses "User" when referring to customers, particularly in authentication sections.

2. **Price vs. PriceChanged**: The product requirements discuss "Price" as a concept, while the domain model only has a PriceChanged event without an explicit Price value object.

3. **Inventory vs. InventoryAdjusted**: The product requirements treat Inventory as an aggregate, while the domain model only has an InventoryAdjusted event.

4. **Order Status vs. Order Events**: The product requirements refer to Order Status as a state, while the domain model represents status changes through events without an explicit OrderStatus value object.

## Recommendations for Alignment

1. **Standardize on "Customer"**: Replace all instances of "User" in product requirements with "Customer" for consistency.

2. **Create Missing Value Objects**: Implement explicit value objects for concepts that are implied but not explicitly modeled (Price, OrderStatus, SubscriptionStatus, etc.).

3. **Complete Missing Aggregates**: Implement proper aggregates for core concepts that are currently only represented by events (Inventory, Payment, etc.).

4. **Align Event Naming**: Ensure domain events follow a consistent naming convention that clearly indicates the state change they represent.

5. **Document Metrics in Domain Model**: Add explicit representation of business metrics mentioned in requirements (Order Accuracy, Inventory Accuracy, etc.) to enable monitoring and reporting.

## Conclusion

This mapping document provides a clear connection between the domain terms used in product requirements and their representation in the domain model. By addressing the identified inconsistencies and gaps, we can ensure that the ubiquitous language is applied consistently across all project artifacts, improving communication and reducing misunderstandings between business and technical teams.

---
*This document should be updated whenever significant changes are made to either the product requirements or domain model. Last updated: 2025-06-05*

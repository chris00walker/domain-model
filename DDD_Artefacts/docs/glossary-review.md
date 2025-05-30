# Ubiquitous Language Review

## Purpose
This document reconciles domain terminology across the business model and codebase, identifying inconsistencies, duplicates, and undefined terms.

## Consolidated Terms

| Term | Definition | Source | Status |
|------|------------|--------|--------|
| **Customer Segments** | | | |
| Diaspora Household (HH) | Families with cultural ties to Lebanon/Mediterranean seeking authentic ingredients | Glossary | ✓ Implemented |
| Expat Resident | Long-term international residents in Barbados | Glossary | ✓ Implemented |
| Indigenous Foodie Family | Local families interested in exploring Levantine/Mediterranean cuisines | Glossary | ✓ Implemented |
| Tourist | Short-term visitors in AirBnBs | Glossary | ✓ Implemented |
| Food Truck Operator | Mobile food vendors requiring specialty ingredients | Glossary | ✓ Implemented |
| Specialty Mini-Market | Small retail stores focusing on ethnic/imported foods | Glossary | ✓ Implemented |
| Limited-Service Restaurant | Quick-service dining establishments | Glossary | ✓ Implemented |
| **Products & Inventory** | | | |
| SKU | Stock Keeping Unit - unique identifier for each product variant | Glossary | ⚠️ Not Implemented |
| QR Provenance | QR code system for tracking product origin and authenticity | Glossary | ✓ Implemented |
| Home & Explore Bundles | Subscription boxes with staple and discovery items | Glossary | ⚠️ Not Fully Implemented |
| Sampler Kit | Small, affordable product samples for trial | Glossary | ⚠️ Not Implemented |
| **Business Metrics** | | | |
| AOV | Average Order Value (Target: BBD 300+) | Glossary | ℹ️ Business Concept |
| CAC | Customer Acquisition Cost (Max: BBD 20 retail, BBD 50 food-trucks) | Glossary | ℹ️ Business Concept |
| LTV | Customer Lifetime Value (Target: 4x CAC) | Glossary | ℹ️ Business Concept |
| GMV | Gross Merchandise Value | Glossary | ℹ️ Business Concept |
| Churn Rate | Monthly customer attrition (Target: ≤3% for subscribers) | Glossary | ℹ️ Business Concept |
| **Order Fulfillment** | | | |
| SLA | Service Level Agreement (e.g., 48h delivery, 95% on-time) | Glossary | ℹ️ Business Concept |
| FOB | Free On Board - shipping term where seller loads goods on transport | Glossary | ℹ️ Business Concept |
| RAG | Retrieval-Augmented Generation for AI content | Glossary | ℹ️ Technical Concept |
| 3D Secure | Payment authentication protocol | Glossary | ℹ️ Technical Concept |
| **Value Objects** | | | |
| Money | Currency and amount with built-in validation | Glossary | ✓ Implemented |
| Address | Physical location with validation | Glossary | ✓ Implemented |
| Quantity | Product quantity with unit of measure | Glossary | ⚠️ Not Implemented |
| TimeSlot | Delivery/pickup time window | Glossary | ⚠️ Not Implemented |
| **Aggregates** | | | |
| Customer | Representation of a business client or individual consumer | Glossary | ✓ Implemented |
| Product | Inventory item available for purchase | Glossary | ✓ Implemented |
| Order | Collection of items purchased together | Glossary | ✓ Implemented |
| Subscription | Recurring order arrangement | Glossary | ✓ Implemented |
| InventoryItem | Stock tracking unit | Glossary | ⚠️ Not Fully Implemented |

## Synonym Analysis

| Canonical Term | Synonyms Found | Recommendation |
|----------------|----------------|----------------|
| Customer | Client, User, Account | Standardize on "Customer" |
| Product | Item, Good, Merchandise | Standardize on "Product" |
| Order | Purchase, Transaction | Standardize on "Order" |
| Subscription | Recurring Order, Plan | Standardize on "Subscription" |

## Undefined or Ambiguous Terms

| Term | Context | Recommendation |
|------|---------|----------------|
| Bundle | Used in both subscription and product contexts | Define distinct terms: "SubscriptionBundle" vs "ProductBundle" |
| Delivery | Used for both order fulfillment and subscription delivery | Clarify with context: "OrderDelivery" vs "SubscriptionDelivery" |
| Account | Ambiguous between customer account and financial account | Use "CustomerAccount" or "FinancialAccount" explicitly |

## Recommendations

1. **Add Missing Value Objects**:
   - Implement `Quantity` value object with unit of measure
   - Implement `TimeSlot` value object for delivery windows

2. **Address Ambiguity**:
   - Add clear definitions for Bundle and Delivery terms
   - Create distinct types for ambiguous concepts

3. **Enforce Consistency**:
   - Update codebase to use canonical terms consistently
   - Add JSDoc comments with term definitions

4. **Domain Events Glossary**:
   - Create a separate section for domain events with clear definitions
   - Document event flows across bounded contexts

_Last Updated: 2025-05-30_

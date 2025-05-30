# Ubiquitous Language

## Core Domain Terms

### Customer Segments
- **Diaspora Household (HH)**: Families with cultural ties to Lebanon/Mediterranean seeking authentic ingredients
- **Expat Resident**: Long-term international residents in Barbados
- **Indigenous Foodie Family**: Local families interested in exploring Levantine/Mediterranean cuisines
- **Tourist**: Short-term visitors in AirBnBs
- **Food Truck Operator**: Mobile food vendors requiring specialty ingredients
- **Specialty Mini-Market**: Small retail stores focusing on ethnic/imported foods
- **Limited-Service Restaurant**: Quick-service dining establishments

### Products & Inventory
- **SKU**: Stock Keeping Unit - unique identifier for each product variant
- **QR Provenance**: QR code system for tracking product origin and authenticity
- **Home & Explore Bundles**: Subscription boxes with staple and discovery items
- **Sampler Kit**: Small, affordable product samples for trial

### Business Metrics
- **AOV**: Average Order Value (Target: BBD 300+)
- **CAC**: Customer Acquisition Cost (Max: BBD 20 retail, BBD 50 food-trucks)
- **LTV**: Customer Lifetime Value (Target: 4x CAC)
- **GMV**: Gross Merchandise Value
- **Churn Rate**: Monthly customer attrition (Target: ≤3% for subscribers)

### Order Fulfillment
- **SLA**: Service Level Agreement (e.g., 48h delivery, 95% on-time)
- **FOB**: Free On Board - shipping term where seller loads goods on transport
- **RAG**: Retrieval-Augmented Generation for AI content
- **3D Secure**: Payment authentication protocol

### Compliance
- **HACCP**: Food safety management system
- **ISO 22000**: Food safety management standard
- **WCAG**: Web Content Accessibility Guidelines
- **PCI DSS**: Payment Card Industry Data Security Standard

## Bounded Contexts
1. **Customer Management**: Handles customer profiles, authentication, and preferences
2. **Catalog & Inventory**: Manages product catalog, pricing, and stock levels
3. **Order Processing**: Handles order creation, payment, and fulfillment
4. **Subscription Service**: Manages recurring orders and subscription plans
5. **Compliance & Safety**: Ensures regulatory compliance and food safety
6. **Analytics & Reporting**: Provides business intelligence and metrics

## Domain Events
- `OrderPlaced`
- `PaymentProcessed`
- `InventoryReserved`
- `OrderFulfilled`
- `SubscriptionRenewed`
- `CustomerRegistered`

## Value Objects
- `Money`: Currency and amount with built-in validation
- `Address`: Physical location with validation
- `Quantity`: Product quantity with unit of measure
- `TimeSlot`: Delivery/pickup time window

## Aggregates
- `Customer`
- `Product`
- `Order`
- `Subscription`
- `InventoryItem`

## Policies
- **Pricing Policy**: Ensures minimum margins (40% retail, 30% commercial, 25% wholesale)
- **Inventory Policy**: Maintains minimum stock levels and reorder points
- **Payment Policy**: Enforces 3D Secure and PCI compliance
- **Delivery Policy**: Ensures SLA compliance for order fulfillment

---
*This document is a living artifact that evolves with the domain. Last updated: 2025-05-29*

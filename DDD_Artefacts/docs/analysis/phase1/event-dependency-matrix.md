# EFI Context Dependency Matrix

> **Purpose**: Map integration dependencies between missing contexts and existing system

## Summary

- **Total Missing Contexts**: 12
- **With Existing PRDs**: 12
- **With Upstream Dependencies**: 8
- **With Downstream Dependencies**: 11

## Context Dependencies

| Context | Status | Upstream Dependencies | Downstream Dependencies | Key Events |
| --- | --- | --- | --- | --- |
| **batch_tracking** | ✅ Has PRD | - | SupplierTrace | - |
| **cold_chain** | ✅ Has PRD | - | ShippingFulfillment, NotificationsAlerts | - |
| **inventory_management** | ✅ Has PRD | OrderMgmt, ProductCatalog, EventBus, PricingPromotions, ShoppingCart, OrderMgmt, ProductCatalog, SalesQuoting, ReturnsMgmt, EventBus | ShippingFulfillment, Warehouse, ShippingFulfillment, SupplierTrace, QualityControl, AnalyticsReporting, NotificationsAlerts, Odoo | - |
| **quality_control** | ✅ Has PRD | ReturnsMgmt, InventoryShelfLife | NotificationsAlerts, ComplianceServices | - |
| **returns** | ✅ Has PRD | - | InventoryShelfLife, QualityControl, NotificationsAlerts | - |
| **shopping_cart** | ✅ Has PRD | APIGateway | OrderMgmt, ProductCatalog, CustomerMgmt, Subscriptions, Reviews, InventoryShelfLife, PricingPromotions | - |
| **marketing** | ✅ Has PRD | CustomerMgmt | ProductCatalog, HubSpot, NotificationsAlerts, HubSpot | - |
| **supplier_traceability** | ✅ Has PRD | InventoryShelfLife, BatchTracking | SupplierEDI | - |
| **notifications_alerts** | ✅ Has PRD | InventoryShelfLife, ColdChainMonitor, PricingPromotions, QualityControl, AnalyticsReporting, ReturnsMgmt, Subscriptions, Marketing | CustomerMgmt, OrderMgmt | - |
| **analytics_reporting** | ✅ Has PRD | PaymentBilling, PaymentBilling, InventoryShelfLife, PricingPromotions | Tableau, ShippingFulfillment, NotificationsAlerts, GoogleAnalytics, Tableau | - |
| **reviews_ratings** | ✅ Has PRD | ShoppingCart | - | - |
| **sales_quoting** | ✅ Has PRD | - | PricingPromotions, InventoryShelfLife | - |

## Implementation Priority

Based on dependency analysis:

### Phase 1: Foundation (No upstream dependencies)
- **batch_tracking** (validate PRD)
- **cold_chain** (validate PRD)
- **returns** (validate PRD)
- **sales_quoting** (validate PRD)

### Phase 2: Integration (1-2 upstream dependencies)
- **shopping_cart** (validate PRD) - depends on: APIGateway
- **marketing** (validate PRD) - depends on: CustomerMgmt
- **reviews_ratings** (validate PRD) - depends on: ShoppingCart
- **quality_control** (validate PRD) - depends on: ReturnsMgmt, InventoryShelfLife
- **supplier_traceability** (validate PRD) - depends on: InventoryShelfLife, BatchTracking

### Phase 3: Complex Integration (3+ upstream dependencies)
- **analytics_reporting** (validate PRD) - depends on: PaymentBilling, PaymentBilling, InventoryShelfLife, PricingPromotions
- **notifications_alerts** (validate PRD) - depends on: InventoryShelfLife, ColdChainMonitor, PricingPromotions, QualityControl, AnalyticsReporting, ReturnsMgmt, Subscriptions, Marketing
- **inventory_management** (validate PRD) - depends on: OrderMgmt, ProductCatalog, EventBus, PricingPromotions, ShoppingCart, OrderMgmt, ProductCatalog, SalesQuoting, ReturnsMgmt, EventBus

---

Generated from context map analysis and existing PRD review

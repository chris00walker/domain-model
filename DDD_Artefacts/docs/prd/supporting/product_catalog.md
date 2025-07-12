# Product Catalog

[RELATED: ADR-002, ADR-004, ADR-006, ADR-007, ADR-008, ADR-009, ADR-011, ADR-012]
[CONTEXT: Supporting]
[STATUS: Draft]
[VERSION: 1.0.0]
[OWNER: @catalog-team]

## 1. Business Context
- **Purpose**: Serve as the single authoritative source of product master data (names, descriptions, nutritional facts, imagery, pricing references) for all customer-facing and operational contexts.
- **Business Capabilities**:
  - Unified product data CRUD with versioning & audit trail
  - SKU lifecycle management and status (active, discontinued, seasonal)
  - Attribute management (allergens, certifications, temperature sensitivity)
  - Localization (multi-language, multi-currency display attributes)
  - Real-time publication to downstream contexts (Shopping Cart, Order Management, Marketing)
- **Success Metrics**:
  - Catalogue completeness ≥ 99 % required attributes
  - Time-to-publish new SKU ≤ 2 h
  - Zero critical data quality defects per month (nutritional/allergen fields)
  - Searchable SKU latency ≤ 1 min after publish
- **Domain Experts**: Merchandising Lead, Regulatory Specialist, Product Photographer, Data Engineer

## 2. Domain Model
- **Key Entities**: `Product`, `SKU`, `ProductVariant`, `Attribute`, `Category`, `MediaAsset`, `NutritionFact`
- **Aggregates**:
  - `Product` (root) → owns variants, attributes, media assets
- **Value Objects**: `Money`, `UnitOfMeasure`, `AllergenList`, `ShelfLife`, `Certification`
- **Domain Services**: `CategoryHierarchyService`, `LocalizationService`, `PublicationService`
- **Domain Events**: `ProductCreated`, `ProductUpdated`, `ProductDiscontinued`, `ProductMediaUpdated`

## 3. Functional Requirements
### 3.1 Product Onboarding
- **FR-1**: As a merchandising manager, I can create a new `Product` with required attributes so that it becomes available for sale.
  - **Acceptance Criteria**:
    - [ ] Mandatory fields validated (name, category, base price reference, shelf life)
    - [ ] `ProductCreated` event published

### 3.2 SKU & Variant Management
- **FR-2**: As an admin, I can add or update `SKU` variants (size, packaging) so inventory can be tracked precisely.
  - **Acceptance Criteria**:
    - [ ] Variant inherits parent attributes by default
    - [ ] Version history retained

### 3.3 Attribute & Certification Updates
- **FR-3**: Regulatory specialist can modify nutritional facts or allergen list with audit log.
  - **Acceptance Criteria**:
    - [ ] Changes require 2-person review before publish
    - [ ] `ProductUpdated` event includes regulatory flag

### 3.4 Media Asset Management
- **FR-4**: Product photographers upload images & videos with auto-optimization.
  - **Acceptance Criteria**:
    - [ ] Max upload size 20 MB
    - [ ] CDN URL generated and stored in `MediaAsset`

### 3.5 Publication & Cache Invalidation
- **FR-5**: Upon approval, product data is published to downstream contexts within 60 s.
  - **Acceptance Criteria**:
    - [ ] Publication to Redis cache & event bus
    - [ ] Search index updated

### 3.6 Business Rules
- Product names must be unique within the catalog.
- All products must include valid name, description, base price, and at least one category.
- Price changes must preserve history and emit `PriceChanged` events.
- Nutritional and allergen data must follow standardized formats and be complete.
- Premium products require region-of-origin metadata and authentication provenance.
- Discontinued products remain visible but cannot be added to new orders.
- Bundle price must not exceed sum of component product prices and must contain at least two available products.
- Category hierarchy depth ≤ 5; category removal requires reassignment of all products.
- Inventory counts shown must reflect real-time availability; zero inventory marks item "out of stock" while retaining visibility.
- Search queries must be logged for analytics; search results ranked by relevance with business promotion rules.

## 4. Integration Points
### 4.1 Published Events
- `ProductCreated` → **Consumers**: InventoryShelfLife, PricingPromotions, ShoppingCart, AnalyticsReporting
- `ProductUpdated` → **Consumers**: ShoppingCart, OrderManagement, Marketing
- `ProductDiscontinued` → **Consumers**: InventoryShelfLife, OrderManagement, NotificationsAlerts
- `PriceChanged` → **Consumers**: PricingPromotions, CustomerManagement, AnalyticsReporting
- `InventoryAdjusted` → **Consumers**: InventoryShelfLife, ShoppingCart, OrderManagement
- `ProductCategorized` → **Consumers**: MarketingManagement, AnalyticsReporting
- `BundleCreated` → **Consumers**: ShoppingCart, MarketingManagement

### 4.2 Consumed Events
- `SupplierShipmentCreated` (SupplierTraceability) → auto-create draft Product for new supplier batch
- `RegulationUpdated` (Compliance) → trigger attribute review workflow
- `InventoryAdjusted` (InventoryWarehouse) → update stock status indicators
- `PricingRuleUpdated` (PricingPromotions) → schedule asynchronous price recalculation

### 4.3 APIs/Services
- **REST/GraphQL**: `/products`, `/products/{id}/variants`, `/categories`
- **gRPC**: `CatalogPublisher` used by other modules for bulk sync
- **External Services**: AWS S3 for media, Cloudinary optimization API

## 5. Non-Functional Requirements
- **Performance**: ≤ 100 ms read for product details (P95);
- **Scalability**: Handle catalogue of 100 k SKUs, 10 M read requests/day
- **Security**: Role-based access; PII-free data; audit logs per ADR-009
- **Reliability**: 99.9 % uptime; event-driven publication with retries
- **Maintainability**: Schema versioning; automated contract tests with consumers (/contract-test workflow)

## 6. Implementation Roadmap

### Phase 1 – Data Model Foundation (Weeks 1-2)
1. Implement `Product`, `Category`, and `MediaAsset` persistence with audit trail.
2. Expose `/products` and `/categories` CRUD APIs.
3. Emit `ProductCreated` and `ProductUpdated` events.

### Phase 2 – Search & Publication (Weeks 3-5)
1. Integrate Elasticsearch and implement `ProductSearchService`.
2. Implement event-driven cache invalidation using Redis per ADR-011.
3. Achieve search response time ≤ 500 ms (P95).

### Phase 3 – Advanced Catalog Features (Weeks 6-8)
1. Add bundle management and `BundleCreated` events.
2. Implement multilingual attribute management and localization workflows.
3. Automate media optimization pipeline with Cloudinary.

### Phase 4 – Optimisation & Analytics (Weeks 9-11)
1. Capture and analyse search query logs for relevance tuning.
2. Implement adaptive ranking rules with business promotion weights.
3. Hard-load testing to 100 k SKUs and 10 M daily reads.

## 7. Testing & Validation Strategy
- **Unit Tests**: Aggregate invariants (`Product`, `Category`, `Bundle`), value object validation, event emission.
- **Integration Tests**: Repository operations, Elasticsearch indexing, cross-context event flows.
- **Performance Tests**: Search latency ≤ 500 ms at 500 QPS using JMeter.
- **Security Tests**: Ensure PII-free data, RBAC enforcement, CSA STAR for cloud media storage.
- **User Acceptance Tests**: Merchandising workflows for product onboarding, variant creation, media uploads.
- **CI/CD Gates**: 80 % code coverage, linting, dependency scanning per ADR-012.

## 8. Open Questions
- [ ] Should we support GS1 GTIN as mandatory identifier for all SKUs?
- [ ] Need strategy for rich content (3D models) — separate service or within catalog?

## 9. Out of Scope
- Pricing logic (Pricing & Promotions context)
- Inventory stock levels (Inventory & Shelf-Life context)

## 10. References
- ADR-006: Shared Kernel Design
- ADR-008: Event-Driven Communication
- Context Map (context_map.puml)

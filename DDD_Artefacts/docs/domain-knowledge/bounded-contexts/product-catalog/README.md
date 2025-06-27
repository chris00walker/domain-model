---
title: [[Catalog]]
status: draft
owner: @Catalog-team
reviewers: @domain-experts, @tech-leads
last_updated: 2025-06-10
---

# [[Catalog]]

## Table of Contents
- [Overview](#overview)
- [Strategic Importance](#strategic-importance)
- [Core Domain Concepts](#core-domain-concepts)
- [Business Rules](#business-rules)
- [Domain Events](#domain-events)
- [Domain Model Components](#domain-model-components)
- [Aggregates](#aggregates)
- [Entities](#entities)
- [Value Objects](#value-objects)
- [Domain Services](#domain-services)
- [Integration Points](#integration-points)
- [Implementation Guidelines](#implementation-guidelines)
- [Testing Strategy](#testing-strategy)
- [Success Metrics](#success-metrics)
- [References](#references)

## Overview

The [[Catalog]] domain manages Elias Food Imports' [[Product]] information, categorization, and search capabilities. It serves as the central repository for all [[Product]]-related data, enabling customers to browse, search, and discover the company's specialty imported food products. This domain supports the company's business by maintaining accurate, detailed, and appealing [[Product]] information that drives sales and [[Customer]] engagement.

## Strategic Importance

**Domain Type**: Core Domain

**Business Value**: High  
The [[Catalog]] is essential to Elias Food Imports' business model as it directly enables [[Product]] discovery and purchase decisions by customers.

**Technical Complexity**: Medium  
While the domain requires robust search capabilities and integration with multiple contexts, the core data model and operations follow established patterns.

**Volatility**: Medium  
[[Product]] information requirements evolve with changing market needs and integration with new sales channels, but the fundamental [[Product]] concepts remain stable.

<!-- GAP_IMPLEMENTED: Rich Media Management | Low | Medium | Medium -->
<!-- stub for "Rich Media Management" gap in the [[Catalog]] context -->

<!-- GAP_IMPLEMENTED: [[Product]] Variant Management | Medium | Medium | High -->
<!-- stub for "[[Product]] Variant Management" gap in the [[Catalog]] context -->

## Core Domain Concepts

### [[Product]]

The central concept representing a specific food item available for purchase.

**Key Attributes**:
- [[Product]] identifier (unique reference)
- Name and description
- Price and currency
- [[Inventory]] count
- Discontinuation status
- QR provenance URL (linking to [[Authentication]] information)
- Category associations
- Creation and update timestamps
- Region of origin
- Nutritional information
- Allergen information
- Ingredient list
- Storage requirements
- [[Product]] dimensions and weight
- Shelf life information

### [[Product]] Category

A classification grouping for products with similar characteristics.

**Key Attributes**:
- Category identifier
- Name and description
- Parent category (for hierarchical categorization)
- Attribute schema (defining attributes specific to this category)
- Status (active, inactive)
- Display [[Order]]
- Creation and update timestamps

### [[Product]] Bundle

A curated collection of products sold together as a single offering.

**Key Attributes**:
- Bundle identifier
- Name and description
- Component products with quantities
- Bundle price (may differ from sum of component prices)
- Discount percentage
- Limited availability periods
- Bundle type (gift set, sampler, meal kit, etc.)
- Creation and update timestamps

### [[Product]] Attribute

A characteristic or property that describes a [[Product]].

**Key Attributes**:
- Attribute identifier
- Name and description
- Value type (text, number, boolean, enum)
- Unit of measure (if applicable)
- Is filterable (whether customers can filter by this attribute)
- Is comparable (whether this attribute can be used in [[Product]] comparisons)
- Display [[Order]]

### [[Product]] Search Query

A user request to find products based on specific criteria.

**Key Attributes**:
- Search terms
- Filters (categories, price ranges, attributes)
- Sort criteria
- Pagination parameters
- User context (language, region)
- Search timestamp
- Result count

### [[Product]] Variant

A specific version of a [[Product]] with unique characteristics.

**Key Attributes**:
- Variant identifier
- Parent [[Product]] identifier
- Variant attributes (size, flavor, packaging type)
- Price adjustment (if different from parent [[Product]]
- [[Inventory]] count
- SKU (Stock Keeping Unit)
- Barcode/UPC

## Business Rules

### [[Product]] Management Rules

1. **[[Product]] Creation**
   - All products must have a valid name, description, and price.
   - [[Product]] names must be unique within the [[Catalog]].
   - [[Product]] prices must be greater than zero.
   - Each [[Product]] must be associated with at least one category.
   - Premium products must include region of origin and [[Authentication]] information.

2. **[[Product]] Updates**
   - Price changes must preserve price history for audit purposes.
   - Price changes must trigger notifications to relevant stakeholders.
   - When products are modified, all search indexes must be updated.
   - [[Product]] discontinuation doesn't delete the [[Product]] but marks it as unavailable for new orders.

3. **[[Product]] Data Quality**
   - Nutritional information must follow standardized formats for the target market.
   - Allergen information must be complete and prominently displayed.
   - [[Product]] descriptions must be available in all supported languages.
   - [[Product]] images must meet minimum quality standards (resolution, format, background).
   - All required attributes for a [[Product]] category must be provided.

### [[Inventory]] Integration Rules

1. **[[Inventory]] Synchronization**
   - [[Inventory]] counts displayed in the [[Catalog]] must reflect real-time availability.
   - Low [[Inventory]] levels must trigger visibility of "limited availability" indicators.
   - When [[Inventory]] reaches zero, products must be marked as "out of stock" but remain visible.
   - [[Inventory]] adjustments must produce events for other systems to consume.

### Categorization Rules

1. **Category Structure**
   - Categories must form a directed acyclic graph (no circular references).
   - A [[Product]] can belong to multiple categories.
   - Category hierarchy depth must not exceed 5 levels for usability.
   - Categories must have unique identifiers and names.

2. **Category Management**
   - Removing a category requires reassigning or removing all its products.
   - Category merges must maintain [[Product]] relationships and search functionality.

### [[Product]] Bundle Rules

1. **Bundle Composition**
   - A bundle must contain at least two distinct products.
   - Bundle prices must be less than or equal to the sum of component [[Product]] prices.
   - All products in a bundle must be available (in stock and not discontinued).
   - Bundles must clearly indicate component products and quantities.

2. **Bundle Lifecycle**
   - If any component [[Product]] becomes unavailable, the bundle must be marked as unavailable.
   - Seasonal bundles must have defined start and end dates.
   - Bundle [[Inventory]] is limited by the minimum available [[Inventory]] of its components.

### Search and Discovery Rules

1. **Search Functionality**
   - Search must account for multilingual support and language-specific stemming.
   - Search results must be ranked by relevance, with business rules for promotion.
   - Search queries must be logged for analytics and improvement.
   - [[Product]] search must support filtering by multiple attributes.

2. **[[Product]] Visibility**
   - Products pending [[Authentication]] verification must be marked as "[[Authentication]] pending".
   - Products can be hidden from search results while remaining accessible by direct link.
   - Featured products must be clearly marked and prioritized in relevant searches.
   - Regional restrictions must be applied based on shipping and regulatory limitations.

## Domain Events

### ProductCreated

**Description**: Emitted when a new [[Product]] is successfully created in the [[Catalog]].

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "productId": "uuid-string",
  "name": "[[Product]] Name",
  "description": "[[Product]] Description",
  "price": {
    "amount": 29.99,
    "currency": "USD"
  },
  "inventoryCount": 100,
  "occurredOn": "2025-06-06T16:30:00Z"
}
```

**Consumers**:
- **Search Service**: Indexes the new [[Product]] for search functionality
- **[[Inventory]] Context**: Creates initial [[Inventory]] records
- **Recommendation Engine**: Updates [[Product]] offerings
- **Marketing Context**: Evaluates for potential promotional campaigns
- **Analytics Context**: Tracks [[Product]] [[Catalog]] growth metrics

### PriceChanged

**Description**: Emitted when a [[Product]]'s price is modified.

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "productId": "uuid-string",
  "previousPrice": {
    "amount": 24.99,
    "currency": "USD"
  },
  "newPrice": {
    "amount": 29.99,
    "currency": "USD"
  },
  "percentageChange": 20.0,
  "occurredOn": "2025-06-06T16:30:00Z"
}
```

**Consumers**:
- **Search Service**: Updates price in search index
- **[[Customer]] Context**: Notifies customers with wishlist or price alerts
- **[[Pricing]] Context**: Updates price history records
- **Analytics Context**: Monitors price change patterns

### InventoryAdjusted

**Description**: Emitted when a [[Product]]'s [[Inventory]] count changes.

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "productId": "uuid-string",
  "previousCount": 100,
  "adjustment": -5,
  "newCount": 95,
  "reason": "sale",
  "occurredOn": "2025-06-06T16:30:00Z"
}
```

**Consumers**:
- **Search Service**: Updates availability status
- **[[Inventory]] Context**: Synchronizes [[Inventory]] records
- **Analytics Context**: Tracks [[Inventory]] movement patterns
- **Purchase Context**: Updates [[Product]] availability for online shopping

### ProductDiscontinued

**Description**: Emitted when a [[Product]] is marked as discontinued.

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "productId": "uuid-string",
  "name": "[[Product]] Name",
  "remainingInventory": 50,
  "discontinuationReason": "supplier_discontinued",
  "effectiveDate": "2025-07-01T00:00:00Z",
  "occurredOn": "2025-06-06T16:30:00Z"
}
```

**Consumers**:
- **Search Service**: Updates [[Product]] status
- **[[Inventory]] Context**: Flags [[Inventory]] as discontinued
- **Purchase Context**: Adjusts [[Product]] availability
- **Marketing Context**: Potential clearance campaign trigger
- **[[Customer]] Context**: Notifies subscribed customers

### ProductCategorized

**Description**: Emitted when a [[Product]] is assigned to a category or its categorization changes.

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "productId": "uuid-string",
  "addedCategories": ["uuid-string-1", "uuid-string-2"],
  "removedCategories": ["uuid-string-3"],
  "currentCategories": ["uuid-string-1", "uuid-string-2"],
  "occurredOn": "2025-06-06T16:30:00Z"
}
```

**Consumers**:
- **Search Service**: Updates category facets
- **Recommendation Engine**: Updates cross-selling relationships
- **Analytics Context**: Tracks [[Product]] categorization patterns

### ProductBundleCreated

**Description**: Emitted when a new [[Product]] bundle is created.

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "bundleId": "uuid-string",
  "name": "Holiday Gift Set",
  "description": "Bundle Description",
  "componentProducts": [
    {"productId": "uuid-string-1", "quantity": 1},
    {"productId": "uuid-string-2", "quantity": 2}
  ],
  "price": {
    "amount": 49.99,
    "currency": "USD"
  },
  "discountPercentage": 15.0,
  "startDate": "2025-11-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z",
  "occurredOn": "2025-06-06T16:30:00Z"
}
```

**Consumers**:
- **Search Service**: Indexes the new bundle
- **Marketing Context**: Evaluates for promotional campaigns
- **Purchase Context**: Makes bundle available for purchase
- **Analytics Context**: Tracks bundle creation metrics

## Domain Model Components

### Aggregates

#### [[Product]] Aggregate

**Root Entity**: [[Product]]

**Invariants**:
- [[Product]] must have a valid name, description, and price
- [[Product]].inventoryCount must be >= 0
- [[Product]].price must be a valid Money value object with amount > 0
- [[Product]] price changes must publish a PriceChanged event
- [[Product]] [[Inventory]] adjustments must publish an InventoryAdjusted event
- [[Product]] can be marked as discontinued but not deleted

**Operations**:
- Create new [[Product]]
- Adjust [[Inventory]] count
- Change price
- Discontinue [[Product]]
- Reactivate discontinued [[Product]]
- Associate with categories

**Lifecycle States**:
- Active
- Discontinued
- Out of Stock
- Limited Availability

#### [[Product]] Category Aggregate

**Root Entity**: ProductCategory

**Invariants**:
- Category must have a valid name
- Category hierarchy must not contain cycles
- Category must maintain a list of products contained within it

**Operations**:
- Create new category
- Add [[Product]] to category
- Remove [[Product]] from category
- Update category metadata
- Deactivate/reactivate category

#### [[Product]] Bundle Aggregate

**Root Entity**: ProductBundle

**Invariants**:
- Bundle must contain at least two products
- Bundle price must be less than or equal to sum of component prices
- All component products must be available

**Operations**:
- Create new bundle
- Add [[Product]] to bundle
- Remove [[Product]] from bundle
- Update bundle [[Pricing]]
- Set bundle availability period

### Entities

#### ProductImage

**Properties**:
- Image ID
- [[Product]] ID (foreign key)
- Image URL
- Image type (primary, alternate, detail, etc.)
- Sort [[Order]]
- Alt text
- Creation timestamp

#### ProductReview

**Properties**:
- Review ID
- [[Product]] ID (foreign key)
- [[Customer]] ID
- Rating (numeric)
- Review text
- Review date
- Verification status
- Helpfulness votes

#### RelatedProduct

**Properties**:
- Source [[Product]] ID
- Related [[Product]] ID
- Relationship type (complementary, accessory, alternative, etc.)
- Relationship strength (numeric)

### Value Objects

#### ProductId

**Properties**:
- Identifier (UUID)

**Behavior**:
- Equality comparison
- String representation

#### Money

**Properties**:
- Amount (decimal)
- Currency (ISO code)

**Behavior**:
- Arithmetic operations (add, subtract, multiply)
- Currency conversion
- Formatting for display
- Comparison operations
- Check if positive

#### ProductStatus

**Values**:
- Active
- OutOfStock
- LimitedAvailability
- Discontinued
- PendingApproval
- AuthenticationPending

#### CategoryPath

**Properties**:
- Path segments (array of category IDs from root to leaf)

**Behavior**:
- Path traversal
- Depth calculation
- Parent/child relationship validation
- Path string representation

### Domain Services

#### ProductSearchService

**Responsibility**: Provides advanced search capabilities across the [[Product]] [[Catalog]]

**Operations**:
- Search products by text query
- Apply filtering by multiple parameters
- Sort results by various criteria
- Provide faceted navigation options
- Handle multilingual searches

#### ProductRecommendationService

**Responsibility**: Suggests related products based on various algorithms

**Operations**:
- Find complementary products
- Find alternative products
- Find frequently purchased together products
- Generate personalized recommendations

#### ProductCategorizationService

**Responsibility**: Manages the placement of products in the category hierarchy

**Operations**:
- Assign [[Product]] to categories
- Remove [[Product]] from categories
- Validate categorization rules
- Maintain category hierarchy integrity

## Administrative Capabilities

### Admin Application Services

#### ProductCatalogManagementService

**Responsibility**: Provides advanced [[Product]] management capabilities for administrative users

**Operations**:
- Create and update products with extended validation
- Manage [[Product]] discontinuation workflow
- Handle batch [[Product]] imports and updates
- Configure [[Product]] visibility across channels
- Override automated business rules when necessary

**Authorization**: Requires `[[Catalog]]:[[Product]]:manage` permission

#### CategoryManagementService

**Responsibility**: Manages the [[Product]] categorization hierarchy

**Operations**:
- Create, update, and archive categories
- Reorganize category hierarchies
- Manage category attribute schemas
- Define category-specific business rules
- Generate category performance reports

**Authorization**: Requires `[[Catalog]]:category:manage` permission

#### AttributeSchemaService

**Responsibility**: Manages [[Product]] attribute definitions and schemas

**Operations**:
- Define new [[Product]] attributes
- Configure attribute validation rules
- Manage attribute relationships and dependencies
- Create and update attribute schemas for categories

**Authorization**: Requires `[[Catalog]]:attributes:manage` permission

### Admin Read Models

#### ProductApprovalDashboardModel

**Purpose**: Displays products awaiting administrative approval

**Key Metrics**:
- Products pending approval count by category
- Average time in approval queue
- Approval bottlenecks by attribute or requirement
- Products with missing critical information

#### CatalogHealthModel

**Purpose**: Monitors overall [[Catalog]] data quality and completeness

**Key Metrics**:
- [[Product]] data completeness scores by category
- Image quality compliance rates
- Description quality metrics
- SEO readiness scores
- [[Authentication]] status distribution

#### CategoryPerformanceModel

**Purpose**: Visualizes business performance metrics by category

**Key Metrics**:
- Revenue and margin by category
- Conversion rates compared to browse rates
- Search frequency versus conversion
- Top and bottom performing products by category

### Admin Domain Events

#### ProductApprovedByAdmin

**Description**: Emitted when a [[Product]] is manually approved for publication by an administrator

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "productId": "uuid-string",
  "name": "[[Product]] Name",
  "version": 3,
  "adminId": "admin-uuid",
  "notes": "Approved with special [[Pricing]] conditions",
  "overriddenValidations": ["price_tier_validation"],
  "occurredOn": "2025-06-10T15:30:00Z"
}
```

#### CategoryHierarchyRestructuredByAdmin

**Description**: Emitted when an administrator reorganizes the category hierarchy

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "categoryId": "uuid-string",
  "name": "Category Name",
  "oldParentId": "parent-uuid-old",
  "newParentId": "parent-uuid-new",
  "affectedProductCount": 42,
  "adminId": "admin-uuid",
  "reason": "Strategic reorganization for summer campaign",
  "occurredOn": "2025-06-10T16:45:00Z"
}
```

#### ProductAttributeSchemaModifiedByAdmin

**Description**: Emitted when an administrator modifies attribute schemas affecting multiple products

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "schemaId": "uuid-string",
  "name": "Specialty Foods Schema",
  "modifiedAttributes": [
    {
      "attributeId": "attr-uuid-1",
      "name": "Country of Origin",
      "changeType": "required_status_changed",
      "oldValue": false,
      "newValue": true
    }
  ],
  "affectedCategoryIds": ["cat-uuid-1", "cat-uuid-2"],
  "affectedProductCount": 156,
  "adminId": "admin-uuid",
  "occurredOn": "2025-06-10T14:20:00Z"
}
```

### Repositories

#### ProductRepository

**Responsibility**: Persistence operations for the [[Product]] aggregate

**Operations**:
- Find [[Product]] by ID
- Find products by name (partial match)
- Find products within a price range
- Find products that are low in [[Inventory]]
- Find discontinued products
- Save a [[Product]] (create or update)
- Get all products

#### ProductCategoryRepository

**Responsibility**: Persistence operations for the ProductCategory aggregate

**Operations**:
- Find category by ID
- Find categories by name
- Find categories by parent category
- Find root categories
- Save a category (create or update)
- Get all categories

#### ProductBundleRepository

**Responsibility**: Persistence operations for the ProductBundle aggregate

**Operations**:
- Find bundle by ID
- Find bundles containing a specific [[Product]]
- Find active bundles
- Find seasonal bundles
- Save a bundle (create or update)
- Get all bundles

## Integration Points

### Integration with [[Catalog]] [[Authentication]] Domain

**Relationship Type**: Partnership

**Integration Points**:
- [[Catalog]] provides base [[Product]] information to [[Authentication]]
- [[Authentication]] provides authenticity verification status to [[Catalog]]
- Both share key concepts like [[Product]], ProductOrigin
- The [[Catalog]] domain displays [[Authentication]] status but delegates verification processes

**Data Exchange**:
- [[Catalog]] sends ProductCreated events to trigger [[Authentication]] processes
- [[Authentication]] sends ProductAuthenticated events to update [[Catalog]] status
- [[Catalog]] links to [[Authentication]] details via QR provenance URLs

### Integration with [[Inventory]] Domain

**Relationship Type**: [[Customer]]-Supplier

**Integration Points**:
- [[Catalog]] consumes [[Inventory]] information (stock levels)
- [[Catalog]] translates [[Inventory]] data into [[Customer]]-facing availability status
- Both share key concepts like [[Product]] and InventoryCount

**Data Exchange**:
- [[Inventory]] sends StockUpdated events to [[Catalog]]
- [[Catalog]] sends InventoryAdjusted events to [[Inventory]]

### Integration with [[Pricing]] Domain

**Relationship Type**: [[Customer]]-Supplier

**Integration Points**:
- [[Catalog]] displays prices calculated by the [[Pricing]] domain
- [[Pricing]] domain manages price rules, discounts, and promotions
- Both share the concept of ProductPrice

**Data Exchange**:
- [[Pricing]] sends PriceCalculated events to update [[Catalog]] prices
- [[Catalog]] sends PriceDisplay events for analytics

### Integration with Marketing Domain

**Relationship Type**: Partnership

**Integration Points**:
- [[Catalog]] provides [[Product]] data for marketing campaigns
- Marketing provides promotion flags and featured [[Product]] designations
- Both domains collaborate on bundle creation and seasonal offerings

**Data Exchange**:
- Marketing sends PromotionCreated events to highlight products
- [[Catalog]] sends ProductBundleCreated events for promotional planning

### Integration with [[Customer]] Domain

**Relationship Type**: Supplier

**Integration Points**:
- [[Catalog]] provides [[Product]] information for [[Customer]]-facing interfaces
- [[Customer]] domain provides personalization data to customize [[Catalog]] views
- Both share concepts around [[Product]] interests and recommendations

**Data Exchange**:
- [[Customer]] sends ProductViewed events for analytics
- [[Catalog]] sends ProductDiscontinued notifications to interested customers

## Implementation Guidelines

### Code Organization

```typescript
// Directory structure
src/[[Catalog]]/
  domain/
    aggregates/       // [[Product]], ProductCategory, ProductBundle
    entities/         // ProductImage, ProductReview, etc.
    value-objects/    // ProductId, ProductStatus, etc.
    events/           // ProductCreated, PriceChanged, etc.
    repositories/     // Repository interfaces
    services/         // Domain services
  application/
    commands/         // CreateProduct, UpdatePrice, etc.
    queries/          // GetProduct, SearchProducts, etc.
    services/         // Application services
  infrastructure/
    persistence/      // Repository implementations
    search/           // Search integration
    api/              // API endpoints
```

### Key Implementations

#### [[Product]] Aggregate Implementation

```typescript
export class [[Product]] extends AggregateRoot<ProductProps> {
  private constructor(props: ProductProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: Omit<ProductProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
    clock: Clock = new SystemClock()
  ): Result<[[Product]], string> {
    // Validate invariants
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.description, argumentName: 'description' },
      { argument: props.price, argumentName: 'price' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.inventoryCount < 0) {
      return failure('[[Product]] [[Inventory]] count cannot be negative');
    }

    if (!props.price.isPositive()) {
      return failure('[[Product]] price must be greater than zero');
    }

    // Create the [[Product]]
    const now = clock.now();
    const [[Product]] = new [[Product]]({
      ...props,
      isDiscontinued: props.isDiscontinued ?? false,
      createdAt: now,
      updatedAt: now
    }, id);

    // Publish domain event
    [[Product]].addDomainEvent(new ProductCreated([[Product]];

    return success([[Product]];
  }

  // Additional methods like adjustInventory(), changePrice(), etc.
}
```

#### Repository Implementation Pattern

```typescript
export class MongoProductRepository implements ProductRepository {
  constructor(private readonly connection: mongoose.Connection) {}

  async findById(id: ProductId): Promise<[[Product]] | null> {
    // Implementation details
  }

  async save([[Product]]: [[Product]]: Promise<void> {
    // Implementation details including domain event dispatching
  }

  // Additional repository methods
}
```

### Event Integration

```typescript
// Event subscriber pattern
export class CatalogEventHandlers {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly searchIndexer: SearchIndexer
  ) {}

  @Subscribe(ProductCreated)
  async handleProductCreated(event: ProductCreated) {
    await this.searchIndexer.indexProduct(event.productId);
  }

  @Subscribe(InventoryStockUpdated)
  async handleInventoryUpdated(event: InventoryStockUpdated) {
    const [[Product]] = await this.productRepo.findById(new ProductId(event.productId));
    if ([[Product]] {
      await [[Product]].adjustInventory(event.newCount - [[Product]].inventoryCount);
      await this.productRepo.save([[Product]];
    }
  }

  // Additional event handlers
}
```

## Ubiquitous Language

The following terms make up the ubiquitous language for the [[Catalog]] Domain and should be consistently used across all documentation, code, and communication.

| Term | Definition |
| --- | --- |
| [[Product]] | A specific food item available for purchase in the Elias Food Imports [[Catalog]] |
| [[Product]] Category | A classification grouping for products with similar characteristics |
| [[Product]] Bundle | A curated collection of products sold together as a single offering |
| [[Product]] Variant | A specific version of a [[Product]] with unique characteristics (size, packaging) |
| SKU | Stock Keeping Unit; a unique identifier for [[Inventory]] tracking |
| Discontinuation | The process of phasing out a [[Product]] from active sales |
| Featured [[Product]] | A [[Product]] given special prominence in the [[Catalog]] for promotional purposes |
| [[Product]] Origin | The geographical source of a [[Product]], especially important for specialty foods |
| Provenance | The documented history of a [[Product]]'s origin and authenticity |
| [[Inventory]] Count | The current available quantity of a [[Product]] |
| Limited Availability | A [[Product]] status indicating low [[Inventory]] levels |
| Out of Stock | A [[Product]] status indicating zero available [[Inventory]] |
| [[Product]] Attribute | A characteristic or property that describes a [[Product]] |
| Category Hierarchy | The tree-like structure of [[Product]] categories |
| [[Product]] Search Query | A user request to find products based on specific criteria |
| Related [[Product]] | A [[Product]] with a defined relationship to another [[Product]] |
| Seasonal Bundle | A [[Product]] bundle available only during specific time periods |
| [[Product]] [[Authentication]] | Verification of a [[Product]]'s authenticity and provenance |

## Testing Strategy

### Unit Testing

**Focus Areas**:
- [[Catalog]] domain aggregates and entities
- Value object validations and operations
- Domain service operations

**Testing Approach**:
- Test all invariant validations in aggregates
- Verify domain event generation on state changes
- Test business rule enforcement in domain services
- Validate value object behaviors and constraints

**Examples**:
```typescript
describe('[[Product]] Aggregate', () => {
  test('should enforce positive price invariant', () => {
    // Arrange
    const invalidProps = {
      name: 'Test [[Product]]',
      description: 'Test Description',
      price: Money.create({ amount: -10, currency: 'USD' }).value,
      inventoryCount: 10,
    };
    
    // Act
    const result = [[Product]].create(invalidProps);
    
    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('[[Product]] price must be greater than zero');
  });
});
```

### Integration Testing

**Focus Areas**:
- Repository implementations
- Domain event handling across contexts
- Search indexing and query operations

**Testing Approach**:
- Test repository operations against test databases
- Verify event handling and propagation
- Test [[Catalog]] search functionality with sample datasets
- Validate category hierarchy operations

**Examples**:
```typescript
describe('[[Product]] Search Integration', () => {
  test('should find products by partial name match', async () => {
    // Arrange - set up test database with sample products
    // ...
    
    // Act
    const results = await productSearchService.findByName('artisan');
    
    // Assert
    expect(results).toHaveLength(3);
    expect(results.map(p => p.name)).toContain('Artisan Olive Oil');
  });
});
```

### Acceptance Testing

**Focus Areas**:
- End-to-end [[Catalog]] operations
- Complete [[Customer]] journeys involving [[Catalog]]
- Performance and load testing of search operations

**Testing Approach**:
- Use BDD scenarios for critical [[Catalog]] user stories
- Test [[Catalog]] performance under expected load
- Verify cross-domain integration scenarios

**Examples**:
```gherkin
Feature: [[Product]] Search and Filtering

  Scenario: [[Customer]] searches for products by region
    Given the [[Catalog]] contains products from multiple regions
    When a [[Customer]] searches for products from "Sicily"
    Then only Sicilian products should be displayed
    And each [[Product]] should show its [[Authentication]] status
    And results should load within 500ms
```

## Success Metrics

**Data Quality Metrics**:
- [[Product]] data completeness ≥ 98% (all required fields populated)
- [[Product]] description quality score ≥ 90% (based on SEO and content guidelines)
- Image quality compliance ≥ 95% (resolution, format, background requirements)
- Attribute accuracy ≥ 99% (verified against supplier specifications)

**Search Performance Metrics**:
- Search response time ≤ 500ms for 95% of queries
- Search relevance score ≥ 85% (measured by user clickthrough rates)
- Zero failed searches due to [[Catalog]] errors
- Search index freshness ≤ 5 minutes from [[Product]] updates

**Business Outcome Metrics**:
- [[Product]] discovery rate ≥ 65% (percentage of [[Catalog]] viewed by visitors)
- Category navigation depth ≥ 2.5 pages on average
- [[Product]] bundle conversion rate ≥ 25% (compared to individual products)
- Cross-sell click-through rate ≥ 15% (from related [[Product]] recommendations)

**[[Customer]] Experience Metrics**:
- [[Product]] information satisfaction score ≥ 4.5/5
- Time to find desired products ≤ 45 seconds
- Filter usage rate ≥ 75% for complex searches
- Category navigation clarity rating ≥ 90%

## References

1. Domain Events [[Catalog]]
2. Bounded Context Map: [Context Map](/docs/v2/bounded-context-map.md)
3. Ubiquitous Language Guidelines: [Language Guidelines](/docs/v2/ubiquitous-language-guidelines.md)
4. Business Problem Acceptance Criteria: [Acceptance Criteria](/docs/v2/business-problem-acceptance-criteria.md)
5. [[Catalog]] Context: [[[Authentication]] Domain](/docs/v2/domain-knowledge/core-contexts/[[Catalog]]-auth/README.md)

---
title: Catalog Domain Documentation
status: draft
owner: @catalog-team
reviewers: @domain-experts, @tech-leads
last_updated: 2025-06-10
---

# Catalog Domain

## Overview

The Catalog domain manages Elias Food Imports' product information, categorization, and search capabilities. It serves as the central repository for all product-related data, enabling customers to browse, search, and discover the company's specialty imported food products. This domain supports the company's business by maintaining accurate, detailed, and appealing product information that drives sales and customer engagement.

## Strategic Importance

**Domain Type**: Core Domain

**Business Value**: High  
The catalog is essential to Elias Food Imports' business model as it directly enables product discovery and purchase decisions by customers.

**Technical Complexity**: Medium  
While the domain requires robust search capabilities and integration with multiple contexts, the core data model and operations follow established patterns.

**Volatility**: Medium  
Product information requirements evolve with changing market needs and integration with new sales channels, but the fundamental product concepts remain stable.

<!-- GAP_IMPLEMENTED: Rich Media Management | Low | Medium | Medium -->
<!-- stub for "Rich Media Management" gap in the catalog context -->

<!-- GAP_IMPLEMENTED: Product Variant Management | Medium | Medium | High -->
<!-- stub for "Product Variant Management" gap in the catalog context -->

## Core Domain Concepts

### Product

The central concept representing a specific food item available for purchase.

**Key Attributes**:
- Product identifier (unique reference)
- Name and description
- Price and currency
- Inventory count
- Discontinuation status
- QR provenance URL (linking to authentication information)
- Category associations
- Creation and update timestamps
- Region of origin
- Nutritional information
- Allergen information
- Ingredient list
- Storage requirements
- Product dimensions and weight
- Shelf life information

### Product Category

A classification grouping for products with similar characteristics.

**Key Attributes**:
- Category identifier
- Name and description
- Parent category (for hierarchical categorization)
- Attribute schema (defining attributes specific to this category)
- Status (active, inactive)
- Display order
- Creation and update timestamps

### Product Bundle

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

### Product Attribute

A characteristic or property that describes a product.

**Key Attributes**:
- Attribute identifier
- Name and description
- Value type (text, number, boolean, enum)
- Unit of measure (if applicable)
- Is filterable (whether customers can filter by this attribute)
- Is comparable (whether this attribute can be used in product comparisons)
- Display order

### Product Search Query

A user request to find products based on specific criteria.

**Key Attributes**:
- Search terms
- Filters (categories, price ranges, attributes)
- Sort criteria
- Pagination parameters
- User context (language, region)
- Search timestamp
- Result count

### Product Variant

A specific version of a product with unique characteristics.

**Key Attributes**:
- Variant identifier
- Parent product identifier
- Variant attributes (size, flavor, packaging type)
- Price adjustment (if different from parent product)
- Inventory count
- SKU (Stock Keeping Unit)
- Barcode/UPC

## Business Rules

### Product Management Rules

1. **Product Creation**
   - All products must have a valid name, description, and price.
   - Product names must be unique within the catalog.
   - Product prices must be greater than zero.
   - Each product must be associated with at least one category.
   - Premium products must include region of origin and authentication information.

2. **Product Updates**
   - Price changes must preserve price history for audit purposes.
   - Price changes must trigger notifications to relevant stakeholders.
   - When products are modified, all search indexes must be updated.
   - Product discontinuation doesn't delete the product but marks it as unavailable for new orders.

3. **Product Data Quality**
   - Nutritional information must follow standardized formats for the target market.
   - Allergen information must be complete and prominently displayed.
   - Product descriptions must be available in all supported languages.
   - Product images must meet minimum quality standards (resolution, format, background).
   - All required attributes for a product category must be provided.

### Inventory Integration Rules

1. **Inventory Synchronization**
   - Inventory counts displayed in the catalog must reflect real-time availability.
   - Low inventory levels must trigger visibility of "limited availability" indicators.
   - When inventory reaches zero, products must be marked as "out of stock" but remain visible.
   - Inventory adjustments must produce events for other systems to consume.

### Categorization Rules

1. **Category Structure**
   - Categories must form a directed acyclic graph (no circular references).
   - A product can belong to multiple categories.
   - Category hierarchy depth must not exceed 5 levels for usability.
   - Categories must have unique identifiers and names.

2. **Category Management**
   - Removing a category requires reassigning or removing all its products.
   - Category merges must maintain product relationships and search functionality.

### Product Bundle Rules

1. **Bundle Composition**
   - A bundle must contain at least two distinct products.
   - Bundle prices must be less than or equal to the sum of component product prices.
   - All products in a bundle must be available (in stock and not discontinued).
   - Bundles must clearly indicate component products and quantities.

2. **Bundle Lifecycle**
   - If any component product becomes unavailable, the bundle must be marked as unavailable.
   - Seasonal bundles must have defined start and end dates.
   - Bundle inventory is limited by the minimum available inventory of its components.

### Search and Discovery Rules

1. **Search Functionality**
   - Search must account for multilingual support and language-specific stemming.
   - Search results must be ranked by relevance, with business rules for promotion.
   - Search queries must be logged for analytics and improvement.
   - Product search must support filtering by multiple attributes.

2. **Product Visibility**
   - Products pending authentication verification must be marked as "authentication pending".
   - Products can be hidden from search results while remaining accessible by direct link.
   - Featured products must be clearly marked and prioritized in relevant searches.
   - Regional restrictions must be applied based on shipping and regulatory limitations.

## Domain Events

### ProductCreated

**Description**: Emitted when a new product is successfully created in the catalog.

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "productId": "uuid-string",
  "name": "Product Name",
  "description": "Product Description",
  "price": {
    "amount": 29.99,
    "currency": "USD"
  },
  "inventoryCount": 100,
  "occurredOn": "2025-06-06T16:30:00Z"
}
```

**Consumers**:
- **Search Service**: Indexes the new product for search functionality
- **Inventory Context**: Creates initial inventory records
- **Recommendation Engine**: Updates product offerings
- **Marketing Context**: Evaluates for potential promotional campaigns
- **Analytics Context**: Tracks product catalog growth metrics

### PriceChanged

**Description**: Emitted when a product's price is modified.

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
- **Customer Context**: Notifies customers with wishlist or price alerts
- **Pricing Context**: Updates price history records
- **Analytics Context**: Monitors price change patterns

### InventoryAdjusted

**Description**: Emitted when a product's inventory count changes.

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
- **Inventory Context**: Synchronizes inventory records
- **Analytics Context**: Tracks inventory movement patterns
- **Purchase Context**: Updates product availability for online shopping

### ProductDiscontinued

**Description**: Emitted when a product is marked as discontinued.

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "productId": "uuid-string",
  "name": "Product Name",
  "remainingInventory": 50,
  "discontinuationReason": "supplier_discontinued",
  "effectiveDate": "2025-07-01T00:00:00Z",
  "occurredOn": "2025-06-06T16:30:00Z"
}
```

**Consumers**:
- **Search Service**: Updates product status
- **Inventory Context**: Flags inventory as discontinued
- **Purchase Context**: Adjusts product availability
- **Marketing Context**: Potential clearance campaign trigger
- **Customer Context**: Notifies subscribed customers

### ProductCategorized

**Description**: Emitted when a product is assigned to a category or its categorization changes.

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
- **Analytics Context**: Tracks product categorization patterns

### ProductBundleCreated

**Description**: Emitted when a new product bundle is created.

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

#### Product Aggregate

**Root Entity**: Product

**Invariants**:
- Product must have a valid name, description, and price
- Product.inventoryCount must be >= 0
- Product.price must be a valid Money value object with amount > 0
- Product price changes must publish a PriceChanged event
- Product inventory adjustments must publish an InventoryAdjusted event
- Product can be marked as discontinued but not deleted

**Operations**:
- Create new product
- Adjust inventory count
- Change price
- Discontinue product
- Reactivate discontinued product
- Associate with categories

**Lifecycle States**:
- Active
- Discontinued
- Out of Stock
- Limited Availability

#### Product Category Aggregate

**Root Entity**: ProductCategory

**Invariants**:
- Category must have a valid name
- Category hierarchy must not contain cycles
- Category must maintain a list of products contained within it

**Operations**:
- Create new category
- Add product to category
- Remove product from category
- Update category metadata
- Deactivate/reactivate category

#### Product Bundle Aggregate

**Root Entity**: ProductBundle

**Invariants**:
- Bundle must contain at least two products
- Bundle price must be less than or equal to sum of component prices
- All component products must be available

**Operations**:
- Create new bundle
- Add product to bundle
- Remove product from bundle
- Update bundle pricing
- Set bundle availability period

### Entities

#### ProductImage

**Properties**:
- Image ID
- Product ID (foreign key)
- Image URL
- Image type (primary, alternate, detail, etc.)
- Sort order
- Alt text
- Creation timestamp

#### ProductReview

**Properties**:
- Review ID
- Product ID (foreign key)
- Customer ID
- Rating (numeric)
- Review text
- Review date
- Verification status
- Helpfulness votes

#### RelatedProduct

**Properties**:
- Source product ID
- Related product ID
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

**Responsibility**: Provides advanced search capabilities across the product catalog

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
- Assign product to categories
- Remove product from categories
- Validate categorization rules
- Maintain category hierarchy integrity

### Repositories

#### ProductRepository

**Responsibility**: Persistence operations for the Product aggregate

**Operations**:
- Find product by ID
- Find products by name (partial match)
- Find products within a price range
- Find products that are low in inventory
- Find discontinued products
- Save a product (create or update)
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
- Find bundles containing a specific product
- Find active bundles
- Find seasonal bundles
- Save a bundle (create or update)
- Get all bundles

## Integration Points

### Integration with Catalog Authentication Domain

**Relationship Type**: Partnership

**Integration Points**:
- Catalog provides base product information to Authentication
- Authentication provides authenticity verification status to Catalog
- Both share key concepts like Product, ProductOrigin
- The Catalog domain displays authentication status but delegates verification processes

**Data Exchange**:
- Catalog sends ProductCreated events to trigger authentication processes
- Authentication sends ProductAuthenticated events to update catalog status
- Catalog links to authentication details via QR provenance URLs

### Integration with Inventory Domain

**Relationship Type**: Customer-Supplier

**Integration Points**:
- Catalog consumes inventory information (stock levels)
- Catalog translates inventory data into customer-facing availability status
- Both share key concepts like Product and InventoryCount

**Data Exchange**:
- Inventory sends StockUpdated events to Catalog
- Catalog sends InventoryAdjusted events to Inventory

### Integration with Pricing Domain

**Relationship Type**: Customer-Supplier

**Integration Points**:
- Catalog displays prices calculated by the Pricing domain
- Pricing domain manages price rules, discounts, and promotions
- Both share the concept of ProductPrice

**Data Exchange**:
- Pricing sends PriceCalculated events to update catalog prices
- Catalog sends PriceDisplay events for analytics

### Integration with Marketing Domain

**Relationship Type**: Partnership

**Integration Points**:
- Catalog provides product data for marketing campaigns
- Marketing provides promotion flags and featured product designations
- Both domains collaborate on bundle creation and seasonal offerings

**Data Exchange**:
- Marketing sends PromotionCreated events to highlight products
- Catalog sends ProductBundleCreated events for promotional planning

### Integration with Customer Domain

**Relationship Type**: Supplier

**Integration Points**:
- Catalog provides product information for customer-facing interfaces
- Customer domain provides personalization data to customize catalog views
- Both share concepts around product interests and recommendations

**Data Exchange**:
- Customer sends ProductViewed events for analytics
- Catalog sends ProductDiscontinued notifications to interested customers

## Implementation Guidelines

### Code Organization

```typescript
// Directory structure
src/catalog/
  domain/
    aggregates/       // Product, ProductCategory, ProductBundle
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

#### Product Aggregate Implementation

```typescript
export class Product extends AggregateRoot<ProductProps> {
  private constructor(props: ProductProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: Omit<ProductProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
    clock: Clock = new SystemClock()
  ): Result<Product, string> {
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
      return failure('Product inventory count cannot be negative');
    }

    if (!props.price.isPositive()) {
      return failure('Product price must be greater than zero');
    }

    // Create the product
    const now = clock.now();
    const product = new Product({
      ...props,
      isDiscontinued: props.isDiscontinued ?? false,
      createdAt: now,
      updatedAt: now
    }, id);

    // Publish domain event
    product.addDomainEvent(new ProductCreated(product));

    return success(product);
  }

  // Additional methods like adjustInventory(), changePrice(), etc.
}
```

#### Repository Implementation Pattern

```typescript
export class MongoProductRepository implements ProductRepository {
  constructor(private readonly connection: mongoose.Connection) {}

  async findById(id: ProductId): Promise<Product | null> {
    // Implementation details
  }

  async save(product: Product): Promise<void> {
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
    const product = await this.productRepo.findById(new ProductId(event.productId));
    if (product) {
      await product.adjustInventory(event.newCount - product.inventoryCount);
      await this.productRepo.save(product);
    }
  }

  // Additional event handlers
}
```

## Ubiquitous Language

The following terms make up the ubiquitous language for the Catalog Domain and should be consistently used across all documentation, code, and communication.

| Term | Definition |
| --- | --- |
| Product | A specific food item available for purchase in the Elias Food Imports catalog |
| Product Category | A classification grouping for products with similar characteristics |
| Product Bundle | A curated collection of products sold together as a single offering |
| Product Variant | A specific version of a product with unique characteristics (size, packaging) |
| SKU | Stock Keeping Unit; a unique identifier for inventory tracking |
| Discontinuation | The process of phasing out a product from active sales |
| Featured Product | A product given special prominence in the catalog for promotional purposes |
| Product Origin | The geographical source of a product, especially important for specialty foods |
| Provenance | The documented history of a product's origin and authenticity |
| Inventory Count | The current available quantity of a product |
| Limited Availability | A product status indicating low inventory levels |
| Out of Stock | A product status indicating zero available inventory |
| Product Attribute | A characteristic or property that describes a product |
| Category Hierarchy | The tree-like structure of product categories |
| Product Search Query | A user request to find products based on specific criteria |
| Related Product | A product with a defined relationship to another product |
| Seasonal Bundle | A product bundle available only during specific time periods |
| Product Authentication | Verification of a product's authenticity and provenance |

## Testing Strategy

### Unit Testing

**Focus Areas**:
- Catalog domain aggregates and entities
- Value object validations and operations
- Domain service operations

**Testing Approach**:
- Test all invariant validations in aggregates
- Verify domain event generation on state changes
- Test business rule enforcement in domain services
- Validate value object behaviors and constraints

**Examples**:
```typescript
describe('Product Aggregate', () => {
  test('should enforce positive price invariant', () => {
    // Arrange
    const invalidProps = {
      name: 'Test Product',
      description: 'Test Description',
      price: Money.create({ amount: -10, currency: 'USD' }).value,
      inventoryCount: 10,
    };
    
    // Act
    const result = Product.create(invalidProps);
    
    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Product price must be greater than zero');
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
- Test catalog search functionality with sample datasets
- Validate category hierarchy operations

**Examples**:
```typescript
describe('Product Search Integration', () => {
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
- End-to-end catalog operations
- Complete customer journeys involving catalog
- Performance and load testing of search operations

**Testing Approach**:
- Use BDD scenarios for critical catalog user stories
- Test catalog performance under expected load
- Verify cross-domain integration scenarios

**Examples**:
```gherkin
Feature: Product Search and Filtering

  Scenario: Customer searches for products by region
    Given the catalog contains products from multiple regions
    When a customer searches for products from "Sicily"
    Then only Sicilian products should be displayed
    And each product should show its authentication status
    And results should load within 500ms
```

## Success Metrics

**Data Quality Metrics**:
- Product data completeness ≥ 98% (all required fields populated)
- Product description quality score ≥ 90% (based on SEO and content guidelines)
- Image quality compliance ≥ 95% (resolution, format, background requirements)
- Attribute accuracy ≥ 99% (verified against supplier specifications)

**Search Performance Metrics**:
- Search response time ≤ 500ms for 95% of queries
- Search relevance score ≥ 85% (measured by user clickthrough rates)
- Zero failed searches due to catalog errors
- Search index freshness ≤ 5 minutes from product updates

**Business Outcome Metrics**:
- Product discovery rate ≥ 65% (percentage of catalog viewed by visitors)
- Category navigation depth ≥ 2.5 pages on average
- Product bundle conversion rate ≥ 25% (compared to individual products)
- Cross-sell click-through rate ≥ 15% (from related product recommendations)

**Customer Experience Metrics**:
- Product information satisfaction score ≥ 4.5/5
- Time to find desired products ≤ 45 seconds
- Filter usage rate ≥ 75% for complex searches
- Category navigation clarity rating ≥ 90%

## References

1. Domain Events Catalog: [Domain Event Catalog](/docs/v2/domain-event-catalog.md)
2. Bounded Context Map: [Context Map](/docs/v2/bounded-context-map.md)
3. Ubiquitous Language Guidelines: [Language Guidelines](/docs/v2/ubiquitous-language-guidelines.md)
4. Business Problem Acceptance Criteria: [Acceptance Criteria](/docs/v2/business-problem-acceptance-criteria.md)
5. Catalog Authentication Context: [Authentication Domain](/docs/v2/domain-knowledge/core-contexts/catalog-auth/README.md)

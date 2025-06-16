---
title: [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) Domain Documentation
status: draft
owner: @[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)-team
reviewers: @domain-experts, @tech-leads
last_updated: 2025-06-10
---

# [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) Domain

## Overview

The [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) domain manages Elias Food Imports' [Product](../ubiquitous-language/guidelines/glossary.md#product) information, categorization, and search capabilities. It serves as the central repository for all [Product](../ubiquitous-language/guidelines/glossary.md#product)-related data, enabling customers to browse, search, and discover the company's specialty imported food products. This domain supports the company's business by maintaining accurate, detailed, and appealing [Product](../ubiquitous-language/guidelines/glossary.md#product) information that drives sales and [Customer](../ubiquitous-language/guidelines/glossary.md#customer) engagement.

## Strategic Importance

**Domain Type**: Core Domain

**Business Value**: High  
The [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) is essential to Elias Food Imports' business model as it directly enables [Product](../ubiquitous-language/guidelines/glossary.md#product) discovery and purchase decisions by customers.

**Technical Complexity**: Medium  
While the domain requires robust search capabilities and integration with multiple contexts, the core data model and operations follow established patterns.

**Volatility**: Medium  
[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)) information requirements evolve with changing market needs and integration with new sales channels, but the fundamental [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) concepts remain stable.

<!-- GAP_IMPLEMENTED: Rich Media Management | Low | Medium | Medium -->
<!-- stub for "Rich Media Management" gap in the [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) context -->

<!-- GAP_IMPLEMENTED: [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Variant Management | Medium | Medium | High -->
<!-- stub for "[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Variant Management" gap in the [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) context -->

## Core Domain Concepts

### [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)

The central concept representing a specific food item available for purchase.

**Key Attributes**:
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) identifier (unique reference)
- Name and description
- Price and currency
- [[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory) count
- Discontinuation status
- QR provenance URL (linking to [Authentication](../ubiquitous-language/guidelines/glossary.md#authentication) information)
- Category associations
- Creation and update timestamps
- Region of origin
- Nutritional information
- Allergen information
- Ingredient list
- Storage requirements
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) dimensions and weight
- Shelf life information

### [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Category

A classification grouping for products with similar characteristics.

**Key Attributes**:
- Category identifier
- Name and description
- Parent category (for hierarchical categorization)
- Attribute schema (defining attributes specific to this category)
- Status (active, inactive)
- Display [Order](../ubiquitous-language/guidelines/glossary.md#order)
- Creation and update timestamps

### [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Bundle

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

### [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Attribute

A characteristic or property that describes a [Product](../ubiquitous-language/guidelines/glossary.md#product).

**Key Attributes**:
- Attribute identifier
- Name and description
- Value type (text, number, boolean, enum)
- Unit of measure (if applicable)
- Is filterable (whether customers can filter by this attribute)
- Is comparable (whether this attribute can be used in [Product](../ubiquitous-language/guidelines/glossary.md#product) comparisons)
- Display [Order](../ubiquitous-language/guidelines/glossary.md#order)

### [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Search Query

A user request to find products based on specific criteria.

**Key Attributes**:
- Search terms
- Filters (categories, price ranges, attributes)
- Sort criteria
- Pagination parameters
- User context (language, region)
- Search timestamp
- Result count

### [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Variant

A specific version of a [Product](../ubiquitous-language/guidelines/glossary.md#product) with unique characteristics.

**Key Attributes**:
- Variant identifier
- Parent [Product](../ubiquitous-language/guidelines/glossary.md#product) identifier
- Variant attributes (size, flavor, packaging type)
- Price adjustment (if different from parent [Product](../ubiquitous-language/guidelines/glossary.md#product))
- [[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory) count
- SKU (Stock Keeping Unit)
- Barcode/UPC

## Business Rules

### [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Management Rules

1. **[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Creation**
   - All products must have a valid name, description, and price.
   - [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) names must be unique within the [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog).
   - [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) prices must be greater than zero.
   - Each [Product](../ubiquitous-language/guidelines/glossary.md#product) must be associated with at least one category.
   - Premium products must include region of origin and [Authentication](../ubiquitous-language/guidelines/glossary.md#authentication) information.

2. **[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Updates**
   - Price changes must preserve price history for audit purposes.
   - Price changes must trigger notifications to relevant stakeholders.
   - When products are modified, all search indexes must be updated.
   - [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)) discontinuation doesn't delete the [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) but marks it as unavailable for new orders.

3. **[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Data Quality**
   - Nutritional information must follow standardized formats for the target market.
   - Allergen information must be complete and prominently displayed.
   - [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) descriptions must be available in all supported languages.
   - [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) images must meet minimum quality standards (resolution, format, background).
   - All required attributes for a [Product](../ubiquitous-language/guidelines/glossary.md#product) category must be provided.

### [[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory) Integration Rules

1. **[[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory) Synchronization**
   - [[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory) counts displayed in the [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) must reflect real-time availability.
   - Low [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) levels must trigger visibility of "limited availability" indicators.
   - When [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) reaches zero, products must be marked as "out of stock" but remain visible.
   - [[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory) adjustments must produce events for other systems to consume.

### Categorization Rules

1. **Category Structure**
   - Categories must form a directed acyclic graph (no circular references).
   - A [Product](../ubiquitous-language/guidelines/glossary.md#product) can belong to multiple categories.
   - Category hierarchy depth must not exceed 5 levels for usability.
   - Categories must have unique identifiers and names.

2. **Category Management**
   - Removing a category requires reassigning or removing all its products.
   - Category merges must maintain [Product](../ubiquitous-language/guidelines/glossary.md#product) relationships and search functionality.

### [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Bundle Rules

1. **Bundle Composition**
   - A bundle must contain at least two distinct products.
   - Bundle prices must be less than or equal to the sum of component [Product](../ubiquitous-language/guidelines/glossary.md#product) prices.
   - All products in a bundle must be available (in stock and not discontinued).
   - Bundles must clearly indicate component products and quantities.

2. **Bundle Lifecycle**
   - If any component [Product](../ubiquitous-language/guidelines/glossary.md#product) becomes unavailable, the bundle must be marked as unavailable.
   - Seasonal bundles must have defined start and end dates.
   - Bundle [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) is limited by the minimum available [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) of its components.

### Search and Discovery Rules

1. **Search Functionality**
   - Search must account for multilingual support and language-specific stemming.
   - Search results must be ranked by relevance, with business rules for promotion.
   - Search queries must be logged for analytics and improvement.
   - [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) search must support filtering by multiple attributes.

2. **[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Visibility**
   - Products pending [Authentication](../ubiquitous-language/guidelines/glossary.md#authentication) verification must be marked as "[Authentication](../ubiquitous-language/guidelines/glossary.md#authentication) pending".
   - Products can be hidden from search results while remaining accessible by direct link.
   - Featured products must be clearly marked and prioritized in relevant searches.
   - Regional restrictions must be applied based on shipping and regulatory limitations.

## Domain Events

### ProductCreated

**Description**: Emitted when a new [Product](../ubiquitous-language/guidelines/glossary.md#product) is successfully created in the [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog).

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "productId": "uuid-string",
  "name": "[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Name",
  "description": "[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Description",
  "price": {
    "amount": 29.99,
    "currency": "USD"
  },
  "inventoryCount": 100,
  "occurredOn": "2025-06-06T16:30:00Z"
}
```

**Consumers**:
- **Search Service**: Indexes the new [Product](../ubiquitous-language/guidelines/glossary.md#product) for search functionality
- **[[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#[[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)) Context**: Creates initial [[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory) records
- **Recommendation Engine**: Updates [Product](../ubiquitous-language/guidelines/glossary.md#product) offerings
- **Marketing Context**: Evaluates for potential promotional campaigns
- **Analytics Context**: Tracks [Product](../ubiquitous-language/guidelines/glossary.md#product) [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) growth metrics

### PriceChanged

**Description**: Emitted when a [Product](../ubiquitous-language/guidelines/glossary.md#product)'s price is modified.

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
- **[[[Customer](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer) Context**: Notifies customers with wishlist or price alerts
- **[[[Pricing](../ubiquitous-language/guidelines/glossary.md#pricing)](../ubiquitous-language/guidelines/glossary.md#pricing)](../ubiquitous-language/guidelines/glossary.md#pricing) Context**: Updates price history records
- **Analytics Context**: Monitors price change patterns

### InventoryAdjusted

**Description**: Emitted when a [Product](../ubiquitous-language/guidelines/glossary.md#product)'s [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) count changes.

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
- **[[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#[[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)) Context**: Synchronizes [[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory) records
- **Analytics Context**: Tracks [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) movement patterns
- **Purchase Context**: Updates [Product](../ubiquitous-language/guidelines/glossary.md#product) availability for online shopping

### ProductDiscontinued

**Description**: Emitted when a [Product](../ubiquitous-language/guidelines/glossary.md#product) is marked as discontinued.

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "productId": "uuid-string",
  "name": "[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Name",
  "remainingInventory": 50,
  "discontinuationReason": "supplier_discontinued",
  "effectiveDate": "2025-07-01T00:00:00Z",
  "occurredOn": "2025-06-06T16:30:00Z"
}
```

**Consumers**:
- **Search Service**: Updates [Product](../ubiquitous-language/guidelines/glossary.md#product) status
- **[[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#[[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)) Context**: Flags [[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory) as discontinued
- **Purchase Context**: Adjusts [Product](../ubiquitous-language/guidelines/glossary.md#product) availability
- **Marketing Context**: Potential clearance campaign trigger
- **[[[Customer](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer) Context**: Notifies subscribed customers

### ProductCategorized

**Description**: Emitted when a [Product](../ubiquitous-language/guidelines/glossary.md#product) is assigned to a category or its categorization changes.

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
- **Analytics Context**: Tracks [Product](../ubiquitous-language/guidelines/glossary.md#product) categorization patterns

### ProductBundleCreated

**Description**: Emitted when a new [Product](../ubiquitous-language/guidelines/glossary.md#product) bundle is created.

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

#### [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Aggregate

**Root Entity**: [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)

**Invariants**:
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) must have a valid name, description, and price
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product).inventoryCount must be >= 0
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product).price must be a valid Money value object with amount > 0
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) price changes must publish a PriceChanged event
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) adjustments must publish an InventoryAdjusted event
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) can be marked as discontinued but not deleted

**Operations**:
- Create new [Product](../ubiquitous-language/guidelines/glossary.md#product)
- Adjust [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) count
- Change price
- Discontinue [Product](../ubiquitous-language/guidelines/glossary.md#product)
- Reactivate discontinued [Product](../ubiquitous-language/guidelines/glossary.md#product)
- Associate with categories

**Lifecycle States**:
- Active
- Discontinued
- Out of Stock
- Limited Availability

#### [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Category Aggregate

**Root Entity**: ProductCategory

**Invariants**:
- Category must have a valid name
- Category hierarchy must not contain cycles
- Category must maintain a list of products contained within it

**Operations**:
- Create new category
- Add [Product](../ubiquitous-language/guidelines/glossary.md#product) to category
- Remove [Product](../ubiquitous-language/guidelines/glossary.md#product) from category
- Update category metadata
- Deactivate/reactivate category

#### [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Bundle Aggregate

**Root Entity**: ProductBundle

**Invariants**:
- Bundle must contain at least two products
- Bundle price must be less than or equal to sum of component prices
- All component products must be available

**Operations**:
- Create new bundle
- Add [Product](../ubiquitous-language/guidelines/glossary.md#product) to bundle
- Remove [Product](../ubiquitous-language/guidelines/glossary.md#product) from bundle
- Update bundle [Pricing](../ubiquitous-language/guidelines/glossary.md#pricing)
- Set bundle availability period

### Entities

#### ProductImage

**Properties**:
- Image ID
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) ID (foreign key)
- Image URL
- Image type (primary, alternate, detail, etc.)
- Sort [Order](../ubiquitous-language/guidelines/glossary.md#order)
- Alt text
- Creation timestamp

#### ProductReview

**Properties**:
- Review ID
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) ID (foreign key)
- [[[Customer](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer) ID
- Rating (numeric)
- Review text
- Review date
- Verification status
- Helpfulness votes

#### RelatedProduct

**Properties**:
- Source [Product](../ubiquitous-language/guidelines/glossary.md#product) ID
- Related [Product](../ubiquitous-language/guidelines/glossary.md#product) ID
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

**Responsibility**: Provides advanced search capabilities across the [Product](../ubiquitous-language/guidelines/glossary.md#product) [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)

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
- Assign [Product](../ubiquitous-language/guidelines/glossary.md#product) to categories
- Remove [Product](../ubiquitous-language/guidelines/glossary.md#product) from categories
- Validate categorization rules
- Maintain category hierarchy integrity

## Administrative Capabilities

### Admin Application Services

#### ProductCatalogManagementService

**Responsibility**: Provides advanced [Product](../ubiquitous-language/guidelines/glossary.md#product) management capabilities for administrative users

**Operations**:
- Create and update products with extended validation
- Manage [Product](../ubiquitous-language/guidelines/glossary.md#product) discontinuation workflow
- Handle batch [Product](../ubiquitous-language/guidelines/glossary.md#product) imports and updates
- Configure [Product](../ubiquitous-language/guidelines/glossary.md#product) visibility across channels
- Override automated business rules when necessary

**Authorization**: Requires `[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog):[Product](../ubiquitous-language/guidelines/glossary.md#product):manage` permission

#### CategoryManagementService

**Responsibility**: Manages the [Product](../ubiquitous-language/guidelines/glossary.md#product) categorization hierarchy

**Operations**:
- Create, update, and archive categories
- Reorganize category hierarchies
- Manage category attribute schemas
- Define category-specific business rules
- Generate category performance reports

**Authorization**: Requires `[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog):category:manage` permission

#### AttributeSchemaService

**Responsibility**: Manages [Product](../ubiquitous-language/guidelines/glossary.md#product) attribute definitions and schemas

**Operations**:
- Define new [Product](../ubiquitous-language/guidelines/glossary.md#product) attributes
- Configure attribute validation rules
- Manage attribute relationships and dependencies
- Create and update attribute schemas for categories

**Authorization**: Requires `[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog):attributes:manage` permission

### Admin Read Models

#### ProductApprovalDashboardModel

**Purpose**: Displays products awaiting administrative approval

**Key Metrics**:
- Products pending approval count by category
- Average time in approval queue
- Approval bottlenecks by attribute or requirement
- Products with missing critical information

#### CatalogHealthModel

**Purpose**: Monitors overall [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) data quality and completeness

**Key Metrics**:
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) data completeness scores by category
- Image quality compliance rates
- Description quality metrics
- SEO readiness scores
- [[[Authentication](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication) status distribution

#### CategoryPerformanceModel

**Purpose**: Visualizes business performance metrics by category

**Key Metrics**:
- Revenue and margin by category
- Conversion rates compared to browse rates
- Search frequency versus conversion
- Top and bottom performing products by category

### Admin Domain Events

#### ProductApprovedByAdmin

**Description**: Emitted when a [Product](../ubiquitous-language/guidelines/glossary.md#product) is manually approved for publication by an administrator

**Payload**:
```json
{
  "aggregateId": "uuid-string",
  "productId": "uuid-string",
  "name": "[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Name",
  "version": 3,
  "adminId": "admin-uuid",
  "notes": "Approved with special [Pricing](../ubiquitous-language/guidelines/glossary.md#pricing) conditions",
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

**Responsibility**: Persistence operations for the [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) aggregate

**Operations**:
- Find [Product](../ubiquitous-language/guidelines/glossary.md#product) by ID
- Find products by name (partial match)
- Find products within a price range
- Find products that are low in [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)
- Find discontinued products
- Save a [Product](../ubiquitous-language/guidelines/glossary.md#product) (create or update)
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
- Find bundles containing a specific [Product](../ubiquitous-language/guidelines/glossary.md#product)
- Find active bundles
- Find seasonal bundles
- Save a bundle (create or update)
- Get all bundles

## Integration Points

### Integration with [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) [[[Authentication](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication) Domain

**Relationship Type**: Partnership

**Integration Points**:
- [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) provides base [Product](../ubiquitous-language/guidelines/glossary.md#product) information to [[[Authentication](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication)
- [[[Authentication](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication) provides authenticity verification status to [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)
- Both share key concepts like [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product), ProductOrigin
- The [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) domain displays [Authentication](../ubiquitous-language/guidelines/glossary.md#authentication) status but delegates verification processes

**Data Exchange**:
- [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) sends ProductCreated events to trigger [Authentication](../ubiquitous-language/guidelines/glossary.md#authentication) processes
- [[[Authentication](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication) sends ProductAuthenticated events to update [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) status
- [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) links to [Authentication](../ubiquitous-language/guidelines/glossary.md#authentication) details via QR provenance URLs

### Integration with [[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory) Domain

**Relationship Type**: [[[Customer](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer)-Supplier

**Integration Points**:
- [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) consumes [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) information (stock levels)
- [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) translates [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) data into [Customer](../ubiquitous-language/guidelines/glossary.md#customer)-facing availability status
- Both share key concepts like [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) and InventoryCount

**Data Exchange**:
- [[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory) sends StockUpdated events to [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)
- [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) sends InventoryAdjusted events to [[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)

### Integration with [[[Pricing](../ubiquitous-language/guidelines/glossary.md#pricing)](../ubiquitous-language/guidelines/glossary.md#pricing)](../ubiquitous-language/guidelines/glossary.md#pricing) Domain

**Relationship Type**: [[[Customer](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer)-Supplier

**Integration Points**:
- [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) displays prices calculated by the [[[Pricing](../ubiquitous-language/guidelines/glossary.md#pricing)](../ubiquitous-language/guidelines/glossary.md#pricing)](../ubiquitous-language/guidelines/glossary.md#pricing) domain
- [[[Pricing](../ubiquitous-language/guidelines/glossary.md#pricing)](../ubiquitous-language/guidelines/glossary.md#pricing)](../ubiquitous-language/guidelines/glossary.md#pricing) domain manages price rules, discounts, and promotions
- Both share the concept of ProductPrice

**Data Exchange**:
- [[[Pricing](../ubiquitous-language/guidelines/glossary.md#pricing)](../ubiquitous-language/guidelines/glossary.md#pricing)](../ubiquitous-language/guidelines/glossary.md#pricing) sends PriceCalculated events to update [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) prices
- [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) sends PriceDisplay events for analytics

### Integration with Marketing Domain

**Relationship Type**: Partnership

**Integration Points**:
- [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) provides [Product](../ubiquitous-language/guidelines/glossary.md#product) data for marketing campaigns
- Marketing provides promotion flags and featured [Product](../ubiquitous-language/guidelines/glossary.md#product) designations
- Both domains collaborate on bundle creation and seasonal offerings

**Data Exchange**:
- Marketing sends PromotionCreated events to highlight products
- [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) sends ProductBundleCreated events for promotional planning

### Integration with [[[Customer](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer) Domain

**Relationship Type**: Supplier

**Integration Points**:
- [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) provides [Product](../ubiquitous-language/guidelines/glossary.md#product) information for [Customer](../ubiquitous-language/guidelines/glossary.md#customer)-facing interfaces
- [[[Customer](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer) domain provides personalization data to customize [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) views
- Both share concepts around [Product](../ubiquitous-language/guidelines/glossary.md#product) interests and recommendations

**Data Exchange**:
- [[[Customer](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer) sends ProductViewed events for analytics
- [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) sends ProductDiscontinued notifications to interested customers

## Implementation Guidelines

### Code Organization

```typescript
// Directory structure
src/[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)/
  domain/
    aggregates/       // [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product), ProductCategory, ProductBundle
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

#### [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Aggregate Implementation

```typescript
export class [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) extends AggregateRoot<ProductProps> {
  private constructor(props: ProductProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: Omit<ProductProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
    clock: Clock = new SystemClock()
  ): Result<[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product), string> {
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
      return failure('[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) count cannot be negative');
    }

    if (!props.price.isPositive()) {
      return failure('[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) price must be greater than zero');
    }

    // Create the [Product](../ubiquitous-language/guidelines/glossary.md#product)
    const now = clock.now();
    const [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) = new [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product))({
      ...props,
      isDiscontinued: props.isDiscontinued ?? false,
      createdAt: now,
      updatedAt: now
    }, id);

    // Publish domain event
    [Product](../ubiquitous-language/guidelines/glossary.md#product).addDomainEvent(new ProductCreated([Product](../ubiquitous-language/guidelines/glossary.md#product)));

    return success([Product](../ubiquitous-language/guidelines/glossary.md#product));
  }

  // Additional methods like adjustInventory(), changePrice(), etc.
}
```

#### Repository Implementation Pattern

```typescript
export class MongoProductRepository implements ProductRepository {
  constructor(private readonly connection: mongoose.Connection) {}

  async findById(id: ProductId): Promise<[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) | null> {
    // Implementation details
  }

  async save([[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product): [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product))): Promise<void> {
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
    const [Product](../ubiquitous-language/guidelines/glossary.md#product) = await this.productRepo.findById(new ProductId(event.productId));
    if ([Product](../ubiquitous-language/guidelines/glossary.md#product)) {
      await [Product](../ubiquitous-language/guidelines/glossary.md#product).adjustInventory(event.newCount - [Product](../ubiquitous-language/guidelines/glossary.md#product).inventoryCount);
      await this.productRepo.save([Product](../ubiquitous-language/guidelines/glossary.md#product));
    }
  }

  // Additional event handlers
}
```

## Ubiquitous Language

The following terms make up the ubiquitous language for the [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) Domain and should be consistently used across all documentation, code, and communication.

| Term | Definition |
| --- | --- |
| [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) | A specific food item available for purchase in the Elias Food Imports [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) |
| [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Category | A classification grouping for products with similar characteristics |
| [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Bundle | A curated collection of products sold together as a single offering |
| [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)) Variant | A specific version of a [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) with unique characteristics (size, packaging) |
| SKU | Stock Keeping Unit; a unique identifier for [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) tracking |
| Discontinuation | The process of phasing out a [Product](../ubiquitous-language/guidelines/glossary.md#product) from active sales |
| Featured [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)) | A [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) given special prominence in the [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) for promotional purposes |
| [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)) Origin | The geographical source of a [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product), especially important for specialty foods |
| Provenance | The documented history of a [Product](../ubiquitous-language/guidelines/glossary.md#product)'s origin and authenticity |
| [[[Inventory](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory)](../ubiquitous-language/guidelines/glossary.md#inventory) Count | The current available quantity of a [Product](../ubiquitous-language/guidelines/glossary.md#product) |
| Limited Availability | A [Product](../ubiquitous-language/guidelines/glossary.md#product) status indicating low [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) levels |
| Out of Stock | A [Product](../ubiquitous-language/guidelines/glossary.md#product) status indicating zero available [Inventory](../ubiquitous-language/guidelines/glossary.md#inventory) |
| [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)) Attribute | A characteristic or property that describes a [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) |
| Category Hierarchy | The tree-like structure of [Product](../ubiquitous-language/guidelines/glossary.md#product) categories |
| [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Search Query | A user request to find products based on specific criteria |
| Related [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)) | A [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) with a defined relationship to another [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) |
| Seasonal Bundle | A [Product](../ubiquitous-language/guidelines/glossary.md#product) bundle available only during specific time periods |
| [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)) [[[Authentication](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication) | Verification of a [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)'s authenticity and provenance |

## Testing Strategy

### Unit Testing

**Focus Areas**:
- [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog) domain aggregates and entities
- Value object validations and operations
- Domain service operations

**Testing Approach**:
- Test all invariant validations in aggregates
- Verify domain event generation on state changes
- Test business rule enforcement in domain services
- Validate value object behaviors and constraints

**Examples**:
```typescript
describe('[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Aggregate', () => {
  test('should enforce positive price invariant', () => {
    // Arrange
    const invalidProps = {
      name: 'Test [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)',
      description: 'Test Description',
      price: Money.create({ amount: -10, currency: 'USD' }).value,
      inventoryCount: 10,
    };
    
    // Act
    const result = [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product).create(invalidProps);
    
    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) price must be greater than zero');
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
- Test [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) search functionality with sample datasets
- Validate category hierarchy operations

**Examples**:
```typescript
describe('[[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Search Integration', () => {
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
- End-to-end [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) operations
- Complete [Customer](../ubiquitous-language/guidelines/glossary.md#customer) journeys involving [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)
- Performance and load testing of search operations

**Testing Approach**:
- Use BDD scenarios for critical [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) user stories
- Test [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) performance under expected load
- Verify cross-domain integration scenarios

**Examples**:
```gherkin
Feature: [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) Search and Filtering

  Scenario: [[[Customer](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer) searches for products by region
    Given the [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) contains products from multiple regions
    When a [Customer](../ubiquitous-language/guidelines/glossary.md#customer) searches for products from "Sicily"
    Then only Sicilian products should be displayed
    And each [Product](../ubiquitous-language/guidelines/glossary.md#product) should show its [Authentication](../ubiquitous-language/guidelines/glossary.md#authentication) status
    And results should load within 500ms
```

## Success Metrics

**Data Quality Metrics**:
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) data completeness ≥ 98% (all required fields populated)
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) description quality score ≥ 90% (based on SEO and content guidelines)
- Image quality compliance ≥ 95% (resolution, format, background requirements)
- Attribute accuracy ≥ 99% (verified against supplier specifications)

**Search Performance Metrics**:
- Search response time ≤ 500ms for 95% of queries
- Search relevance score ≥ 85% (measured by user clickthrough rates)
- Zero failed searches due to [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) errors
- Search index freshness ≤ 5 minutes from [Product](../ubiquitous-language/guidelines/glossary.md#product) updates

**Business Outcome Metrics**:
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) discovery rate ≥ 65% (percentage of [Catalog](../ubiquitous-language/guidelines/glossary.md#catalog) viewed by visitors)
- Category navigation depth ≥ 2.5 pages on average
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) bundle conversion rate ≥ 25% (compared to individual products)
- Cross-sell click-through rate ≥ 15% (from related [Product](../ubiquitous-language/guidelines/glossary.md#product) recommendations)

**[[[Customer](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer)](../ubiquitous-language/guidelines/glossary.md#customer) Experience Metrics**:
- [[[Product](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product)](../ubiquitous-language/guidelines/glossary.md#product) information satisfaction score ≥ 4.5/5
- Time to find desired products ≤ 45 seconds
- Filter usage rate ≥ 75% for complex searches
- Category navigation clarity rating ≥ 90%

## References

1. Domain Events [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#[[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)): [Domain Event [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#[[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog))](/docs/v2/domain-event-[[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog).md)
2. Bounded Context Map: [Context Map](/docs/v2/bounded-context-map.md)
3. Ubiquitous Language Guidelines: [Language Guidelines](/docs/v2/ubiquitous-language-guidelines.md)
4. Business Problem Acceptance Criteria: [Acceptance Criteria](/docs/v2/business-problem-acceptance-criteria.md)
5. [[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#[[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)) [[[Authentication](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication) Context: [[[[Authentication](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication)](../ubiquitous-language/guidelines/glossary.md#authentication) Domain](/docs/v2/domain-knowledge/core-contexts/[[[Catalog](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)](../ubiquitous-language/guidelines/glossary.md#catalog)-auth/README.md)

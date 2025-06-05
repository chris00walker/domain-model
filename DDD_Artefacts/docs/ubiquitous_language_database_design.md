# Ubiquitous Language in Database Design

## Purpose

This document provides guidance on aligning database schema design with the ubiquitous language for Elias Food Imports. Ensuring consistency between the persistence layer and the domain model helps maintain the integrity of the domain concepts throughout the system and reduces the cognitive load of translating between different terminologies.

## Importance of Database Terminology Alignment

Database schemas often represent the longest-lived artifacts in a system and can be accessed by multiple applications over time. When database terminology aligns with the ubiquitous language:

1. **Reduced Translation Overhead**: Less need for complex ORM mappings between domain objects and database tables
2. **Improved Maintainability**: Easier to understand the relationship between code and data
3. **Better Cross-team Communication**: Database administrators and domain experts can communicate using the same language
4. **Simplified Debugging**: Tracing issues between application and database layers is more straightforward
5. **Enhanced Data Governance**: Clearer understanding of data meaning and relationships

## Database Design Principles

### 1. Table Naming

Table names should reflect domain aggregates and entities from the ubiquitous language:

| Domain Concept | Table Name | Notes |
|----------------|------------|-------|
| Customer | customers | Direct mapping to aggregate |
| Subscription | subscriptions | Direct mapping to aggregate |
| Order | orders | Direct mapping to aggregate |
| Product | products | Direct mapping to aggregate |
| Line Item | line_items | Direct mapping to entity within Order aggregate |

**Guidelines:**

- Use plural nouns for table names
- Use snake_case for database objects (SQL convention)
- Use the exact term from the glossary for the table name
- Avoid technical prefixes or suffixes (e.g., "tbl_", "_entity")
- For entities within an aggregate, use the entity name directly

### 2. Column Naming

Column names should match the attributes of domain objects:

| Domain Object Property | Column Name | Notes |
|-----------------------|-------------|-------|
| Customer.id | customer_id | Primary key |
| Customer.name | name | Direct match |
| Customer.customerType | customer_type | Direct match with snake_case |
| Product.productOrigin | product_origin | Direct match with snake_case |
| Order.orderStatus | order_status | Direct match with snake_case |

**Guidelines:**

- Use snake_case for column names (SQL convention)
- Use the exact term from the glossary for the column name
- Use [table_name]_id for primary keys and foreign keys
- Avoid abbreviations unless they are part of the ubiquitous language
- Be consistent with pluralization (e.g., always use singular for column names)

### 3. Relationship Tables

For many-to-many relationships, use table names that reflect the relationship in the domain:

| Domain Relationship | Table Name | Notes |
|--------------------|------------|-------|
| Subscription <-> Product | subscription_products | Reflects the relationship |
| Customer <-> CustomerSegment | customer_segments | Reflects the relationship |
| Order <-> Promotion | order_promotions | Reflects the relationship |

**Guidelines:**

- Name relationship tables using the pattern [table1]_[table2] in alphabetical order
- Use plural form for both parts of the name
- For relationships with additional attributes, consider using a domain-meaningful name

### 4. Constraint Naming

Constraint names should be clear and follow a consistent pattern:

| Constraint Type | Naming Pattern | Example |
|-----------------|----------------|---------|
| Primary Key | pk_[table] | pk_customers |
| Foreign Key | fk_[table]_[referenced_table] | fk_orders_customers |
| Unique | uq_[table]_[column(s)] | uq_customers_email |
| Check | ck_[table]_[constraint_purpose] | ck_products_price_positive |

**Guidelines:**

- Use descriptive names that indicate the purpose of the constraint
- Follow a consistent naming pattern for each type of constraint
- Include the table name in the constraint name
- For multi-column constraints, include all column names or a meaningful summary

### 5. Index Naming

Index names should indicate their purpose and the columns they cover:

| Index Type | Naming Pattern | Example |
|------------|----------------|---------|
| Standard | ix_[table]_[column(s)] | ix_customers_last_name |
| Unique | ux_[table]_[column(s)] | ux_products_sku |
| Covering | cx_[table]_[purpose] | cx_orders_fulfillment |

**Guidelines:**

- Indicate the type of index in the prefix
- Include the table name in the index name
- For multi-column indexes, include all column names or a meaningful summary
- For functional indexes, indicate the function or purpose

## Schema Organization

### 1. Schemas/Namespaces

Use schemas or namespaces to organize tables according to bounded contexts:

| Bounded Context | Schema/Namespace | Example Tables |
|-----------------|-----------------|----------------|
| Customer | customer | customers, customer_segments, customer_preferences |
| Subscription | subscription | subscriptions, subscription_plans, subscription_items |
| Order | ordering | orders, line_items, order_fulfillments |
| Pricing | pricing | prices, discounts, promotions, fx_rates |
| Catalog | catalog | products, product_categories, product_authentications |

**Guidelines:**

- Create a schema for each bounded context
- Use the bounded context name for the schema name
- Place shared tables in a common schema if necessary
- Document the purpose of each schema

### 2. Views

Create views that represent important domain concepts and queries:

| Domain Concept | View Name | Purpose |
|----------------|-----------|---------|
| Customer Order History | customer_order_history | Shows all orders for a customer with status |
| Product Inventory | product_inventory | Shows current inventory levels for products |
| Subscription Revenue | subscription_revenue | Calculates revenue from subscriptions |

**Guidelines:**

- Name views using domain concepts from the ubiquitous language
- Document the business purpose of each view
- Use views to encapsulate complex joins that represent domain concepts
- Consider materialized views for performance-critical domain queries

## Handling Domain Concepts in the Database

### 1. Value Objects

For value objects in the domain model, consider these approaches:

| Approach | Example | When to Use |
|----------|---------|-------------|
| Embedded in Table | Address columns in customers table | Simple value objects with few attributes |
| Separate Table | addresses table with foreign key | Complex value objects or those shared across entities |
| JSON/Document Column | preferences JSON column | Collections of related attributes with flexible structure |
| Custom Data Type | money_amount type with currency and value | When database supports custom types |

**Guidelines:**

- Choose the approach based on the complexity and usage of the value object
- Document the mapping between domain value objects and database representation
- Maintain the integrity of the value object's invariants through constraints
- Consider performance implications of each approach

### 2. Enumerations

For domain enumerations, consider these approaches:

| Approach | Example | When to Use |
|----------|---------|-------------|
| Check Constraint | CHECK (order_status IN ('placed', 'processing', 'fulfilled', 'shipped', 'delivered', 'cancelled')) | Simple enumerations |
| Reference Table | order_statuses table | Enumerations with additional attributes or that change frequently |
| Enum Type | CREATE TYPE order_status AS ENUM (...) | When database supports enum types |

**Guidelines:**

- Use the exact terms from the ubiquitous language for enumeration values
- Document the mapping between domain enumerations and database representation
- Consider using reference tables for enumerations that may change or have additional attributes
- Ensure consistency of enumeration values across the system

### 3. Aggregates and Entities

For domain aggregates and entities, consider these approaches:

| Domain Concept | Database Representation | Notes |
|----------------|------------------------|-------|
| Aggregate Root | Table | One table per aggregate root |
| Entity within Aggregate | Table with FK to root | Separate table for complex entities |
| Entity within Aggregate | Columns in root table | Embedded for simple entities |
| Entity Collection | Junction table | For collections of entities |

**Guidelines:**

- Create one primary table for each aggregate root
- Use foreign keys to maintain aggregate boundaries
- Consider denormalization for performance-critical queries
- Document the mapping between domain aggregates and database tables

### 4. Domain Events

For domain events, consider these approaches:

| Approach | Example | When to Use |
|----------|---------|-------------|
| Event Store Table | domain_events table | For event sourcing or event logging |
| Outbox Table | outbox_events table | For reliable event publishing |
| Audit Table | order_status_changes table | For tracking specific changes |

**Guidelines:**

- Name event tables using domain terminology
- Include event type, timestamp, aggregate ID, and payload
- Consider partitioning event tables for performance
- Document the purpose and structure of event tables

## Example Schema Aligned with Ubiquitous Language

### Customer Context

```sql
CREATE SCHEMA customer;

CREATE TABLE customer.customers (
    customer_id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    customer_type VARCHAR(20) NOT NULL CHECK (customer_type IN ('retail', 'wholesale', 'distributor')),
    customer_segment VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE customer.customer_addresses (
    address_id UUID PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customer.customers(customer_id),
    address_type VARCHAR(20) NOT NULL CHECK (address_type IN ('billing', 'delivery', 'both')),
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT uq_customer_addresses_default UNIQUE (customer_id, address_type, is_default)
);

CREATE INDEX ix_customer_addresses_customer_id ON customer.customer_addresses(customer_id);
```

### Subscription Context

```sql
CREATE SCHEMA subscription;

CREATE TABLE subscription.subscriptions (
    subscription_id UUID PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customer.customers(customer_id),
    subscription_plan_id UUID NOT NULL REFERENCES subscription.subscription_plans(subscription_plan_id),
    delivery_frequency VARCHAR(20) NOT NULL CHECK (delivery_frequency IN ('weekly', 'bi_weekly', 'monthly', 'quarterly')),
    subscription_status VARCHAR(20) NOT NULL CHECK (subscription_status IN ('active', 'paused', 'cancelled', 'expired')),
    start_date DATE NOT NULL,
    next_delivery_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE subscription.subscription_items (
    subscription_item_id UUID PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES subscription.subscriptions(subscription_id),
    product_id UUID NOT NULL REFERENCES catalog.products(product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    CONSTRAINT uq_subscription_items_product UNIQUE (subscription_id, product_id)
);

CREATE INDEX ix_subscriptions_customer_id ON subscription.subscriptions(customer_id);
CREATE INDEX ix_subscription_items_subscription_id ON subscription.subscription_items(subscription_id);
```

### Order Context

```sql
CREATE SCHEMA ordering;

CREATE TABLE ordering.orders (
    order_id UUID PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customer.customers(customer_id),
    order_status VARCHAR(20) NOT NULL CHECK (order_status IN ('placed', 'processing', 'fulfilled', 'shipped', 'delivered', 'cancelled')),
    order_date TIMESTAMP NOT NULL,
    delivery_address_id UUID NOT NULL REFERENCES customer.customer_addresses(address_id),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE ordering.line_items (
    line_item_id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES ordering.orders(order_id),
    product_id UUID NOT NULL REFERENCES catalog.products(product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    line_total DECIMAL(10, 2) NOT NULL CHECK (line_total >= 0),
    CONSTRAINT uq_line_items_product UNIQUE (order_id, product_id)
);

CREATE INDEX ix_orders_customer_id ON ordering.orders(customer_id);
CREATE INDEX ix_line_items_order_id ON ordering.line_items(order_id);
```

## Database Documentation

Database documentation should explicitly reference the ubiquitous language:

### Example Table Documentation

```sql
COMMENT ON TABLE customer.customers IS 'Represents customers who purchase products from Elias Food Imports. See domain glossary for Customer definition.';

COMMENT ON COLUMN customer.customers.customer_type IS 'Type of customer (retail, wholesale, distributor) which determines pricing and available products.';

COMMENT ON COLUMN customer.customers.customer_segment IS 'Market segment the customer belongs to, used for marketing and analytics.';
```

## Handling Legacy Database Schemas

When working with legacy database schemas that don't align with the ubiquitous language:

1. **Create Views**: Create views with domain-aligned names that map to legacy tables
2. **Document Mappings**: Explicitly document the mapping between domain terms and legacy schema
3. **Use Synonyms**: If the database supports synonyms, create domain-aligned synonyms for legacy tables
4. **Implement Anticorruption Layer**: Create a data access layer that translates between domain model and legacy schema
5. **Plan Migration**: Develop a plan to gradually migrate the schema to align with the ubiquitous language

### Example Legacy Schema Mapping

```markdown
| Domain Term | Legacy Database Term | Mapping |
|-------------|---------------------|---------|
| Customer | CUST_MASTER | View: customers maps to CUST_MASTER |
| Order | TXN_HEADER | View: orders maps to TXN_HEADER |
| Line Item | TXN_DETAIL | View: line_items maps to TXN_DETAIL |
| Product | INVENTORY | View: products maps to INVENTORY |
```

## Implementation Checklist

When designing a new database schema or updating an existing one:

- [ ] Review the ubiquitous language glossary for relevant terms
- [ ] Map tables to domain aggregates and entities
- [ ] Ensure column names match domain object attributes
- [ ] Use domain terminology in constraint and index names
- [ ] Document the relationship between database objects and domain concepts
- [ ] Review the schema design with domain experts
- [ ] Update the schema when the ubiquitous language changes

## Common Anti-patterns

### 1. Technical Table Names

**Anti-pattern**: `tbl_customer_entity` or `customer_data`  
**Better approach**: `customers`

### 2. Abbreviated Column Names

**Anti-pattern**: `cust_nm`, `ord_sts`, `prod_ctg`  
**Better approach**: `customer_name`, `order_status`, `product_category`

### 3. Generic Foreign Keys

**Anti-pattern**: `parent_id`, `ref_id`, `related_entity_id`  
**Better approach**: `customer_id`, `order_id`, `product_id`

### 4. Inconsistent Pluralization

**Anti-pattern**: Mixing `customer` and `products` table names  
**Better approach**: Consistently use plural: `customers` and `products`

### 5. Technical Schemas

**Anti-pattern**: Organizing schemas by technical layers (`data`, `entities`, `persistence`)  
**Better approach**: Organize schemas by bounded contexts (`customer`, `ordering`, `catalog`)

## Schema Review Process

To ensure database schemas align with the ubiquitous language:

1. **Include Domain Experts**: Have domain experts review schema designs
2. **Terminology Review**: Explicitly review terminology used in the schema
3. **Glossary Mapping**: Create a mapping between schema terms and glossary terms
4. **Documentation Review**: Ensure schema documentation uses consistent terminology
5. **Developer Feedback**: Gather feedback from developers on schema usability

## Conclusion

Aligning database schema design with the ubiquitous language creates a more cohesive system where the persistence layer naturally supports the domain model. By following the guidelines in this document, teams can create database schemas that clearly express domain concepts and facilitate communication between technical and business stakeholders.

---
*This document should be reviewed and updated as the domain model and database schema evolve. Last updated: 2025-06-04*

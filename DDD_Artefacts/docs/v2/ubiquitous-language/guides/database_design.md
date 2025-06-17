---
title: "Ubiquitous Language in Database Design"
version: "2.0"
last_updated: "2025-06-06"
status: "Final"
---
##
title: "Ubiquitous Language in Database Design"
version: "1.0"
last_updated: "2025-06-06"
## status: "Draft"
status: "Draft"
title: Ubiquitous Language in Database Design
version: "1.0"
status: active
owner: Architecture Team, Database Team
last_updated: 2025-06-06
# Ubiquitous Language in Database Design
## Overview
This guide establishes principles and practices for ensuring that database schemas and operations consistently reflect the ubiquitous language of Elias Food Imports' domain model. Proper alignment between database design and domain language is critical for maintaining conceptual integrity across the technical implementation and business understanding.
## Core Principles
1. **Domain-First Naming**: Database objects should derive their names from the ubiquitous language rather than technical conventions.
2. **Explicit Relationships**: Database relationships should mirror domain relationships and use terminology consistent with the business domain.
3. **Bounded Context Alignment**: Database schemas should respect bounded context boundaries and avoid cross-context terminology confusion.
4. **Value Object Preservation**: Value objects from the domain model should maintain their integrity and validation rules in database representations.
5. **Aggregate Consistency**: Database design should support aggregate boundaries and invariants defined in the domain model.
6. **Language Evolution Support**: Database design should accommodate evolution of the ubiquitous language with minimal disruption.
7. **Context Mapping in Data**: Integration databases or views should explicitly translate between bounded contexts using proper context mapping patterns.
## Naming Conventions
### Tables
- **Singular Form**: Use singular nouns for entities (e.g., `Subscription` not `subscriptions`)
- **Full Domain Terms**: Avoid abbreviations (e.g., `Product*Authentication` not `prod*auth`)
- **Context Prefixing**: For shared databases, prefix with bounded context name (e.g., `catalog_product`)
- **Junction Tables**: Use relationship name from domain model (e.g., `Subscription*item` not `Subscription*Product`)
### Columns
- **Domain Attribute Alignment**: Column names should match entity/value object attribute names
- **Primary Keys**: Use `id` consistently, qualified by entity name for joins (e.g., `subscription_id`)
- **Foreign Keys**: Use the full entity name with `*id` suffix (e.g., `Customer*id`)
- **Value Objects**: Use structured naming pattern `{entity}*{value*object}*{attribute}` (e.g., `Subscription*billing*frequency*type`)
- **Boolean Fields**: Use positive domain terminology (e.g., `is*authenticated` not `not*fake`)
### Constraints and Indexes
- **Semantic Naming**: Name constraints after the business rule they enforce (e.g., `ck*minimum*order_amount`)
- **Value Object Validation**: Constraints should enforce value object validation rules
### Stored Procedures and Functions
- **Command/Query Pattern**: Name commands as verbs and queries as questions or nouns
- **Domain Operation Alignment**: Names should match domain service methods where appropriate
## Schema Design Patterns
### Aggregates as Schema Units
Database schemas should be organized around aggregates rather than individual tables:
```sql
-- Example: Subscription Aggregate Schema
CREATE SCHEMA subscription_management;
-- Root Entity
CREATE TABLE subscription_management.Subscription (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  plan_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'PAUSED', 'CANCELLED', 'PENDING')),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  billing*frequency*type VARCHAR(20) NOT NULL,
  billing*frequency*interval INTEGER NOT NULL CHECK (billing*frequency*interval > 0),
  next*billing*date TIMESTAMP NOT NULL,
  delivery*frequency*type VARCHAR(20) NOT NULL,
  delivery*frequency*interval INTEGER NOT NULL CHECK (delivery*frequency*interval > 0),
  next*delivery*date TIMESTAMP NOT NULL,
  total*value*amount DECIMAL(10,2) NOT NULL,
  total*value*currency CHAR(3) NOT NULL,
  last_modified TIMESTAMP NOT NULL,
  CONSTRAINT fk*Customer FOREIGN KEY (Customer*id) REFERENCES customer_management.Customer(id),
  CONSTRAINT fk*plan FOREIGN KEY (plan*id) REFERENCES Subscription*management.Subscription*plan(id),
  CONSTRAINT ck*Subscription*dates CHECK (end*date IS NULL OR end*date > start_date),
  CONSTRAINT ck*billing*frequency CHECK (billing*frequency*type IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'ANNUALLY'))
);
-- Child Entities (within Aggregate boundary)
CREATE TABLE Subscription*management.Subscription*item (
  id UUID PRIMARY KEY,
  subscription_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit*price*amount DECIMAL(10,2) NOT NULL,
  unit*price*currency CHAR(3) NOT NULL,
  is_customizable BOOLEAN NOT NULL DEFAULT false,
  allow_substitution BOOLEAN NOT NULL DEFAULT true,
  added_date TIMESTAMP NOT NULL,
  CONSTRAINT fk*Subscription FOREIGN KEY (Subscription*id) REFERENCES subscription_management.Subscription(id) ON DELETE CASCADE,
  CONSTRAINT fk*Product FOREIGN KEY (Product*id) REFERENCES Catalog.Product(id)
);
```
### Value Objects as Embedded Structures
Value objects should be represented as structured columns or embedded tables with appropriate constraints:
```sql
-- Example: Money Value Object as Column Group
CREATE TABLE Payment.transaction (
  id UUID PRIMARY KEY,
  transaction_date TIMESTAMP NOT NULL,
  amount_value DECIMAL(10,2) NOT NULL,
  amount_currency CHAR(3) NOT NULL,
  CONSTRAINT ck*valid*currency CHECK (amount_currency IN ('USD', 'EUR', 'CAD', 'GBP'))
);
-- Example: Complex Value Object as JSON (PostgreSQL)
CREATE TABLE customer_management.Customer (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address JSONB NOT NULL,
  CONSTRAINT ck*valid*address CHECK (
```
address ? 'street1' AND
address ? 'city' AND
address ? 'postalCode' AND
address ? 'country'
```
  )
);
```
### Domain Events in Database
Store domain events using terminology consistent with the domain event Catalog:
```sql
-- Example: Domain Event Store
CREATE TABLE event*store.Subscription*events (
  id UUID PRIMARY KEY,
  stream*id UUID NOT NULL,  -- aggregateId (Subscription*id)
  version INTEGER NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  occurred_at TIMESTAMP NOT NULL,
  CONSTRAINT ck*event*type CHECK (event_type IN (
```
'SubscriptionCreated',
'SubscriptionModified',
'SubscriptionPaused',
'SubscriptionCancelled',
'SubscriptionRenewed',
'DeliveryScheduled',
'CurationCompleted'
```
  )),
  CONSTRAINT uq*stream*version UNIQUE (stream_id, version)
);
```
### Read Models
Read models should use domain terminology while optimizing for query patterns:
```sql
-- Example: Subscription Dashboard View
CREATE VIEW Subscription*management.Subscription*dashboard AS
SELECT
  s.id as subscription_id,
  c.name as customer_name,
  p.name as plan_name,
  s.status,
  s.next*billing*date,
  s.billing*frequency*type,
  s.total*value*amount,
  s.total*value*currency,
  COUNT(si.id) as product_count,
  MAX(d.delivery*date) as last*delivery_date,
  MIN(CASE WHEN d.delivery*date > NOW() THEN d.delivery*date ELSE NULL END) as next*delivery*date
FROM
  subscription_management.Subscription s
  JOIN Customer*management.Customer c ON s.Customer*id = c.id
  JOIN Subscription*management.Subscription*plan p ON s.plan_id = p.id
  LEFT JOIN Subscription*management.Subscription*item si ON s.id = si.subscription_id
  LEFT JOIN Subscription*management.delivery d ON s.id = d.Subscription*id
WHERE
  s.status IN ('ACTIVE', 'PAUSED')
GROUP BY
  s.id, c.name, p.name, s.status, s.next*billing*date, s.billing*frequency*type,
  s.total*value*amount, s.total*value*currency;
```
## Cross-Context Persistence Patterns
### Anti-Corruption Layer in Database
When integrating with external systems or legacy databases, use anti-corruption layers to translate between contexts:
```sql
-- Example: Anti-corruption view for legacy Inventory system
CREATE VIEW Catalog.legacy*Inventory*translation AS
SELECT
  p.id as product_id,
  p.product_code as sku,  -- Translate to legacy terminology
  i.quantity*on*hand as qty_available,  -- Translate to legacy terminology
  i.reorder*threshold as reorder*point,  -- Translate to legacy terminology
  CASE
```
WHEN i.status = 'IN_STOCK' THEN 'A'  -- Active
WHEN i.status = 'LOW_STOCK' THEN 'L'  -- Low
WHEN i.status = 'OUT*OF*STOCK' THEN 'O'  -- Out
ELSE 'U'  -- Unknown
```
  END as status_code  -- Translate to legacy codes
FROM
  Catalog.Product p
  JOIN Inventory.Inventory*item i ON p.id = i.Product*id;
```
### Shared Kernel Tables
For concepts shared between bounded contexts, create tables with carefully synchronized definitions:
```sql
-- Example: Country reference data as shared kernel
CREATE TABLE shared_kernel.country (
  code CHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  currency_code CHAR(3) NOT NULL,
  is_supported BOOLEAN NOT NULL DEFAULT true,
  shipping_zone VARCHAR(20) NOT NULL,
  tax_region VARCHAR(20) NOT NULL
);
-- Each context references the shared kernel
CREATE TABLE Customer*management.shipping*address (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  country_code CHAR(2) NOT NULL,
  -- other address fields
  CONSTRAINT fk*country FOREIGN KEY (country*code) REFERENCES shared_kernel.country(code)
);
```
### Context Mapping Tables
When multiple contexts need to reference the same conceptual entity but with different meanings, use mapping tables:
```sql
-- Example: Product context mapping between Catalog and Subscription contexts
CREATE TABLE integration.Catalog*Subscription*product_mapping (
  Catalog*Product*id UUID NOT NULL,
  Subscription*Product*id UUID NOT NULL,
  mapping_type VARCHAR(50) NOT NULL,  -- IDENTICAL, VARIANT, SUBSTITUTABLE
  mapping_priority INTEGER NOT NULL,
  mapping_rules JSONB,
  PRIMARY KEY (Catalog*Product*id, Subscription*Product*id),
  CONSTRAINT fk*Catalog*Product FOREIGN KEY (Catalog*Product*id) REFERENCES Catalog.Product(id),
  CONSTRAINT fk*Subscription*Product FOREIGN KEY (Subscription*Product*id) REFERENCES subscription_management.Product(id)
);
```
## ORM and Repository Implementation
### Entity Mapping Alignment
ORM entity definitions should match database schemas and domain model terminology:
```typescript
// Example: TypeScript entity with ORM decorators (TypeORM)
@Entity({ schema: 'subscription_management', name: 'Subscription' })
export class Subscription {
  @PrimaryColumn('uuid')
  id: string;
  @Column('uuid')
  customerId: string;
  @Column('uuid')
  planId: string;
  @Column({
```
type: 'varchar',
length: 20,
enum: SubscriptionStatus
```
  })
  status: SubscriptionStatus;
  @Column('timestamp')
  startDate: Date;
  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;
  @Column({ type: 'varchar', length: 20 })
  billingFrequencyType: FrequencyType;
  @Column('integer')
  billingFrequencyInterval: number;
  @Column('timestamp')
  nextBillingDate: Date;
  // Embedded value objects
  @Column(() => Money)
  totalValue: Money;
  // Relationships
  @OneToMany(() => SubscriptionItem, item => item.Subscription, {
```
cascade: true
```
  })
  items: SubscriptionItem[];
  // Domain methods
  public pause(startDate: Date, endDate: Date): void {
```
// Implementation
```
  }
  public calculateTotalValue(): Money {
```
// Implementation
```
  }
}
// Value object example
export class Money {
  @Column('decimal', { precision: 10, scale: 2, name: 'total*value*amount' })
  amount: number;
  @Column({ length: 3, name: 'total*value*currency' })
  currency: string;
}
```
### Repository Method Naming
Repository method names should align with ubiquitous language query concepts:
```typescript
// Example: Repository with domain-aligned method names
export interface SubscriptionRepository {
  // Use domain language in method names
  findById(id: string): Promise<Subscription>;
  findActiveSubscriptionsByCustomer(customerId: string): Promise<Subscription[]>;
  findSubscriptionsEligibleForRenewal(date: Date): Promise<Subscription[]>;
  findSubscriptionsWithPendingDeliveries(): Promise<Subscription[]>;
  // Command methods match aggregate methods
  save(Subscription: Subscription): Promise<void>;
  remove(Subscription: Subscription): Promise<void>;
}
```
## Review Checklist
Use this checklist to verify database design alignment with ubiquitous language:
### Naming and Terminology
- [ ] Table names match entity names from the domain model
- [ ] Column names match attribute names from entities and value objects
- [ ] Relationship tables use meaningful domain relationship names
- [ ] Constraints are named after the business rules they enforce
- [ ] No technical abbreviations in user-facing database objects
- [ ] No multi-context terminology mixing in a single schema
### Structural Alignment
- [ ] Database schemas align with bounded context boundaries
- [ ] Table relationships reflect domain model relationships
- [ ] Value objects are represented with appropriate structure and constraints
- [ ] Aggregates are properly clustered in schema design
- [ ] Domain events use consistent naming with the event Catalog
### Business Rule Enforcement
- [ ] Check constraints enforce value object validation rules
- [ ] Foreign keys enforce entity references within aggregates
- [ ] Unique constraints enforce identity and uniqueness rules
- [ ] Domain-specific constraints enforce complex business rules
- [ ] Appropriate transaction isolation levels for aggregate consistency
### Context Integration
- [ ] Clear separation between bounded contexts in database design
- [ ] Context mapping tables or views where appropriate
- [ ] Anti-corruption layers for legacy or external integrations
- [ ] Read models respect bounded context terminology
## Governance and Evolution
### Change Management Process
1. **Terminology Changes**: When domain terminology evolves, database changes must be coordinated with domain model updates
2. **Schema Migration Principles**:
   - Use non-destructive migrations with temporary translation views
   - Update applications before removing old structures
   - Document terminology changes in migration scripts
3. **Review Requirements**:
   - Database design reviews must include domain experts
   - ORM mapping reviews must verify alignment with domain model
   - Schema changes require ubiquitous language verification
### Documentation Standards
- Database objects must be documented with domain concepts they represent
- Complex constraints should reference business rules by name
- Context mappings must document terminology differences
- Value object representations must document validation rules
## Implementation Examples
### Pricing Domain Example
```sql
-- Pricing bounded context example
CREATE SCHEMA Pricing;
-- PriceList aggregate root
CREATE TABLE Pricing.price_list (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  valid_from TIMESTAMP NOT NULL,
  valid_to TIMESTAMP,
  customer_segment VARCHAR(50),
  priority INTEGER NOT NULL DEFAULT 0,
  currency_code CHAR(3) NOT NULL,
  CONSTRAINT ck*valid*dates CHECK (valid*to IS NULL OR valid*to > valid_from)
);
-- PricePoint entity within the aggregate
CREATE TABLE Pricing.price_point (
  id UUID PRIMARY KEY,
  price*list*id UUID NOT NULL,
  product_id UUID NOT NULL,
  base*price*amount DECIMAL(10,2) NOT NULL,
  base*price*currency CHAR(3) NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  minimum_quantity INTEGER NOT NULL DEFAULT 1,
  valid_from TIMESTAMP NOT NULL,
  valid_to TIMESTAMP,
  CONSTRAINT fk*price*list FOREIGN KEY (price*list*id) REFERENCES Pricing.price_list(id) ON DELETE CASCADE,
  CONSTRAINT fk*Product FOREIGN KEY (Product*id) REFERENCES Catalog.Product(id),
  CONSTRAINT ck*price*validity CHECK (valid*to IS NULL OR valid*to > valid_from),
  CONSTRAINT ck*price*amount CHECK (base*price*amount >= 0),
  CONSTRAINT ck*discount*percentage CHECK (discount*percentage >= 0 AND discount*percentage <= 100),
  CONSTRAINT ck*minimum*quantity CHECK (minimum_quantity > 0)
);
```
### Subscription Domain Example
```typescript
// ORM Repository Implementation Example
@Injectable()
export class PostgresSubscriptionRepository implements SubscriptionRepository {
  constructor(
```
@InjectRepository(SubscriptionEntity)
private subscriptionRepository: Repository<SubscriptionEntity>,
@InjectRepository(SubscriptionItemEntity)
private itemRepository: Repository<SubscriptionItemEntity>
```
  ) {}
  async findById(id: string): Promise<Subscription> {
```
const subscriptionEntity = await this.subscriptionRepository.findOne({
```
      where: { id },
      relations: ['items']
```
});
if (!subscriptionEntity) {
```
      throw new SubscriptionNotFoundException(id);
```
}
return this.mapToDomain(subscriptionEntity);
```
  }
  async findSubscriptionsEligibleForRenewal(date: Date): Promise<Subscription[]> {
```
const entities = await this.subscriptionRepository
```
      .createQueryBuilder('Subscription')
      .leftJoinAndSelect('Subscription.items', 'item')
      .where('Subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('Subscription.nextBillingDate <= :date', { date })
      .getMany();
```
return entities.map(entity => this.mapToDomain(entity));
```
  }
  async save(Subscription: Subscription): Promise<void> {
```
const entity = this.mapToEntity(Subscription);
await this.subscriptionRepository.save(entity);
```
  }
  // Private mapping methods between domain and persistence models
  private mapToDomain(entity: SubscriptionEntity): Subscription {
```
// Transform database entity to domain model
// Preserving all domain concepts and terminology
```
  }
  private mapToEntity(domain: Subscription): SubscriptionEntity {
```
// Transform domain model to database entity
// Preserving all business rules and invariants
```
  }
}
```
## Conclusion
Consistent application of ubiquitous language in database design creates a foundation for maintainable, comprehensible data systems that align with business understanding. The principles and patterns in this guide ensure that technical implementations remain true to the domain model and facilitate clearer communication between technical and domain experts.
When implemented correctly, these practices reduce translation errors, improve documentation, simplify onboarding, and create a more cohesive system architecture where data structures reinforce rather than obscure the underlying domain concepts.
*This guide is part of the Elias Food Imports Ubiquitous Language Consistency Framework. Refer to the [Ubiquitous Language Guidelines](../guidelines.md) for overarching principles and the [Domain Terms in Requirements Analysis](../analysis/domain-terms-requirements.md) for terminology reference.*

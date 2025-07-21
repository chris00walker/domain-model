---
title: CQRS Implementation Strategy
status: accepted
date: 2025-06-06
deciders: DDD Implementation Team, Architecture Team
---

## ADR-004: CQRS Implementation Strategy

## Context

As the Elias Food Imports domain model grows in complexity, we face increasing challenges with our current monolithic approach to data access patterns:

1. **Mixing Concerns**: Read and write operations have fundamentally different requirements and patterns, yet our current architecture uses the same models and repositories for both
2. **Performance Challenges**: Complex domain aggregate queries are becoming inefficient for read-heavy operations
3. **Scalability Limitations**: We cannot independently scale read and write operations
4. **Evolution Bottlenecks**: Changes to domain models affect both commands and queries

Command Query Responsibility Segregation (CQRS) is an architectural pattern that separates read and write operations into different models. Given our growing needs for specialized read models, denormalized views for reporting, and varying consistency models depending on use cases, we need to establish a clear CQRS implementation strategy.

## Decision

We will adopt a pragmatic CQRS implementation strategy with a phased approach:

1. **Pattern Adoption**: Separate command and query models at the application layer while initially maintaining a single database
2. **Selective Implementation**: Apply CQRS only to bounded contexts with clear benefits (high read/write ratio disparity or complex read models)
3. **Progressive Enhancement**: Start with logical separation, adding physical data store separation only when justified by scaling needs
4. **Domain Alignment**: Ensure CQRS implementation respects domain boundaries and ubiquitous language

### Implementation Pattern

We will implement CQRS using the following components:

#### Commands

Commands represent intentions to change the system state and should be named in the imperative form from the ubiquitous language:

```typescript
export class AuthenticateProductCommand {
  constructor(
    public readonly productId: string,
    public readonly authenticationType: AuthenticationType,
    public readonly authenticationToken: string,
    public readonly scannedAt: Date,
    public readonly scannedBy: string
  ) {}
}
```

#### Command Handlers

Command handlers validate, execute business logic, and persist domain changes:

```typescript
@Injectable()
export class AuthenticateProductCommandHandler implements CommandHandler<AuthenticateProductCommand> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly authenticationService: AuthenticationService,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(command: AuthenticateProductCommand): Promise<void> {
    // 1. Load aggregate
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new ProductNotFoundException(command.productId);
    }

    // 2. Execute domain logic
    const authenticationResult = await this.authenticationService.authenticate(
      product,
      command.authenticationType,
      command.authenticationToken
    );
    
    // 3. Update domain aggregate
    product.recordAuthenticationResult(
      authenticationResult,
      command.scannedAt,
      command.scannedBy
    );
    
    // 4. Publish domain events
    const events = this.eventPublisher.mergeObjectContext(product);
    
    // 5. Persist changes
    await this.productRepository.save(product);
    
    // 6. Release events
    events.commit();
  }
}
```

#### Queries

Queries represent requests for information without side effects, named according to their intent:

```typescript
export class GetProductAuthenticationHistoryQuery {
  constructor(
    public readonly productId: string,
    public readonly limit?: number,
    public readonly offset?: number
  ) {}
}
```

#### Query Handlers

Query handlers retrieve and shape data specifically for read operations, potentially using denormalized views:

```typescript
@Injectable()
export class GetProductAuthenticationHistoryQueryHandler implements QueryHandler<GetProductAuthenticationHistoryQuery> {
  constructor(
    private readonly authenticationReadRepository: AuthenticationReadRepository
  ) {}

  async execute(query: GetProductAuthenticationHistoryQuery): Promise<AuthenticationHistoryDto[]> {
    // Retrieve from read-optimized store/model
    const history = await this.authenticationReadRepository.findByProductId(
      query.productId,
      query.limit || 10,
      query.offset || 0
    );
    
    // Transform to DTO specific to this query's needs
    return history.map(item => ({
      authenticationId: item.id,
      timestamp: item.scannedAt,
      result: item.result,
      authenticationType: item.type,
      authenticatedBy: item.scannedBy,
      certificateUrl: item.certificateId 
        ? `/certificates/${item.certificateId}` 
        : null
    }));
  }
}
```

#### Command and Query Buses

We will implement a mediator pattern using command and query buses to decouple command/query dispatch from their handling:

```typescript
// Usage example
@Controller('products')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
  
  @Post(':id/authentication')
  async authenticateProduct(
    @Param('id') productId: string,
    @Body() request: AuthenticateProductRequest,
    @User() currentUser: UserIdentity
  ): Promise<void> {
    await this.commandBus.execute(
      new AuthenticateProductCommand(
        productId,
        request.authenticationType,
        request.authenticationToken,
        new Date(),
        currentUser.id
      )
    );
  }
  
  @Get(':id/authentication-history')
  async getAuthenticationHistory(
    @Param('id') productId: string,
    @Query() paginationParams: PaginationParams
  ): Promise<AuthenticationHistoryDto[]> {
    return this.queryBus.execute(
      new GetProductAuthenticationHistoryQuery(
        productId,
        paginationParams.limit,
        paginationParams.offset
      )
    );
  }
}
```

### Data Store Separation

Our initial approach will maintain a single database but create separate read and write models:

1. **Write Database**: Optimized for domain-oriented aggregate persistence
2. **Read Model**: Denormalized views generated from domain events or periodically synchronized

As the system scales, we will selectively implement separate physical data stores for high-volume bounded contexts.

## Consequences

### Positive

1. **Separation of Concerns**: Cleaner code with dedicated models for reading and writing
2. **Performance Optimization**: Read models can be optimized for specific query patterns
3. **Scalability**: Ability to scale read and write operations independently
4. **Independent Evolution**: Query models can evolve separately from command models
5. **Specialized Persistence**: Freedom to use different persistence mechanisms for different access patterns

### Negative

1. **Increased Complexity**: More moving parts and concepts to maintain
2. **Eventual Consistency**: Read models may be temporarily out of sync with write models
3. **Development Overhead**: Developers must maintain separate models and mappings
4. **Learning Curve**: Team needs to understand CQRS concepts and patterns

## Implementation Examples

### Example 1: Subscription Management Context

The Subscription bounded context has complex read requirements (reports, customer-facing views) but straightforward command paths.

#### Command Side

```typescript
// Command
export class ChangeBillingFrequencyCommand {
  constructor(
    public readonly subscriptionId: string,
    public readonly newFrequency: BillingFrequency,
    public readonly effectiveDate: Date
  ) {}
}

// Command Handler
@Injectable()
export class ChangeBillingFrequencyCommandHandler implements CommandHandler<ChangeBillingFrequencyCommand> {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}
  
  async execute(command: ChangeBillingFrequencyCommand): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(command.subscriptionId);
    if (!subscription) {
      throw new SubscriptionNotFoundException(command.subscriptionId);
    }
    
    // Domain logic in aggregate
    subscription.changeBillingFrequency(command.newFrequency, command.effectiveDate);
    
    await this.subscriptionRepository.save(subscription);
  }
}
```

#### Query Side

```typescript
// Query
export class GetSubscriptionSummaryQuery {
  constructor(public readonly customerId: string) {}
}

// Denormalized Read Model (stored procedure or view)
interface SubscriptionSummaryReadModel {
  id: string;
  customerName: string;
  plan: string;
  status: string;
  nextBillingDate: Date;
  billingFrequency: string;
  totalValue: number;
  productCount: number;
  lastDeliveryDate: Date | null;
  nextDeliveryDate: Date | null;
}

// Query Handler using optimized read model
@Injectable()
export class GetSubscriptionSummaryQueryHandler implements QueryHandler<GetSubscriptionSummaryQuery> {
  constructor(
    @Inject('SUBSCRIPTION_READ_DB') private readonly readDb: any
  ) {}
  
  async execute(query: GetSubscriptionSummaryQuery): Promise<SubscriptionSummaryDto[]> {
    // Using optimized read store (could be a view, materialized view, or separate database)
    const summaries = await this.readDb.query(`
      SELECT * FROM subscription_summary_view 
      WHERE customer_id = $1
    `, [query.customerId]);
    
    return summaries.map(summary => ({
      id: summary.id,
      plan: summary.plan,
      status: summary.status,
      nextBillingDate: summary.next_billing_date,
      billingFrequency: summary.billing_frequency,
      value: {
        amount: summary.total_value,
        currency: 'USD'
      },
      productCount: summary.product_count,
      lastDelivery: summary.last_delivery_date,
      nextDelivery: summary.next_delivery_date
    }));
  }
}
```

### Example 2: Read Model Update Strategies

For maintaining read models, we'll use a combination of strategies:

#### Event-Driven Projection (eventual consistency)

```typescript
@Injectable()
export class SubscriptionEventHandler {
  constructor(
    @Inject('SUBSCRIPTION_READ_DB') private readonly readDb: any
  ) {}
  
  @EventHandler(SubscriptionCreatedEvent)
  async handleSubscriptionCreated(event: SubscriptionCreatedEvent): Promise<void> {
    await this.readDb.query(`
      INSERT INTO subscription_summary (
        id, customer_id, customer_name, plan, status, 
        next_billing_date, billing_frequency, total_value
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      event.subscriptionId,
      event.customerId,
      event.customerName,
      event.plan,
      'ACTIVE',
      event.nextBillingDate,
      event.billingFrequency,
      event.totalValue
    ]);
  }
  
  @EventHandler(BillingFrequencyChangedEvent)
  async handleBillingFrequencyChanged(event: BillingFrequencyChangedEvent): Promise<void> {
    await this.readDb.query(`
      UPDATE subscription_summary 
      SET billing_frequency = $1, next_billing_date = $2 
      WHERE id = $3
    `, [event.newFrequency, event.nextBillingDate, event.subscriptionId]);
  }
}
```

#### Scheduled Synchronization (for complex projections)

```typescript
@Injectable()
export class SubscriptionReadModelSynchronizer {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject('SUBSCRIPTION_READ_DB') private readonly readDb: any
  ) {}
  
  @Scheduled('0 */1 * * *') // Every hour
  async synchronizeAnalyticsProjections(): Promise<void> {
    const lastSync = await this.getLastSyncTimestamp();
    const updatedSubscriptions = await this.subscriptionRepository
      .findUpdatedSince(lastSync);
    
    for (const subscription of updatedSubscriptions) {
      await this.updateAnalyticsProjection(subscription);
    }
    
    await this.updateLastSyncTimestamp();
  }
  
  private async updateAnalyticsProjection(subscription: Subscription): Promise<void> {
    // Complex projection logic that may be inefficient to do with events
    // For example, calculating aggregate metrics or complex joins
    // ...
  }
}
```

## Phased Implementation Strategy

We will implement CQRS in phases across bounded contexts:

### Phase 1: Logical Separation (Immediate)

1. Separate command and query models in application layer
2. Maintain single database
3. Apply to Catalog Authentication and Subscription contexts

### Phase 2: Specialized Read Models (Next 3 months)

1. Create denormalized read models for complex queries
2. Implement event-driven projections for read models
3. Apply to Pricing and Order contexts

### Phase 3: Physical Separation (When required)

1. Implement separate physical data stores for high-volume contexts
2. Add caching layer for read-heavy operations
3. Apply based on performance monitoring and scaling needs

## Testing Strategy

Testing CQRS implementations requires specific approaches:

1. **Unit Testing**: Test command and query handlers in isolation
2. **Integration Testing**: Test command handling and event propagation to read models
3. **Consistency Testing**: Verify that read models eventually reflect command changes
4. **Performance Testing**: Validate that read models meet performance requirements

Example command handler test:

```typescript
describe('ChangeBillingFrequencyCommandHandler', () => {
  let handler: ChangeBillingFrequencyCommandHandler;
  let repository: MockSubscriptionRepository;
  
  beforeEach(() => {
    repository = new MockSubscriptionRepository();
    handler = new ChangeBillingFrequencyCommandHandler(repository);
  });
  
  it('should change billing frequency', async () => {
    // Arrange
    const subscription = Subscription.create(/* ... */);
    repository.save(subscription);
    const command = new ChangeBillingFrequencyCommand(
      subscription.id, 
      BillingFrequency.QUARTERLY,
      new Date()
    );
    
    // Act
    await handler.execute(command);
    
    // Assert
    const updated = await repository.findById(subscription.id);
    expect(updated.billingFrequency).toBe(BillingFrequency.QUARTERLY);
  });
  
  it('should throw if subscription not found', async () => {
    // Arrange
    const command = new ChangeBillingFrequencyCommand(
      'non-existent-id', 
      BillingFrequency.QUARTERLY,
      new Date()
    );
    
    // Act & Assert
    await expect(handler.execute(command))
      .rejects
      .toThrow(SubscriptionNotFoundException);
  });
});
```

## References

- Evans, Eric. "Domain-Driven Design: Tackling Complexity in the Heart of Software"
- Young, Greg. "CQRS Documents"
- Fowler, Martin. "CQRS" <https://martinfowler.com/bliki/CQRS.html>
- Vernon, Vaughn. "Implementing Domain-Driven Design"
- [Domain Event Catalog](../domain-knowledge/integrations/events.md)

---

*This ADR establishes our approach to implementing CQRS across our domain model. It provides a consistent pattern while allowing for context-specific adaptations based on performance and complexity requirements.*

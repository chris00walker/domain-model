---
title: "Domain Event Naming Analysis"
version: "2.0"
last_updated: "2025-06-06"
status: "Final"
---
<!-- MANUAL REVIEW NEEDED: Ensure all domain events follow entity-first, past-tense naming convention -->
<!-- NOTE: This file needs manual review to ensure all domain events follow entity-first, past-tense naming convention -->
##
title: "Domain Event Naming Analysis"
version: "1.0"
last_updated: "2025-06-06"
## status: "Draft"
status: "Draft"
title: "Domain Event Naming Analysis"
version: "1.0"
last_updated: "2025-06-06"
status: "Approved"
contributors:
  - "Domain Team"
# Domain Event Naming Analysis
## Overview
This document analyzes and establishes conventions for naming domain events within the Elias Food Imports system. Domain events represent significant occurrences within the domain that domain experts care about, and consistent naming is crucial for maintaining a clear and expressive ubiquitous language. This analysis provides guidelines, patterns, and examples to ensure that domain events are named consistently across all bounded contexts.
## Strategic Importance
Consistent domain event naming provides several critical benefits:
1. **Communication Clarity**: Enables unambiguous discussion of system behavior across teams
2. **Model Integrity**: Ensures events accurately represent business-significant occurrences
3. **Integration Consistency**: Facilitates reliable integration between bounded contexts
4. **Documentation Quality**: Improves documentation with predictable naming patterns
5. **Evolutionary Design**: Supports sound evolution of the domain model over time
## Naming Conventions
### Primary Convention: Entity-First, Past-Tense
The primary convention for domain events in Elias Food Imports is **Entity-First, Past-Tense** naming:
```
[Entity][State/Action Change]
```
Examples:
- `OrderPlaced`
- `PaymentProcessed`
- `InventoryAdjusted`
- `SubscriptionRenewed`
- `ProductAuthenticated`
This convention clearly communicates:
- **What** changed (the entity)
- **How** it changed (the action or state change)
- **When** it happened (implicitly past tense, representing a completed occurrence)
### Alternative Convention: Process-Oriented Events
For events that represent significant steps in business processes rather than entity state changes:
```
[Process][Stage]
```
Examples:
- `AuthenticationSucceeded`
- `ShipmentScheduled`
- `VerificationCompleted`
- `ReconciliationFailed`
This convention is used when:
- The focus is on the process outcome, not a specific entity
- Multiple entities are involved in the process
- The event represents a significant business process milestone
## Context-Specific Patterns
Different bounded contexts may have specific event naming patterns that align with their domain focus:
### Catalog Authentication Context
Pattern: `Product[Authentication Action][Result]`
Examples:
- `ProductAuthenticationSucceeded`
- `ProductAuthenticationFailed`
- `ProductCounterfeitDetected`
### Pricing Context
Pattern: `Price[Action]` or `[Entity]Price[Action]`
Examples:
- `PriceCalculated`
- `ProductPriceUpdated`
- `DiscountApplied`
- `MarginThresholdBreached`
### Subscription Context
Pattern: `Subscription[State Change]`
Examples:
- `SubscriptionCreated`
- `SubscriptionRenewed`
- `SubscriptionCancelled`
- `SubscriptionPaused`
- `SubscriptionReactivated`
### Inventory Context
Pattern: `Inventory[State Change]` or `[Product]Inventory[State]`
Examples:
- `InventoryAdjusted`
- `ProductInventoryLow`
- `StockReceived`
- `ProductQuarantined`
- `InventoryReconciled`
## Structural Guidelines
### Event Naming Do's
1. **Use Past Tense**: Events represent things that have happened
   - Good: `OrderPlaced`, `PaymentReceived`
   - Avoid: `PlaceOrder`, `ReceivePayment`
2. **Be Specific**: Clearly indicate the entity and change
   - Good: `CustomerAddressUpdated`
   - Avoid: `DataChanged`, `CustomerUpdated`
3. **Focus on Business Significance**: Events should be meaningful to domain experts
   - Good: `ShipmentDelayed`
   - Avoid: `LogisticsDatabaseUpdated`
4. **Maintain Consistency**: Use similar patterns for similar events
   - Good: `OrderPlaced`, `OrderShipped`, `OrderCancelled`
   - Avoid: `OrderPlaced`, `ShippingCompleted`, `CancelOrder`
5. **Enable Traceability**: Event names should help trace business processes
   - Good: `OrderFulfillmentStarted`, `OrderFulfillmentCompleted`
   - Avoid: `ProcessStarted`, `ProcessEnded`
### Event Naming Don'ts
1. **Avoid Technical Jargon**: Don't use technical terms in event names
   - Avoid: `OrderEntitySavedToDatabase`
   - Better: `OrderRecorded`
2. **Avoid CRUD Terminology**: Don't mimic database operations
   - Avoid: `CustomerCreated`, `CustomerUpdated`, `CustomerDeleted`
   - Better: `CustomerRegistered`, `CustomerProfileUpdated`, `CustomerRemoved`
3. **Don't Include Temporal Information**: Avoid time in event names
   - Avoid: `DailyInventoryReconciled`
   - Better: `InventoryReconciled` (with timestamp metadata)
4. **Don't Include Technical Context**: Avoid implementation details
   - Avoid: `RabbitMQPaymentMessage`
   - Better: `PaymentReceived`
5. **Don't Use Conjunctions**: Keep event names as single concepts
   - Avoid: `OrderPlacedAndEmailSent`
   - Better: Two separate events: `OrderPlaced` and `OrderConfirmationEmailSent`
## Event Payload Guidelines
While this document focuses on event naming, consistency in event payload structure is also important:
1. **Include Entity Identifier**: Always include a reference to the entity ID
   - Example: `orderId`, `customerId`, `productId`
2. **Include Occurrence Time**: Always include when the event occurred
   - Example: `occurredAt`, `timestamp`
3. **Include Relevant Context**: Add context-specific data needed by consumers
   - Example: For `OrderPlaced`, include Order items, total, Customer info
4. **Avoid Including Everything**: Only include data relevant to the event
   - Example: For `CustomerAddressUpdated`, include just address data, not all Customer data
5. **Version Events**: Include version information for schema evolution
   - Example: `version: 1`, `schemaVersion: "1.0"`
## Implementation Examples
### TypeScript Event Examples
```typescript
// Example of a well-named domain event with appropriate payload
export class ProductAuthenticated implements DomainEvent {
  constructor(
```
public readonly productId: ProductId,
public readonly authenticatedBy: UserId,
public readonly authenticationMethod: AuthenticationMethod,
public readonly authenticationResult: AuthenticationResult,
public readonly occurredAt: Date
```
  ) {
```
super({
```
      aggregateId: new UniqueEntityID(productId.value),
      dateTimeOccurred: occurredAt
```
});
```
  }
}
// Example of Subscription context event
export class SubscriptionRenewed implements DomainEvent {
  constructor(
```
public readonly subscriptionId: SubscriptionId,
public readonly renewedUntil: Date,
public readonly paymentId: PaymentId,
public readonly occurredAt: Date
```
  ) {
```
super({
```
      aggregateId: new UniqueEntityID(subscriptionId.value),
      dateTimeOccurred: occurredAt
```
});
```
  }
}
```
## Relationship to the Domain Event Catalog
This naming analysis is the foundation for the Domain Event Catalog, which documents all domain events in the system. The Catalog follows these naming conventions and organizes events by bounded context. When adding new events to the system, they should:
1. Follow the naming conventions in this document
2. Be added to the Domain Event Catalog
3. Include proper documentation of purpose, payload, and consumers
## Event Evolution
When business requirements change requiring modifications to existing events:
1. **Name Changes**: Consider backward compatibility needs
2. **Minor Changes**: Version the event payload
3. **Major Changes**: Create a new event with clear naming distinction
4. **Deprecations**: Document deprecation in the Domain Event Catalog
5. **Migrations**: Provide migration guidance for event consumers
## Relationship to Other Artifacts
| Related Artifact | Relationship |
|-----------------|--------------|
| Domain Event Catalog | Implements these naming conventions |
| Bounded Context Map | Provides context for event producers and consumers |
| Ubiquitous Language Guidelines | General terminology guidance that events must follow |
| Domain Events Business Mapping | Maps events to business processes |
| API Design Guidelines | Influences how events are exposed in APIs |
## Conclusion
Consistent domain event naming is essential for maintaining a clear and expressive ubiquitous language in the Elias Food Imports system. By following the entity-first, past-tense convention and the guidelines in this document, we can ensure that our domain events accurately represent significant occurrences in the business domain and facilitate clear communication across teams.
*This document should be reviewed and updated as the domain model evolves. Last updated: 2025-06-06*

---

⚑ Related
- [Domain Glossary](../glossary.md)
- [Ubiquitous Language Evolution Process](./ubiquitous_language_evolution.md)

↩ [Back to Framework TOC](../README.md)

# Domain Event Naming Analysis

## Purpose

This document analyzes the current state of domain event naming in the Elias Food Imports codebase and provides recommendations for improving consistency with the ubiquitous language. Domain events are a critical part of the domain model, representing significant state changes that domain experts care about. Ensuring that domain events follow consistent naming conventions and accurately reflect business concepts is essential for maintaining a clear and expressive domain model.

## Current State Analysis

### Domain Event Inventory

The following domain events have been identified in the codebase:

#### Customer Context

| Event Name | Naming Convention | Ubiquitous Language Alignment | Recommendation |
|------------|-------------------|------------------------------|----------------|
| CustomerCreated | Past tense, entity + action | Good | No change needed |
| CustomerUpdated | Past tense, entity + action | Good | No change needed |
| CustomerAddressChanged | Past tense, entity + property + action | Good | No change needed |
| CustomerTypeChanged | Past tense, entity + property + action | Good | No change needed |

#### Subscription Context

| Event Name | Naming Convention | Ubiquitous Language Alignment | Recommendation |
|------------|-------------------|------------------------------|----------------|
| SubscriptionCreated | Past tense, entity + action | Good | No change needed |
| SubscriptionCancelled | Past tense, entity + action | Good | No change needed |
| SubscriptionPaused | Past tense, entity + action | Good | No change needed |
| SubscriptionResumed | Past tense, entity + action | Good | No change needed |
| SubscriptionRenewed | Past tense, entity + action | Good | No change needed |
| SubscriptionEdited | Past tense, entity + action | Moderate | Rename to "SubscriptionModified" to better align with glossary |

#### Order Context

| Event Name | Naming Convention | Ubiquitous Language Alignment | Recommendation |
|------------|-------------------|------------------------------|----------------|
| OrderPlaced | Past tense, entity + action | Good | No change needed |
| OrderFulfilled | Past tense, entity + action | Good | No change needed |
| OrderCancelled | Past tense, entity + action | Good | No change needed |
| OrderShipped | Past tense, entity + action | Good | No change needed |
| OrderItemAdded | Past tense, entity + action | Poor | Rename to "LineItemAddedToOrder" to match glossary term "Line Item" |
| OrderItemRemoved | Past tense, entity + action | Poor | Rename to "LineItemRemovedFromOrder" to match glossary term "Line Item" |

#### Pricing Context

| Event Name | Naming Convention | Ubiquitous Language Alignment | Recommendation |
|------------|-------------------|------------------------------|----------------|
| PriceCalculated | Past tense, entity + action | Good | No change needed |
| DiscountApplied | Past tense, entity + action | Good | No change needed |
| PriceChanged | Past tense, entity + action | Moderate | Rename to "ProductPriceChanged" to be more specific |
| MarginThresholdViolated | Past tense, entity + action | Good | No change needed |

#### Catalog Context

| Event Name | Naming Convention | Ubiquitous Language Alignment | Recommendation |
|------------|-------------------|------------------------------|----------------|
| ProductCreated | Past tense, entity + action | Good | No change needed |
| ProductUpdated | Past tense, entity + action | Good | No change needed |
| ProductRetired | Past tense, entity + action | Good | No change needed |
| ProductCategoryAssigned | Past tense, entity + action | Good | No change needed |

### Missing Domain Events

Based on the business processes and domain model, the following domain events are missing but should be implemented:

#### Customer Context

- **CustomerSegmentChanged**: Triggered when a customer's segment changes
- **CustomerLoyaltyStatusChanged**: Triggered when a customer's loyalty status changes
- **CustomerChurnRiskIdentified**: Triggered when a customer is identified as a churn risk

#### Subscription Context

- **SubscriptionFrequencyChanged**: Triggered when a subscription frequency is changed
- **SubscriptionUpgraded**: Triggered when a subscription is upgraded to a higher tier
- **SubscriptionDowngraded**: Triggered when a subscription is downgraded to a lower tier
- **SubscriptionBundleChanged**: Triggered when products in a subscription bundle are changed

#### Order Context

- **OrderDelivered**: Triggered when an order is delivered to the customer
- **OrderReturned**: Triggered when an order is returned by the customer
- **OrderPaymentConfirmed**: Triggered when payment for an order is confirmed

#### Pricing Context

- **PromotionalPriceActivated**: Triggered when a promotional price is activated
- **PromotionalPriceDeactivated**: Triggered when a promotional price is deactivated
- **FXRateUpdated**: Triggered when foreign exchange rates are updated
- **CostPriceChanged**: Triggered when the cost price of a product changes

#### Catalog Context

- **ProductInventoryLevelChanged**: Triggered when a product's inventory level changes
- **ProductAuthenticityVerified**: Triggered when a product's authenticity is verified
- **ProductCounterfeitDetected**: Triggered when a counterfeit product is detected

## Naming Convention Analysis

### Current Conventions

The current domain events generally follow these conventions:

1. **Past Tense**: Events use past tense verbs (e.g., "Created", "Updated", "Cancelled")
2. **Entity-First**: The entity name comes before the action (e.g., "CustomerCreated", not "CreatedCustomer")
3. **Specific Actions**: Actions are specific rather than generic (e.g., "OrderFulfilled" rather than "OrderStatusChanged")
4. **Property Changes**: For property changes, the format is Entity + Property + Changed (e.g., "CustomerAddressChanged")

### Inconsistencies

The following inconsistencies have been identified:

1. **Terminology Misalignment**: Some events use terms that don't match the glossary (e.g., "OrderItem" vs. "Line Item")
2. **Specificity Variations**: Some events are more specific than others (e.g., "CustomerAddressChanged" vs. "CustomerUpdated")
3. **Missing Context**: Some events could benefit from more context in their names (e.g., "PriceChanged" could be "ProductPriceChanged")

## Recommendations for Improvement

### Naming Convention Guidelines

1. **Use Past Tense**: All events should use past tense verbs to indicate that something has happened
2. **Follow Entity-First Pattern**: Always put the entity name before the action
3. **Be Specific About Actions**: Use specific verbs that clearly indicate what happened
4. **Include Context When Needed**: Include additional context when the event would otherwise be ambiguous
5. **Align with Glossary Terms**: Always use the exact terms from the glossary
6. **Indicate Property Changes**: For property changes, use the pattern Entity + Property + Changed
7. **Avoid Abbreviations**: Spell out all terms fully to avoid ambiguity

### Implementation Recommendations

1. **Rename Existing Events**: Update the names of events that don't follow the conventions
2. **Update Event Handlers**: Ensure all event handlers are updated to use the new event names
3. **Update Documentation**: Update all documentation to reflect the new event names
4. **Create Missing Events**: Implement the missing domain events identified above
5. **Add Event Documentation**: Add documentation to each event class explaining its business significance

### Example Refactoring

```typescript
// BEFORE
export class OrderItemAdded extends DomainEvent {
  constructor(public readonly order: Order, public readonly item: OrderItem) {
    super({
      aggregateId: order.orderId
    });
  }
}

// AFTER
export class LineItemAddedToOrder extends DomainEvent {
  constructor(public readonly order: Order, public readonly lineItem: LineItem) {
    super({
      aggregateId: order.orderId
    });
  }
  
  /**
   * This event is triggered when a line item is added to an existing order.
   * It is used by inventory management to reserve stock and by pricing
   * to recalculate order totals.
   */
}
```

## Domain Event Documentation Template

For each domain event, the following documentation should be provided:

```typescript
/**
 * Event: [Event Name]
 * 
 * Business Significance:
 * [Explanation of why this event matters to the business]
 * 
 * Triggered When:
 * [Conditions that cause this event to be raised]
 * 
 * Consumed By:
 * [List of bounded contexts or systems that react to this event]
 * 
 * Related Business Rules:
 * [Any business rules that apply to this event]
 * 
 * Related Glossary Terms:
 * [Terms from the glossary that are relevant to this event]
 */
```

## Event Storming Alignment

To ensure that domain events align with the business processes, we recommend conducting an Event Storming session with domain experts to:

1. Identify all significant business events
2. Verify that all these events are represented in the domain model
3. Confirm that the event names are meaningful to domain experts
4. Identify any missing events or incorrect naming

## Implementation Roadmap

### Phase 1: Analysis and Documentation

1. Complete inventory of all domain events in the codebase
2. Document the business significance of each event
3. Identify naming inconsistencies and misalignments with the glossary
4. Create a mapping of current event names to proposed names

### Phase 2: Refactoring

1. Rename events that don't follow the conventions
2. Update all event handlers and subscribers
3. Update tests to use the new event names
4. Add documentation to all event classes

### Phase 3: Enhancement

1. Implement missing domain events
2. Create event handlers for the new events
3. Update aggregates to raise the new events
4. Add tests for the new events

### Phase 4: Validation

1. Conduct a review with domain experts
2. Verify that all events are meaningful and correctly named
3. Update the glossary if necessary
4. Ensure all documentation is up to date

## Conclusion

Domain events are a critical part of the domain model, representing significant state changes that domain experts care about. By ensuring that domain events follow consistent naming conventions and accurately reflect business concepts, we can maintain a clear and expressive domain model that facilitates communication between technical and business stakeholders.

The recommendations in this document will help improve the consistency and clarity of domain events in the Elias Food Imports codebase, making the domain model more expressive and easier to understand.

---
*This document should be reviewed and updated as the domain model evolves. Last updated: 2025-06-05*

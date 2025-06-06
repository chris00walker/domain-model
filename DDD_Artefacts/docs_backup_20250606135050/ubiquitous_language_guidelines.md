# Ubiquitous Language Guidelines

## Purpose

This document provides guidelines for consistently applying the ubiquitous language across all aspects of the Elias Food Imports project. Adhering to these guidelines ensures clear communication between business stakeholders and technical teams, reduces misunderstandings, and maintains alignment between the domain model and business requirements.

## Core Principles

1. **Consistency**: Use the same terms with the same meanings across all contexts.
2. **Clarity**: Choose precise, unambiguous terms that clearly express domain concepts.
3. **Completeness**: Ensure all important domain concepts have corresponding terms.
4. **Evolution**: Refine the language as domain understanding deepens.
5. **Accessibility**: Make terminology understandable to both technical and non-technical stakeholders.

## Guidelines for Different Artifacts

### 1. Source Code Guidelines

#### Naming Conventions

- **Classes and Aggregates**: Use nouns that directly match glossary terms (e.g., `Customer`, `Subscription`, `Order`).
- **Interfaces**: Use nouns or adjective+noun combinations (e.g., `CustomerRepository`, `PricingGovernanceService`).
- **Methods**: Use verb phrases that reflect business processes (e.g., `placeOrder()`, `cancelSubscription()`).
- **Domain Events**: Use past tense to indicate completed state changes (e.g., `OrderPlaced`, `SubscriptionCancelled`).
- **Value Objects**: Use nouns that represent immutable concepts (e.g., `Money`, `Address`, `CustomerId`).
- **Enumerations**: Use singular nouns for the type and specific values that match business terminology (e.g., `CustomerType.DiasporaHousehold`).

#### Code Structure

- Organize code by bounded context, with directory/package names matching the glossary.
- Place related domain concepts together within their bounded context.
- Include domain terminology in comments and documentation strings.
- Reference the glossary in complex domain logic to explain business rules.

#### Example:

```typescript
// GOOD: Using ubiquitous language consistently
export class Subscription extends AggregateRoot<SubscriptionProps> {
  pauseSubscription(): Result<void> {
    if (this.props.status === SubscriptionStatus.ACTIVE) {
      this.props.status = SubscriptionStatus.PAUSED;
      this.addDomainEvent(new SubscriptionPaused(this));
      return Result.ok();
    }
    return Result.fail("Only active subscriptions can be paused");
  }
}

// BAD: Inconsistent with ubiquitous language
export class SubscriptionPlan extends AggregateRoot<SubscriptionPlanProps> {
  deactivatePlan(): Result<void> { // Should be "cancelSubscription" to match glossary
    if (this.props.planState === "enabled") { // Should use SubscriptionStatus enum
      this.props.planState = "disabled";
      this.addDomainEvent(new PlanDeactivated(this)); // Should be SubscriptionCancelled
      return Result.ok();
    }
    return Result.fail("Cannot deactivate plan");
  }
}
```

### 2. Documentation Guidelines

#### Technical Documentation

- Begin each technical document with references to relevant glossary terms.
- Use consistent capitalization and formatting for domain terms.
- Format domain terms in `code style` or **bold** to highlight them.
- Include links to the glossary where appropriate.
- Structure documentation around bounded contexts and domain concepts.

#### Business Documentation

- Align all business requirements with the ubiquitous language.
- Replace generic terms with specific domain terms (e.g., use "Diaspora Household" instead of "customer").
- Include a glossary reference in all business documents.
- Organize acceptance criteria using domain terminology.
- Use consistent metrics and KPIs as defined in the glossary.

#### Example:

```markdown
# Subscription Management Feature

This feature allows **Customers** to manage their **Subscription** lifecycle.

## Functionality

- **Customers** can create a new **Subscription** by selecting a **Subscription Plan**
- **Customers** can pause their **Subscription**, triggering a **SubscriptionPaused** event
- **Customers** can resume a paused **Subscription**, triggering a **SubscriptionResumed** event
- **Customers** can cancel their **Subscription**, triggering a **SubscriptionCancelled** event

## Business Rules

- The system must maintain a **Churn Rate** of ≤5% for **Subscriptions**
- **MRR** growth must be ≥10% month-over-month
```

### 3. Database Guidelines

- Name tables and columns using the ubiquitous language.
- Use consistent naming patterns across all database objects.
- Document database schemas with references to domain concepts.
- Maintain alignment between database structures and domain aggregates.

### 4. API Guidelines

- Name endpoints using domain terminology.
- Structure API responses to reflect domain entities and value objects.
- Document APIs using ubiquitous language terms.
- Use consistent status codes and error messages that align with domain concepts.

#### Example:

```
// GOOD: API using ubiquitous language
POST /subscriptions
GET /customers/{customerId}/subscriptions
PATCH /subscriptions/{subscriptionId}/pause

// BAD: API not using ubiquitous language
POST /create-recurring-order
GET /users/{userId}/recurring-orders
PATCH /recurring-orders/{orderId}/deactivate
```

### 5. User Interface Guidelines

- Label UI elements using terms from the ubiquitous language.
- Structure navigation and information architecture around bounded contexts.
- Use consistent terminology in error messages and notifications.
- Align form fields and validation with domain rules and constraints.

## Maintaining the Ubiquitous Language

### Regular Reviews

1. **Glossary Reviews**: Schedule quarterly reviews of the ubiquitous language glossary.
2. **Code Reviews**: Include terminology checks in code review processes.
3. **Documentation Reviews**: Verify terminology consistency in all new and updated documentation.

### Handling New Terms

1. **Identification**: When a new domain concept emerges, identify it during refinement sessions.
2. **Definition**: Collaboratively define the term with both business and technical stakeholders.
3. **Documentation**: Add the term to the glossary with a clear definition and context.
4. **Communication**: Announce new or changed terms to all team members.
5. **Implementation**: Update code, documentation, and other artifacts to incorporate the new term.

### Resolving Terminology Conflicts

1. **Detection**: Monitor for inconsistent usage of terms across teams or artifacts.
2. **Analysis**: Determine the root cause of the inconsistency.
3. **Resolution**: Facilitate discussion between business and technical stakeholders to agree on the correct term.
4. **Standardization**: Update the glossary and all affected artifacts.
5. **Communication**: Ensure all team members are aware of the resolution.

## Onboarding New Team Members

1. **Introduction**: Include ubiquitous language training in onboarding processes.
2. **Reference**: Provide new team members with access to the glossary and these guidelines.
3. **Mentoring**: Assign experienced team members to help with terminology questions.
4. **Practice**: Encourage active use of the ubiquitous language in all communications.

## Conclusion

Consistent application of the ubiquitous language is essential for successful Domain-Driven Design. These guidelines provide a framework for ensuring terminology consistency across all aspects of the Elias Food Imports project. By following these guidelines, we can improve communication, reduce misunderstandings, and maintain alignment between the domain model and business requirements.

---
*This document should be reviewed and updated as the ubiquitous language evolves. Last updated: 2025-06-05*

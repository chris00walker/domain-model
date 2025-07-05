---
title: "Ubiquitous Language Guidelines"
version: "2.0"
last_updated: "2025-06-11"
status: "Final"
owner: "DDD Implementation Team"
---

# Ubiquitous Language Guidelines

## Overview

This document establishes the core guidelines for creating, maintaining, and evolving the Ubiquitous Language within the Elias Food Imports domain model. These guidelines ensure consistency across all aspects of the system, from code to documentation to conversations with domain experts.
## Key Principles
### 1. Single Source of Truth
Every domain concept must have a single, authoritative definition that is consistently used across all contexts. These definitions are maintained in the [Domain Glossary](../glossary.md) and should be referenced from all documentation and code.
### 2. Business-Driven Terminology
The Ubiquitous Language must reflect the business domain, not technical implementation. Technical terms should only be used when they have specific business meaning.
### 3. Bounded Context Awareness
Each Bounded Context may have its own dialect of the Ubiquitous Language. Terms may have different meanings in different contexts, but these differences must be explicitly documented.
### 4. Evolutionary Development
The Ubiquitous Language will evolve as our understanding of the domain evolves. Changes must be tracked, communicated, and reflected in both code and documentation.
### 5. Shared Understanding
All team members must use the Ubiquitous Language in all forms of communication about the domain, including conversations, documentation, code, tests, and user interfaces.
## Naming Conventions
### Entities
- Use nouns that reflect business concepts (e.g., `Order`, `Customer`, `Product`)
- Include a type suffix only when necessary for clarity (e.g., `SubscriptionPlan` vs. `Subscription`)
- Avoid technical suffixes like "Manager", "Helper", or "Utility"
### Value Objects
- Name after the concept they represent (e.g., `Money`, `Address`, `DateRange`)
- Use business-meaningful names rather than technical ones (e.g., `DeliveryAddress` not `AddressData`)
- Append "VO" suffix in code to distinguish from similar-named entities
### Domain Events
- Use past tense to indicate something that has happened (e.g., `OrderPlaced`, `PaymentProcessed`)
- Entity-first naming to indicate the subject of the event
- Be specific about what changed or occurred
### Domain Services
- Use verbs or verb phrases that describe the action performed (e.g., `AuthenticationService`)
- Focus on the business capability rather than technical function
- Avoid generic terms like "Manager" or "Processor"
### Repositories
- Name after the aggregate they provide access to with "Repository" suffix (e.g., `OrderRepository`)
- Use consistent access method names across all repositories
## Documentation Standards
### Definition Format
```
Term: [Term Name]
Definition: [Clear, concise definition]
Bounded Context: [Primary context where this term applies]
Related Terms: [List of related terms]
Examples: [Business examples of the term in use]
```
### Cross-Reference Requirements
- All documentation must use consistent terminology from the Ubiquitous Language
- Any ambiguous terms must be linked to their authoritative definition
- Variations in meaning across bounded contexts must be explicitly noted
## Code Implementation
### Class and Type Declaration
```typescript
// Entity example
export class Order {
  // Properties and methods using ubiquitous language terms
}
// Value Object example
export class Money {
  // Implementation with business-relevant methods
}
// Domain Event example
export class ProductAuthenticated extends DomainEvent {
  // Event properties using consistent terminology
}
```
### Method Naming
- Use verbs that reflect business operations
- Be consistent with tense and voice
- Examples:
  ```typescript
  Order.place() // not Order.create() or Order.submit()
  Subscription.renew() // not Subscription.extend() or Subscription.update()
  Product.authenticate() // not Product.verify() or Product.check()
  ```
## Domain Language Glossary
See the [Domain Glossary](../glossary.md) for the authoritative list of all domain terms, their definitions, and context-specific variations.
## Compliance Checklist
- [ ] Does the term reflect a concept that domain experts recognize?
- [ ] Is the term consistently used in code, documentation, and conversation?
- [ ] Is the term clearly defined without technical jargon?
- [ ] Does the term avoid ambiguity within its bounded context?
- [ ] If the term has different meanings across bounded contexts, is this explicitly documented?
- [ ] Has the term been reviewed and approved by domain experts?
## Governance
The Ubiquitous Language is governed by the DDD Implementation Team with regular input from domain experts. Any proposed changes must follow the [Ubiquitous Language Evolution Process](ubiquitous_language_evolution.md).
*These guidelines serve as the foundation for maintaining consistency across the entire domain model and ensuring clear communication between technical and business stakeholders.*

---

⚑ Related
- [Domain Glossary](../glossary.md)
- [Ubiquitous Language Evolution Process](./ubiquitous_language_evolution.md)

↩ [Back to Framework TOC](../README.md)

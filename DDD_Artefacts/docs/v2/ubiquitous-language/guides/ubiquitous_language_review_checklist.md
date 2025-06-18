---
title: "Ubiquitous Language Review Checklist"
version: "2.0"
last_updated: "2025-06-06"
status: "Final"
---
##
title: "Ubiquitous Language Review Checklist"
version: "1.0"
last_updated: "2025-06-06"
## status: "Draft"
status: "Draft"
title: "Ubiquitous Language Review Checklist"
version: "1.0"
last_updated: "2025-06-06"
status: "Approved"
contributors:
  - "Domain Team"
# Ubiquitous Language Review Checklist
## Overview
This document provides a comprehensive checklist for reviewing artifacts, code, documentation, and communications to ensure consistent use of the ubiquitous language in the Elias Food Imports domain model. This checklist should be used during code reviews, document reviews, and design discussions to maintain language consistency across the system.
## Strategic Importance
Consistent application of ubiquitous language is essential for:
1. **Communication Clarity**: Eliminating misunderstandings between technical and domain experts
2. **Model Integrity**: Ensuring the code accurately reflects the domain model
3. **Documentation Consistency**: Maintaining alignment between documentation and implementation
4. **Onboarding Efficiency**: Helping new team members understand the domain quickly
5. **Reduced Technical Debt**: Preventing terminology drift that leads to confusion and errors
## Code Review Checklist
### 1. Class and Type Names
- [ ] Names clearly reflect domain concepts, not technical implementation details
- [ ] Aggregate, entity, and value object names match the ubiquitous language glossary
- [ ] Class names are consistent with bounded context terminology
- [ ] Types use domain-specific rather than generic terms (e.g., `ProductId` instead of `Identifier`)
- [ ] Type hierarchies reflect domain relationships
### 2. Method and Function Names
- [ ] Method names represent domain actions, behaviors, or use cases
- [ ] Domain verbs are used consistently (e.g., `completeOrder` not `finishOrder`)
- [ ] Parameter names use domain terminology
- [ ] Return value types and names align with domain concepts
- [ ] Method signatures reflect domain rules and constraints
### 3. Variable and Property Names
- [ ] All variables use domain terminology rather than technical jargon
- [ ] Collection names reflect their domain purpose (e.g., `activeSubscriptions` not just `items`)
- [ ] Boolean variables express domain states or conditions (e.g., `isEligibleForDiscount`)
- [ ] Enumerations use domain-specific labels and values
- [ ] Constants represent domain-specific fixed values with meaningful names
### 4. Comments and Documentation
- [ ] Code comments reference domain concepts and rationales
- [ ] JSDocs/TSDoc annotations use ubiquitous language terms
- [ ] Examples in documentation use domain-accurate scenarios
- [ ] Edge cases are explained in domain terms
- [ ] Links to relevant business rules or domain documentation are provided
## Documentation Review Checklist
### 1. Terminology Consistency
- [ ] All terms align with the current glossary definitions
- [ ] No synonyms or alternate phrasings for the same concept
- [ ] Technical terms are defined in relation to domain concepts
- [ ] Consistent capitalization and hyphenation of domain-specific terms
- [ ] Abbreviations are used consistently and documented when introduced
### 2. Structural Alignment
- [ ] Document structure reflects domain relationships and hierarchies
- [ ] Bounded contexts are clearly delineated
- [ ] Relationships between concepts are accurately described
- [ ] Domain processes are described using consistent terminology
- [ ] Business rules are expressed using ubiquitous language
### 3. Diagrams and Visuals
- [ ] Diagram labels use exact ubiquitous language terms
- [ ] Entity relationships reflect domain relationships
- [ ] Process flows use domain-specific action verbs
- [ ] Decision points reflect actual business rules
- [ ] Visual hierarchies match domain concept importance
### 4. Examples and Scenarios
- [ ] Examples use realistic business scenarios
- [ ] Sample data reflects actual domain values
- [ ] Edge cases demonstrate real business concerns
- [ ] Success and error conditions are domain-meaningful
- [ ] Example flows demonstrate actual business processes
## Design Discussion Checklist
### 1. Meeting Preparation
- [ ] Relevant domain glossary sections available for reference
- [ ] Previous design decisions on terminology reviewed
- [ ] Domain experts involved or consulted
- [ ] Known terminology conflicts identified in advance
- [ ] Context-specific language variations acknowledged
### 2. During Discussions
- [ ] Terms are used consistently by all participants
- [ ] New terms are explicitly defined and documented
- [ ] Terminology conflicts are resolved immediately
- [ ] Technical concepts are translated to domain language
- [ ] Domain metaphors are used appropriately and consistently
### 3. Follow-up Actions
- [ ] New or refined terms are added to the glossary
- [ ] Term clarifications are distributed to the team
- [ ] Changes to existing terminology are documented with rationale
- [ ] Affected code and documentation are identified
- [ ] Migration plan for terminology changes is created if needed
## Technical Integration Checklist
### 1. API Design
- [ ] Endpoint names reflect domain concepts
- [ ] Request/response fields use domain terminology
- [ ] Error messages express domain validation rules
- [ ] API documentation uses ubiquitous language
- [ ] API versioning strategy accounts for terminology evolution
### 2. Database Design
- [ ] Table and column names reflect domain entities and attributes
- [ ] Relationships express domain relationships
- [ ] Constraints implement domain rules
- [ ] Indexes support domain-specific access patterns
- [ ] Schema documentation uses ubiquitous language
### 3. UI Components
- [ ] UI labels match ubiquitous language terms
- [ ] Form field names align with domain attributes
- [ ] Error messages use domain terminology
- [ ] Navigation reflects domain processes
- [ ] UI documentation uses consistent terminology
### 4. Testing
- [ ] Test descriptions use domain terminology
- [ ] Test cases reflect business scenarios
- [ ] Assertions verify domain rules
- [ ] Test data represents meaningful domain values
- [ ] Mock objects follow domain patterns and naming
## Cross-Context Integration Checklist
### 1. Context Boundaries
- [ ] Clear identification of bounded context for each term
- [ ] Context maps document terminology differences between contexts
- [ ] Translation between contexts is explicit when necessary
- [ ] Shared kernel terms are consistently applied
- [ ] Anti-corruption layer terminology is documented
### 2. Integration Points
- [ ] Events use publisher's ubiquitous language
- [ ] Subscribers translate to their own context as needed
- [ ] Shared services use agreed terminology
- [ ] Public interfaces document terminology assumptions
- [ ] Version changes consider terminology impact
## Evolution and Lifecycle Management Checklist
### 1. Terminology Changes
- [ ] Changes follow the Ubiquitous Language Evolution Process
- [ ] Business motivation for changes is documented
- [ ] Impact analysis covers all affected artifacts
- [ ] Migration strategy includes code, docs, and data
- [ ] Team communication plan for terminology changes
### 2. New Concepts
- [ ] New terms are clearly defined
- [ ] Relationship to existing concepts is documented
- [ ] Distinction from similar concepts is clear
- [ ] Examples demonstrate proper usage
- [ ] Integration with existing model is explicit
## Related Resources
| Resource | Relationship |
|----------|--------------|
| Ubiquitous Language Guidelines | Defines standards for language usage |
| Ubiquitous Language Evolution Process | Details how to safely evolve terminology |
| Domain Terms in Requirements Analysis | Shows application in requirements |
| Domain Event Naming Analysis | Specific guidance for naming events |
| Value Objects Analysis | Guidelines for value object terminology |
## Conclusion
Regular application of this review checklist ensures that Elias Food Imports maintains a consistent, clear, and expressive ubiquitous language throughout all aspects of the system. By systematically reviewing artifacts against these criteria, we can detect and correct terminology inconsistencies early, maintaining the integrity of our domain model.
*This document should be reviewed and updated as the Ubiquitous Language evolves. Last updated: 2025-06-06*

---

⚑ Related
- [Domain Glossary](../glossary.md)
- [Ubiquitous Language Evolution Process](./ubiquitous_language_evolution.md)

↩ [Back to Framework TOC](../README.md)

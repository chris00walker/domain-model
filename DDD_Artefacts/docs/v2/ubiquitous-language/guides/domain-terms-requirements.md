---
title: "Domain Terms in Requirements Analysis"
version: "2.0"
last_updated: "2025-06-06"
status: "Final"
---
##
title: "Domain Terms in Requirements Analysis"
version: "1.0"
last_updated: "2025-06-06"
## status: "Draft"
status: "Draft"
title: Domain Terms in Requirements Analysis
version: "1.0"
status: active
owner: Domain Modeling Team, Product Owners
last_updated: 2025-06-07
# Domain Terms in Requirements Analysis
## Overview
This document provides an analysis of domain terminology usage in requirements documentation, user stories, and acceptance criteria across Elias Food Imports' bounded contexts. Consistent usage of domain terms in requirements is critical for maintaining semantic alignment between business needs and technical implementation.
## Purpose
1. **Terminology Audit**: Evaluate the consistency of domain terms in requirements artifacts
2. **Reference Standard**: Establish requirements language standards for all stakeholders
3. **Gap Analysis**: Identify areas where domain terminology is incomplete or inconsistent
4. **Alignment Guide**: Provide guidelines for writing domain-aligned requirements
## Terminology Analysis by Bounded Context
### Catalog Authentication Context
| Domain Term | Definition | Usage in Requirements | Consistency Analysis |
|-------------|------------|----------------------|---------------------|
| Authentication Token | A unique identifier used to verify Product authenticity | Consistently used in Authentication requirements and stories | ✓ High consistency |
| Authentication Method | The technical approach used for verification (QR, NFC, Hologram) | Sometimes referred to as "verification type" in older requirements | ⚠️ Medium consistency |
| Certificate of Authenticity | Digital document proving Product authenticity | Often abbreviated as "COA" in requirements | ⚠️ Medium consistency |
| Authentication Scan | Process of scanning a Product to verify authenticity | Sometimes called "verification scan" or just "scan" | ⚠️ Medium consistency |
| Counterfeit Detection | Process of identifying fake products | Consistently used across all relevant requirements | ✓ High consistency |
**Recommended Improvements:**
- Standardize on "Authentication Method" rather than "verification type"
- Use full term "Certificate of Authenticity" on first mention with subsequent "COA" abbreviation
- Always use "Authentication Scan" rather than generic "scan"
### Subscription Context
| Domain Term | Definition | Usage in Requirements | Consistency Analysis |
|-------------|------------|----------------------|---------------------|
| Subscription Plan | A defined offering with specific products, Pricing, and terms | Consistently used in Subscription-related requirements | ✓ High consistency |
| Billing Cycle | The recurring period for Subscription billing | Sometimes called "billing period" or "Payment cycle" | ⚠️ Medium consistency |
| Delivery Schedule | Timing pattern for recurring Product deliveries | Consistently used across requirements | ✓ High consistency |
| Subscription Pause | Temporary suspension of a Subscription | Consistently referred to as "pause" | ✓ High consistency |
| Curation | Process of selecting products for Subscription boxes | Sometimes called "Product selection" or "box customization" | ⚠️ Medium consistency |
**Recommended Improvements:**
- Standardize on "Billing Cycle" throughout all requirements
- Consistently use "Curation" for Product selection processes
### Pricing Context
| Domain Term | Definition | Usage in Requirements | Consistency Analysis |
|-------------|------------|----------------------|---------------------|
| Price List | Collection of prices for specific Customer segments | Consistently used in Pricing requirements | ✓ High consistency |
| Price Point | The price of a specific Product in a specific context | Sometimes called "Product price" or just "price" | ⚠️ Medium consistency |
| Discount Rule | Logic that determines price reductions | Various terms used ("discount logic", "price rule", etc.) | ❌ Low consistency |
| Currency Conversion | Process of converting prices between currencies | Consistently used | ✓ High consistency |
| Pricing Strategy | High-level approach to setting prices | Consistently used | ✓ High consistency |
**Recommended Improvements:**
- Always use "Price Point" when referring to a specific Product's price
- Standardize on "Discount Rule" for all price reduction logic
### Order Context
| Domain Term | Definition | Usage in Requirements | Consistency Analysis |
|-------------|------------|----------------------|---------------------|
| Order | A Customer request for products to be delivered | Consistently used | ✓ High consistency |
| Order Line | Individual Product entry in an Order | Sometimes called "Order item" or "line item" | ⚠️ Medium consistency |
| Order Status | Current state of an Order in its lifecycle | Consistently used | ✓ High consistency |
| Fulfillment | Process of completing and shipping an Order | Sometimes called "shipping process" | ⚠️ Medium consistency |
| Order Modification | Change to an existing Order | Various terms used ("Order change", "Order update", etc.) | ❌ Low consistency |
**Recommended Improvements:**
- Standardize on "Order Line" for individual products in orders
- Always use "Fulfillment" for the shipping process
- Consistently use "Order Modification" for changes to existing orders
## Cross-Context Terminology Analysis
### Terms with Different Meanings Across Contexts
| Term | Context | Domain Meaning | Requirements Usage | Resolution Strategy |
|------|---------|----------------|-------------------|---------------------|
| Product | Catalog | Item in the Product Catalog | Consistent with domain model | Specify "Catalog Product" in cross-context requirements |
| Product | Subscription | Item included in Subscription plan | Sometimes lacking context | Specify "Subscription Product" in cross-context requirements |
| Customer | Customer Management | Entity with Customer attributes | Consistent | No change needed |
| Customer | Order | The buyer in a specific transaction | Sometimes used inconsistently | Specify "Order Customer" when referring to transaction context |
| Delivery | Order | Physical transportation of products | Consistent | No change needed |
| Delivery | Subscription | Scheduled dispatch of Subscription items | Sometimes called "Subscription delivery" or "dispatch" | Always use "Subscription Delivery" |
### Shared Terms with Consistent Meanings
| Term | Contexts | Shared Meaning | Requirements Usage | Status |
|------|----------|----------------|-------------------|--------|
| Authentication | Catalog Authentication, Customer | Verification of identity | Consistent | ✓ Aligned |
| Payment | Order, Subscription | Financial transaction | Consistent | ✓ Aligned |
| Country | All | Geographic location with customs/regulatory implications | Consistent | ✓ Aligned |
| Currency | Pricing, Payment, Order | Monetary unit | Consistent | ✓ Aligned |
## Requirements Writing Guidelines
### User Story Structure
User stories should follow this domain-aligned structure:
```
As a [ACTOR ROLE],
I want to [ACTION using domain terminology],
So that I can [BUSINESS OUTCOME using domain terminology].
```
**Good Example**:
```
As a Subscription Customer,
I want to pause my Subscription for a specific duration,
So that I can temporarily stop deliveries while maintaining my Subscription.
```
**Poor Example**:
```
As a user,
I want to stop getting boxes for a while,
So that I don't get deliveries when I'm away.
```
### Acceptance Criteria Structure
Acceptance criteria should use domain terminology and explicit business rules:
```
GIVEN [domain context with domain terms]
WHEN [action using domain terminology]
THEN [outcome using domain terminology and explicit criteria]
```
**Good Example**:
```
GIVEN a Customer with an Active Subscription
WHEN they request to Pause the Subscription for 60 days
THEN the Subscription Status should change to Paused
AND no Subscription Deliveries should be scheduled during the pause period
AND the Next Billing Date should be extended by 60 days
```
**Poor Example**:
```
GIVEN a user with a Subscription
WHEN they pause it
THEN they shouldn't get charged or receive products
```
## Domain Terminology Gap Analysis
The following areas have been identified as requiring additional domain terminology refinement:
### Payment Context
Current requirements use inconsistent terminology for:
- Payment processing workflows
- Refund categorization
- Payment failure handling
**Recommendation**: Schedule a dedicated domain modeling session for the Payment context with finance stakeholders.
### Inventory Management Context
Requirements for Inventory processes lack consistent terminology for:
- Stock allocation processes
- Inventory reservation mechanisms
- Warehousing terminology
**Recommendation**: Develop a comprehensive Inventory glossary with operations team.
## Term Usage Metrics
Analysis of 250 user stories and requirements documents over the past 12 months:
| Metric | Result | Target | Status |
|--------|--------|--------|--------|
| % of User Stories Using Domain Terminology | 78% | 95% | ⚠️ Below Target |
| % of Acceptance Criteria Using Domain Terminology | 65% | 90% | ❌ Significantly Below Target |
| % of Technical Requirements Using Domain Terminology | 83% | 90% | ⚠️ Below Target |
| % of Requirements Authors Trained on Ubiquitous Language | 60% | 100% | ❌ Significantly Below Target |
## Requirements Analysis Tools
### Domain Terminology Checker
We've implemented an automated domain terminology checker for requirements that:
1. Scans requirements documents and user stories
2. Highlights non-standard terms or inconsistent usage
3. Suggests domain-aligned alternatives
4. Reports compliance metrics
**Usage**: `domaincheck --path [path/to/requirements] --context [bounded-context]`
### Requirements Templates
Domain-aligned templates are available for:
- Epic descriptions
- User stories
- Acceptance criteria
- Technical requirements
- Feature specifications
**Repository**: `[internal-link]/templates/domain-requirements`
## Implementation Verification Process
To ensure domain terminology continues from requirements to implementation:
1. **Requirements Review**: Product managers verify domain terminology in requirements
2. **Design Review**: Designers and developers verify domain terminology in design artifacts
3. **Code Review**: Developers verify domain terminology in code implementations
4. **Testing Verification**: QA verifies domain terminology in test cases and scenarios
## Glossary References
For comprehensive domain term definitions, refer to:
| Bounded Context | Glossary Location |
|-----------------|-------------------|
| Catalog Authentication | `/DDD_Artefacts/docs/v2/domain-knowledge/core-contexts/Catalog-Authentication/glossary.md` |
| Subscription | `/DDD_Artefacts/docs/v2/domain-knowledge/core-contexts/Subscription/glossary.md` |
| Pricing | `/DDD_Artefacts/docs/v2/domain-knowledge/core-contexts/Pricing/glossary.md` |
| Order | `/DDD_Artefacts/docs/v2/domain-knowledge/core-contexts/Order/glossary.md` |
| Customer | `/DDD_Artefacts/docs/v2/domain-knowledge/supporting-contexts/Customer/glossary.md` |
## Continuous Improvement
### Term Evolution Process
As domain understanding evolves:
1. **Detection**: Identify new or evolving terms in requirements or domain discussions
2. **Analysis**: Compare with existing terminology and evaluate consistency
3. **Documentation**: Update domain glossaries with new/changed terms
4. **Communication**: Notify stakeholders of terminology changes
5. **Training**: Update training materials and conduct refresher sessions
### Feedback Loop
Maintain an open feedback channel for terminology issues:
- Regular review sessions with domain experts
- Quick-response term clarification process
- Documentation of term evolution decisions
## Conclusion
Consistent domain terminology in requirements is the foundation for successful domain-driven design implementation. This analysis provides a baseline for improving requirements language and establishes processes for maintaining terminology consistency from requirements through implementation.
*This document is part of the Elias Food Imports Ubiquitous Language Consistency Framework. Refer to the [Ubiquitous Language Guidelines](../guidelines.md) for overarching principles.*

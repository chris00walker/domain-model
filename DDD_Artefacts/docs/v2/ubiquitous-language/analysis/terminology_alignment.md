---
title: "Domain Terminology Alignment Guide"
version: "2.0"
last_updated: "2025-06-06"
status: "Final"
---
##
title: "Domain Terminology Alignment Guide"
version: "1.0"
last_updated: "2025-06-06"
## status: "Draft"
status: "Draft"
title: "Domain Terminology Alignment Guide"
version: "1.0"
last_updated: "2025-06-06"
status: "Approved"
contributors:
  - "Domain Team"
# Domain Terminology Alignment Guide
## Overview
This document provides guidance for aligning terminology across different stakeholders, teams, and artifacts in the Elias Food Imports domain model. It addresses the common challenge of terminology misalignment that occurs when different parts of the organization use different terms for the same concept or the same term for different concepts. By establishing clear alignment strategies, we can maintain a consistent ubiquitous language that supports effective communication and a coherent domain model.
## Strategic Importance
Terminology alignment provides several critical benefits:
1. **Reduced Misunderstandings**: Eliminates confusion caused by terminology differences
2. **Improved Collaboration**: Enables clearer communication between technical and domain experts
3. **Model Integrity**: Ensures the code accurately reflects business concepts
4. **Documentation Consistency**: Creates coherent documentation that uses consistent terminology
5. **Onboarding Efficiency**: Helps new team members learn the domain language faster
## Terminology Mapping Approach
### Cross-Team Terminology Mapping
The following table maps key domain terms across different stakeholder groups:
| Business Term | Technical Term | Customer-Facing Term | Database Term | Preferred Domain Term |
|--------------|----------------|---------------------|--------------|---------------------|
| Scan | Authentication Verification | Product Verification | prod*auth*scan | ProductAuthentication |
| Margin | Price Margin | (N/A - Internal) | margin_pct | Margin |
| Delivery Schedule | Shipment Plan | Delivery Time | delivery_sched | ShipmentSchedule |
| Renewal | Subscription Renewal | Plan Continuation | renewal_event | SubscriptionRenewal |
| Product Settings | Product Configuration | Preferences | prod_settings | ProductSettings |
| Refund | Payment Reversal | Refund | transaction_refund | Refund |
| Cold Chain | Temperature Control | Freshness Guarantee | temp*control*log | ColdChainCompliance |
| Customer Tier | Customer Segment | Membership Level | cust_segment | CustomerSegment |
### Bounded Context Translation
This table shows how key concepts translate across bounded contexts:
| Concept | Catalog Context | Order Context | Subscription Context | Preferred Cross-Context Term |
|---------|----------------|---------------|---------------------|----------------------------|
| Product | Product | OrderLine Item | SubscriptionItem | Product (with context qualifier) |
| Price | ListPrice | OrderPrice | SubscriptionPrice | Price (with context qualifier) |
| Customer | Browser | Customer | Subscriber | Customer (with context qualifier) |
| Address | (N/A) | ShippingAddress | BillingAddress | Address (with type qualifier) |
| Payment | (N/A) | OrderPayment | SubscriptionPayment | Payment (with context qualifier) |
## Alignment Strategies
### 1. Context-Specific Glossaries
Maintain glossaries for each bounded context that:
- Define all terms specific to that context
- Note any terms that differ from general domain terminology
- Explain the reasoning behind context-specific terminology
Example:
```markdown
# Subscription Context Glossary
- **Subscriber**: A Customer with an active Subscription (equivalent to "Customer" in other contexts)
- **Plan**: The Subscription offering including frequency and products (unique to this context)
- **Billing Cycle**: The recurring period for Subscription payments (unique to this context)
```
### 2. Translation Tables
Create and maintain translation tables for:
- Business-to-technical terminology
- Cross-context terminology
- Legacy-to-current terminology
- External system integration terminology
Example:
```markdown
# Legacy to Current Terminology
| Legacy Term | Current Term | Notes |
|------------|-------------|-------|
| Customer Type | Customer Segment | Changed with segmentation model update |
| Stock Level | Inventory Level | Aligned with Inventory management system |
| Authentication Code | Product Authentication Token | Updated for clarity |
```
### 3. Context Mapping Documents
For each context boundary, document:
- Shared concepts and their terminology in each context
- Translation mechanisms between contexts
- Common misunderstandings and how to avoid them
### 4. Visual Dictionary
Create visual representations of key domain concepts, showing:
- The concept name in the ubiquitous language
- Visual representation or diagram
- Key attributes and behaviors
- Related concepts and their relationships
## Terminology Conflict Resolution
When terminology conflicts arise, follow this resolution process:
### 1. Identify Conflict Type
- **Synonym Conflict**: Different terms for the same concept
- **Homonym Conflict**: Same term for different concepts
- **Definition Conflict**: Same term with different meanings
- **Boundary Conflict**: Unclear context boundaries
### 2. Resolution Process
1. **Document the conflict**: Note all variations currently in use
2. **Consult domain experts**: Determine which term best reflects business meaning
3. **Evaluate impact**: Assess change impact on code, documentation, and UI
4. **Make a decision**: Select the preferred term based on clarity and business alignment
5. **Document the decision**: Record the chosen term and rationale
6. **Create migration plan**: Plan for updating all affected artifacts
### 3. Conflict Resolution Examples
#### Example 1: Resolving "Membership" vs. "Subscription"
**Conflict**: Marketing team uses "Membership" while technical team uses "Subscription"
**Resolution**:
- Domain expert consultation revealed "Subscription" better reflects the business model
- "Subscription" adopted as the ubiquitous language term
- UI/UX updated to use "Subscription" consistently
- Marketing materials gradually updated to align terminology
- Translation maintained for external partner APIs still using "Membership"
#### Example 2: Resolving "Authentication" Context Boundary
**Conflict**: Unclear if "Authentication" refers to Product authenticity or user login
**Resolution**:
- Created distinct bounded contexts: "Catalog Authentication" and "User Authentication"
- Updated documentation to consistently use qualified terms
- Renamed classes and methods to reflect the proper context
- Created context map showing relationship between these contexts
## Implementation Guidelines
### Code Implementation
1. **Class and Method Naming**:
   - Use ubiquitous language terms directly in code
   - Add context prefixes when necessary for clarity
   - Document any deviation from ubiquitous language
2. **Comments and Documentation**:
   - Reference the ubiquitous language term in comments
   - Link to glossaries for complex domain concepts
   - Explain any technical-to-domain term mappings
3. **Variable Naming**:
   - Use domain terminology even for local variables
   - Avoid technical abbreviations that obscure domain meaning
   - Be consistent with singular/plural forms
### Documentation Implementation
1. **Cross-References**:
   - Link terms to their glossary definitions
   - Provide term translation when introducing concepts
   - Specify context when using potentially ambiguous terms
2. **Consistency Checking**:
   - Review documentation for terminology consistency
   - Use automated tools to flag terminology mismatches
   - Include terminology review in document approval process
## Common Pitfalls and Solutions
### 1. Implicit Context
**Problem**: Using terms without specifying their context
**Solution**: Always qualify ambiguous terms with their context
### 2. Technical Leakage
**Problem**: Technical terms leaking into business discussions
**Solution**: Translate technical concepts to business language before discussions with domain experts
### 3. Legacy Momentum
**Problem**: Resistance to terminology changes due to familiarity with old terms
**Solution**: Create clear mapping between old and new terms, explain benefits of alignment
### 4. Incomplete Adoption
**Problem**: Partial adoption of ubiquitous language across teams
**Solution**: Regular terminology audits and alignment sessions across teams
## Relationship to Other Artifacts
| Related Artifact | Relationship |
|-----------------|--------------|
| Ubiquitous Language Guidelines | Provides core terminology standards |
| Domain Event Naming Analysis | Ensures events follow consistent terminology |
| Value Objects Analysis | Ensures value objects reflect domain language |
| API Design Guidelines | Ensures APIs use consistent terminology |
| Context Map | Shows boundaries where terminology changes occur |
## Conclusion
Terminology alignment is an ongoing process that requires continuous attention and refinement. By following the strategies outlined in this guide, Elias Food Imports can maintain a consistent ubiquitous language that accurately reflects the business domain, facilitates clear communication across teams, and supports a coherent domain model. Regular review and updating of terminology alignment documents ensures that the ubiquitous language evolves appropriately as the business and domain understanding evolve.
*This document should be reviewed and updated as the domain model evolves. Last updated: 2025-06-06*

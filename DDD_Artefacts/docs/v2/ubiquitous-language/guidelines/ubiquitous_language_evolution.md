---
title: "Ubiquitous Language Evolution Process"
version: "2.0"
last_updated: "2025-06-06"
status: "Final"
---
##
title: "Ubiquitous Language Evolution Process"
version: "1.0"
last_updated: "2025-06-06"
## status: "Draft"
status: "Draft"
title: Ubiquitous Language Evolution Process
version: "1.0"
status: active
owner: DDD Implementation Team
last_updated: 2025-06-06
# Ubiquitous Language Evolution Process
## Overview
This document defines the formal process for evolving the Ubiquitous Language within Elias Food Imports as our understanding of the domain grows and changes. A disciplined approach to language evolution ensures that we maintain consistency while allowing our language to grow with the business needs.
## Principles
1. **Intentional Change**: Changes to the Ubiquitous Language should be deliberate, not accidental
2. **Business-Driven**: Evolution should be driven by business needs and insights, not technical convenience
3. **Collaborative Process**: Both domain experts and technical team members must participate
4. **Transparency**: The evolution process must be visible and accessible to all stakeholders
5. **Traceability**: Changes must be documented with rationale and impact assessment
## Evolution Workflow
### 1. Proposal Phase
1. **Submit Language Change Proposal (LCP)**:
   - Complete the LCP template (see below)
   - Submit to the Language Stewardship Team
2. **Initial Review**:
   - Language Stewards review for completeness and clarity
   - If incomplete, return to proposer for additional information
   - If complete, advance to discussion phase
### 2. Discussion Phase
1. **Stakeholder Notification**:
   - Notify relevant domain experts and technical teams
   - Schedule review session if significant change
2. **Discussion Period**:
   - 3-5 working days for feedback collection
   - Consider impact on existing code, documentation, and processes
   - Domain experts evaluate business alignment
3. **Refinement**:
   - Incorporate feedback into proposal
   - Clarify definitions and usage examples
   - Document context-specific variations if needed
### 3. Decision Phase
1. **Final Review by Language Stewards**:
   - Evaluate against language quality criteria (clarity, consistency, necessity)
   - Ensure business alignment and technical feasibility
2. **Decision**:
   - Accept, Reject, or Request Modifications
   - Document decision rationale
3. **Versioning**:
   - Assign version to accepted changes
   - Record in Language Change Log
### 4. Implementation Phase
1. **Update Documentation**:
   - Update Glossary
   - Revise relevant documentation
   - Add to onboarding materials
2. **Code Changes**:
   - Create technical tasks for implementing changes
   - Follow established refactoring patterns
   - Update tests to reflect new terminology
3. **Communication**:
   - Announce changes to all teams
   - Provide transition guidance
4. **Training**:
   - Update training materials
   - Conduct sessions if major changes
## Language Change Proposal (LCP) Template
```markdown
# Language Change Proposal
## Change Type
[ ] New Term Addition
[ ] Term Definition Change
[ ] Term Deprecation
[ ] Context-Specific Variation
## Proposed Change
**Term**: [Term name]
**Current Definition**: [If existing term]
**Proposed Definition**: [Clear, concise definition]
**Primary Bounded Context**: [Where this term primarily applies]
**Rationale**: [Business or technical reasoning for change]
**Impact Assessment**:
- Code: [Classes/components affected]
- APIs: [Endpoints affected]
- Documentation: [Docs requiring updates]
- UI: [Interface changes needed]
**Example Usage**: [Example in business context]
**Proposed by**: [Name] [Date]
```
## Decision Criteria
Language Stewards will evaluate proposals using these criteria:
1. **Clarity**: Is the definition clear and unambiguous?
2. **Consistency**: Does it maintain consistency with existing terminology?
3. **Necessity**: Does it address a genuine need or gap?
4. **Business Alignment**: Does it accurately reflect business concepts?
5. **Feasibility**: Can it be reasonably implemented?
6. **Cross-Context Impact**: How will it affect other bounded contexts?
## Language Versioning
The Ubiquitous Language follows semantic versioning principles:
- **Major Version**: Significant changes that may break existing understanding
- **Minor Version**: Additions and clarifications that maintain backward compatibility
- **Patch Version**: Minor corrections and refinements
## Language Change Log
The Language Change Log is maintained in [glossary/CHANGELOG.md](../glossary/CHANGELOG.md) and records:
- Version
- Date
- Changes (additions, modifications, deprecations)
- Rationale
- Impact summary
## Special Considerations
### Emergency Changes
For urgent changes (e.g., legal requirements, critical business changes):
1. Submit expedited LCP marked "URGENT"
2. Language Stewards review within 24 hours
3. Abbreviated discussion period (1-2 days)
4. Implementation prioritized
### Bounded Context Variations
When a term must vary between bounded contexts:
1. Document primary definition
2. Clearly document context-specific variations
3. Establish explicit translation where contexts interact
## Governance
The Ubiquitous Language is governed by:
- **Language Stewardship Team**: 1 architect, 2 domain experts, 1 Product owner
- **Decision Authority**: Final decision authority rests with the Language Stewardship Team
- **Review Cadence**: The team meets biweekly to review proposals
## Example: Language Evolution in Practice
**Original Term**: "Subscription Box"
**Evolution Process**:
1. **Issue Identified**: Domain experts note that "Subscription Box" is ambiguous; some use it to mean the physical package, others the Subscription Product.
2. **LCP Submitted**: Proposal to clarify by separating into two terms
3. **Discussion**: Impact assessment shows moderate code changes but significant clarity improvement
4. **Decision**: Approved with modifications
5. **Implementation**:
   - "Subscription Plan" for the purchasable Subscription Product
   - "Subscription Shipment" for the physical package delivered
   - Code and documentation updated accordingly
6. **Communication**: Changes announced in team meeting and documented
*This process supports the continuous refinement of our Ubiquitous Language while maintaining consistency and clarity across the domain model.*

# Documentation Governance

## Purpose
This document establishes the governance process for maintaining documentation consistency and preventing multiple sources of truth within the Elias Food Imports domain model documentation.

## Core Principles

1. **Single Source of Truth**
   - Each concept has exactly one authoritative source of documentation
   - All other references must link to, not duplicate, this source

2. **Version Control**
   - All documentation must be version controlled
   - Version numbers follow semantic versioning (MAJOR.MINOR.PATCH)
   - Update version numbers when making significant changes

3. **Ownership**
   - Each document must have a clear owner
   - Owners are responsible for maintaining document accuracy and consistency

## Documentation Standards

### Frontmatter Requirements
All Markdown files must include the following frontmatter:

```yaml
---
title: "Document Title"
version: "1.0.0"
last_updated: "YYYY-MM-DD"
status: "Draft | Review | Final | Deprecated"
owner: "Team or Individual Name"
---
```

### File Naming Conventions
- Use `snake_case` for all filenames
- Prefix with document type when appropriate (e.g., `adr_`, `rfc_`)
- Use descriptive, specific names

## Change Management Process

### Proposing Changes
1. Create a new branch for documentation changes
2. Update the relevant documentation
3. Update the version number following semantic versioning:
   - MAJOR: Breaking changes or major restructuring
   - MINOR: New content or significant updates
   - PATCH: Minor corrections or formatting changes

### Review Process
1. Request review from at least one other team member
2. Address all review comments
3. Update the `last_updated` field
4. Update the `status` field if necessary

### Approval and Merge
1. Merge to main only after approval
2. Delete the feature branch after merge
3. Update any related documentation that references the changed content

## Preventing Duplication

### Cross-Referencing
- Use relative links to reference other documentation
- When referencing concepts, link to the canonical source
- Avoid duplicating content; link instead

### Documentation Types
1. **Reference Documentation**
   - Authoritative source for specific topics
   - Must be kept up-to-date
   - Examples: API references, domain models

2. **Guides**
   - Explain how to accomplish specific tasks
   - May reference multiple reference documents
   - Should not duplicate reference content

3. **Tutorials**
   - Step-by-step instructions for beginners
   - May include some duplication for clarity
   - Must be clearly marked as learning materials

## Regular Audits

### Quarterly Reviews
- Review documentation for accuracy and relevance
- Identify and remove or update outdated content
- Check for broken links
- Verify cross-references

### Documentation Health Check
- Run automated checks for:
  - Broken links
  - Missing frontmatter
  - Outdated version numbers
  - Unused files

## Tools and Automation

### Linting
- Use markdown-lint to enforce consistent formatting
- Custom rules for project-specific requirements
- Run as part of CI/CD pipeline

### Link Checking
- Automated link validation
- Scheduled weekly runs
- Reports broken or outdated links

## Training and Onboarding

### New Team Members
- Documentation standards training during onboarding
- Pair with experienced team members for first documentation changes
- Review documentation contributions during probation

### Continuous Learning
- Regular documentation workshops
- Share best practices in team meetings
- Document and share lessons learned

## Compliance and Enforcement

### Documentation Reviews
- Include documentation in code reviews
- Reject PRs that don't meet standards
- Document exceptions when necessary

### Metrics and Reporting
- Track documentation health metrics
- Report on documentation coverage
- Identify areas needing improvement

## Version History

| Version | Date       | Description                          | Author           |
|---------|------------|--------------------------------------|------------------|
| 1.0.0   | 2025-06-11 | Initial version                       | DDD Team         |

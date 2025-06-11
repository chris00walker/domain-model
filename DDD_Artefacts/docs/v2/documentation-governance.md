# Documentation Governance

## Purpose
This document establishes the governance process for maintaining documentation consistency and preventing multiple sources of truth within the Elias Food Imports domain model documentation. For style and formatting guidelines, please refer to the [Style Guide](./STYLE_GUIDE.md).

## Core Principles

1. **Single Source of Truth**
   - Each concept has exactly one authoritative source of documentation
   - All other references must link to, not duplicate, this source
   - Cross-reference related content using relative links

2. **Version Control**
   - All documentation must be version controlled in the main repository
   - Version numbers follow semantic versioning (MAJOR.MINOR.PATCH)
   - Update version numbers when making significant changes
   - Use meaningful commit messages that reference issue numbers when applicable

3. **Ownership**
   - Each document must have a clear owner (individual or team)
   - Owners are responsible for:
     - Maintaining document accuracy and consistency
     - Reviewing and approving changes
     - Ensuring proper versioning and status updates
     - Archiving or deprecating obsolete content

## Documentation Lifecycle

### Document Status

Each document progresses through these stages:

1. **Draft**: Initial version, not yet ready for review
2. **Review**: Ready for team feedback and approval
3. **Final**: Approved and published
4. **Deprecated**: No longer current but kept for reference

### Versioning

- **MAJOR** version: Breaking changes or major restructuring
- **MINOR** version: New content or significant updates
- **PATCH** version: Minor corrections or formatting changes

Example: `version: "2.1.0"` indicates a minor update to version 2.0.0

## Change Management

### Proposing Changes
1. Create a new branch following the naming convention: `docs/description-of-change`
2. Make your changes following the [Style Guide](./STYLE_GUIDE.md)
3. Update the version number and status in the frontmatter
4. Update the `last_updated` field to today's date

### Review Process
1. Create a pull request with a clear description of changes
2. Request review from:
   - The document owner
   - At least one domain expert for technical accuracy
   - A documentation specialist for clarity and completeness
3. Address all review comments
4. Update documentation status based on review feedback

### Approval and Merge
1. Obtain at least one approval from a senior team member
2. Ensure all automated checks pass (linting, link checking)
3. Use squash and merge to keep history clean
4. Delete the feature branch after successful merge
5. Update any related documentation that references the changed content

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

## Quality Assurance

### Automated Checks

#### Linting
- Markdown syntax validation
- Style guide compliance
- Frontmatter validation
- Broken link detection

#### Link Checking
- Automated validation of internal and external links
- Scheduled weekly runs with reporting
- Integration with CI/CD pipeline

### Manual Review Checklist
- [ ] Content is accurate and up-to-date
- [ ] Follows the style guide
- [ ] All links work correctly
- [ ] Version and status are updated
- [ ] Cross-references are valid
- [ ] No sensitive information is included

## Training and Onboarding

### New Team Members
1. Complete documentation standards training
2. Review the [Style Guide](./STYLE_GUIDE.md) and this governance document
3. Make initial documentation updates under supervision
4. Receive feedback on first contributions

### Continuous Learning
- Monthly documentation office hours
- Quarterly workshops on documentation best practices
- Annual documentation health audit and retrospective
- Recognition program for excellent documentation contributions

## Compliance and Metrics

### Review Process
- Documentation is a required part of all code reviews
- PRs with documentation issues must be addressed before merging
- Exceptions require team lead approval and documentation

### Metrics Dashboard
Track and report on:
- Documentation coverage by module
- Average time to review documentation changes
- Number of documentation-related issues
- Documentation health score (automated checks)
- Reader feedback and satisfaction

### Continuous Improvement
- Quarterly review of documentation metrics
- Action items for addressing gaps
- Updates to processes based on feedback and metrics

## Version History

| Version | Date       | Description                          | Author           |
|---------|------------|--------------------------------------|------------------|
| 1.1.0   | 2025-06-11 | Consolidated with style guide        | DDD Team         |
| 1.0.0   | 2025-06-11 | Initial version                      | DDD Team         |

## Related Documents

- [Style Guide](./STYLE_GUILD.md)
- [Ubiquitous Language Framework](./ubiquitous-language/README.md)
- [Documentation Templates](./templates/README.md)

# Documentation Style Guide

This style guide ensures consistency across all documentation for the Elias Food Imports domain model.

## General Principles

1. **Use the Ubiquitous Language**: Always use terms consistently with the [Ubiquitous Language Framework](./ubiquitous-language/README.md).
2. **Be Precise**: Documentation should be clear, concise, and unambiguous.
3. **Provide Examples**: Include practical examples, especially for complex concepts.
4. **Maintain Structure**: Follow the established document structure for each type of document.

## Formatting

### Markdown Rules

- Use ATX-style headings (`#` for title, `##` for sections)
- Use code blocks for code examples (with language specifier)
- Use tables for tabular data
- Use lists for sequential or unordered items

### Front Matter

All documents should include front matter:

```yaml
---
title: Document Title
status: draft|review|approved
owner: @github-username
reviewers: @reviewer1, @reviewer2
last_updated: YYYY-MM-DD
---
```

## Document Types

### Domain Knowledge Documents

Structure for domain knowledge documents:
1. Domain Overview
2. Strategic Importance
3. Core Concepts
4. Business Rules
5. Domain Events
6. Aggregates, Entities, Value Objects
7. Domain Services
8. Integration Points
9. Implementation Recommendations

### Architecture Decision Records (ADRs)

Structure for ADRs:
1. Title
2. Status
3. Context
4. Decision
5. Consequences
6. References

### Implementation Documentation

Structure for implementation documents:
1. Executive Summary
2. Current Status
3. Technical Details
4. Next Steps

## Gap-Implementation Markers & Stubs

To support our incremental stub-and-marker workflow, documentation may include HTML comments of the form:

```html
<!-- GAP_IMPLEMENTED: <Gap Title> | <Severity> | <Business Impact> | <Implementation Complexity> -->
<!-- TODO: stub for "<Gap Title>" gap in the <Context Name> context -->
```

Lint rules must ignore these comments (e.g., disable or whitelist under markdownlint).

Formatters should preserve them verbatim.

When filling in stubs, remove only the TODO comment; retain the GAP_IMPLEMENTED marker.

### Example

```markdown
## Batch and Expiration Tracking
<!-- GAP_IMPLEMENTED: Batch and Expiration Tracking | High | High | Medium -->
<!-- TODO: stub for "Batch and Expiration Tracking" gap in the Inventory & Warehouse context -->
```

That way, any automated checks or formatters know to leave your markers and stubs intact.

## Conventions

### Links

- Use relative links within the documentation
- Use descriptive link text (not "click here")
- Link to other relevant documents when referencing them

### Code Examples

```typescript
// Good: Include type annotations
function calculateTotal(items: OrderItem[]): Money {
  return items.reduce(
    (total, item) => total.add(item.price.multiply(item.quantity)),
    Money.zero('USD')
  );
}
```

### Diagrams

- Use Mermaid for diagrams when possible
- Include descriptive captions
- Keep diagrams simple and focused

## Review Process

1. Self-review against this style guide
2. Technical review by team member
3. Domain expert review for terminology
4. Final approval by documentation owner

## Tools

1. **Markdown Linting**: Use markdownlint for style checking
2. **Link Checking**: Use markdown-link-check for link validation
3. **Spell Checking**: Use cspell for spell checking

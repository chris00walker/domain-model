# Documentation Style Guide

This style guide ensures consistency across all documentation for the Elias Food Imports domain model. For documentation processes, reviews, and governance, see the [Documentation Governance](./documentation-governance.md) guide.

## General Writing Principles

1. **Use the Ubiquitous Language**: Always use terms consistently with the [Ubiquitous Language Framework](./ubiquitous-language/README.md).
2. **Be Precise**: Documentation should be clear, concise, and unambiguous.
3. **Provide Examples**: Include practical examples, especially for complex concepts.
4. **Maintain Structure**: Follow the established document structure for each type of document.

## Naming Conventions

### File and Directory Naming

#### Files
- Use `kebab-case` for all file names
  - Example: `user-service.ts`, `order-controller.ts`, `payment-processor.js`
- For React/Vue components, use `PascalCase` to match component naming
  - Example: `UserProfile.tsx`, `ProductCard.vue`
- Use consistent file extensions (.js, .ts, .jsx, .tsx, etc.)

#### Directories
- Use `kebab-case` for all directory names to maintain consistency with file naming
  - Example: `user-management/`, `order-processing/`, `api-clients/`
- For feature directories, use singular form when it represents a single concept
  - Example: `user/` (not `users/`) for user-related features
- For utility/helper directories, use plural form
  - Example: `utils/`, `helpers/`, `services/`

### Code Elements

#### TypeScript/JavaScript
- `PascalCase` for:
  - Class names: `class UserService { ... }`
  - Interface names: `interface UserProfile { ... }`
  - Type aliases: `type UserRole = 'admin' | 'user'`
  - React components: `function UserProfile() { ... }`
  - Enum names: `enum OrderStatus { ... }`

- `camelCase` for:
  - Variables: `const userService = new UserService()`
  - Functions: `function calculateTotal() { ... }`
  - Methods: `user.getName()`
  - Object properties: `{ firstName: 'John', lastName: 'Doe' }`
  - Parameters: `function createUser(userData) { ... }`

- `UPPER_SNAKE_CASE` for:
  - Constants: `const MAX_RETRY_COUNT = 3`
  - Environment variables: `API_BASE_URL`
  - Global configuration values

#### Other Conventions
- Prefix interfaces with `I` when needed for clarity: `IUserRepository`
- Use descriptive names that indicate purpose or type
- Avoid abbreviations unless they are widely understood
- Be consistent within each context

## Formatting Guidelines

### Markdown Formatting

#### Headings
- Use ATX-style headings with `#` for title, `##` for main sections, `###` for subsections, etc.
- Include exactly one space between `#` and the heading text
- Use sentence case for headings (capitalize only the first word and proper nouns)

#### Text Formatting
- Use **bold** for UI elements, buttons, and important concepts on first mention
- Use *italics* for emphasis or to introduce new terms
- Use `backticks` for code, commands, file names, and technical terms
- Use ~~strikethrough~~ for deprecated or removed features

#### Lists
- Use hyphens (`-`) for unordered lists
- Use numbers with periods (`1.`) for ordered lists
- Indent nested lists with 2 spaces
- Include a blank line before and after lists

#### Code Blocks

Use fenced code blocks with language specification:

```typescript
// Example TypeScript code
interface User {
  id: string;
  name: string;
  email: string;
}
```

#### Tables

Use tables for tabular data with aligned columns:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `name` | string | Yes | User's full name |
| `email` | string | No | Contact email |

#### Links
- Use descriptive link text that makes sense out of context
- Place the link reference at the end of the document if using reference-style links
- Use relative paths for internal links

### Document Structure

#### Front Matter

All documents should include the following front matter:

```yaml
---
title: "Document Title"
version: "1.0.0"
last_updated: "YYYY-MM-DD"
status: "Draft | Review | Final | Deprecated"
owner: "Team or Individual Name"
reviewers: "@reviewer1, @reviewer2"
---
```

#### Standard Sections

1. **Introduction**: Brief overview and purpose
2. **Overview**: High-level description
3. **Details**: In-depth information
4. **Examples**: Practical usage examples
5. **Related**: Links to related documentation

## Document Types and Templates

### Domain Knowledge Documents

```markdown
# [Domain Name] Domain

## Overview
Brief description of the domain and its purpose.

## Core Concepts
- Key concept 1
- Key concept 2
- Key concept 3

## Business Rules
1. Rule 1
2. Rule 2
3. Rule 3

## Related Documents
- [Related Doc 1](./path/to/doc1.md)
- [Related Doc 2](./path/to/doc2.md)
```

### Architecture Decision Records (ADRs)

```markdown
# [Short title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?
```

For documentation processes, review workflows, and governance, please refer to the [Documentation Governance](./documentation-governance.md) guide.

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

## Related Documents

- [Coding Standards](../.windsurf/rules/technical/coding-standards.md) - Detailed technical coding conventions and best practices

## Review Process

1. Self-review against this style guide
2. Technical review by team member
3. Domain expert review for terminology
4. Final approval by documentation owner

## Tools

1. **Markdown Linting**: Use markdownlint for style checking
2. **Link Checking**: Use markdown-link-check for link validation
3. **Spell Checking**: Use cspell for spell checking

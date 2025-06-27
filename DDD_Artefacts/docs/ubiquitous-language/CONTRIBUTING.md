---
title: "Contributing to the Ubiquitous Language Framework"
version: "1.0"
last_updated: "2025-06-18"
status: "Draft"
---

# Contribution Guidelines

Thank you for improving the Ubiquitous Language Consistency Framework!  Follow the steps below to ensure a smooth contribution process.

## 1. Before You Start

1. **Read the [Ubiquitous Language Guidelines](./guides/ubiquitous_language_guidelines.md)** to understand the tone and standards.
2. **Search the [Domain Glossary](./glossary.md)** to avoid introducing duplicate or conflicting terminology.
3. **Check open issues / pull-requests** to ensure your idea hasn’t already been proposed.

## 2. Proposing a New Term or Change

1. Open an issue titled `UL-Proposal: <Your Term>`.
2. Use the template:
   ```
   **Definition**: <concise definition>
   **Bounded Context**: <where it belongs>
   **Rationale**: <why it matters>
   **References**: <links to specs, requirements, etc.>
   ```
3. Tag at least one domain expert and the DDD Implementation Team.
4. The team will assign the proposal to a review meeting.

## 3. Updating Documentation

1. Fork & branch from `main` (branch name `ul/<topic>`).
2. Make edits **and** update links/back-links:
   * Add a ⚑ **Related** block if the document references other guides.
   * Add the footer `↩ [Back to Framework TOC](../README.md)` to the bottom of any new or updated guide.
3. Run markdown lint (e.g., `npm run lint:md`).
4. Open a pull-request; reference the issue ID.

## 4. Evolution Process

Major changes must follow the [Ubiquitous Language Evolution Process](./guides/ubiquitous_language_evolution.md).  The DDD Implementation Team coordinates quarterly reviews for sweeping terminology updates.

## 5. Code of Conduct

Be respectful, empathetic, and constructive.  We model our conduct on the CNCF code-of-conduct.

---

↩ [Back to Framework TOC](./README.md)

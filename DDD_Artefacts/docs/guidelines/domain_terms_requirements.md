# Domain Terms and Requirements

## Status

Draft (2025-07-04)

## Overview

This document defines the standardized domain terminology and requirements for the Elias Food Imports system. It serves as the single source of truth for domain-specific language used across the organization.

## Core Domain Concepts

### 1. Product Domain

#### Key Terms

- **Product**: A food item available for import/sale
- **SKU (Stock Keeping Unit)**: Unique identifier for product variations
- **Batch/Lot**: A specific production run of a product
- **Shelf Life**: Duration a product remains suitable for sale
- **Origin**: Geographic source of a product
- **Certification**: Official recognition of product attributes (organic, fair trade, etc.)

### 2. Order Management

#### Key Terms

- **Order**: Customer request for products
- **Order Line**: Individual product entry within an order
- **Backorder**: Unfulfilled portion of an order
- **Fulfillment**: Process of preparing and shipping orders
- **Shipment**: Physical package containing ordered items

### 3. Inventory

#### Key Terms

- **Stock**: Physical quantity of products on hand
- **Allocation**: Reservation of inventory for specific orders
- **Replenishment**: Process of restocking inventory
- **Stockout**: Condition where inventory is depleted
- **Safety Stock**: Buffer inventory to prevent stockouts

## Naming Conventions

### General Rules

- Use American English spelling
- Prefer simple, clear terms over jargon
- Maintain consistent terminology across all contexts
- Document all abbreviations and acronyms

### Formatting

- **Bold** for defined terms on first use
- *Italics* for related terms
- `Code font` for technical names and identifiers

## Term Lifecycle

### 1. Proposal

- New terms must be proposed via pull request
- Include definition, context, and rationale
- Tag relevant domain experts for review

### 2. Review

- Domain experts review proposed terms
- Ensure consistency with existing terminology
- Resolve conflicts with similar terms

### 3. Approval

- Terms approved by domain owner
- Added to this document
- Versioned with date of approval

### 4. Deprecation

- Mark deprecated terms as such
- Provide migration guidance
- Maintain for historical reference

## Common Pitfalls

### 1. Ambiguous Terms

- **Avoid**: Terms with multiple meanings
- **Example**: "Order" (purchase order vs. sequence)
- **Solution**: Use more specific terms (e.g., "PurchaseOrder")

### 2. Technical vs. Business Terms

- **Avoid**: Using technical terms in business contexts
- **Example**: "DB record" vs. "customer information"
- **Solution**: Use business-oriented language in requirements

### 3. Synonyms

- **Avoid**: Multiple terms for the same concept
- **Example**: "Client" vs. "Customer"
- **Solution**: Standardize on one term

## Related Documents

- [Ubiquitous Language Guidelines](./ubiquitous_language_guidelines.md)
- [Glossary](../glossary.md)
- [API Design Guidelines](../../guidelines/api-design-guidelines.md)

## Changelog

- 2025-07-04: Initial version

---

*This document is part of the Elias Food Imports Ubiquitous Language Framework.*

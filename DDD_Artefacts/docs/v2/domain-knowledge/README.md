---
title: Domain Knowledge Repository
status: approved
owner: @domain-team
reviewers: @architecture-team, @domain-experts
last_updated: 2025-06-10
---

<!-- GAP_IMPLEMENTED: Domain Knowledge Structure | Low | Medium | Low -->

# Domain Knowledge Repository

This repository contains comprehensive documentation for each bounded context in the Elias Food Imports domain model.

## Core Contexts

- [Catalog](./core-contexts/catalog/README.md)
- [Catalog Authentication](./core-contexts/catalog-auth/README.md)
- [Customer](./core-contexts/customer/README.md)
- [Inventory](./core-contexts/inventory/README.md)
- [Marketing](./core-contexts/marketing/README.md)
- [Ordering](./core-contexts/ordering/README.md)
- [Payment](./core-contexts/payment/README.md)
- [Pricing](./core-contexts/pricing/README.md)
- [Shipping](./core-contexts/shipping/README.md)
- [Subscription](./core-contexts/subscription/README.md)

## Cross-Cutting Concerns

- [Domain Events](./integrations/events.md)
- [Integration Patterns](./integrations/patterns.md)
- [Bounded Context Map](./integrations/context-map.md)

## Document Structure

Each bounded context document follows a consistent structure:

1. Domain Overview
2. Strategic Importance
3. Core Concepts
4. Business Rules
5. Domain Events
6. Aggregates, Entities, Value Objects
7. Domain Services
8. Integration Points
9. Implementation Recommendations

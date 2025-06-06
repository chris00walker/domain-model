---
title: Bounded Context Map
status: active
owner: Domain Architecture Team
last_updated: 2025-06-06
---

# Elias Food Imports Bounded Context Map

This document provides a comprehensive visualization and description of the bounded contexts within the Elias Food Imports domain model and defines the relationships between them.

## Bounded Context Diagram

```mermaid
graph TB
    subgraph "Core Domains"
        CA[Catalog<br/>Authentication]:::core
        PR[Pricing]:::core
        SU[Subscription]:::core
        OR[Order]:::core
    end
    
    subgraph "Supporting Domains"
        CA[Catalog<br/>Authentication]:::core --> CT[Catalog]:::supporting
        PR --> CT
        SU --> CT
        CT <--> IN[Inventory]:::supporting
        OR --> CT
        OR --> CU[Customer]:::supporting
        OR --> SH[Shipping]:::supporting
        OR --> PAY[Payment]:::supporting
        SU --> CU
        SU --> PAY
    end
    
    subgraph "Generic Domains"
        MK[Marketing]:::generic
        NT[Notification]:::generic
        AN[Analytics]:::generic
        RV[Review]:::generic
    end
    
    %% Relationships
    CA -- Authenticates --> CT
    PR -- Prices for --> CT
    PR -- Price Rules for --> CU
    SU -- Subscribes to --> CT
    SU -- For --> CU
    SU -- Processes --> PAY
    OR -- Contains --> CT
    OR -- For --> CU
    OR -- Delivered via --> SH
    OR -- Processes --> PAY
    IN -- Manages --> CT
    MK -- Promotes --> CT
    MK -- Targets --> CU
    NT -- Notifies --> CU
    NT -- About --> OR
    NT -- About --> SH
    NT -- About --> SU
    AN -- Analyzes --> OR
    AN -- Analyzes --> CU
    AN -- Analyzes --> CT
    RV -- Reviews --> CT
    RV -- By --> CU
    
    %% Style definitions
    classDef core fill:#f96,stroke:#333,stroke-width:2px;
    classDef supporting fill:#69f,stroke:#333,stroke-width:1px;
    classDef generic fill:#9c9,stroke:#333,stroke-width:1px;
```

## Context Relationships

### Upstream-Downstream Relationships

| Upstream Context | Downstream Context | Relationship Type | Integration Pattern |
|-----------------|-------------------|-------------------|-------------------|
| Catalog Authentication | Catalog | Customer-Supplier | Synchronous API |
| Pricing | Catalog | Customer-Supplier | Event-Driven |
| Pricing | Order | Customer-Supplier | Synchronous API |
| Subscription | Order | Partnership | Event-Driven |
| Customer | Order | Customer-Supplier | Synchronous API |
| Customer | Subscription | Customer-Supplier | Synchronous API |
| Inventory | Catalog | Customer-Supplier | Event-Driven |
| Inventory | Order | Conformist | Event-Driven |
| Payment | Order | Customer-Supplier | Synchronous API |
| Payment | Subscription | Customer-Supplier | Synchronous API |
| Shipping | Order | Customer-Supplier | Event-Driven |

### Anti-Corruption Layers

The following bounded contexts implement anti-corruption layers to isolate themselves from external systems or legacy domains:

1. **Catalog ↔ External Supplier Systems**: Translates between supplier product data formats and our domain model
2. **Payment ↔ Payment Gateway**: Isolates payment domain from payment provider-specific implementations
3. **Shipping ↔ Fulfillment Partners**: Translates between shipping partners' APIs and our domain model

## Bounded Context Details

### Core Domains

#### Catalog Authentication

**Business Capability**: Ensures product authenticity and provenance tracking.

**Domain Ownership**: Authentication Team

**Strategic Classification**: Core Domain (Differentiator)

**Key Domain Concepts**:
- Authentication Certificate
- Provenance Record
- Authentication Scan
- Product Verification

**Integration Points**:
- Provides authentication status to Catalog context
- Consumes product data from Catalog context
- Publishes authentication events to Analytics context

#### Pricing

**Business Capability**: Dynamic price calculation and optimization

**Domain Ownership**: Pricing Strategy Team

**Strategic Classification**: Core Domain (Differentiator)

**Key Domain Concepts**:
- Price Rules
- Import Cost
- Currency Exchange
- Margin Requirements
- Promotions

**Integration Points**:
- Provides pricing information to Catalog and Order contexts
- Consumes product data from Catalog context
- Consumes customer segment data from Customer context

#### Subscription

**Business Capability**: Recurring product delivery management

**Domain Ownership**: Subscription Team

**Strategic Classification**: Core Domain (Differentiator)

**Key Domain Concepts**:
- Subscription Plan
- Delivery Schedule
- Subscription Items
- Pause/Resume
- Billing Cycle

**Integration Points**:
- Creates orders via Order context
- Uses customer information from Customer context
- Processes payments through Payment context
- Subscribes to products in Catalog context

#### Order

**Business Capability**: Order processing and fulfillment

**Domain Ownership**: Order Processing Team

**Strategic Classification**: Core Domain (Business Essential)

**Key Domain Concepts**:
- Order 
- Order Line Items
- Fulfillment Status
- Shipping Information
- Payment Status

**Integration Points**:
- Gets products from Catalog context
- Gets customer data from Customer context
- Verifies inventory with Inventory context
- Processes payment through Payment context
- Arranges shipping through Shipping context

### Supporting Domains

#### Catalog

**Business Capability**: Product information management

**Domain Ownership**: Product Team

**Strategic Classification**: Supporting Domain

**Key Domain Concepts**:
- Product
- Category
- Product Attributes
- Media Assets
- Product Search

**Integration Points**:
- Provides product information to all contexts
- Receives inventory updates from Inventory context
- Receives authentication status from Authentication context
- Receives pricing information from Pricing context

#### Customer

**Business Capability**: Customer relationship management

**Domain Ownership**: Customer Success Team

**Strategic Classification**: Supporting Domain

**Key Domain Concepts**:
- Customer Profile
- Preferences
- Customer Segment
- Contact Information
- Order History

**Integration Points**:
- Provides customer data to Order and Subscription contexts
- Receives order history from Order context
- Provides customer segments to Marketing and Pricing contexts

#### Inventory

**Business Capability**: Stock management and forecasting

**Domain Ownership**: Warehouse Operations Team

**Strategic Classification**: Supporting Domain

**Key Domain Concepts**:
- Stock Level
- Warehouse Location
- Reorder Point
- Reserved Inventory
- Inventory Adjustment

**Integration Points**:
- Provides inventory levels to Catalog context
- Reserves inventory for Order context
- Publishes inventory events for Analytics context

#### Payment

**Business Capability**: Payment processing and financial transactions

**Domain Ownership**: Finance Team

**Strategic Classification**: Supporting Domain

**Key Domain Concepts**:
- Payment Method
- Transaction
- Invoice
- Refund
- Payment Status

**Integration Points**:
- Processes payments for Order and Subscription contexts
- Publishes payment events for Analytics context
- Connects to external payment gateways

#### Shipping

**Business Capability**: Delivery coordination and tracking

**Domain Ownership**: Logistics Team

**Strategic Classification**: Supporting Domain

**Key Domain Concepts**:
- Shipment
- Tracking Information
- Shipping Method
- Delivery Schedule
- Carrier Information

**Integration Points**:
- Receives shipping requests from Order context
- Sends tracking updates to Notification context
- Connects to external shipping providers

### Generic Domains

#### Marketing

**Business Capability**: Campaign management and customer engagement

**Domain Ownership**: Marketing Team

**Strategic Classification**: Generic Domain

**Integration Points**:
- Uses customer segments from Customer context
- Promotes products from Catalog context
- Publishes promotion events to Pricing context

#### Notification

**Business Capability**: Multi-channel customer communications

**Domain Ownership**: Communications Team

**Strategic Classification**: Generic Domain

**Integration Points**:
- Receives events from Order, Shipping, Subscription contexts
- Uses customer contact info from Customer context

#### Analytics

**Business Capability**: Business intelligence and reporting

**Domain Ownership**: Data Analytics Team

**Strategic Classification**: Generic Domain

**Integration Points**:
- Consumes events from all domains
- Provides reports and dashboards to all teams

#### Review

**Business Capability**: Product review and rating management

**Domain Ownership**: Content Team

**Strategic Classification**: Generic Domain

**Integration Points**:
- Associates reviews with products from Catalog context
- Associates reviews with customers from Customer context
- Provides rating data to Catalog context

## Context Mapping Patterns

### Customer-Supplier Pattern

Used when one team (upstream) provides data or services to another team (downstream) with a commitment to meet the downstream team's needs.

**Examples**:
- **Catalog → Order**: Catalog team provides product information required by the Order team.
- **Customer → Subscription**: Customer team provides customer data needed for subscription management.

### Partnership Pattern

Used when two teams have mutual dependencies and need to plan development together.

**Examples**:
- **Subscription ↔ Order**: Both teams collaborate closely to ensure subscription orders are processed correctly.
- **Pricing ↔ Marketing**: Teams coordinate promotional pricing and campaign management.

### Conformist Pattern

Used when a downstream team must adapt to the model of an upstream team without influence.

**Examples**:
- **Inventory ↔ Order**: Order processing must conform to inventory availability models.
- **Analytics ↔ All Domains**: Analytics conforms to the event structures provided by other domains.

### Anti-corruption Layer Pattern

Used to isolate a domain model from external systems or legacy domains.

**Examples**:
- **Payment → Payment Gateway**: Isolates payment domain from payment provider specifics.
- **Shipping → Fulfillment Partners**: Translates between shipping partner APIs and our domain model.

### Open Host Service Pattern

Used to provide a well-defined interface for integration with multiple other contexts.

**Examples**:
- **Catalog API**: Provides standardized interfaces for accessing product information.
- **Customer API**: Offers standard interfaces for customer data access across contexts.

## Context Boundary Enforcement

To maintain clear boundaries between contexts, we enforce:

1. **Separate Codebases**: Each bounded context has its own dedicated codebase repository or module
2. **API Gateways**: External access to context capabilities is handled through well-defined API gateways
3. **Event Contracts**: Domain events use strict contracts for communication between contexts
4. **Context-Specific CI/CD Pipelines**: Separate build and deployment pipelines ensure independent evolution
5. **Team Alignment**: Development teams are aligned with bounded contexts

## Testing Across Context Boundaries

When testing interactions between bounded contexts:

1. **Contract Tests**: Verify that inter-context communications adhere to defined contracts
2. **Integration Tests**: Focus on the boundaries between contexts
3. **Context Map Validation**: Automated tests verify that context mappings remain valid
4. **Cross-Context Scenarios**: End-to-end tests validate complete business scenarios spanning multiple contexts

## Evolving the Context Map

This context map is a living document that evolves as the domain model matures. Changes to the context map follow this process:

1. **Context Boundary Change Proposal**: Submitted when team identifies need for boundary adjustment
2. **Impact Analysis**: Assessment of how changes affect other contexts
3. **Cross-Team Review**: Context owners review and approve changes
4. **Implementation Plan**: Detailed steps for implementing boundary changes
5. **Documentation Update**: This context map and related documentation is updated

## References

- [Domain Knowledge Repository](../README.md)
- [Domain Event Catalog](./events.md)
- [Integration Patterns](./patterns.md)
- [Architecture Decision Records](../../adr/README.md)

---

*This context map serves as the primary reference for understanding the relationships between bounded contexts in our domain model. It guides architectural decisions, team structures, and integration patterns.*

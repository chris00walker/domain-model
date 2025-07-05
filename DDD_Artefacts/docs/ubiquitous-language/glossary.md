# Domain Glossary

This document defines the key terms and concepts used across the Elias Food Imports domain model. Each term is defined with its meaning, context, and relationships to other domain concepts.

## Core Business Domains

### Analytics
**Definition**: The process of analyzing data to gain insights into business performance and customer behavior.
**Status**: Draft
**Owner**: @data-engineering-team
**Reviewers**: @business-analytics, @domain-experts
**Last Updated**: 2025-06-10

### Catalog
**Definition**: The collection of products available for purchase, including their descriptions, pricing, and availability.
**Status**: Draft
**Owner**: @catalog-team
**Reviewers**: @domain-experts, @tech-leads
**Last Updated**: 2025-06-10

### Customer
**Definition**: An individual or organization that purchases goods or services from Elias Food Imports.
**Status**: Draft
**Owner**: @chris00walker
**Reviewers**: @team
**Last Updated**: 2025-06-10

### Inventory
**Definition**: The management of product stock levels, including tracking, replenishment, and allocation.
**Status**: Draft
**Owner**: @inventory-arch-team
**Reviewers**: @janesmith, @johndoe, @alexwong
**Last Updated**: 2025-06-10

### Order
**Definition**: A customer's request to purchase one or more products, including delivery and payment details.
**Status**: Active
**Owner**: @order-management-team
**Last Updated**: 2025-06-06

### Payment
**Definition**: The process of settling financial transactions for purchased goods or services.
**Status**: Draft
**Owner**: @payment-team
**Reviewers**: @reviewer1, @reviewer2
**Last Updated**: 2025-06-10

### Pricing
**Definition**: The strategy and process of setting and managing prices for products and services.
**Status**: Active
**Owner**: @pricing-team
**Last Updated**: 2025-06-06

### Review
**Definition**: Customer feedback and ratings for products and services.
**Status**: Draft
**Owner**: @review-team
**Reviewers**: @reviewer1, @reviewer2
**Last Updated**: 2025-06-10

## Business Model Components

### Channels
**Definition**: The various methods through which Elias Food Imports reaches and interacts with customers, from initial attraction through post-purchase support.
**Goal**: Design and prioritize channels that move each Phase 1 segment through the customer journey (Attraction → Awareness → Consideration → Confidence → Exchange → Post-Exchange) while respecting CAC and margin guardrails.

### Cost Structure
**Definition**: The financial model that outlines all costs involved in operating the business.
**Goal**: Ensure every dollar spent is traceable to a Key Activity, Resource, or Partner while maintaining appropriate gross-margin floors and cash runway.

### Customer Relationships
**Definition**: The strategies and processes for managing interactions with customers throughout their lifecycle.
**Goal**: Guide each priority segment through the relationship stages (Experience → Satisfaction → Significance) to maximize LTV while protecting gross-margin and CAC guardrails.

### Customer Segments
**Definition**: The different groups of customers that Elias Food Imports serves, each with distinct needs and behaviors.
**Goal**: Catalog every current and future customer segment, capturing their top Jobs, Pains, and Gains, and tag each with Phase (1-3) and Priority (Prioritize/Monitor/Park).

### Key Activities
**Definition**: The most important actions a company must take to operate successfully.
**Goal**: Excel at activities that create, deliver, and capture value while enabling customer acquisition, retention, and margin protection.

### Key Partners
**Definition**: External organizations that help the business model work effectively.
**Goal**: Develop an ecosystem that enhances speed, safety, and authenticity across all customer touchpoints.

### Key Resources
**Definition**: The most important assets required to make a business model work.
**Goal**: Secure and manage assets that power Key Activities to deliver on brand promises.

### Revenue & Pricing
**Definition**: The strategy for generating income from customer segments.
**Goal**: Ensure transparent linkage between income, value delivered, costs, and experimental initiatives.

## Technical Components

### Catalog Authentication
**Definition**: The process of verifying the authenticity of products in the catalog.
**Status**: Active
**Owner**: @auth-team
**Reviewers**: @reviewer1, @reviewer2
**Last Updated**: 2025-06-10

### Notification
**Definition**: The system responsible for delivering messages to users and systems.
**Status**: Draft
**Owner**: @elias-food-imports-team
**Reviewers**: @domain-experts, @architecture-team
**Last Updated**: 2025-06-10

### Sales Quoting
**Definition**: The process of creating and managing price quotes for potential sales.
**Status**: Draft
**Owner**: @sales-team
**Reviewers**: @reviewer1, @reviewer2
**Last Updated**: 2025-06-10

### Shipping
**Definition**: The process of delivering products to customers.
**Status**: Draft
**Owner**: @shipping-team
**Reviewers**: @reviewer1, @reviewer2
**Last Updated**: 2025-06-10

### Shopping Cart
**Definition**: The virtual container that holds items a customer intends to purchase.
**Status**: Draft
**Owner**: @domain-architecture-team
**Reviewers**: @product-team
**Last Updated**: 2025-06-10

---
*This glossary is a living document that evolves with our understanding of the domain. Please propose updates through the standard change process.*eam, @tech-lead last_updated: 2025-06-10 ---
- **Subscription**: --- title: [[Subscription](#subscription)](#subscription) Domain Knowledge status: active owner: @subscription-team last_updated: 2025-06-10 reviewers: @domain-experts, @architecture-team ---
- **Value Proposition Analysis**: # [Elias Food Imports (EFI) \- Value Proposition Analysis](https://www.figma.com/file/GLPem1dl33hlzAWhA7LNwW/EFI-Business-Model?type=whiteboard&node-id=0%3A1&t=rzqZYPNmgR2rqWdI-1)
- **value propositions**: # **🎯 Goal:** Articulate EFI’s core value propositions—the pain-relievers and gain-creators that address priority segments’ critical jobs, pains, and gains—so each claim can be traced back to a *Testing Business Ideas* experiment and a block in the master VPA.

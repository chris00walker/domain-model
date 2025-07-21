# Sales Quoting Context Glossary

Generated: 2025-07-21T13:02:05-03:00

## Purpose

This glossary defines terms specific to the Sales Quoting bounded context, focusing on quote generation, pricing negotiations, and B2B sales processes for commercial customers and food service operations.

## Context Overview

- **Business Purpose**: Generate accurate quotes and support B2B sales negotiations
- **Core Responsibility**: Quote creation, pricing calculations, and sales proposal management
- **Key Metrics**: Quote accuracy 98%, Response time <24h, Conversion rate ≥25%
- **Integration Points**: Pricing & Promotions, Customer Management, Product Catalog, Order Management

## Aggregates

### SalesQuote

- **Definition**: Central aggregate representing a formal price quote for potential customer purchase
- **Implementation**: `SalesQuote` class extends AggregateRoot
- **Properties**:
  - **quoteId**: Unique quote identifier
  - **quoteNumber**: Human-readable quote number
  - **customerId**: Reference to requesting customer
  - **salesRepId**: Reference to assigned sales representative
  - **quoteType**: Type of sales quote
  - **requestDate**: When quote was requested
  - **validUntil**: Quote expiration date
  - **lineItems**: Collection of quoted products and services
  - **subtotal**: Total before taxes and discounts
  - **discounts**: Applied discounts and adjustments
  - **taxes**: Tax calculations
  - **totalAmount**: Final quote total
  - **status**: Current quote status
  - **terms**: Payment and delivery terms
  - **notes**: Additional notes and conditions
- **Responsibilities**:
  - Quote calculation and pricing
  - Line item management
  - Discount and tax application
  - Status tracking and lifecycle management
- **Business Rules**:
  - Quotes valid for specified period only
  - Pricing based on current rates and customer tier
  - Discounts require approval for large amounts
  - All quotes tracked for conversion analysis
- **Related Terms**: QuoteId, QuoteType, QuoteLineItem, QuoteStatus

### QuoteLineItem

- **Definition**: Aggregate representing individual product or service line within a sales quote
- **Implementation**: `QuoteLineItem` class extends AggregateRoot
- **Properties**:
  - **lineItemId**: Unique line item identifier
  - **quoteId**: Reference to parent quote
  - **productId**: Reference to quoted product
  - **productName**: Product name and description
  - **quantity**: Requested quantity
  - **unitPrice**: Price per unit
  - **listPrice**: Standard list price
  - **discount**: Applied discount amount or percentage
  - **netPrice**: Final price after discounts
  - **lineTotal**: Total for this line item
  - **deliveryDate**: Expected delivery date
  - **specialRequirements**: Special handling or requirements
  - **availability**: Product availability status
- **Responsibilities**:
  - Individual line pricing calculations
  - Availability verification
  - Special requirement tracking
  - Delivery date coordination
- **Business Rules**:
  - Pricing based on customer tier and volume
  - Availability verified before quote generation
  - Special requirements affect pricing and delivery
  - Delivery dates coordinated with inventory
- **Related Terms**: LineItemId, UnitPrice, NetPrice, ProductAvailability

## Value Objects

### QuoteId

- **Definition**: Unique identifier for sales quotes
- **Implementation**: `QuoteId` value object
- **Format**: UUID-based string identifier
- **Usage**: Internal tracking, customer references, conversion analysis
- **Business Rules**:
  - Globally unique across all quotes
  - Immutable once assigned
  - Used for audit trails and sales tracking
- **Related Terms**: SalesQuote, UniqueEntityID

### QuoteType

- **Definition**: Classification of sales quotes by purpose and customer type
- **Implementation**: `QuoteType` enum
- **Types**:
  - **STANDARD_QUOTE**: Standard product quote for regular customers
  - **VOLUME_QUOTE**: High-volume quote with special pricing
  - **CUSTOM_QUOTE**: Custom product or service quote
  - **TENDER_RESPONSE**: Response to formal tender or RFP
  - **CONTRACT_RENEWAL**: Contract renewal quote
  - **TRIAL_ORDER**: Trial order for new customers
  - **SEASONAL_QUOTE**: Seasonal product quote
  - **EMERGENCY_QUOTE**: Urgent quote for immediate needs
  - **DISTRIBUTOR_QUOTE**: Quote for distributor or reseller
  - **CATERING_QUOTE**: Quote for catering or event services
- **Business Rules**:
  - Each type has specific pricing rules
  - Approval requirements vary by quote type
  - Validity periods differ by type
  - Conversion tracking by quote type
- **Related Terms**: PricingRules, ApprovalRequirements, ValidityPeriod

### QuoteStatus

- **Definition**: Current status of sales quote in the sales process
- **Implementation**: `QuoteStatus` enum
- **Statuses**:
  - **DRAFT**: Quote being prepared, not yet sent
  - **PENDING_APPROVAL**: Awaiting internal approval
  - **SENT**: Quote sent to customer
  - **UNDER_NEGOTIATION**: Customer negotiating terms
  - **REVISED**: Quote revised based on customer feedback
  - **ACCEPTED**: Customer accepted the quote
  - **REJECTED**: Customer rejected the quote
  - **EXPIRED**: Quote expired without acceptance
  - **CONVERTED**: Quote converted to order
  - **CANCELLED**: Quote cancelled before completion
- **State Transitions**:
  - DRAFT → PENDING_APPROVAL (approval required)
  - PENDING_APPROVAL → SENT (approved and sent)
  - SENT → UNDER_NEGOTIATION (customer response)
  - UNDER_NEGOTIATION → REVISED (terms negotiated)
  - SENT/REVISED → ACCEPTED (customer acceptance)
  - ACCEPTED → CONVERTED (order created)
- **Business Rules**:
  - Status changes tracked for sales analytics
  - Expired quotes require renewal for reactivation
  - Converted quotes linked to resulting orders
  - Cancelled quotes retain history for analysis
- **Related Terms**: StatusTransition, QuoteLifecycle, ConversionTracking

### QuoteTerms

- **Definition**: Payment, delivery, and contractual terms for sales quote
- **Implementation**: `QuoteTerms` value object
- **Properties**:
  - **paymentTerms**: Payment terms and conditions
  - **deliveryTerms**: Delivery method and timeline
  - **validityPeriod**: How long quote remains valid
  - **minimumOrder**: Minimum order requirements
  - **shippingTerms**: Shipping and freight terms
  - **warrantyTerms**: Product warranty terms
  - **cancellationPolicy**: Order cancellation policy
  - **specialConditions**: Any special terms or conditions
- **Payment Terms**:
  - **NET_30**: Payment due within 30 days
  - **NET_15**: Payment due within 15 days
  - **COD**: Cash on delivery
  - **PREPAID**: Payment required before shipment
  - **CREDIT_TERMS**: Established credit terms
- **Business Rules**:
  - Terms based on customer credit rating
  - Standard terms for each customer type
  - Special terms require approval
  - Terms clearly communicated to customer
- **Related Terms**: PaymentTerms, DeliveryTerms, CreditRating

### PricingCalculation

- **Definition**: Detailed calculation showing how quote prices were determined
- **Implementation**: `PricingCalculation` value object
- **Properties**:
  - **basePrice**: Starting price before adjustments
  - **volumeDiscount**: Discount for volume purchases
  - **customerDiscount**: Customer-specific discount
  - **promotionalDiscount**: Promotional discount applied
  - **netPrice**: Final price after all adjustments
  - **marginPercentage**: Gross margin percentage
  - **calculationDate**: When pricing was calculated
  - **pricingRules**: Rules used in calculation
- **Business Rules**:
  - All discounts must be justified and approved
  - Margin percentages must meet minimum requirements
  - Pricing calculations documented for audit
  - Rules applied consistently across quotes
- **Related Terms**: VolumeDiscount, CustomerDiscount, GrossMargin

## Domain Services

### QuoteGenerationService

- **Definition**: Service managing quote creation and pricing calculations
- **Implementation**: `QuoteGenerationService` domain service
- **Responsibilities**:
  - Quote template management
  - Pricing calculation coordination
  - Product availability verification
  - Quote formatting and presentation
- **Generation Rules**:
  - Pricing based on current rates and customer tier
  - Availability verified for all quoted products
  - Discounts applied according to approval rules
  - Quote format standardized for consistency
- **Related Terms**: QuoteTemplate, PricingCalculation, ProductAvailability

### NegotiationManagementService

- **Definition**: Service managing quote negotiations and revisions
- **Implementation**: `NegotiationManagementService` domain service
- **Responsibilities**:
  - Negotiation tracking and history
  - Quote revision management
  - Approval workflow coordination
  - Customer communication tracking
- **Negotiation Rules**:
  - All negotiations documented and tracked
  - Revisions require appropriate approvals
  - Customer communications logged
  - Final terms clearly documented
- **Related Terms**: NegotiationHistory, QuoteRevision, ApprovalWorkflow

### ConversionTrackingService

- **Definition**: Service tracking quote conversion to orders and sales performance
- **Implementation**: `ConversionTrackingService` domain service
- **Responsibilities**:
  - Conversion rate calculation
  - Sales performance analysis
  - Quote effectiveness measurement
  - Pipeline management support
- **Tracking Rules**:
  - All quote outcomes tracked
  - Conversion rates calculated by type and period
  - Performance metrics updated regularly
  - Pipeline data maintained for forecasting
- **Related Terms**: ConversionRate, SalesPerformance, PipelineManagement

## Domain Events

### QuoteGenerated

- **Definition**: Published when new sales quote is generated
- **Implementation**: `QuoteGenerated` extends DomainEvent
- **Payload**: Quote ID, customer ID, sales rep ID, total amount, validity period, timestamp
- **Consumers**: Sales Management, Customer Management, Analytics, CRM
- **Business Impact**: Sales tracking, customer engagement, pipeline management

### QuoteSent

- **Definition**: Published when quote is sent to customer
- **Implementation**: `QuoteSent` extends DomainEvent
- **Payload**: Quote ID, customer ID, delivery method, sent date, timestamp
- **Consumers**: Customer Management, Sales Tracking, Analytics, Follow-up Systems
- **Business Impact**: Customer communication tracking, follow-up scheduling

### QuoteAccepted

- **Definition**: Published when customer accepts sales quote
- **Implementation**: `QuoteAccepted` extends DomainEvent
- **Payload**: Quote ID, customer ID, acceptance date, total amount, timestamp
- **Consumers**: Order Management, Sales Management, Analytics, Finance
- **Business Impact**: Order creation, sales commission, revenue recognition

### QuoteExpired

- **Definition**: Published when sales quote expires without acceptance
- **Implementation**: `QuoteExpired` extends DomainEvent
- **Payload**: Quote ID, customer ID, expiration date, total amount, timestamp
- **Consumers**: Sales Management, Customer Management, Analytics, Follow-up Systems
- **Business Impact**: Follow-up actions, pipeline cleanup, conversion analysis

## Repository Interfaces

### ISalesQuoteRepository

- **Definition**: Persistence contract for sales quote aggregates
- **Implementation**: `ISalesQuoteRepository` interface
- **Standard Operations**:
  - `findById(id: QuoteId): Promise<SalesQuote | null>`
  - `save(quote: SalesQuote): Promise<void>`
  - `findByCustomerId(customerId: CustomerId): Promise<SalesQuote[]>`
- **Specialized Queries**:
  - `findByStatus(status: QuoteStatus): Promise<SalesQuote[]>`
  - `findBySalesRep(salesRepId: string): Promise<SalesQuote[]>`
  - `findExpiringQuotes(days: number): Promise<SalesQuote[]>`
  - `findByDateRange(start: Date, end: Date): Promise<SalesQuote[]>`
- **Business Rules**: All operations return Result pattern for error handling

### IQuoteLineItemRepository

- **Definition**: Persistence contract for quote line item aggregates
- **Implementation**: `IQuoteLineItemRepository` interface
- **Standard Operations**:
  - `findById(id: LineItemId): Promise<QuoteLineItem | null>`
  - `save(lineItem: QuoteLineItem): Promise<void>`
  - `findByQuoteId(quoteId: QuoteId): Promise<QuoteLineItem[]>`
- **Specialized Queries**:
  - `findByProductId(productId: ProductId): Promise<QuoteLineItem[]>`
  - `findByDeliveryDate(date: Date): Promise<QuoteLineItem[]>`
  - `findHighValueItems(minValue: number): Promise<QuoteLineItem[]>`
  - `findSpecialRequirements(): Promise<QuoteLineItem[]>`
- **Business Rules**: Line items linked to parent quotes

## Business Rules & Constraints

### Quote Generation Rules

1. **Pricing Accuracy**: All quotes based on current pricing and customer tiers
2. **Product Availability**: Product availability verified before quote generation
3. **Approval Requirements**: Large discounts require management approval
4. **Validity Periods**: All quotes have clearly defined validity periods
5. **Documentation**: Complete quote documentation for audit and reference

### Negotiation Management Rules

1. **Negotiation Tracking**: All negotiations documented and tracked
2. **Revision Control**: Quote revisions properly versioned and approved
3. **Communication Logging**: Customer communications logged and tracked
4. **Approval Workflows**: Appropriate approvals for negotiated terms
5. **Final Terms**: Final agreed terms clearly documented

### Conversion Tracking Rules

1. **Outcome Tracking**: All quote outcomes tracked for analysis
2. **Conversion Metrics**: Conversion rates calculated and monitored
3. **Performance Analysis**: Sales performance analyzed by rep and period
4. **Pipeline Management**: Quote pipeline maintained for forecasting
5. **Follow-up Actions**: Systematic follow-up on pending quotes

## Integration Patterns

### Inbound Events (Consumed)

- **CustomerRegistered** (Customer Management) → Enable quote generation
- **ProductPriceUpdated** (Pricing & Promotions) → Update quote pricing
- **InventoryLevelChanged** (Inventory Management) → Update availability
- **CustomerTierChanged** (Customer Management) → Update pricing tier

### Outbound Events (Published)

- **QuoteGenerated** → Sales Management for tracking
- **QuoteAccepted** → Order Management for order creation
- **QuoteExpired** → Sales Management for follow-up
- **QuoteSent** → Customer Management for communication tracking

### Service Dependencies

- **Pricing Service**: Current pricing and discount calculations
- **Inventory Service**: Product availability verification
- **Customer Service**: Customer information and credit terms
- **Product Service**: Product details and specifications
- **Communication Service**: Quote delivery and tracking

## Anti-Corruption Patterns

### CRM Integration

- **CRM Quote Data** → Internal sales quote format
- **Customer Record** → Internal customer information
- **Sales Pipeline Data** → Internal quote tracking

### ERP Integration

- **ERP Pricing Data** → Internal pricing calculation
- **Product Master Data** → Internal product information
- **Customer Master Data** → Internal customer profile

## Context Boundaries

### What's Inside This Context

- Sales quote generation and management
- Quote pricing calculations and negotiations
- Quote lifecycle tracking and conversion
- Sales performance measurement
- Customer quote history and analysis

### What's Outside This Context

- Customer relationship management
- Product catalog management
- Inventory stock management
- Order processing and fulfillment
- Financial accounting and invoicing

### Integration Points

- **Pricing & Promotions**: Current pricing and discount rules
- **Customer Management**: Customer information and credit terms
- **Product Catalog**: Product details and availability
- **Order Management**: Quote conversion to orders
- **Sales Management**: Sales performance and pipeline tracking

This glossary ensures consistent terminology within the Sales Quoting context while maintaining clear boundaries and integration patterns with other bounded contexts.

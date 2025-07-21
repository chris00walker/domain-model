# Core Domain Glossary

Generated: 2025-07-21T12:19:38-03:00

## Purpose

This glossary defines terms that are shared across multiple bounded contexts and represent core business concepts for Elias Food Imports. These terms form the **Shared Kernel** of our domain language.

## Shared Kernel Terms

### Business Entities

### Customer

- **Definition**: A person or organization that purchases or uses EFI products/services

- **Context**: Used across Sales, Billing, Support, and Subscription contexts

- **Implementation**: `Customer` abstract aggregate root

- **Related Terms**: CustomerAccount, CustomerType, CustomerSegment

- **Business Rules**: Must have valid contact information and customer type classification

### Order

- **Definition**: A request for products or services from a customer, including payment and fulfillment details

- **Context**: Core to Order Management, integrates with Payment, Billing, and Fulfillment

- **Implementation**: `Order` aggregate root

- **Related Terms**: OrderLineItem, OrderStatus, OrderPayment, OrderFulfillment

- **Business Rules**: Must have at least one line item, valid customer, and payment method

### Product

- **Definition**: A food item or service offering available for purchase through EFI

- **Context**: Product Catalog, Order Management, Inventory, Pricing

- **Implementation**: `Product` aggregate root (referenced)

- **Related Terms**: ProductCategory, ProductBundle, ProductId

- **Business Rules**: Must have valid pricing, inventory tracking, and quality certifications

### Payment

- **Definition**: A financial transaction for goods or services, including method and status

- **Context**: Payment & Billing, Order Management, Subscription Management

- **Implementation**: `Payment` aggregate root

- **Related Terms**: PaymentMethod, PaymentStatus, PaymentId

- **Business Rules**: Must be associated with an order or subscription, have valid payment method

### Invoice

- **Definition**: A billing document detailing charges for products or services

- **Context**: Billing & Invoicing, Subscription Management, Customer Management

- **Implementation**: `InvoiceAggregate`

- **Related Terms**: InvoiceStatus, InvoiceItem, RenewalInvoice

- **Business Rules**: Must have valid customer, line items, and payment terms

### Core Value Objects

### Money

- **Definition**: Represents monetary amounts with currency (BBD - Barbados Dollar)

- **Context**: Used across all financial contexts

- **Implementation**: `Money` value object with amount and currency

- **Related Terms**: Price, Cost, Revenue, Discount

- **Business Rules**: Amount must be non-negative, currency must be valid ISO code

### CustomerId

- **Definition**: Unique identifier for customers across all contexts

- **Context**: Customer Management, Order Management, Billing, Subscriptions

- **Implementation**: `CustomerId` value object

- **Related Terms**: Customer, CustomerAccount

- **Business Rules**: Must be globally unique, immutable once assigned

### Address

- **Definition**: Physical location information for shipping, billing, or business operations

- **Context**: Customer Management, Order Management, Shipping & Fulfillment

- **Implementation**: `Address` value object

- **Related Terms**: ShippingAddress, BillingAddress, BusinessAddress

- **Business Rules**: Must include required fields for delivery region

### UniqueEntityID

- **Definition**: Universal unique identifier for all domain entities

- **Context**: Shared across ALL bounded contexts

- **Implementation**: `UniqueEntityID` value object

- **Related Terms**: All entity identifiers

- **Business Rules**: Must be globally unique, immutable, URL-safe

### Core Enumerations

### CustomerType

- **Definition**: Classification of customers by business segment and characteristics

- **Context**: Customer Management, Pricing & Promotions, Marketing

- **Implementation**: `CustomerType` enum

- **Values**:

  - **B2C**: DiasporaCommunity, Tourist, Expat, IndigenousFoodie

  - **B2B**: FoodTruck, PrivateChef, SpecialtyMarket, LimitedServiceRestaurant, FullServiceRestaurant, HotelRestaurant

  - **Future**: Importer, RegionalSupermarket, CruiseLineProvisioner, InternationalRetailer

- **Business Rules**: Determines pricing tier, available products, and service levels

### Domain Events (Cross-Context)

### CustomerUpdated

- **Definition**: Published when customer profile information changes

- **Context**: Customer Management → Order Management, Subscription Management, Marketing

- **Implementation**: `CustomerUpdated` domain event

- **Payload**: Customer ID, changed fields, timestamp

- **Business Impact**: Triggers profile synchronization across contexts

### PaymentCaptured

- **Definition**: Published when a payment is successfully processed

- **Context**: Payment & Billing → Order Management, Subscription Management

- **Implementation**: `PaymentCaptured` domain event

- **Payload**: Payment ID, amount, order/subscription ID

- **Business Impact**: Triggers order fulfillment or subscription activation

### OrderCreated

- **Definition**: Published when a new order is placed by a customer

- **Context**: Order Management → Inventory, Fulfillment, Billing, Analytics

- **Implementation**: `OrderCreated` domain event

- **Payload**: Order ID, customer ID, line items, total amount

- **Business Impact**: Triggers inventory reservation and fulfillment process

### Business Processes (Cross-Context)

### Order-to-Cash Process

- **Definition**: Complete customer journey from order placement to payment collection

- **Contexts Involved**: Order Management, Payment & Billing, Fulfillment, Customer Management

- **Key Events**: OrderCreated → PaymentCaptured → OrderFulfilled → InvoicePaid

- **Business Rules**: Must maintain data consistency across all contexts

### Subscription Lifecycle

- **Definition**: Complete subscription journey from sign-up to cancellation

- **Contexts Involved**: Subscription Management, Customer Management, Payment & Billing

- **Key Events**: SubscriptionCreated → SubscriptionRenewed → SubscriptionCancelled

- **Business Rules**: Must enforce billing cycles and benefit allocation

### Quality & Compliance

### Result Pattern

- **Definition**: Standardized error handling approach across all contexts

- **Context**: Shared across ALL bounded contexts

- **Implementation**: `Result<T, E>` generic type

- **Usage**: All domain operations return Result instead of throwing exceptions

- **Business Rules**: Explicit error handling, no hidden failures

### Clock Abstraction

- **Definition**: Testable time operations for all temporal business logic

- **Context**: Shared across ALL bounded contexts

- **Implementation**: `Clock` interface with `SystemClock` and `TestClock`

- **Usage**: All date/time operations use Clock instead of direct system calls

- **Business Rules**: Enables deterministic testing of time-dependent logic

## Cross-Context Mapping Rules

### Customer Context → Other Contexts

- **Customer** maps to **CustomerId** in Order, Billing, Subscription contexts

- **CustomerType** determines pricing rules in Pricing & Promotions context

- **CustomerUpdated** events synchronize profile changes across all contexts

### Order Context → Other Contexts

- **Order** triggers **Payment** processing in Payment & Billing context

- **OrderCreated** reserves inventory in Inventory Management context

- **OrderFulfilled** initiates shipping in Shipping & Fulfillment context

### Payment Context → Other Contexts

- **PaymentCaptured** confirms orders in Order Management context

- **PaymentCaptured** activates subscriptions in Subscription Management context

- **PaymentFailed** triggers retry workflows across multiple contexts

### Subscription Context → Other Contexts

- **SubscriptionCreated** creates billing schedules in Billing & Invoicing context

- **SubscriptionRenewed** generates orders in Order Management context

- **SubscriptionCancelled** updates customer status in Customer Management context

## Anti-Corruption Patterns

### External System Integration

- **Stripe Payment Gateway**: All Stripe-specific terms are translated to domain terms in BillingIntegrator

- **HubSpot CRM**: External customer data is mapped to internal Customer aggregate

- **Shipping Carriers**: Carrier-specific tracking info is normalized to TrackingNumber value object

### Legacy System Integration

- **Old Customer Database**: Legacy customer IDs are mapped to new CustomerId format

- **Previous Order System**: Historical orders maintain backward compatibility through OrderNumber mapping

## Validation Rules

### Naming Conventions

- **Entities**: PascalCase (Customer, Order, Product)

- **Value Objects**: PascalCase (Money, Address, CustomerId)

- **Enums**: PascalCase with descriptive values (CustomerType.DiasporaCommunity)

- **Domain Events**: PascalCase, past-tense, entity-first (CustomerUpdated, OrderCreated)

- **Services**: PascalCase with "Service" suffix (SubscriptionEngine, BillingIntegrator)

### Consistency Rules

- All monetary amounts use Money value object (never primitive numbers)

- All entity references use typed IDs (CustomerId, OrderId) not generic strings

- All temporal operations use Clock abstraction (never Date.now() or new Date())

- All error handling uses Result pattern (never throw exceptions in domain)

### Cross-Reference Integrity

- Every domain term must be defined in exactly one glossary (no duplicates)

- Cross-context references must use anti-corruption layers

- External system terms must be translated to domain terms at boundaries

## Governance

### Ownership

- **Core Glossary**: Architecture Team (this document)

- **Context-Specific Terms**: Individual bounded context teams

- **Cross-Context Integration**: Architecture Team with context team input

### Update Process

1. Propose changes via ADR (Architecture Decision Record)

2. Review with affected bounded context teams

3. Validate against existing implementations

4. Update glossary and notify all teams

5. Update code documentation and tests

### Quality Assurance

- Monthly glossary review meetings

- Automated validation of term usage in code

- Cross-reference integrity checks

- Business stakeholder validation sessions

This core glossary serves as the foundation for all context-specific glossaries and ensures consistent domain language across the entire Elias Food Imports platform.

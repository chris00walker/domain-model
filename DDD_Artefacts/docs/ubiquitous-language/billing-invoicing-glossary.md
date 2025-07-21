# Billing & Invoicing Context Glossary

Generated: 2025-07-21T12:19:38-03:00

## Purpose

This glossary defines terms specific to the Billing & Invoicing bounded context, focusing on invoice generation, payment tracking, financial reconciliation, and tax compliance.

## Context Overview

- **Business Purpose**: Generate accurate invoices, track payments, and ensure financial compliance

- **Core Responsibility**: Invoice lifecycle management and financial record keeping

- **Key Metrics**: Invoice accuracy ≥99.5%, Payment collection rate ≥95%, Tax compliance 100%

- **Integration Points**: Order Management, Payment Processing, Customer Management, Accounting Systems

## Aggregates

### InvoiceAggregate

- **Definition**: Central aggregate representing a financial document requesting payment for goods or services

- **Implementation**: `InvoiceAggregate` class extends AggregateRoot

- **Properties**:

  - **invoiceId**: Unique invoice identifier

  - **invoiceNumber**: Human-readable invoice number

  - **customerId**: Reference to invoiced customer

  - **orderId**: Reference to originating order (if applicable)

  - **invoiceItems**: Collection of billable items

  - **invoiceStatus**: Current lifecycle status

  - **issueDate**: Invoice creation date

  - **dueDate**: Payment due date

  - **totalAmount**: Total invoice amount including taxes

  - **paidAmount**: Amount received to date

  - **balanceAmount**: Remaining unpaid balance

- **Responsibilities**:

  - Invoice generation from orders or manual creation

  - Payment tracking and balance calculation

  - Status management (draft → issued → paid → overdue)

  - Tax calculation and compliance

  - Credit note and adjustment handling

- **Business Rules**:

  - Invoice numbers must be sequential and unique

  - Total amount must equal sum of items plus taxes

  - Status transitions follow defined lifecycle

  - Payments cannot exceed invoice total

  - Overdue status triggered after due date

- **Related Terms**: InvoiceId, InvoiceNumber, InvoiceStatus, InvoiceItem

### PaymentRecord

- **Definition**: Aggregate tracking payment transactions against invoices

- **Implementation**: `PaymentRecord` class extends AggregateRoot

- **Properties**:

  - **paymentId**: Unique payment identifier

  - **invoiceId**: Reference to paid invoice

  - **customerId**: Reference to paying customer

  - **paymentAmount**: Amount of this payment

  - **paymentMethod**: How payment was made

  - **paymentDate**: When payment was received

  - **paymentStatus**: Current payment status

  - **transactionId**: External payment system reference

  - **reconciliationStatus**: Bank reconciliation status

- **Responsibilities**:

  - Payment transaction recording

  - Invoice balance updates

  - Payment method tracking

  - Reconciliation with bank statements

  - Refund and chargeback handling

- **Business Rules**:

  - Payment amount must be positive

  - Cannot exceed outstanding invoice balance

  - Payment date cannot be in future

  - Successful payments are immutable

  - Failed payments can be retried

- **Related Terms**: PaymentId, PaymentMethod, PaymentStatus, TransactionId

## Value Objects

### InvoiceId

- **Definition**: Unique identifier for invoices across all EFI systems

- **Implementation**: `InvoiceId` value object

- **Format**: UUID-based string identifier

- **Usage**: Internal system references and external API calls

- **Business Rules**:

  - Globally unique across all invoice types

  - Immutable once assigned

  - Used for payment reconciliation

- **Related Terms**: InvoiceAggregate, UniqueEntityID

### InvoiceNumber

- **Definition**: Human-readable sequential invoice number for customer communication

- **Implementation**: `InvoiceNumber` value object

- **Format**: "INV-YYYY-NNNNNN" (e.g., "INV-2025-000001")

- **Generation**: Sequential numbering with year prefix

- **Usage**: Customer communication, accounting system integration, legal compliance

- **Business Rules**:

  - Sequential numbering without gaps

  - Year prefix for easy organization

  - Cannot be reused or modified

  - Required for tax compliance

- **Related Terms**: InvoiceAggregate, TaxCompliance

### InvoiceStatus

- **Definition**: Current state of invoice in its lifecycle

- **Implementation**: `InvoiceStatusType` union type

- **States**:

  - **DRAFT**: Invoice created but not yet issued

  - **ISSUED**: Invoice sent to customer, payment pending

  - **PARTIALLY_PAID**: Partial payment received, balance outstanding

  - **PAID**: Full payment received, invoice closed

  - **OVERDUE**: Payment not received by due date

  - **CANCELLED**: Invoice cancelled before payment

  - **CREDITED**: Credit note issued, invoice reversed

- **State Transitions**:

  - DRAFT → ISSUED (invoice finalized and sent)

  - ISSUED → PARTIALLY_PAID (partial payment received)

  - PARTIALLY_PAID → PAID (full payment received)

  - ISSUED/PARTIALLY_PAID → OVERDUE (due date passed)

  - Any state → CANCELLED (before payment)

  - PAID → CREDITED (credit note issued)

- **Business Rules**:

  - Status changes trigger domain events

  - Some transitions are irreversible

  - Status determines available actions

- **Related Terms**: InvoiceStatusChanged, InvoiceLifecycle

### InvoiceItem

- **Definition**: Individual billable item within an invoice

- **Implementation**: `InvoiceItem` value object

- **Properties**:

  - **description**: Item description for customer

  - **quantity**: Billable quantity

  - **unitPrice**: Price per unit

  - **totalPrice**: Quantity × unit price

  - **taxRate**: Applicable tax rate percentage

  - **taxAmount**: Calculated tax amount

  - **productId**: Reference to product (if applicable)

- **Business Rules**:

  - Quantity must be positive

  - Unit price can be zero (for free items)

  - Tax calculation based on customer location

  - Description required for clarity

  - Total price includes tax amount

- **Related Terms**: Product, TaxRate, Money

### Money

- **Definition**: Monetary amount with currency information

- **Implementation**: `Money` value object (shared kernel)

- **Properties**:

  - **amount**: Decimal amount value

  - **currency**: Currency code (default: BBD)

- **Business Rules**:

  - Amount precision to 2 decimal places

  - Currency must be supported

  - Arithmetic operations preserve currency

  - Comparison only between same currencies

- **Related Terms**: Currency, Amount, TotalAmount

### TaxRate

- **Definition**: Tax percentage and calculation rules

- **Implementation**: `TaxRate` value object

- **Properties**:

  - **rate**: Tax percentage (e.g., 17.5 for VAT)

  - **taxType**: Type of tax (VAT, GST, etc.)

  - **applicableFrom**: Effective start date

  - **applicableTo**: Effective end date (optional)

- **Business Rules**:

  - Rate must be between 0 and 100

  - Effective dates determine applicability

  - Different rates for different product categories

  - Historical rates preserved for audit

- **Related Terms**: VAT, TaxCalculation, TaxCompliance

## Domain Services

### InvoiceGenerationService

- **Definition**: Service creating invoices from orders or manual requests

- **Implementation**: `InvoiceGenerationService` domain service

- **Responsibilities**:

  - Order-to-invoice conversion

  - Manual invoice creation

  - Invoice numbering and sequencing

  - Tax calculation and application

  - Invoice template population

- **Generation Rules**:

  - One invoice per order (default)

  - Consolidate multiple orders if requested

  - Apply current tax rates at generation time

  - Include all order items and adjustments

  - Generate PDF for customer delivery

- **Related Terms**: OrderToInvoice, InvoiceTemplate, TaxCalculation

### PaymentAllocationService

- **Definition**: Service applying payments to invoices and managing balances

- **Implementation**: `PaymentAllocationService` domain service

- **Responsibilities**:

  - Payment-to-invoice allocation

  - Balance calculation and updates

  - Overpayment and underpayment handling

  - Multi-invoice payment distribution

  - Credit balance management

- **Allocation Rules**:

  - Payments applied to oldest invoices first

  - Partial payments reduce invoice balance

  - Overpayments create customer credit

  - Credit balances applied to future invoices

  - Manual allocation override available

- **Related Terms**: PaymentAllocation, CreditBalance, InvoiceBalance

### TaxCalculationService

- **Definition**: Service calculating taxes based on customer location and product type

- **Implementation**: `TaxCalculationService` domain service

- **Responsibilities**:

  - Tax rate determination

  - Tax amount calculation

  - Tax exemption handling

  - Multi-jurisdiction tax support

  - Tax reporting data collection

- **Calculation Rules**:

  - VAT 17.5% for Barbados customers

  - Tax-exempt items clearly identified

  - Business customers may have exemptions

  - International customers may be tax-free

  - Accurate tax reporting for compliance

- **Related Terms**: VATCalculation, TaxExemption, TaxReporting

### ReconciliationService

- **Definition**: Service matching payments with bank statements and external systems

- **Implementation**: `ReconciliationService` domain service

- **Responsibilities**:

  - Bank statement import and matching

  - Payment gateway reconciliation

  - Discrepancy identification and resolution

  - Automated matching rules

  - Manual reconciliation support

- **Reconciliation Rules**:

  - Match by amount, date, and reference

  - Flag unmatched transactions

  - Support multiple payment methods

  - Daily reconciliation process

  - Exception reporting for review

- **Related Terms**: BankReconciliation, PaymentMatching, Discrepancy

## Domain Events

### InvoiceGenerated

- **Definition**: Published when new invoice is created from order or manual process

- **Implementation**: `InvoiceGenerated` extends DomainEvent

- **Payload**: Invoice ID, customer ID, order ID, total amount, due date, timestamp

- **Consumers**: Customer Notifications, Accounting System, Analytics, Collections

- **Business Impact**: Triggers invoice delivery, accounting entry, payment tracking

### InvoiceIssued

- **Definition**: Published when draft invoice is finalized and sent to customer

- **Implementation**: `InvoiceIssued` extends DomainEvent

- **Payload**: Invoice ID, invoice number, customer ID, total amount, due date, timestamp

- **Consumers**: Customer Notifications, Collections, Analytics, Accounting

- **Business Impact**: Starts payment collection process, customer communication

### PaymentReceived

- **Definition**: Published when payment is successfully processed against invoice

- **Implementation**: `PaymentReceived` extends DomainEvent

- **Payload**: Payment ID, invoice ID, payment amount, payment method, timestamp

- **Consumers**: Order Management, Customer Notifications, Analytics, Accounting

- **Business Impact**: Updates invoice balance, triggers fulfillment, customer receipt

### InvoicePaid

- **Definition**: Published when invoice is fully paid and closed

- **Implementation**: `InvoicePaid` extends DomainEvent

- **Payload**: Invoice ID, customer ID, total paid amount, payment date, timestamp

- **Consumers**: Order Management, Customer Notifications, Analytics, Collections

- **Business Impact**: Completes billing cycle, enables order fulfillment, updates metrics

### InvoiceOverdue

- **Definition**: Published when invoice passes due date without full payment

- **Implementation**: `InvoiceOverdue` extends DomainEvent

- **Payload**: Invoice ID, customer ID, overdue amount, days overdue, timestamp

- **Consumers**: Collections, Customer Notifications, Analytics, Customer Service

- **Business Impact**: Triggers collection process, customer follow-up, credit review

### PaymentFailed

- **Definition**: Published when payment processing fails or is rejected

- **Implementation**: `PaymentFailed` extends DomainEvent

- **Payload**: Payment ID, invoice ID, failure reason, payment method, timestamp

- **Consumers**: Customer Notifications, Order Management, Analytics, Customer Service

- **Business Impact**: Notifies customer, may hold order, triggers retry process

## Repository Interfaces

### IInvoiceRepository

- **Definition**: Persistence contract for invoice aggregates

- **Implementation**: `IInvoiceRepository` interface

- **Standard Operations**:

  - `findById(id: InvoiceId): Promise<InvoiceAggregate | null>`

  - `save(invoice: InvoiceAggregate): Promise<void>`

  - `findByCustomerId(customerId: CustomerId): Promise<InvoiceAggregate[]>`

- **Specialized Queries**:

  - `findByStatus(status: InvoiceStatus): Promise<InvoiceAggregate[]>`

  - `findOverdueInvoices(): Promise<InvoiceAggregate[]>`

  - `findByDateRange(start: Date, end: Date): Promise<InvoiceAggregate[]>`

  - `findByInvoiceNumber(number: InvoiceNumber): Promise<InvoiceAggregate | null>`

- **Business Rules**: All operations return Result pattern for error handling

### IPaymentRepository

- **Definition**: Persistence contract for payment record aggregates

- **Implementation**: `IPaymentRepository` interface

- **Standard Operations**:

  - `findById(id: PaymentId): Promise<PaymentRecord | null>`

  - `save(payment: PaymentRecord): Promise<void>`

  - `findByInvoiceId(invoiceId: InvoiceId): Promise<PaymentRecord[]>`

- **Specialized Queries**:

  - `findByCustomerId(customerId: CustomerId): Promise<PaymentRecord[]>`

  - `findByTransactionId(transactionId: string): Promise<PaymentRecord | null>`

  - `findUnreconciledPayments(): Promise<PaymentRecord[]>`

  - `findByDateRange(start: Date, end: Date): Promise<PaymentRecord[]>`

- **Business Rules**: Support both successful and failed payment records

## Business Rules & Constraints

### Invoice Generation Rules

1. **Sequential Numbering**: Invoice numbers must be sequential without gaps

2. **Tax Compliance**: All invoices must include correct tax calculations

3. **Customer Information**: Complete customer details required for legal compliance

4. **Due Date**: Standard 30-day payment terms unless otherwise specified

5. **Currency**: All invoices in BBD (Barbados Dollar) unless customer requires otherwise

### Payment Processing Rules

1. **Payment Validation**: Amount cannot exceed outstanding invoice balance

2. **Payment Methods**: Support credit card, bank transfer, cash, check

3. **Currency Matching**: Payment currency must match invoice currency

4. **Duplicate Prevention**: Same transaction ID cannot be processed twice

5. **Refund Policy**: Refunds processed within 5-10 business days

### Tax Calculation Rules

1. **VAT Rate**: 17.5% VAT for Barbados customers on taxable items

2. **Tax Exemptions**: Certain food items may be tax-exempt

3. **Business Customers**: May have tax exemption certificates

4. **International**: Non-Barbados customers may be exempt from VAT

5. **Rate Changes**: Historical rates preserved for issued invoices

### Collection Rules

1. **Overdue Threshold**: Invoices overdue after 30 days

2. **Collection Process**: Automated reminders at 7, 14, 30 days overdue

3. **Credit Limits**: Customers with overdue invoices may have credit holds

4. **Payment Plans**: Available for large overdue amounts

5. **Write-off**: Bad debts written off after 90 days and collection efforts

## Integration Patterns

### Inbound Events (Consumed)

- **OrderConfirmed** (Order Management) → Generate invoice for confirmed order

- **PaymentProcessed** (Payment Processing) → Record payment against invoice

- **OrderCancelled** (Order Management) → Cancel or credit related invoice

- **CustomerUpdated** (Customer Management) → Update customer billing information

### Outbound Events (Published)

- **InvoiceGenerated** → Customer Notifications for invoice delivery

- **PaymentReceived** → Order Management for fulfillment authorization

- **InvoiceOverdue** → Collections for follow-up actions

- **InvoicePaid** → Analytics for revenue recognition

### Service Dependencies

- **Tax Service**: Current tax rates and exemption rules

- **Customer Service**: Customer billing information and preferences

- **Payment Gateway**: Payment processing and transaction status

- **Email Service**: Invoice delivery and payment notifications

- **PDF Service**: Invoice document generation

- **Accounting System**: Financial data synchronization

## Anti-Corruption Patterns

### Payment Gateway Integration

- **Stripe Charge** → Internal `PaymentRecord` with gateway-specific metadata

- **PayPal Transaction** → Internal payment with PayPal reference

- **Square Payment** → Internal payment record with Square transaction ID

### Accounting System Integration

- **QuickBooks Invoice** → Internal `InvoiceAggregate` with QB sync status

- **Xero Invoice** → Internal invoice with Xero reference

- **SAP Financial Document** → Internal invoice with SAP integration

### Legacy Billing System

- **Old Invoice Numbers** → New sequential numbering with mapping

- **Previous Payment Records** → Current payment structure with migration

- **Historical Tax Rates** → Current tax calculation with rate history

## Context Boundaries

### What's Inside This Context

- Invoice generation and lifecycle management

- Payment recording and allocation

- Tax calculation and compliance

- Financial reconciliation and reporting

- Collection and overdue management

### What's Outside This Context

- Order processing and fulfillment

- Customer relationship management

- Product catalog and pricing

- Physical payment processing

- General accounting and financial reporting

### Integration Points

- **Order Management**: Invoice generation from confirmed orders

- **Customer Management**: Customer billing information and preferences

- **Payment Processing**: Payment transaction processing and status

- **Analytics**: Financial metrics and revenue reporting

- **Accounting Systems**: Financial data synchronization

## Performance Considerations

### Scalability Patterns

- **Invoice Archiving**: Move old invoices to archive storage

- **Payment Batching**: Process payments in batches for efficiency

- **Tax Calculation Caching**: Cache tax rates and rules

- **Report Generation**: Async processing for large financial reports

### Data Retention

- **Invoice Records**: Retain for 7 years for tax compliance

- **Payment Records**: Retain for 7 years for audit purposes

- **Tax Records**: Retain per local tax authority requirements

- **Reconciliation Data**: Retain for 3 years for operational needs

This glossary ensures consistent terminology within the Billing & Invoicing context while maintaining clear boundaries and integration patterns with other bounded contexts.

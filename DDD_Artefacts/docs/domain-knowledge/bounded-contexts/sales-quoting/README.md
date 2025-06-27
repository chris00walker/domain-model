---
title: Sales & Quoting Domain Knowledge
status: draft
owner: @sales-team
reviewers: @reviewer1, @reviewer2
last_updated: 2025-06-10
---

# Sales & Quoting Domain

## Table of Contents
- [Domain Overview](#domain-overview)
- [Strategic Classification](#strategic-classification)
- [Core Domain Concepts](#core-domain-concepts)
- [Business Rules](#business-rules)
- [Domain Events](#domain-events)
- [Aggregates](#aggregates)

<!-- GAP_IMPLEMENTED: B2B Quoting System | High | High | High -->
<!-- stub for "B2B Quoting System" gap in the sales-quoting context -->

<!-- GAP_IMPLEMENTED: Contract Management | Medium | High | Medium -->
<!-- stub for "Contract Management" gap in the sales-quoting context -->

<!-- GAP_IMPLEMENTED: B2B Quoting System | High | High | High -->
<!-- stub for "B2B Quoting System" gap in the sales-quoting context -->

<!-- GAP_IMPLEMENTED: Contract Management | Medium | High | Medium -->
<!-- stub for "Contract Management" gap in the sales-quoting context -->

## Domain Overview

The Sales & Quoting domain manages the process of creating, negotiating, and finalizing quotes for B2B customers in the Elias Food Imports ecosystem. This domain handles the entire quote-to-cash process, from initial quote creation to contract management and [[Order]] conversion.

## Strategic Classification

**Classification**: Supporting Domain

**Justification**: While not a core differentiator, the Sales & Quoting domain is essential for supporting B2B sales processes, managing [[Customer]] negotiations, and ensuring accurate [[Order]] fulfillment based on contractual terms. It directly impacts [[Customer]] acquisition, revenue recognition, and contract compliance.

## Core Domain Concepts

### Quote
A formal offer to sell products or services at specified prices and terms, valid for a defined period.

### Quote Line Item
An individual [[Product]] or service included in a quote, with specific quantities, [[Pricing]], and configuration options.

### Contract
A legally binding agreement that defines the terms and conditions for business transactions between Elias Food Imports and its B2B customers.

### Discount Structure
Rules and parameters that determine [[Pricing]] adjustments based on volume, [[Customer]] segment, or other business rules.

### Approval Workflow
Defined process for reviewing and approving quotes and contracts based on amount, [[Customer]] type, or other criteria.

## Business Rules

### Quote Management
1. Quotes must include all relevant [[Product]] details, [[Pricing]], terms, and expiration dates.
2. Quote validity periods must be clearly defined and enforced (default 30 days).
3. Changes to quotes after [[Customer]] acceptance require a new quote version.
4. All quote modifications must be tracked with audit trails.
5. Quotes exceeding €50,000 require executive approval.
6. Quotes must be automatically archived after 12 months of inactivity.

### Contract Management
1. Contracts must reference the accepted quote and include all negotiated terms.
2. Contract terms must be validated against company policies and legal requirements.
3. Contract renewals and expirations must be tracked with 60-day advance notifications.
4. Contract amendments must maintain version history and approval records.
5. Auto-renewal clauses require explicit [[Customer]] opt-in.
6. Contract termination clauses must include a minimum 30-day notice period.

### [[Pricing]] and Discounts
1. Discounts must be within approved thresholds based on [[Customer]] tier and [[Order]] volume.
2. Special [[Pricing]] requires appropriate approval levels (10-20%: Manager, 21-30%: Director, 30%+: VP).
3. Price overrides must be documented with business justification and valid for a maximum of 6 months.
4. Volume discounts must follow the approved tiered [[Pricing]] structure.
5. Promotional [[Pricing]] must have defined start and end dates.

## Domain Events

### QuoteCreated
**Description**: Triggered when a new quote is created in the system.
**Payload**:
```typescript
{
  quoteId: string;
  customerId: string;
  creatorId: string;
  createdAt: Date;
  validUntil: Date;
  currency: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
  }>;
}
```
**Consumers**:
- **Notification Context**: Send quote confirmation to creator
- **Analytics Context**: Track quote creation metrics
- **[[Customer]] Context**: Update [[Customer]] interaction history

### QuoteSent
**Description**: Triggered when a quote is sent to a [[Customer]].
**Payload**:
```typescript
{
  quoteId: string;
  customerId: string;
  sentTo: string; // Email
  sentBy: string; // User ID
  sentAt: Date;
  expirationDate: Date;
  communicationChannel: 'email' | 'portal' | 'api';
}
```
**Consumers**:
- **Notification Context**: Send delivery confirmation
- **Analytics Context**: Track quote engagement metrics
- **CRM Context**: Log [[Customer]] interaction

### QuoteAccepted
**Description**: Triggered when a [[Customer]] accepts a quote.
**Payload**:
```typescript
{
  quoteId: string;
  customerId: string;
  acceptedBy: string; // [[Customer]] contact
  acceptedAt: Date;
  ipAddress: string;
  orderId?: string; // If [[Order]] is auto-created
  acceptanceMethod: 'digital_signature' | 'click_accept' | 'email_confirmation';
}
```
**Consumers**:
- **[[Order]] Context**: Create [[Order]] from accepted quote
- **Billing Context**: Set up billing schedule
- **Notification Context**: Send acceptance confirmation

### ContractCreated
**Description**: Triggered when a new contract is created from an accepted quote.
**Payload**:
```typescript
{
  contractId: string;
  quoteId: string;
  customerId: string;
  effectiveDate: Date;
  expirationDate: Date;
  autoRenew: boolean;
  terms: {
    paymentTerms: string;
    deliveryTerms: string;
    terminationClause: string;
    serviceLevelAgreements: Array<{
      metric: string;
      target: number;
      timeWindow: string;
    }>;
  };
  signatories: Array<{
    name: string;
    email: string;
    role: string;
    signedAt?: Date;
  }>;
}
```
**Consumers**:
- **Legal Context**: Store contract documents
- **Billing Context**: Set up recurring billing if applicable
- **Notification Context**: Notify stakeholders of new contract

## Aggregates

### QuoteAggregate
**Description**: Manages the lifecycle of a quote from creation to acceptance or expiration.

**Root Entity**: `Quote`

**Entities**:
- `QuoteLineItem`
- `QuoteVersion`
- `QuoteApproval`

**Invariants**:
1. A quote must have at least one line item
2. Quote total must equal the sum of all line item totals
3. Only one version of a quote can be active at a time
4. Quotes cannot be modified after acceptance

**Commands**:
- `CreateQuote(customerId, items, validUntil)`
- `AddLineItem(quoteId, productId, quantity, unitPrice)`
- `UpdateLineItem(quoteId, lineItemId, updates)`
- `SubmitForApproval(quoteId, approverId)`
- `ApproveQuote(quoteId, approverId, comments)`
- `RejectQuote(quoteId, approverId, reason)`
- `SendQuote(quoteId, sentBy, recipientEmail)`
- `AcceptQuote(quoteId, acceptedBy, acceptanceMethod)`

**Events**:
- `QuoteCreated`
- `QuoteLineItemAdded`
- `QuoteSubmittedForApproval`
- `QuoteApproved`
- `QuoteRejected`
- `QuoteSent`
- `QuoteAccepted`
- `QuoteExpired`

### ContractAggregate
**Description**: Manages the lifecycle of [[Customer]] contracts, including creation, amendments, and renewals.

**Root Entity**: `Contract`

**Entities**:
- `ContractVersion`
- `ContractTerm`
- `ContractSignatory`
- `ServiceLevelAgreement`

**Invariants**:
1. A contract must reference an accepted quote
2. Contract terms must be within company policy limits
3. Only one version of a contract can be active at a time
4. Contract amendments must maintain an audit trail

**Commands**:
- `CreateContract(quoteId, terms, signatories)`
- `AmendContract(contractId, changes, reason)`
- `AddSignatory(contractId, signatory)`
- `SignContract(contractId, signatoryId, signatureData)`
- `RenewContract(contractId, newEndDate)`
- `TerminateContract(contractId, reason, effectiveDate)`

**Events**:
- `ContractCreated`
- `ContractAmended`
- `ContractSigned`
- `ContractRenewed`
- `ContractTerminated`
- `ContractExpirationReminder`

## Entities

### Quote
**Description**: Represents a formal offer to sell products or services.

**Identifier**: `quoteId` (UUID)

**Attributes**:
- `quoteNumber`: string (auto-generated)
- `status`: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'accepted' | 'rejected' | 'expired'
- `customerId`: string
- `accountManagerId`: string
- `createdAt`: Date
- `updatedAt`: Date
- `validUntil`: Date
- `subtotal`: number
- `totalDiscount`: number
- `totalTax`: number
- `totalAmount`: number
- `currency`: string (ISO 4217)
- `notes`: string
- `termsAndConditions`: string
- `shippingAddress`: Address
- `billingAddress`: Address
- `metadata`: Record<string, any>

**Methods**:
- `addLineItem(productId, quantity, unitPrice, discount)`: void
- `updateLineItem(lineItemId, updates)`: void
- `removeLineItem(lineItemId)`: void
- `calculateTotals()`: void
- `submitForApproval(approverId)`: void
- `approve(approverId, comments)`: void
- `reject(approverId, reason)`: void
- `send(sentBy, recipientEmail)`: void
- `accept(acceptedBy, acceptanceMethod)`: void
- `expire()`: void
- `toJSON()`: object

### Contract
**Description**: Represents a legally binding agreement with a [[Customer]].

**Identifier**: `contractId` (UUID)

**Attributes**:
- `contractNumber`: string (auto-generated)
- `quoteId`: string
- `customerId`: string
- `status`: 'draft' | 'active' | 'pending_signature' | 'expired' | 'terminated'
- `startDate`: Date
- `endDate`: Date
- `autoRenew`: boolean
- `billingCycle`: 'monthly' | 'quarterly' | 'annually'
- `paymentTerms`: string
- `deliveryTerms`: string
- `terminationNoticePeriod`: number (days)
- `createdAt`: Date
- `updatedAt`: Date
- `metadata`: Record<string, any>

**Methods**:
- `addSignatory(signatory)`: void
- `removeSignatory(signatoryId)`: void
- `sign(signatoryId, signatureData)`: void
- `amend(changes, reason)`: void
- `renew(newEndDate)`: void
- `terminate(reason, effectiveDate)`: void
- `isActive(date)`: boolean
- `daysUntilExpiration()`: number
- `toJSON()`: object

## Value Objects

### Money
**Description**: Represents a monetary amount with currency.

**Attributes**:
- `amount`: number
- `currency`: string (ISO 4217)

**Methods**:
- `add(other)`: Money
- `subtract(other)`: Money
- `multiply(factor)`: Money
- `divide(divisor)`: Money
- `format(locale)`: string
- `equals(other)`: boolean

### Address
**Description**: Represents a physical or mailing address.

**Attributes**:
- `street1`: string
- `street2`: string (optional)
- `city`: string
- `state`: string
- `postalCode`: string
- `country`: string (ISO 3166-1 alpha-2)
- `type`: 'billing' | 'shipping' | 'both'

**Methods**:
- `validate()`: boolean
- `toFormattedString()`: string
- `equals(other)`: boolean

### Discount
**Description**: Represents a discount to be applied to a quote or line item.

**Attributes**:
- `type`: 'percentage' | 'fixed' | 'bulk'
- `value`: number
- `reason`: string
- `approvedBy`: string (User ID)
- `approvedAt`: Date
- `validUntil`: Date (optional)

**Methods**:
- `calculateDiscount(amount)`: number
- `isValid()`: boolean
- `toJSON()`: object

## Domain Services

### QuoteGenerationService
**Description**: Handles the generation of quotes based on [[Customer]] requirements and [[Product]] configurations.

**Methods**:
- `generateQuote(customerId, items, options)`: Promise<Quote>
- `cloneQuote(quoteId, updates)`: Promise<Quote>
- `convertToOrder(quoteId, customerId)`: Promise<[[Order]]>
- `expireQuotesOlderThan(days)`: Promise<number>

### ContractManagementService
**Description**: Manages the contract lifecycle including creation, amendments, and renewals.

**Methods**:
- `createContractFromQuote(quoteId, terms)`: Promise<Contract>
- `generateContractDocument(contractId)`: Promise<Buffer>
- `sendForSignature(contractId, signatories)`: Promise<void>
- `processRenewals()`: Promise<RenewalResult[]>

### ApprovalWorkflowService
**Description**: Manages the approval workflow for quotes and contracts.

**Methods**:
- `getApprovers(quoteOrContract)`: User[]
- `requestApproval(itemId, requesterId)`: Promise<void>
- `approve(itemId, approverId, comments)`: Promise<void>
- `reject(itemId, approverId, reason)`: Promise<void>
- `getApprovalHistory(itemId)`: ApprovalHistory[]

## Administrative Capabilities

### Admin Application Services

#### QuoteConfigurationAdminService

**Responsibility**: Manages system-wide quote configuration and business rules

**Operations**:
- Configure quote validity periods and expiration rules
- Define approval thresholds and routing rules
- Manage quote templates and required fields
- Configure quote numbering schemes and formats
- Define quote statuses and state transitions

**Authorization**: Requires `quote:config:manage` permission

#### ContractConfigurationAdminService

**Responsibility**: Manages contract templates, clauses, and compliance rules

**Operations**:
- Define standard contract templates and clauses
- Configure contract renewal and expiration rules
- Manage legal compliance requirements by region
- Define contract approval workflows and thresholds
- Configure document generation templates

**Authorization**: Requires `contract:config:manage` permission

#### PricingRulesAdminService

**Responsibility**: Manages [[Pricing]] rules, discount structures, and approval thresholds

**Operations**:
- Configure discount approval thresholds by role
- Define volume-based [[Pricing]] tiers
- Manage special [[Pricing]] programs and eligibility
- Configure margin protection rules and alerts
- Define [[Customer]] tier-based [[Pricing]] rules

**Authorization**: Requires `[[Pricing]]:rules:manage` permission

#### SalesOperationsAdminService

**Responsibility**: Manages sales operations, territories, and performance metrics

**Operations**:
- Configure sales territories and account assignments
- Define sales performance metrics and targets
- Manage commission structures and calculations
- Configure sales forecasting parameters
- Generate sales performance reports

**Authorization**: Requires `sales:operations:manage` permission

### Admin Read Models

#### QuotePerformanceDashboardModel

**Purpose**: Monitors quote creation, conversion, and performance metrics

**Key Metrics**:
- Quote volume by status, [[Customer]] segment, and [[Product]] category
- Quote conversion rates and time-to-close metrics
- Average quote value and margin by sales representative
- Quote modification frequency and approval cycle times
- Quote expiration and renewal rates

#### ContractComplianceDashboardModel

**Purpose**: Monitors contract compliance, renewals, and risk factors

**Key Metrics**:
- Contract renewal rates and advance notice compliance
- Contract amendment frequency and approval metrics
- Non-standard term usage and approval statistics
- Contract risk assessment by [[Customer]] and region
- Contract value distribution and trend analysis

#### PricingExceptionsDashboardModel

**Purpose**: Monitors [[Pricing]] exceptions, discounts, and margin impacts

**Key Metrics**:
- Discount exception frequency by approver and [[Customer]]
- Margin impact of [[Pricing]] exceptions by [[Product]] category
- Special [[Pricing]] program utilization and effectiveness
- [[Pricing]] override patterns and business justifications
- Competitive [[Pricing]] adjustment impact analysis

#### SalesPerformanceDashboardModel

**Purpose**: Monitors sales team performance, pipeline, and forecasting accuracy

**Key Metrics**:
- Sales pipeline by stage, representative, and territory
- Forecast accuracy and conversion metrics
- Sales cycle duration by [[Product]] category and [[Customer]] segment
- Win/loss analysis by competitor and [[Product]]
- Commission calculation and payout tracking

### Admin Domain Events

#### QuoteConfigurationModifiedByAdmin

**Payload**:
```json
{
  "eventId": "uuid",
  "timestamp": "ISO-8601 datetime",
  "adminUserId": "string",
  "configType": "string",
  "previousConfiguration": {
    "validityPeriodDays": "integer",
    "approvalThresholds": [
      {
        "amount": "decimal",
        "currency": "string",
        "requiredRole": "string"
      }
    ],
    "requiredFields": ["string"],
    "numberingFormat": "string"
  },
  "newConfiguration": {
    "validityPeriodDays": "integer",
    "approvalThresholds": [
      {
        "amount": "decimal",
        "currency": "string",
        "requiredRole": "string"
      }
    ],
    "requiredFields": ["string"],
    "numberingFormat": "string"
  },
  "reason": "string",
  "effectiveDate": "ISO-8601 datetime"
}
```

#### ContractTermsModifiedByAdmin

**Payload**:
```json
{
  "eventId": "uuid",
  "timestamp": "ISO-8601 datetime",
  "adminUserId": "string",
  "contractTemplateId": "string",
  "templateName": "string",
  "previousTerms": {
    "standardClauses": ["string"],
    "renewalTerms": {
      "autoRenewal": "boolean",
      "noticePeriodDays": "integer"
    },
    "paymentTerms": "string",
    "deliveryTerms": "string"
  },
  "newTerms": {
    "standardClauses": ["string"],
    "renewalTerms": {
      "autoRenewal": "boolean",
      "noticePeriodDays": "integer"
    },
    "paymentTerms": "string",
    "deliveryTerms": "string"
  },
  "reason": "string",
  "effectiveDate": "ISO-8601 datetime",
  "affectsExistingContracts": "boolean"
}
```

#### PricingRulesModifiedByAdmin

**Payload**:
```json
{
  "eventId": "uuid",
  "timestamp": "ISO-8601 datetime",
  "adminUserId": "string",
  "ruleType": "string",
  "previousRules": {
    "discountThresholds": [
      {
        "maxDiscountPercentage": "decimal",
        "requiredRole": "string"
      }
    ],
    "volumeTiers": [
      {
        "minimumQuantity": "integer",
        "discountPercentage": "decimal"
      }
    ],
    "minimumMarginPercentage": "decimal"
  },
  "newRules": {
    "discountThresholds": [
      {
        "maxDiscountPercentage": "decimal",
        "requiredRole": "string"
      }
    ],
    "volumeTiers": [
      {
        "minimumQuantity": "integer",
        "discountPercentage": "decimal"
      }
    ],
    "minimumMarginPercentage": "decimal"
  },
  "reason": "string",
  "effectiveDate": "ISO-8601 datetime"
}
```

#### QuoteApprovalOverriddenByAdmin

**Payload**:
```json
{
  "eventId": "uuid",
  "timestamp": "ISO-8601 datetime",
  "adminUserId": "string",
  "quoteId": "string",
  "customerId": "string",
  "previousStatus": "string",
  "newStatus": "string",
  "bypassedApprovals": ["string"],
  "overrideReason": "string",
  "totalValue": {
    "amount": "decimal",
    "currency": "string"
  },
  "discountPercentage": "decimal",
  "marginPercentage": "decimal"
}
```

## Integration Points

### Consumed Events

| Event | Source Context | Purpose |
|-------|----------------|---------|
| `CustomerCreated` | [[Customer]] | Track new customers for potential quotes |
| `ProductPriceChanged` | [[Pricing]] | Update draft quotes with latest [[Pricing]] |
| `InventoryLow` | [[Inventory]] | Check impact on quotes with backordered items |
| `PaymentFailed` | Billing | Handle [[Payment]] issues for contract renewals |
| `OrderShipped` | [[Order]] | Update contract fulfillment status |

### Published Events

| Event | Consumer Contexts | Purpose |
|-------|-------------------|---------|
| `QuoteCreated` | Analytics, Notification | Track quote metrics and notify stakeholders |
| `QuoteAccepted` | [[Order]], Billing | Create [[Order]] and set up billing |
| `ContractCreated` | Legal, Billing | Store contract and set up billing schedule |
| `ContractExpiring` | [[Customer]], Sales | Send renewal reminders |
| `ContractTerminated` | Billing, Support | Stop billing and update support status |

## Implementation Phases

### Phase 1: Core Quote Management (Weeks 1-4)
1. Implement basic quote creation and management
2. Create quote approval workflow
3. Set up basic notifications
4. Implement quote-to-[[Order]] conversion

### Phase 2: Contract Management (Weeks 5-8)
1. Implement contract creation from quotes
2. Add digital signature support
3. Set up contract versioning
4. Implement basic renewal process

### Phase 3: Advanced Features (Weeks 9-12)
1. Add complex [[Pricing]] rules
2. Implement bulk operations
3. Add reporting and analytics
4. Set up integration with CRM/ERP systems

### Phase 4: Optimization (Weeks 13-16)
1. Performance optimization
2. Add AI/ML for quote recommendations
3. Implement advanced analytics
4. Add self-service portal for customers

## Technical Considerations

### Architecture
- **Hexagonal Architecture**: Keep domain logic independent of infrastructure
- **CQRS**: Separate read and write models for better scalability
- **Event Sourcing**: For audit trail and time-travel debugging

### Performance
- Cache frequently accessed quotes and contracts
- Use materialized views for reporting
- Implement batch processing for background jobs

### Security
- Role-based access control for all operations
- Audit logging for all changes
- Data encryption at rest and in transit
- Regular security audits

### Scalability
- Horizontal scaling for read-heavy operations
- Database sharding by [[Customer]]/region
- Asynchronous processing for non-critical operations

### Monitoring and Alerting
- Track key metrics (quote conversion rate, time to close, etc.)
- Set up alerts for system issues
- Monitor contract renewal dates and expirations

### Compliance
- GDPR/CCPA compliance for [[Customer]] data
- Industry-specific regulations (e.g., food safety)
- Document retention policies

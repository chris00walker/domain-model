# Sales & Quoting

[RELATED: ADR-002, ADR-004, ADR-005, ADR-008, ADR-012]
[CONTEXT: Core]
[STATUS: Draft]
[VERSION: 1.0.0]
[OWNER: @sales-team]

## 1. Business Context

- **Purpose**: The Sales & Quoting context manages the creation, negotiation, and management of commercial sales quotes and contracts, ensuring alignment with pricing strategies and margin targets.

- **Business Capabilities**:
  - **Quote Generation**: Create and manage commercial quotes with volume-based pricing
  - **Contract Management**: Handle B2B and wholesale contracts with negotiated terms
  - **Approval Workflows**: Manage multi-level approval processes for pricing exceptions
  - **Margin Protection**: Enforce segment-specific gross margin floors
  - **Customer Segmentation**: Apply appropriate pricing tiers based on customer type (Commercial, Wholesale, Importer)

- **Success Metrics**:
  - **Financial Performance**:
    - Achieve target gross margins by segment (100% Commercial, 70% Wholesale, 30% Importer FOB)
    - Maintain blended pocket GM ≥ 35 % across Commercial, Wholesale and Importer revenue
    - Maintain quote-to-order conversion rate > 30 %
    - Monitor revenue mix dashboard (% revenue per tier)
  - **Operational Efficiency & Cash-Flow**:
    - Reduce quote generation time to < 15 minutes
    - Maintain SLA 99.5 % quote accuracy (pricing + availability)
    - Days-to-close ≤ 14 days (Commercial), ≤ 30 days (Wholesale), ≤ 45 days (Importer)
    - Days-sales-outstanding ≤ 35 days for Commercial & Wholesale; advance payment/LC for Importer
    - Auto-reprice stale quotes after 14 days; require approval when unit margin drops > 10 pp below floor
  - **Relationship Growth & Satisfaction**:
    - Achieve > 90 % on-time quote delivery
    - Maintain < 5 % quote revision rate
    - Upsell ratio (follow-on orders within 60 days) ≥ 25 %
    - Net Revenue Retention > 110 % for Commercial accounts
  - **Risk & Margin Protection**:
    - Real-time margin check available in 100 % of quote interactions

- **Domain Experts**:
<!--- agents:
  - role: Sales Director (Ultimate Approver)
  - role: Sales Operations Manager
  - role: Account Managers
  - role: Pricing Analysts
-->

## 2. Domain Model

- **Key Entities**:
  - `Quote`: Commercial proposal with line items, terms, and pricing
  - `Contract`: Binding agreement with specific terms and conditions
  - `CustomerAccount`: B2B customer profile and history
  - `PricingTier`: Volume-based pricing structures
  - `ApprovalWorkflow`: Multi-level approval processes

- **Aggregates**:
  - `Quote` (root): Manages quote lifecycle and validations
  - `Contract` (root): Handles contract terms and compliance
  - `CustomerAccount` (root): Maintains customer-specific pricing and history

- **Value Objects**:
  - `QuoteLineItem`: Individual product/service in a quote
  - `PricingTerm`: Specific pricing conditions and discounts
  - `ApprovalChain`: Sequence of required approvals
  - `VolumeTier`: Volume thresholds and associated pricing

- **Domain Services**:
  - `QuoteGenerator`: Creates and prices quotes based on customer tier
  - `ContractNegotiator`: Manages contract terms and conditions
  - `MarginValidator`: Ensures quotes meet minimum margin requirements
  - `ApprovalOrchestrator`: Routes quotes through approval workflows

- **Domain Events**:
  - `QuoteCreated`: When a new quote is generated
  - `QuoteApproved`: When a quote receives all required approvals
  - `ContractSigned`: When a customer accepts a quote
  - `PricingExceptionRequested`: When a quote falls below margin thresholds

## 3. Functional Requirements

### 3.1 Quote Management

- **FR-1**: As a Sales Representative, I want to generate commercial quotes with volume-based pricing
  - **Acceptance Criteria**:
    - [ ] Support tiered pricing based on order volume
    - [ ] Apply customer-specific discounts and terms
    - [ ] Enforce minimum order quantities
    - [ ] Generate PDF versions of quotes
  - **Dependencies**: [Pricing & Promotions, Customer Management]

### 3.2 Contract Negotiation

- **FR-2**: As an Account Manager, I want to manage contract negotiations
  - **Acceptance Criteria**:
    - [ ] Track changes during negotiation
    - [ ] Maintain version history of terms
    - [ ] Enforce standard contract templates
    - [ ] Capture special terms and conditions
  - **Dependencies**: [Legal, Customer Management]

### 3.3 Approval Workflows

- **FR-3**: As a Sales Manager, I want to configure approval workflows
  - **Acceptance Criteria**:
    - [ ] Define multi-level approval chains
    - [ ] Set thresholds for automatic approvals
    - [ ] Route exceptions to appropriate approvers
    - [ ] Track approval status in real-time
  - **Dependencies**: [Identity & Access Management]

### 3.4 Business Rules

- **Quote Management**
  - Quotes must include all relevant product details, pricing, terms, and expiration dates.
  - Quote validity periods are enforced; default validity is 30 days.
  - Changes to quotes after customer acceptance require creating a new quote version.
  - All quote modifications must be tracked with audit trails.
  - Quotes exceeding €50,000 require executive approval.
  - Quotes are automatically archived after 12 months of inactivity.
- **Contract Management**
  - Contracts must reference the accepted quote and include all negotiated terms.
  - Contract terms must align with company policies and legal requirements.
  - Contract renewals and expirations are tracked with 60-day advance notifications.
  - Contract amendments maintain version history and approval records.
  - Auto-renewal clauses require explicit customer opt-in.
  - Contract termination clauses require a minimum 30-day notice period.
- **Pricing & Discounts**
  - Discounts must remain within approved thresholds based on customer tier and order volume.
  - Special pricing approvals: 10-20 % Manager, 21-30 % Director, > 30 % VP.
  - Price overrides must include a business justification and are valid for a maximum of six months.
  - Volume discounts follow the approved tiered pricing structure.
  - Promotional pricing must have defined start and end dates.

## 4. Integration Points

### 4.1 Published Events

- `QuoteCreated`: When a new quote is generated
  - Payload: { quoteId, customerId, totalAmount, expirationDate, terms }
  - Consumers: [CRM, Billing, Analytics]
- `ContractSigned`: When a customer accepts a quote
  - Payload: { contractId, customerId, effectiveDate, termMonths, value }
  - Consumers: [Order Management, Billing, Customer Management]
- `PricingExceptionApproved`: When a pricing exception is granted
  - Payload: { exceptionId, approver, oldPrice, newPrice, marginImpact }
  - Consumers: [Pricing & Promotions, Finance, Analytics]
- `ContractCreated`: When a contract is generated from an accepted quote
  - Payload: { contractId, quoteId, customerId, startDate, endDate, value }
  - Consumers: [Billing, Legal, Analytics]
- `ContractExpiring`: Reminder 60 days before contract expiration
  - Payload: { contractId, customerId, expirationDate, renewalTerms }
  - Consumers: [Sales, Customer Success, Billing]
- `ContractTerminated`: When a contract terminates before expiration
  - Payload: { contractId, customerId, terminatedBy, effectiveDate, reason }
  - Consumers: [Billing, Support, Analytics]

### 4.2 Consumed Events

- `CustomerTierUpdated`: From Customer Management
  - Source: Customer Management Context
  - Action: Update customer's pricing tier and applicable discounts
- `PriceListUpdated`: From Pricing & Promotions
  - Source: Pricing & Promotions Context
  - Action: Refresh cached pricing data for quote generation
- `InventoryLevelChanged`: From Inventory Management
  - Source: Inventory Context
  - Action: Update product availability in active quotes

- `ProductPriceChanged`: From Pricing & Promotions
  - Source: Pricing & Promotions Context
  - Action: Update draft quotes with latest pricing
- `PaymentFailed`: From Billing
  - Source: Billing Context
  - Action: Handle payment issues for contract renewals
- `OrderShipped`: From Order Management
  - Source: Shipping Fulfillment Context
  - Action: Update contract fulfillment status

### 4.3 APIs/Services

- **REST/GraphQL**: Sales & Quoting API
  - `/quotes`: CRUD operations for quotes
  - `/contracts`: Contract management
  - `/approvals`: Workflow management
- **gRPC**: High-volume pricing service
  - Real-time margin calculations
  - Bulk quote generation
- **External Services**:
  - E-signature providers (DocuSign, etc.)
  - CRM integration (HubSpot, Salesforce)

## 5. Non-Functional Requirements

- **Performance**:
  - Generate quotes in < 5 seconds
  - Support 100+ concurrent users
  - Handle 10,000+ active quotes
- **Scalability**:
  - Scale horizontally for peak sales periods
  - Support 3x normal load during quarter-end
  - Cache frequently accessed pricing data
- **Security**:
  - Role-based access control for all operations
  - Audit logging of all quote modifications
  - Data encryption at rest and in transit
- **Reliability**:
  - 99.9% uptime for quoting services
  - Automatic failover for critical components
  - Data consistency across all quote versions
- **Compliance**:
  - Maintain audit trail for all pricing decisions
  - Enforce regulatory requirements in contracts
  - Document all approval workflows

## 6. Implementation Roadmap

### Phase 1 – Core Quote Management (Weeks 1-4)

1. Implement basic quote creation and management.
2. Establish quote approval workflow.
3. Set up essential notifications.
4. Enable quote-to-order conversion.

### Phase 2 – Contract Management (Weeks 5-8)

1. Implement contract creation from accepted quotes.
2. Add digital signature support.
3. Enable contract versioning.
4. Implement renewal process with reminders.

### Phase 3 – Advanced Features (Weeks 9-12)

1. Enhance pricing rules and volume-based calculations.
2. Implement bulk operations and reporting dashboards.
3. Integrate with CRM/ERP systems.
4. Introduce AI/ML quote recommendations.

### Phase 4 – Optimization (Weeks 13-16)

1. Optimize performance and scalability.
2. Add advanced analytics and KPIs.
3. Provide self-service customer portal.
4. Refine approval rules based on data insights.

## 7. Testing & Validation Strategy

- **Unit Tests**: Validate quote calculations, margin checks, and approval workflows.
- **Integration Tests**: Verify interactions with Pricing, Customer Management, Billing, and Inventory contexts.
- **Performance Tests**: Ensure quote generation < 5 seconds at P95 and concurrency targets.
- **Security Tests**: RBAC enforcement and OWASP Top 10 scanning.
- **User Acceptance Tests**: Confirm end-to-end quote-to-contract flows with domain experts.
- **CI/CD Quality Gates**: 80 % code coverage, static analysis, and security scanning per ADR-012.

## 8. Open Questions

- [ ] How should we handle international contracts with different tax regulations?
- [ ] What's the process for handling pricing disputes with high-value customers?
- [ ] How frequently should we review and update standard contract templates?

## 9. Out of Scope

- Direct payment processing (handled by Payment context)
- Tax calculation (handled by Order Management context)
- Product catalog management (handled by Product Catalog context)
- Customer identity verification (handled by Customer Management context)

## 10. References

- ADR-005: Distributed Transaction Strategy
- ADR-008: Event-Driven Communication
- EFI Revenue & Pricing Strategy (5-revenue-&-pricing.md)
- Context Map (context_map.puml)

## Event Storm Updates

### 2025-07-23

**New Events**
- TemperatureAlertTriggered
- ColdChainViolationDetected
- ColdChainComplianceConfirmed
- ColdChainAlertAcknowledged
- ColdChainExceptionReported
- TemperatureExceptionRecorded
- ColdChainAuditCompleted
- ColdChainAlertEscalated

**New Commands**
- MonitorColdChain
- InvestigateColdChainViolation
- ConfirmColdChainCompliance
- AcknowledgeColdChainAlert
- ReportColdChainException
- RecordTemperatureException
- CompleteColdChainAudit
- EscalateColdChainAlert

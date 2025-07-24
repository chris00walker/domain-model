# Returns Management

[RELATED: ADR-009]
[CONTEXT: Supporting]
[STATUS: Draft]
[VERSION: 1.0.0]
[OWNER: @cx-ops]

## 1. Business Context

- **Purpose**: Handle the end-to-end product return lifecycle—from customer initiation through physical processing and financial settlement—while minimising cost, fraud, and customer effort.
- **Business Capabilities**:
  - Self-service return initiation & label generation
  - Automated authorisation based on policy (30-day window, exemptions for perishables)
  - Receive & inspect returned goods with disposition decisions (donation* when safety criteria met, destroy)
  - Refund & credit processing aligned with Payment & Billing
  - Supplier chargeback workflows for defective items
- **Success Metrics**:
  - First-contact resolution rate ≥ 85 %
  - Average refund issuance time ≤ 5 business days
  - Return disposition cycle time (donation or destruction) ≤ 48 h
  - Fraudulent return rate < 0.5 % of returns
- **Domain Experts**:
<!--- agents:
  - role: Returns Manager
  - role: Warehouse Lead
  - role: Finance Analyst
  - role: QA Specialist
-->

## 2. Domain Model

- **Key Entities**: `ReturnOrder`, `ReturnItem`, `InspectionReport`, `Refund`, `Disposition`, `SupplierChargeback`
- **Aggregates**:
  - `ReturnOrder` (root) → owns return items, inspection reports, financial records
- **Value Objects**: `ReturnReason`, `ReturnStatus`, `QualityGrade`, `Money`
- **Domain Services**: `ReturnAuthorisationService`, `InspectionService`, `RefundService`
- **Domain Events**: `ReturnRequested`, `ReturnAuthorised`, `ReturnReceived`, `ReturnInspected`, `RefundIssued`, `ReturnDisposed`, `SupplierChargebackInitiated`

## 3. Functional Requirements

### 3.1 Return Initiation & Authorisation

- **FR-1**: Customers can request a return via portal or CSR within 30 days of delivery.
  - **Acceptance Criteria**:
    - [ ] Policy checks for product type (no perishables without QA approval)
    - [ ] Return label generated via carrier API
    - [ ] `ReturnRequested` event emitted

### 3.2 Receiving & Inspection

- **FR-2**: Warehouse staff scan RMA barcode and record condition.
  - **Acceptance Criteria**:
    - [ ] Inspection app supports photo upload
    - [ ] Quality grades A–D recorded; perishables get temperature check

### 3.3 Disposition & Inventory Update

- **FR-3**: System decides disposition based on inspection rules.
  - **Acceptance Criteria**:
    - [ ] Approved returns are either donated (when seal intact & cold-chain proven) or destroyed; inventory is never incremented
    - [ ] Destroy requires dual approval and waste log

### 3.4 Refund & Financial Settlement

- **FR-4**: Eligible returns trigger refund or store credit.
  - **Acceptance Criteria**:
    - [ ] Partial refunds may include handling fees
    - [ ] `RefundIssued` event published to Payment & Billing

### 3.5 Supplier Chargeback

- **FR-5**: Defective supplier goods initiate chargeback.
  - **Acceptance Criteria**:
    - [ ] Supplier notified via portal API
    - [ ] Chargeback tracked until settlement

## 4. Integration Points

### 4.1 Published Events

- `ReturnRequested` → Consumers: InventoryShelfLife, AnalyticsReporting
- `ReturnAuthorised` → Consumers: ShippingFulfillment (label), NotificationsAlerts
- `ReturnReceived` / `ReturnInspected` → Consumers: QualityControl, InventoryShelfLife
- `RefundIssued` → Consumers: PaymentBilling, AnalyticsReporting
- `SupplierChargebackInitiated` → Consumers: SupplierTraceability

### 4.2 Consumed Events

- `OrderDelivered` (ShippingFulfillment) → enable return window timer
- `PaymentCaptured` (PaymentBilling) → prerequisite for refund
- `QualityInspectionFailed` (QualityControl) → auto-authorise return beyond 30 days

### 4.3 APIs/Services

- **REST**: `/returns`, `/returns/{id}/inspection`, `/returns/{id}/refund`
- **Carrier API**: Create prepaid label (DHL, FedEx)
- **Supplier Portal**: Chargeback endpoint `/suppliers/{id}/chargebacks`

## 5. Non-Functional Requirements

- **Performance**: Authorisation API ≤ 500 ms; label generation ≤ 10 s
- **Scalability**: 5 k return requests/day peak; 100 concurrent inspections
- **Security**: ADR-009 compliant; PII redaction in photos; role-based permissions
- **Reliability**: 99.9 % uptime; offline inspection mode with sync
- **Maintainability**: Modular inspection rules; automated contract tests with OrderManagement

## 6. Open Questions

- [ ] Should cold-chain returns use IoT temperature probe during transit?
- [ ] Automate donation workflow for non-resalable but safe food items?

## 7. Out of Scope

- Forward shipment logistics (handled by Shipping & Fulfillment)
- Warranty repair process (future context)

## 8. References

- ADR-009: Data Protection Strategy
- ADR-005: Distributed Transaction Strategy
- ADR-002: Domain Event Design Patterns
- FDA Food Code 2022 (U.S. FDA)
- EU Regulation 178/2002 (General Food Law)
- Context Map (context_map.puml)

## Event Storm Updates

### 2025-07-23

**New Events**
- ReturnInitiated
- ReturnProcessed

**New Commands**
- InitiateReturn
- ProcessReturn

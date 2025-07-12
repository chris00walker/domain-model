# Batch Tracking

[RELATED: ADR-XXX]
[CONTEXT: Core]
[STATUS: Draft]
[VERSION: 1.0.0]
[OWNER: @supply-chain-team]

## 1. Business Context

- **Purpose**: Manage the complete lifecycle of product batches throughout the supply chain, ensuring traceability, quality control, and regulatory compliance for perishable goods.
- **Business Capabilities**:
  - End-to-end batch/lot tracking
  - Expiration and shelf-life management
  - Quality control integration
  - Regulatory compliance and reporting
- **Success Metrics**:
  - 100% batch traceability
  - Reduction in expired inventory
  - Compliance with food safety regulations
  - Reduction in quality incidents
- **Domain Experts**:
  - Supply Chain Manager
  - Quality Assurance Team
  - Warehouse Operations
  - Regulatory Compliance Officer

## 2. Domain Model

- **Key Entities**:
  - Batch
  - BatchEvent
  - QualityInspection
  - SupplierCertificate
  - InventoryLocation
- **Aggregates**:
  - Batch (root aggregate)
  - QualityInspection (root aggregate for quality context)
- **Value Objects**:
  - BatchNumber
  - ExpirationDate
  - StorageConditions
  - CertificateDetails
- **Domain Services**:
  - BatchCreationService
  - ExpirationManagementService
  - TraceabilityService
- **Domain Events**:
  - `BatchCreated`
  - `BatchExpired`
  - `BatchQualityHoldPlaced`
  - `BatchMoved`
  - `BatchSplit`
  - `BatchMerged`

## 3. Functional Requirements

### 3.1 Batch Creation & Management

- **FR-1**: As a warehouse operator, I want to create new batch records so that we can track products through the supply chain

  - **Acceptance Criteria**:
    - [ ] System generates unique batch numbers following [NUMBERING_SCHEMA]
    - [ ] All mandatory fields are captured (supplier, dates, quantities)
    - [ ] Batch is assigned initial status 'Received'
  - **Dependencies**: [Supplier Management PRD], [Inventory PRD]

- **FR-2**: As a quality manager, I want to place batches on quality hold so that potentially non-compliant products are not distributed
  - **Acceptance Criteria**:
    - [ ] Batch status changes to 'On Hold' with reason code
    - [ ] System prevents order fulfillment for held batches
    - [ ] Automated notifications are sent to stakeholders
  - **Dependencies**: [Quality Management PRD]

### 3.2 Expiration Management

- **FR-3**: As a warehouse manager, I want to implement FEFO (First-Expired-First-Out) picking so that we minimize product waste
  - **Acceptance Criteria**:
    - [ ] System sorts available batches by expiration date
    - [ ] Picking workflow presents oldest batches first
    - [ ] Alerts generated for batches nearing expiration
  - **Dependencies**: [Order Fulfillment PRD]

### 3.3 Traceability

- **FR-4**: As a compliance officer, I need complete batch traceability so that we can meet regulatory requirements
  - **Acceptance Criteria**:
    - [ ] System maintains complete chain of custody
    - [ ] All batch movements are logged with timestamps and users
    - [ ] Reports can be generated showing full batch history
  - **Dependencies**: [Reporting PRD]

## 4. Integration Points

### 4.1 Published Events

- `BatchCreated`

  - Payload: {batchId, productId, quantity, supplierId, productionDate, expirationDate}
  - Consumers: Inventory, Quality, Compliance

- `BatchStatusChanged`

  - Payload: {batchId, previousStatus, newStatus, reason, userId, timestamp}
  - Consumers: Inventory, Quality, Reporting

- `BatchExpiringSoon`

  - Payload: {batchId, productId, daysUntilExpiration, currentLocation}
  - Consumers: Inventory, Purchasing, Sales

- `BatchExpirationWarning`

  - Payload: {batchId, productId, warehouseId, expirationDate, daysRemaining, warningLevel}
  - Consumers: Notifications, Purchasing, PricingPromotions

- `BatchQuarantined`

  - Payload: {batchId, productId, reason, quarantinedBy, timestamp}
  - Consumers: Quality, Compliance, Inventory

- `BatchReleased`

  - Payload: {batchId, productId, releasedBy, approvals, timestamp}
  - Consumers: Inventory, Quality, Compliance

- `BatchTemperatureExcursionRecorded`
  - Payload: {batchId, locationId, minTemp, maxTemp, durationMinutes, detectedAt}
  - Consumers: Quality, Notifications

### 4.2 Consumed Events

- `InventoryReceived`

  - Source: Inventory Management
  - Action: Create new batch record and trigger quality inspection

- `QualityTestCompleted`
  - Source: Quality Management
  - Action: Update batch status based on test results

### 4.3 APIs/Services

- **REST/GraphQL**:

  - `POST /api/batches` - Create new batch
  - `GET /api/batches/{id}/history` - Get batch movement history
  - `POST /api/batches/{id}/hold` - Place batch on quality hold

- **gRPC**:

  - `BatchService` - For high-performance batch operations
  - `TraceabilityService` - For supply chain traceability

- **External Services**:
  - Supplier certificate validation service
  - Regulatory compliance databases

## 5. Non-Functional Requirements

- **Performance**:

  - Batch creation: < 500ms response time
  - Traceability queries: < 2s for 12-month history
  - Support for 1,000+ batch updates per hour

- **Scalability**:

  - Handle 10,000+ active batches
  - Support 3x seasonal volume increases
  - Multi-region deployment capability

- **Security**:

  - Role-based access control for all operations
  - Audit logging of all batch status changes
  - Data encryption for sensitive batch information
  - Compliance with [RELEVANT_REGULATIONS]

- **Reliability**:

  - 99.9% uptime for batch operations
  - Automated backups of all batch records
  - Disaster recovery RPO < 5 minutes

- **Usability**:
  - Intuitive batch search and filtering
  - Clear visualization of batch status and location
  - Mobile-friendly for warehouse operations

## 6. Open Questions

- Should we integrate with blockchain for enhanced traceability?
- What are the specific regulatory requirements for each target market?
- How should we handle batch recalls across multiple locations?

## 7. Out of Scope

- Direct integration with supplier systems (handled by Supplier Management context)
- Detailed quality test specifications (handled by Quality Management context)
- Financial reconciliation (handled by Accounting context)

## 8. References

- [Food Safety Modernization Act (FSMA)](https://www.fda.gov/food/guidance-regulation-food-and-dietary-supplements/food-safety-modernization-act-fsma)
- [EU General Food Law (Regulation (EC) No 178/2002)](https://eur-lex.europa.eu/eli/reg/2002/178/oj)
- [HACCP Principles](https://www.fda.gov/food/hazard-analysis-critical-control-point-haccp/haccp-principles-application-guidelines)
- [IFS/BRCGS Food Safety Standards](https://www.ifs-certification.com/)
- [Global Food Safety Initiative (GFSI)](https://www.mygfsi.com/)

## User Roles & Permissions

| Role                 | Permissions                                                  |
| -------------------- | ------------------------------------------------------------ |
| Warehouse Operator   | View batch info, Record receipts, Perform inventory counts   |
| Quality Inspector    | Place batches on hold, Release batches, Record test results  |
| Supply Chain Manager | Configure batch parameters, Generate reports, Manage recalls |
| Customer Service     | View batch information for customer inquiries                |

## Data Requirements

### Batch Master Data

- Batch/Lot number (unique identifier)
- Product reference
- Manufacturing date
- Expiration date
- Supplier information
- Country of origin
- Initial quantity
- Storage requirements

### Batch Transaction Data

- Movement history (date, from, to, quantity)
- Quality test results
- Temperature logs
- Status changes
- Associated documents (certificates, test results)

## Business Rules

1. **Batch Allocation**

   - Allocate oldest batches first (FEFO) unless overridden
   - Prevent allocation of expired or on-hold batches
   - Allow manual override with authorization

2. **Quality Management**

   - Automatic hold on receipt for inspection if required
   - Prevent shipment of quarantined batches
   - Require quality approval for release from hold

3. **Traceability**

   - Maintain complete history of all batch movements
   - Support full traceability within 4 hours for regulatory requests
   - Retain batch records for required retention period

4. **Temperature Control & Cold-Chain Compliance**

   - All temperature-sensitive batches **must** be stored within their specified temperature range (see `StorageConditions`).
   - Continuous temperature monitoring is required; any excursion ≥ 5 minutes outside the range triggers an alert and emits `BatchTemperatureExcursionRecorded`.
   - Temperature logs are retained for a minimum of 3 years for compliance (FDA, EU 178/2002).

5. **Expiration Alerts & Disposition**

   - System emits `BatchExpirationWarning` 30, 14 and 7 days before `expirationDate`.
   - Batches reaching 75 % of shelf life are flagged for promotion pricing review.
   - Expired products are automatically quarantined and cannot be allocated or shipped until disposed.

6. **Enhanced Quarantine Rules**
   - Batches may be quarantined due to quality failure, temperature excursion, or regulatory hold → emits `BatchQuarantined`.
   - Release from quarantine requires dual approval (Quality & Compliance) → emits `BatchReleased`.

## Non-Functional Requirements

1. **Performance**

   - Support batch lookups in < 2 seconds
   - Handle 1000+ batch updates per minute
   - Support 10,000+ concurrent users

2. **Availability**

   - 99.9% uptime during business hours
   - Graceful degradation during peak loads

3. **Security**
   - Role-based access control for all batch operations
   - Audit logging of all batch status changes
   - Data encryption for sensitive batch information

## Related Documents

- [Inventory Management](./inventory.md)
- [Quality Control](./quality_control.md)
- [Supplier Traceability](./supplier_traceability.md)

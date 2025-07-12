# Quality Control

[RELATED: ADR-XXX]
[CONTEXT: Core]
[STATUS: Draft]
[VERSION: 1.0.0]
[OWNER: @quality-team]

## 1. Business Context
- **Purpose**: Ensure all products meet established quality standards throughout the supply chain by providing comprehensive tools for inspection, testing, compliance management, and continuous improvement, with special emphasis on perishable goods and regulatory requirements.
- **Business Capabilities**:
  - Quality planning and standards management
  - Inspection and testing workflows
  - Non-conformance and CAPA management
  - Regulatory compliance and reporting
  - Supplier quality management
  - Quality analytics and continuous improvement
- **Success Metrics**:
  - First-pass yield > 98%
  - CAPA completion rate > 95%
  - Reduction in quality incidents by 30% YoY
  - Regulatory inspection readiness score > 95%
  - Supplier quality performance > 98% on-time delivery with zero defects
- **Domain Experts**:
  - Quality Assurance Managers
  - Quality Control Technicians
  - Regulatory Compliance Specialists
  - Production Supervisors
  - Supplier Quality Engineers

## 2. Domain Model
- **Key Entities**:
  - QualitySpecification (root aggregate)
  - InspectionPlan
  - QualityTest
  - NonConformanceReport
  - CorrectiveAction
  - QualityDocument
- **Aggregates**:
  - QualitySpecification (root aggregate)
  - NonConformance (root aggregate)
  - QualityDocument (root aggregate)
- **Value Objects**:
  - QualityParameter
  - TestResult
  - InspectionCriteria
  - Disposition
  - ComplianceStatus
- **Domain Services**:
  - InspectionService
  - CAPAManagementService
  - ComplianceService
  - DocumentControlService
  - SupplierQualityService
- **Domain Events**:
  - `QualityInspectionScheduled`
  - `QualityTestPerformed`
  - `NonConformanceReported`
  - `QualityHoldPlaced`
  - `QualityHoldReleased`
  - `CAPAInitiated`
  - `CAPACompleted`
  - `RegulatoryInspectionScheduled`
  - `RegulatoryFindingReported`
  - `ProductAuthenticated`
  - `AuthenticationFailed`
  - `ProductQuarantined`
  - `ProvenanceVerified`
  - `CounterfeitDetected`

## 3. Functional Requirements
### 3.1 Quality Planning & Standards
- **FR-1**: As a quality manager, I want to define and maintain quality specifications so that all products meet required standards
  - **Acceptance Criteria**:
    - [ ] Support hierarchical quality parameters by product category
    - [ ] Define acceptable tolerance levels with measurement units
    - [ ] Configure sampling plans using AQL standards
    - [ ] Version control for all quality specifications
  - **Dependencies**: [Product Catalog PRD], [Regulatory Compliance PRD]

- **FR-2**: As a quality engineer, I want to create inspection plans so that we ensure consistent quality checks
  - **Acceptance Criteria**:
    - [ ] Define inspection points in the production process
    - [ ] Configure required tests and acceptance criteria
    - [ ] Assign inspection frequencies and sample sizes
    - [ ] Integrate with production scheduling
  - **Dependencies**: [Production Planning PRD], [Work Instructions PRD]

### 3.2 Inspection & Testing
- **FR-3**: As a quality technician, I want to perform inspections so that I can verify product quality
  - **Acceptance Criteria**:
    - [ ] Mobile-friendly inspection interface
    - [ ] Support for various test methods (visual, measurement, etc.)
    - [ ] Immediate notification of out-of-spec results
    - [ ] Digital signature for inspection approval
  - **Dependencies**: [Mobile App PRD], [Device Integration PRD]

- **FR-4**: As a quality manager, I want to monitor quality metrics so that I can identify trends and issues
  - **Acceptance Criteria**:
    - [ ] Real-time quality dashboards
    - [ ] Statistical process control (SPC) charts
    - [ ] Customizable quality reports
    - [ ] Automated alerts for quality trends
  - **Dependencies**: [Analytics PRD], [Reporting PRD]

### 3.3 Non-Conformance Management
- **FR-5**: As a quality engineer, I want to manage non-conformances so that I can drive continuous improvement
  - **Acceptance Criteria**:
    - [ ] Categorize non-conformances by type and severity
    - [ ] Track root cause analysis (RCA) process
    - [ ] Manage corrective and preventive actions (CAPA)
    - [ ] Monitor effectiveness of corrective actions
  - **Dependencies**: [Incident Management PRD], [Supplier Management PRD]


### 3.4 Product Authentication & Provenance Verification
This sub-function verifies product authenticity and provenance, ensuring imported goods are genuine and compliant.

#### Business Rules
- Every imported product includes at least one verifiable authentication marker (QR, NFC, hologram).
- All authentication scans are logged with timestamp, location, operator, and result.
- Authentication failure immediately places the associated batch in **Quarantine** with investigation workflow.
- Verified products must maintain an immutable provenance record linking all supply-chain hops.
- System must sustain ≥ 99.5 % authentication success rate.
- Counterfeit detection algorithms must achieve ≥ 98 % detection accuracy.
- Products in *Quarantine* status are blocked from sale or allocation.

#### Success Metrics (Authentication)
| Metric | Target |
|--------|--------|
| Authentication Scan Success Rate | ≥ 99.5 % |
| Counterfeit Detection Accuracy | ≥ 98 % |
| Avg. Authentication Processing Time | < 2 s |
| Provenance Record Completeness | ≥ 99.8 % |
| Verified Counterfeits Reaching Customers | 0 |

---

## 4. Integration Points
### 4.1 Published Events
- `QualityTestCompleted`
  - Payload: {testId, productId, batchNumber, testType, result, status, timestamp}
  - Consumers: Inventory, Production, Supplier Management

- `NonConformanceReported`
  - Payload: {ncId, type, severity, productId, batchNumber, description, reporter, timestamp}
  - Consumers: Production, Supplier Management, Customer Service

- `CAPAInitiated`
  - Payload: {capaId, ncId, description, owner, dueDate, priority, timestamp}
  - Consumers: Operations, Engineering, Supplier Management

- `ProductAuthenticated`
  - Payload: {productId, batchNumber, markerId, method, timestamp}
  - Consumers: Catalog, Inventory

- `AuthenticationFailed`
  - Payload: {productId, batchNumber, markerId, failureReason, timestamp}
  - Consumers: Inventory, Notifications, Compliance

- `ProductQuarantined`
  - Payload: {productId, batchNumber, reason, timestamp}
  - Consumers: Inventory, Reporting

- `ProvenanceVerified`
  - Payload: {productId, provenanceId, verificationMethod, timestamp}
  - Consumers: Catalog, Marketing

- `CounterfeitDetected`
  - Payload: {productId, detectionScore, algorithmVersion, timestamp}
  - Consumers: Notifications, Compliance, Reporting

### 4.2 Consumed Events
- `BatchProduced`
  - Source: Production
  - Action: Trigger required quality inspections

- `GoodsReceived`
  - Source: Inventory
  - Action: Schedule incoming inspection & trigger authentication scan

- `CustomerComplaintReceived`
  - Source: Customer Service
  - Action: Initiate quality investigation

### 4.3 APIs/Services
- **REST/GraphQL**:
  - `POST /api/quality/inspections` - Record inspection results
  - `GET /api/quality/nonconformances` - Retrieve non-conformance reports
  - `POST /api/quality/capa` - Create or update CAPA
  - `GET /api/quality/metrics` - Retrieve quality metrics

- **gRPC**:
  - `QualityInspectionService` - Manage inspection workflows
  - `NonConformanceService` - Handle quality issues
  - `DocumentControlService` - Manage quality documents

- **External Services**:
  - Laboratory Information Management Systems (LIMS)
  - Regulatory compliance databases
  - Supplier quality portals
  - Document management systems

## 5. Non-Functional Requirements
- **Compliance**:
  - 21 CFR Part 11, ISO 9001, FSMA, GMP compliance
  - Electronic signatures with audit trail
  - Data integrity controls (ALCOA+)
  - Regulatory reporting capabilities
  - Document retention policies

- **Performance**:
  - Support 500+ concurrent users
  - Sub-200ms response time for critical operations
  - Batch processing of quality data
  - Handle large file attachments (test reports, images)

- **Security**:
  - Role-based access control (RBAC)
  - Data encryption at rest and in transit
  - Comprehensive audit logging
  - Secure document storage
  - Multi-factor authentication for critical operations

- **Reliability**:
  - 99.99% system availability
  - Automated backups and disaster recovery
  - Data consistency across distributed systems
  - Graceful degradation under load

- **Usability**:
  - Intuitive user interface
  - Mobile-responsive design
  - Configurable dashboards and reports
  - Context-sensitive help and guidance
  - Multi-language support

## 6. Open Questions
- How should we integrate with third-party laboratory testing services?
- What are the specific regulatory requirements for different export markets?
- How can we leverage AI/ML for predictive quality analytics?

## 7. Out of Scope
- Product design and development (handled by R&D)
- Supplier certification and onboarding (handled by Supplier Management)
- Employee training and certification (handled by HR/LMS)
- Customer complaint management (handled by Customer Service)

## 8. References
- [ISO 9001:2015 Quality Management Systems](https://www.iso.org/standard/62085.html)
- [21 CFR Part 11 - Electronic Records; Electronic Signatures](https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/CFRSearch.cfm?CFRPart=11)
- [FSMA Final Rule on Preventive Controls for Human Food](https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-preventive-controls-human-food)
- [Good Manufacturing Practice (GMP) Guidelines](https://www.fda.gov/drugs/pharmaceutical-quality-resources/good-manufacturing-practices-cgmp-regulations)
- [ALCOA+ Principles for Data Integrity](https://www.fda.gov/files/drugs/published/Data-Integrity-and-Compliance-With-Drug-CGMP--Questions-and-Answers-Guidance-for-Industry.pdf)

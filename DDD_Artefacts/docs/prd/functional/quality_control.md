# Quality Control

[RELATED: ADR-XXX]

## Overview

> **Status:** Draft — auto-normalised. Update with meaningful content.

## Functional Requirements

> _TBD – add detailed requirements here._

## Benefits

> Establishes consistent documentation and enables lint compliance.


The Quality Control module ensures that all products meet established quality standards throughout the supply chain. It provides tools for inspection, testing, and compliance management, with special emphasis on perishable goods and regulatory requirements.

## Core Capabilities

### 1. Quality Planning
- **Quality Standards**
  - Define quality parameters by product category
  - Set acceptable tolerance levels for various attributes
  - Configure sampling plans and AQL (Acceptable Quality Levels)
  - Document quality control procedures and work instructions

- **Specification Management**
  - Maintain product specifications and quality requirements
  - Manage specification versions and effective dating
  - Link specifications to regulatory requirements
  - Define critical control points (CCPs) for HACCP compliance

### 2. Inspection & Testing
- **Incoming Inspection**
  - Schedule and perform quality checks on received goods
  - Document inspection results and non-conformances
  - Apply quality holds and release decisions
  - Generate certificates of analysis (CoA)

- **In-Process Inspection**
  - Monitor quality at critical production stages
  - Perform line checks and process validations
  - Track process capability indices (CpK, PpK)
  - Implement statistical process control (SPC)

- **Finished Goods Testing**
  - Conduct final quality verification before shipment
  - Perform shelf-life testing and stability studies
  - Manage retention samples
  - Document test results and release decisions

### 3. Non-Conformance Management
- **Deviation Handling**
  - Record and classify quality deviations
  - Initiate and track corrective and preventive actions (CAPA)
  - Manage customer complaints and quality incidents
  - Document root cause analysis (RCA) findings

- **Disposition Management**
  - Process quality holds and material review boards (MRB)
  - Manage rework and reprocessing operations
  - Document product dispositions (use as-is, rework, reject, return)
  - Track quality-related costs and waste

## Domain Events

### Quality Events
- `QualityInspectionScheduled`: Quality check has been scheduled
- `QualityTestPerformed`: Test results have been recorded
- `NonConformanceReported`: Quality issue has been identified
- `QualityHoldPlaced`: Material placed on quality hold
- `QualityHoldReleased`: Material released from quality hold
- `CAPAInitiated`: Corrective action process started
- `CAPACompleted`: Corrective action process completed
- `QualityAlertRaised`: Critical quality issue detected
- `RegulatoryInspectionScheduled`: Regulatory audit or inspection scheduled
- `RegulatoryFindingReported`: Regulatory non-compliance identified

## Integration Points

### Internal Integrations
- **Inventory Management**: Place and release quality holds
- **Batch Tracking**: Associate quality data with specific batches
- **Supplier Management**: Track supplier quality performance
- **Production Planning**: Schedule quality checks in production
- **Cold Chain Monitoring**: Validate temperature compliance

### External Integrations
- **Regulatory Systems**: Report quality data to authorities
- **Laboratory Information Systems (LIMS)**: Exchange test results
- **Supplier Portals**: Share quality requirements and findings
- **Customer Portals**: Provide quality documentation

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| Quality Technician | Perform inspections, Record test results, Initiate deviations |
| Quality Engineer | Approve test results, Authorize dispositions, Manage CAPA |
| Quality Manager | Define quality standards, Review quality metrics, Approve exceptions |
| Production Staff | View quality requirements, Report issues, Perform rework |
| Supplier Quality | Manage supplier quality, Conduct audits, Approve suppliers |

## Data Requirements

### Quality Master Data
- Product specifications and quality parameters
- Testing methods and procedures
- Quality standards and regulatory requirements
- Supplier quality agreements
- Customer quality requirements

### Quality Transaction Data
- Inspection and test results
- Non-conformance reports
- CAPA records
- Audit findings and observations
- Quality metrics and KPIs

## Business Rules

1. **Inspection Rules**
   - Mandatory inspection for first article and process changes
   - Automatic hold for out-of-specification (OOS) results
   - Escalation for repeated quality issues
   - Approval requirements for quality exceptions

2. **Document Control**
   - Version control for all quality documents
   - Electronic signatures for approvals
   - Retention according to regulatory requirements
   - Controlled access to quality records

3. **Supplier Quality**
   - Scorecard-based supplier evaluation
   - Minimum quality requirements for supplier approval
   - Escalation for supplier quality issues
   - Supplier corrective action requests (SCAR)

## Non-Functional Requirements

1. **Compliance**
   - Support for 21 CFR Part 11, ISO 9001, FSMA, GMP
   - Electronic signature with audit trail
   - Data integrity controls (ALCOA+ principles)
   - Regulatory reporting capabilities

2. **Performance**
   - Support 500+ concurrent quality transactions
   - Sub-second response time for quality record retrieval
   - Batch processing of quality data
   - Support for large file attachments (e.g., test reports, images)

3. **Security**
   - Role-based access control
   - Data encryption at rest and in transit
   - Audit logging of all quality transactions
   - Secure storage of sensitive quality data

## Related Documents
- [Batch Tracking](./batch_tracking.md)
- [Cold Chain Monitoring](./cold_chain.md)
- [Inventory Management](./inventory.md)
- [Supplier Traceability](./supplier_traceability.md)

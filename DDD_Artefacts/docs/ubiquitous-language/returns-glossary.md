# Returns Context Glossary

Generated: 2025-07-21T13:40:29-03:00

## Purpose

This glossary defines terms specific to the Returns bounded context, focusing on return request processing, refund management, and customer satisfaction for product returns and exchanges.

## Context Overview

- **Business Purpose**: Handle product returns efficiently while maintaining customer satisfaction
- **Core Responsibility**: Return processing, refund management, and return policy enforcement
- **Key Metrics**: Return processing time <48h, Customer satisfaction ≥90%, Return fraud <2%
- **Integration Points**: Order Management, Customer Management, Inventory Management, Finance

## Aggregates

### ReturnRequest

- **Definition**: Central aggregate representing a customer request to return products with processing details and resolution
- **Implementation**: `ReturnRequest` class extends AggregateRoot
- **Properties**:
  - **returnId**: Unique return request identifier
  - **returnNumber**: Human-readable return number
  - **customerId**: Reference to requesting customer
  - **originalOrderId**: Reference to original order
  - **requestDate**: When return was requested
  - **returnReason**: Reason for return request
  - **returnType**: Type of return (refund, exchange, credit)
  - **returnItems**: Items being returned
  - **returnStatus**: Current return status
  - **returnMethod**: How items will be returned
  - **refundAmount**: Total refund amount
  - **restockingFee**: Any restocking fees applied
  - **shippingCosts**: Return shipping costs
  - **processedBy**: Staff member processing return
  - **processedDate**: When return was processed
  - **notes**: Additional notes and comments
- **Responsibilities**:
  - Return request validation and processing
  - Refund calculation and authorization
  - Status tracking and customer communication
  - Policy compliance verification
- **Business Rules**:
  - Returns must be within policy time limits
  - Items must be in returnable condition
  - Refund amounts calculated according to policy
  - Customer communication at each status change
- **Related Terms**: ReturnId, ReturnReason, ReturnType, ReturnStatus

### ReturnItem

- **Definition**: Aggregate representing individual item within a return request with condition assessment and disposition
- **Implementation**: `ReturnItem` class extends AggregateRoot
- **Properties**:
  - **returnItemId**: Unique return item identifier
  - **returnId**: Reference to parent return request
  - **originalOrderItemId**: Reference to original order item
  - **productId**: Reference to returned product
  - **quantityReturned**: Quantity being returned
  - **unitPrice**: Original unit price
  - **refundAmount**: Refund amount for this item
  - **itemCondition**: Condition of returned item
  - **returnReason**: Specific reason for returning this item
  - **disposition**: What happens to returned item
  - **inspectionNotes**: Notes from item inspection
  - **inspectedBy**: Staff member who inspected item
  - **inspectionDate**: When item was inspected
  - **restockable**: Whether item can be restocked
- **Responsibilities**:
  - Item condition assessment
  - Refund amount calculation
  - Disposition determination
  - Inspection tracking
- **Business Rules**:
  - Items inspected upon receipt
  - Condition affects refund amount and disposition
  - Restockable items returned to inventory
  - Damaged items handled according to policy
- **Related Terms**: ReturnItemId, ItemCondition, ItemDisposition, InspectionNotes

## Value Objects

### ReturnId

- **Definition**: Unique identifier for return requests
- **Implementation**: `ReturnId` value object
- **Format**: UUID-based string identifier
- **Usage**: Internal tracking, customer references, audit trails
- **Business Rules**:
  - Globally unique across all returns
  - Immutable once assigned
  - Used for customer service and tracking
- **Related Terms**: ReturnRequest, UniqueEntityID

### ReturnReason

- **Definition**: Reason why customer is returning product
- **Implementation**: `ReturnReason` enum
- **Reasons**:
  - **DEFECTIVE_PRODUCT**: Product was defective or damaged
  - **WRONG_ITEM**: Wrong item shipped
  - **NOT_AS_DESCRIBED**: Product not as described
  - **QUALITY_ISSUE**: Product quality below expectations
  - **EXPIRED_PRODUCT**: Product expired or near expiration
  - **DAMAGED_SHIPPING**: Product damaged during shipping
  - **CHANGED_MIND**: Customer changed mind
  - **DUPLICATE_ORDER**: Duplicate order placed by mistake
  - **SIZE_FIT_ISSUE**: Size or fit not suitable
  - **ALLERGIC_REACTION**: Customer allergic to product
  - **TASTE_PREFERENCE**: Product taste not preferred
  - **BETTER_PRICE_FOUND**: Found better price elsewhere
- **Business Rules**:
  - Reason affects return policy application
  - Some reasons qualify for full refund
  - Quality issues trigger supplier feedback
  - Defective products may require investigation
- **Related Terms**: ReturnPolicy, RefundEligibility, QualityFeedback

### ReturnType

- **Definition**: Type of resolution requested for return
- **Implementation**: `ReturnType` enum
- **Types**:
  - **REFUND**: Full or partial monetary refund
  - **EXCHANGE**: Exchange for different product
  - **STORE_CREDIT**: Credit applied to customer account
  - **REPLACEMENT**: Replacement of same product
  - **REPAIR**: Product repair if applicable
  - **PARTIAL_REFUND**: Partial refund with item retention
- **Business Rules**:
  - Type availability depends on return reason
  - Exchange requires product availability
  - Store credit may have expiration dates
  - Replacement for defective items prioritized
- **Related Terms**: RefundType, ExchangeEligibility, StoreCreditPolicy

### ReturnStatus

- **Definition**: Current status of return request in processing workflow
- **Implementation**: `ReturnStatus` enum
- **Statuses**:
  - **REQUESTED**: Return requested by customer
  - **APPROVED**: Return request approved
  - **REJECTED**: Return request rejected
  - **RETURN_LABEL_SENT**: Return shipping label sent
  - **IN_TRANSIT**: Items being returned to warehouse
  - **RECEIVED**: Items received at warehouse
  - **INSPECTING**: Items being inspected
  - **PROCESSING**: Return being processed
  - **REFUND_ISSUED**: Refund issued to customer
  - **EXCHANGE_SHIPPED**: Exchange item shipped
  - **COMPLETED**: Return fully completed
  - **CANCELLED**: Return cancelled by customer
- **Status Transitions**:
  - REQUESTED → APPROVED/REJECTED (policy evaluation)
  - APPROVED → RETURN_LABEL_SENT (shipping arranged)
  - RETURN_LABEL_SENT → IN_TRANSIT (customer ships)
  - IN_TRANSIT → RECEIVED (warehouse receives)
  - RECEIVED → INSPECTING → PROCESSING (inspection and processing)
  - PROCESSING → REFUND_ISSUED/EXCHANGE_SHIPPED (resolution)
- **Business Rules**:
  - Status changes trigger customer notifications
  - Processing time limits enforced
  - Automatic status updates where possible
  - Manual intervention for complex cases
- **Related Terms**: StatusTransition, ProcessingWorkflow, CustomerNotification

### ItemCondition

- **Definition**: Assessed condition of returned item upon inspection
- **Implementation**: `ItemCondition` enum
- **Conditions**:
  - **NEW**: Item in new, unopened condition
  - **LIKE_NEW**: Item opened but in excellent condition
  - **GOOD**: Item in good condition with minor wear
  - **FAIR**: Item in fair condition with noticeable wear
  - **POOR**: Item in poor condition, significant damage
  - **DEFECTIVE**: Item defective or not functioning
  - **EXPIRED**: Item past expiration date
  - **DAMAGED**: Item damaged during return shipping
  - **UNSELLABLE**: Item cannot be resold
- **Business Rules**:
  - Condition affects refund amount
  - NEW and LIKE_NEW items eligible for full refund
  - DEFECTIVE items trigger quality investigation
  - UNSELLABLE items disposed of appropriately
- **Related Terms**: RefundCalculation, RestockEligibility, QualityInvestigation

### ItemDisposition

- **Definition**: What happens to returned item after processing
- **Implementation**: `ItemDisposition` enum
- **Dispositions**:
  - **RESTOCK**: Return to sellable inventory
  - **CLEARANCE**: Sell at discounted price
  - **DONATE**: Donate to charity
  - **DISPOSE**: Dispose of item appropriately
  - **RETURN_TO_SUPPLIER**: Return to supplier
  - **QUARANTINE**: Hold for quality investigation
  - **REPAIR**: Repair and return to inventory
  - **SAMPLE**: Use as sample or display
- **Business Rules**:
  - Disposition based on item condition and policy
  - Food items have specific disposal requirements
  - Valuable items may be returned to supplier
  - Quarantined items investigated before disposition
- **Related Terms**: InventoryManagement, QualityInvestigation, SupplierReturn

## Domain Services

### ReturnPolicyService

- **Definition**: Service managing return policy rules and eligibility determination
- **Implementation**: `ReturnPolicyService` domain service
- **Responsibilities**:
  - Return eligibility evaluation
  - Policy rule application
  - Refund amount calculation
  - Exception handling and approval
- **Policy Rules**:
  - Time limits enforced for return eligibility
  - Product categories have different policies
  - Customer history affects return privileges
  - Exceptions require management approval
- **Related Terms**: PolicyEvaluation, EligibilityRules, ExceptionHandling

### ReturnProcessingService

- **Definition**: Service coordinating return processing workflow and resolution
- **Implementation**: `ReturnProcessingService` domain service
- **Responsibilities**:
  - Return workflow orchestration
  - Item inspection coordination
  - Refund processing
  - Inventory disposition management
- **Processing Rules**:
  - Items inspected before refund processing
  - Refunds processed according to original payment method
  - Inventory updates coordinated with disposition
  - Customer notifications sent at key milestones
- **Related Terms**: WorkflowOrchestration, RefundProcessing, InventoryDisposition

### FraudDetectionService

- **Definition**: Service detecting and preventing return fraud and abuse
- **Implementation**: `FraudDetectionService` domain service
- **Responsibilities**:
  - Return pattern analysis
  - Fraud indicator detection
  - Risk scoring and flagging
  - Investigation coordination
- **Detection Rules**:
  - Excessive return frequency flagged
  - High-value returns require additional verification
  - Pattern analysis identifies potential fraud
  - Flagged returns require manual review
- **Related Terms**: FraudPrevention, RiskScoring, PatternAnalysis

## Domain Events

### ReturnRequested

- **Definition**: Published when customer submits return request
- **Implementation**: `ReturnRequested` extends DomainEvent
- **Payload**: Return ID, customer ID, order ID, return reason, items, timestamp
- **Consumers**: Customer Service, Inventory Management, Analytics, Notification Service
- **Business Impact**: Return processing initiation, customer service tracking, analytics

### ReturnApproved

- **Definition**: Published when return request is approved for processing
- **Implementation**: `ReturnApproved` extends DomainEvent
- **Payload**: Return ID, approval reason, return label info, estimated refund, timestamp
- **Consumers**: Shipping Service, Customer Notifications, Analytics, Inventory Management
- **Business Impact**: Return label generation, customer notification, inventory planning

### RefundIssued

- **Definition**: Published when refund is issued to customer
- **Implementation**: `RefundIssued` extends DomainEvent
- **Payload**: Return ID, customer ID, refund amount, payment method, timestamp
- **Consumers**: Finance, Customer Management, Analytics, Notification Service
- **Business Impact**: Financial reconciliation, customer account updates, satisfaction tracking

### ItemRestocked

- **Definition**: Published when returned item is restocked to inventory
- **Implementation**: `ItemRestocked` extends DomainEvent
- **Payload**: Return item ID, product ID, quantity, condition, location, timestamp
- **Consumers**: Inventory Management, Analytics, Quality Control, Product Catalog
- **Business Impact**: Inventory level updates, availability restoration, quality tracking

## Repository Interfaces

### IReturnRequestRepository

- **Definition**: Persistence contract for return request aggregates
- **Implementation**: `IReturnRequestRepository` interface
- **Standard Operations**:
  - `findById(id: ReturnId): Promise<ReturnRequest | null>`
  - `save(returnRequest: ReturnRequest): Promise<void>`
  - `findByCustomerId(customerId: CustomerId): Promise<ReturnRequest[]>`
- **Specialized Queries**:
  - `findByStatus(status: ReturnStatus): Promise<ReturnRequest[]>`
  - `findByOrderId(orderId: OrderId): Promise<ReturnRequest[]>`
  - `findPendingReturns(): Promise<ReturnRequest[]>`
  - `findByDateRange(start: Date, end: Date): Promise<ReturnRequest[]>`
- **Business Rules**: All operations return Result pattern for error handling

### IReturnItemRepository

- **Definition**: Persistence contract for return item aggregates
- **Implementation**: `IReturnItemRepository` interface
- **Standard Operations**:
  - `findById(id: ReturnItemId): Promise<ReturnItem | null>`
  - `save(returnItem: ReturnItem): Promise<void>`
  - `findByReturnId(returnId: ReturnId): Promise<ReturnItem[]>`
- **Specialized Queries**:
  - `findByProductId(productId: ProductId): Promise<ReturnItem[]>`
  - `findByCondition(condition: ItemCondition): Promise<ReturnItem[]>`
  - `findByDisposition(disposition: ItemDisposition): Promise<ReturnItem[]>`
  - `findPendingInspection(): Promise<ReturnItem[]>`
- **Business Rules**: Items linked to parent return requests

## Business Rules & Constraints

### Return Policy Rules

1. **Time Limits**: Returns must be requested within policy time limits
2. **Condition Requirements**: Items must meet condition requirements for returns
3. **Original Packaging**: Some items require original packaging for returns
4. **Proof of Purchase**: Valid proof of purchase required for all returns
5. **Category Restrictions**: Certain product categories may not be returnable

### Processing Rules

1. **Inspection Required**: All returned items must be inspected
2. **Refund Calculation**: Refunds calculated based on condition and policy
3. **Processing Time**: Returns processed within specified time limits
4. **Customer Communication**: Customers notified at key processing milestones
5. **Documentation**: Complete documentation maintained for all returns

### Fraud Prevention Rules

1. **Pattern Monitoring**: Return patterns monitored for potential fraud
2. **Verification Requirements**: High-value returns require additional verification
3. **Account Limits**: Customer accounts may have return limits
4. **Investigation Procedures**: Suspected fraud triggers investigation procedures
5. **Blacklist Management**: Fraudulent customers may be blacklisted

## Integration Patterns

### Inbound Events (Consumed)

- **OrderCompleted** (Order Management) → Enable return eligibility
- **PaymentProcessed** (Billing) → Link refund to original payment
- **InventoryReceived** (Inventory Management) → Process returned items
- **CustomerUpdated** (Customer Management) → Update return privileges

### Outbound Events (Published)

- **ReturnRequested** → Customer Service for support tracking
- **RefundIssued** → Finance for accounting reconciliation
- **ItemRestocked** → Inventory Management for stock updates
- **ReturnApproved** → Shipping Service for return label generation

### Service Dependencies

- **Payment Service**: Refund processing and payment method handling
- **Shipping Service**: Return label generation and tracking
- **Inventory Service**: Item disposition and restocking
- **Customer Service**: Customer communication and support
- **Quality Service**: Defective item investigation and feedback

## Anti-Corruption Patterns

### Payment Gateway Integration

- **Payment Gateway Refund Response** → Internal refund status
- **Payment Method Data** → Internal payment information
- **Transaction Details** → Internal financial records

### Shipping Service Integration

- **Shipping Label Format** → Internal return shipping data
- **Tracking Information** → Internal return status updates
- **Delivery Confirmation** → Internal receipt confirmation

## Context Boundaries

### What's Inside This Context

- Return request processing and management
- Item inspection and condition assessment
- Refund calculation and processing
- Return policy enforcement
- Fraud detection and prevention

### What's Outside This Context

- Original order processing and fulfillment
- Customer account management
- Inventory stock level management
- Payment processing infrastructure
- Shipping and logistics operations

### Integration Points

- **Order Management**: Original order information and return eligibility
- **Customer Management**: Customer information and return history
- **Inventory Management**: Item restocking and disposition
- **Finance**: Refund processing and financial reconciliation
- **Quality Control**: Defective item investigation and supplier feedback

This glossary ensures consistent terminology within the Returns context while maintaining clear boundaries and integration patterns with other bounded contexts.

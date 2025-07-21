# Shipping & Fulfillment Context Glossary

Generated: 2025-07-21T12:19:38-03:00

## Purpose

This glossary defines terms specific to the Shipping & Fulfillment bounded context, focusing on order fulfillment, delivery logistics, and shipment tracking.

## Context Overview

- **Business Purpose**: Efficiently fulfill orders through optimized picking, packing, and delivery operations

- **Core Responsibility**: Physical order fulfillment from warehouse to customer delivery

- **Key Metrics**: Fulfillment accuracy ≥98%, On-time delivery ≥95%, Damage rate <1%

- **Integration Points**: Order Management, Inventory Management, Customer Management, Logistics Partners

## Aggregates

### Shipment

- **Definition**: Central aggregate representing the physical delivery of one or more orders to a customer

- **Implementation**: `Shipment` class extends AggregateRoot

- **Properties**:

  - **shipmentId**: Unique shipment identifier

  - **orderId**: Reference to originating order

  - **customerId**: Reference to receiving customer

  - **shipmentStatus**: Current delivery status

  - **shippingAddress**: Delivery destination

  - **trackingNumber**: Carrier tracking reference

  - **carrier**: Delivery service provider

  - **shippingMethod**: Delivery speed and service level

  - **packagedAt**: When shipment was prepared

  - **shippedAt**: When shipment left facility

  - **estimatedDeliveryDate**: Expected delivery date

  - **actualDeliveryDate**: Actual delivery date

  - **deliveryInstructions**: Special delivery notes

- **Responsibilities**:

  - Shipment lifecycle management (prepared → shipped → delivered)

  - Tracking number generation and management

  - Delivery status updates and notifications

  - Carrier coordination and communication

  - Delivery confirmation and proof of delivery

- **Business Rules**:

  - One shipment per order (default, can be split)

  - Tracking number required before shipping

  - Status updates must follow logical sequence

  - Delivery confirmation required for completion

  - Special handling for perishable items

- **Related Terms**: ShipmentId, ShipmentStatus, TrackingNumber, Carrier

### FulfillmentOrder

- **Definition**: Aggregate representing the warehouse fulfillment process for an order

- **Implementation**: `FulfillmentOrder` class extends AggregateRoot

- **Properties**:

  - **fulfillmentOrderId**: Unique fulfillment identifier

  - **orderId**: Reference to customer order

  - **warehouseId**: Fulfilling warehouse location

  - **fulfillmentStatus**: Current fulfillment status

  - **pickingList**: Items to be picked from inventory

  - **packingInstructions**: Special packing requirements

  - **assignedPicker**: Staff member assigned to pick

  - **pickedAt**: When picking was completed

  - **packedAt**: When packing was completed

  - **shippedAt**: When shipment was dispatched

- **Responsibilities**:

  - Order-to-fulfillment conversion

  - Picking list generation and optimization

  - Staff assignment and workload management

  - Quality control and accuracy verification

  - Packing and shipping preparation

- **Business Rules**:

  - All items must be available before fulfillment starts

  - Picking accuracy must be verified

  - Cold chain items require special handling

  - Quality checks mandatory before packing

  - Fragile items need protective packaging

- **Related Terms**: FulfillmentOrderId, PickingList, PackingInstructions

## Value Objects

### ShipmentId

- **Definition**: Unique identifier for shipments across all EFI systems

- **Implementation**: `ShipmentId` value object

- **Format**: UUID-based string identifier

- **Usage**: Internal tracking, carrier integration, customer communication

- **Business Rules**:

  - Globally unique across all shipment types

  - Immutable once assigned

  - Used for carrier API integration

- **Related Terms**: Shipment, UniqueEntityID

### ShipmentStatus

- **Definition**: Current state of shipment in its delivery lifecycle

- **Implementation**: `ShipmentStatus` enum

- **States**:

  - **PREPARING**: Items being picked and packed

  - **READY_TO_SHIP**: Packed and ready for carrier pickup

  - **SHIPPED**: Dispatched with carrier, in transit

  - **OUT_FOR_DELIVERY**: On delivery vehicle for final delivery

  - **DELIVERED**: Successfully delivered to customer

  - **DELIVERY_FAILED**: Delivery attempted but failed

  - **RETURNED**: Shipment returned to sender

  - **CANCELLED**: Shipment cancelled before dispatch

- **State Transitions**:

  - PREPARING → READY_TO_SHIP (packing completed)

  - READY_TO_SHIP → SHIPPED (carrier pickup)

  - SHIPPED → OUT_FOR_DELIVERY (local delivery hub)

  - OUT_FOR_DELIVERY → DELIVERED (successful delivery)

  - OUT_FOR_DELIVERY → DELIVERY_FAILED (delivery attempt failed)

  - DELIVERY_FAILED → OUT_FOR_DELIVERY (retry delivery)

  - Any state → CANCELLED (before delivery)

- **Business Rules**:

  - Status changes trigger domain events

  - Some transitions are irreversible

  - Failed deliveries allow retry attempts

- **Related Terms**: ShipmentStatusChanged, DeliveryAttempt

### TrackingNumber

- **Definition**: Unique identifier provided by carrier for shipment tracking

- **Implementation**: `TrackingNumber` value object

- **Format**: Carrier-specific format (varies by provider)

- **Generation**: Obtained from carrier API during shipment creation

- **Usage**: Customer tracking, carrier communication, delivery confirmation

- **Business Rules**:

  - Must be unique within carrier system

  - Required before shipment dispatch

  - Used for carrier status updates

  - Provided to customer for tracking

- **Related Terms**: Carrier, ShipmentTracking, CarrierAPI

### Carrier

- **Definition**: Delivery service provider responsible for shipment transport

- **Implementation**: `Carrier` value object

- **Supported Carriers**:

  - **DHL**: International and express delivery

  - **FedEx**: Express and standard delivery

  - **UPS**: Ground and express services

  - **LocalCourier**: Local Barbados delivery service

  - **EFIDelivery**: In-house delivery fleet

- **Properties**:

  - **carrierCode**: Unique carrier identifier

  - **carrierName**: Display name for customer

  - **serviceTypes**: Available delivery options

  - **trackingUrlTemplate**: URL pattern for tracking

- **Business Rules**:

  - Each carrier has specific service offerings

  - Tracking integration varies by carrier

  - Cost and delivery time vary by carrier

  - Some carriers limited to specific regions

- **Related Terms**: ShippingMethod, DeliveryService, CarrierAPI

### ShippingMethod

- **Definition**: Specific delivery service level and speed offered by carrier

- **Implementation**: `ShippingMethod` value object

- **Service Levels**:

  - **STANDARD**: 3-5 business days, lowest cost

  - **EXPRESS**: 1-2 business days, higher cost

  - **OVERNIGHT**: Next business day, premium cost

  - **SAME_DAY**: Same day delivery, premium service

  - **SCHEDULED**: Customer-selected delivery window

- **Properties**:

  - **methodCode**: Unique method identifier

  - **methodName**: Customer-facing name

  - **carrier**: Associated delivery carrier

  - **estimatedDays**: Expected delivery timeframe

  - **cost**: Shipping cost for this method

- **Business Rules**:

  - Cost varies by distance and package size

  - Not all methods available to all locations

  - Express methods may have cutoff times

  - Same-day delivery limited to local area

- **Related Terms**: Carrier, DeliverySpeed, ShippingCost

### DeliveryAddress

- **Definition**: Complete destination information for shipment delivery

- **Implementation**: `DeliveryAddress` value object

- **Properties**:

  - **recipientName**: Name of person receiving delivery

  - **companyName**: Business name (if applicable)

  - **streetAddress**: Street address lines

  - **city**: City or town

  - **parish**: Parish (for Barbados addresses)

  - **postalCode**: Postal/ZIP code

  - **country**: Country code

  - **phoneNumber**: Contact number for delivery

  - **deliveryInstructions**: Special delivery notes

- **Business Rules**:

  - Must be complete and validated

  - Phone number required for delivery coordination

  - Special instructions help ensure successful delivery

  - Address validation against postal service database

- **Related Terms**: Address, DeliveryInstructions, AddressValidation

## Domain Services

### FulfillmentOrchestrator

- **Definition**: Service coordinating the complete fulfillment process from order to shipment

- **Implementation**: `FulfillmentOrchestrator` domain service

- **Responsibilities**:

  - Order-to-fulfillment conversion

  - Warehouse selection and assignment

  - Picking list optimization

  - Staff workload balancing

  - Quality control coordination

- **Orchestration Rules**:

  - Select nearest warehouse with inventory

  - Optimize picking routes for efficiency

  - Balance workload across available staff

  - Enforce quality control checkpoints

  - Coordinate with shipping schedule

- **Related Terms**: WarehouseSelection, PickingOptimization, QualityControl

### ShippingCalculator

- **Definition**: Service calculating shipping costs and delivery options

- **Implementation**: `ShippingCalculator` domain service

- **Responsibilities**:

  - Shipping cost calculation based on weight, distance, method

  - Delivery time estimation

  - Carrier selection optimization

  - Special handling fee calculation

  - Delivery zone determination

- **Calculation Rules**:

  - Base cost plus weight-based charges

  - Distance zones affect pricing

  - Express methods have premium pricing

  - Special handling adds surcharges

  - Volume discounts for large orders

- **Related Terms**: ShippingCost, DeliveryZone, WeightCalculation

### TrackingService

- **Definition**: Service managing shipment tracking and status updates

- **Implementation**: `TrackingService` domain service

- **Responsibilities**:

  - Carrier API integration for status updates

  - Tracking number generation and validation

  - Delivery confirmation processing

  - Exception handling for delivery issues

  - Customer notification coordination

- **Tracking Rules**:

  - Poll carrier APIs for status updates

  - Update internal status based on carrier data

  - Handle tracking exceptions and failures

  - Notify customers of status changes

  - Maintain tracking history for audit

- **Related Terms**: CarrierAPI, TrackingUpdate, DeliveryConfirmation

### DeliveryScheduler

- **Definition**: Service managing delivery appointments and time windows

- **Implementation**: `DeliveryScheduler` domain service

- **Responsibilities**:

  - Delivery window scheduling

  - Route optimization for delivery fleet

  - Customer appointment coordination

  - Delivery capacity management

  - Rescheduling and exception handling

- **Scheduling Rules**:

  - Respect customer preferred delivery windows

  - Optimize routes for fuel efficiency

  - Balance delivery capacity across time slots

  - Allow rescheduling with advance notice

  - Handle delivery failures and redelivery

- **Related Terms**: DeliveryWindow, RouteOptimization, DeliveryCapacity

## Domain Events

### FulfillmentStarted

- **Definition**: Published when order fulfillment process begins

- **Implementation**: `FulfillmentStarted` extends DomainEvent

- **Payload**: Fulfillment order ID, order ID, warehouse ID, assigned picker, timestamp

- **Consumers**: Order Management, Inventory Management, Analytics, Customer Notifications

- **Business Impact**: Triggers inventory allocation, customer notification, progress tracking

### ItemsPicked

- **Definition**: Published when all items for an order have been picked from inventory

- **Implementation**: `ItemsPicked` extends DomainEvent

- **Payload**: Fulfillment order ID, picked items, picker ID, accuracy score, timestamp

- **Consumers**: Quality Control, Packing, Analytics, Inventory Management

- **Business Impact**: Triggers packing process, updates inventory, tracks picker performance

### ShipmentPrepared

- **Definition**: Published when shipment is packed and ready for carrier pickup

- **Implementation**: `ShipmentPrepared` extends DomainEvent

- **Payload**: Shipment ID, order ID, package details, carrier, estimated pickup, timestamp

- **Consumers**: Carrier Systems, Customer Notifications, Analytics, Warehouse Management

- **Business Impact**: Schedules carrier pickup, notifies customer, updates order status

### ShipmentDispatched

- **Definition**: Published when shipment leaves facility with carrier

- **Implementation**: `ShipmentDispatched` extends DomainEvent

- **Payload**: Shipment ID, tracking number, carrier, estimated delivery, timestamp

- **Consumers**: Order Management, Customer Notifications, Tracking Service, Analytics

- **Business Impact**: Enables customer tracking, updates order status, starts delivery monitoring

### DeliveryAttempted

- **Definition**: Published when delivery attempt is made (successful or failed)

- **Implementation**: `DeliveryAttempted` extends DomainEvent

- **Payload**: Shipment ID, attempt result, delivery timestamp, failure reason, timestamp

- **Consumers**: Customer Notifications, Customer Service, Analytics, Redelivery Scheduler

- **Business Impact**: Notifies customer of result, schedules redelivery if needed

### ShipmentDelivered

- **Definition**: Published when shipment is successfully delivered to customer

- **Implementation**: `ShipmentDelivered` extends DomainEvent

- **Payload**: Shipment ID, delivery timestamp, recipient signature, delivery proof, timestamp

- **Consumers**: Order Management, Customer Notifications, Analytics, Billing

- **Business Impact**: Completes fulfillment cycle, triggers customer feedback, updates metrics

## Repository Interfaces

### IShipmentRepository

- **Definition**: Persistence contract for shipment aggregates

- **Implementation**: `IShipmentRepository` interface

- **Standard Operations**:

  - `findById(id: ShipmentId): Promise<Shipment | null>`

  - `save(shipment: Shipment): Promise<void>`

  - `findByOrderId(orderId: OrderId): Promise<Shipment[]>`

- **Specialized Queries**:

  - `findByStatus(status: ShipmentStatus): Promise<Shipment[]>`

  - `findByTrackingNumber(trackingNumber: TrackingNumber): Promise<Shipment | null>`

  - `findInTransitShipments(): Promise<Shipment[]>`

  - `findOverdueDeliveries(): Promise<Shipment[]>`

- **Business Rules**: All operations return Result pattern for error handling

### IFulfillmentOrderRepository

- **Definition**: Persistence contract for fulfillment order aggregates

- **Implementation**: `IFulfillmentOrderRepository` interface

- **Standard Operations**:

  - `findById(id: FulfillmentOrderId): Promise<FulfillmentOrder | null>`

  - `save(fulfillmentOrder: FulfillmentOrder): Promise<void>`

  - `findByOrderId(orderId: OrderId): Promise<FulfillmentOrder | null>`

- **Specialized Queries**:

  - `findByStatus(status: FulfillmentStatus): Promise<FulfillmentOrder[]>`

  - `findByWarehouse(warehouseId: WarehouseId): Promise<FulfillmentOrder[]>`

  - `findByPicker(pickerId: PickerId): Promise<FulfillmentOrder[]>`

  - `findPendingFulfillment(): Promise<FulfillmentOrder[]>`

- **Business Rules**: Support both active and completed fulfillment orders

## Business Rules & Constraints

### Fulfillment Processing Rules

1. **Inventory Availability**: All items must be in stock before fulfillment starts

2. **Picking Accuracy**: 98% accuracy required, verified through quality control

3. **Cold Chain**: Perishable items require refrigerated storage and transport

4. **Fragile Handling**: Special packaging and handling for fragile items

5. **Processing Time**: Orders confirmed before 2 PM ship same day

### Shipping and Delivery Rules

1. **Tracking Required**: All shipments must have carrier tracking number

2. **Delivery Attempts**: Maximum 3 delivery attempts before return

3. **Delivery Windows**: 2-hour delivery windows for scheduled deliveries

4. **Signature Required**: High-value orders require delivery signature

5. **Delivery Confirmation**: Photo or signature proof required for completion

### Carrier Integration Rules

1. **API Integration**: Real-time status updates from carrier systems

2. **Service Levels**: Different carriers offer different service levels

3. **Cost Optimization**: Select most cost-effective carrier for each shipment

4. **Backup Carriers**: Secondary carrier options for service failures

5. **Performance Monitoring**: Track carrier performance metrics

### Quality Control Rules

1. **Picking Verification**: Random quality checks on picked orders

2. **Packing Standards**: Standardized packing procedures for all items

3. **Damage Prevention**: Protective packaging for fragile and perishable items

4. **Accuracy Tracking**: Monitor and improve fulfillment accuracy rates

5. **Customer Feedback**: Incorporate delivery feedback into quality improvements

## Integration Patterns

### Inbound Events (Consumed)

- **OrderConfirmed** (Order Management) → Create fulfillment order

- **PaymentReceived** (Billing & Invoicing) → Authorize fulfillment

- **InventoryAllocated** (Inventory Management) → Start picking process

- **CustomerAddressUpdated** (Customer Management) → Update delivery address

### Outbound Events (Published)

- **FulfillmentStarted** → Order Management for status update

- **ShipmentDispatched** → Order Management and Customer Notifications

- **ShipmentDelivered** → Order Management for completion

- **DeliveryFailed** → Customer Service for follow-up

### Service Dependencies

- **Inventory Service**: Stock levels and item locations

- **Customer Service**: Delivery preferences and contact information

- **Carrier APIs**: Shipping rates, tracking, and status updates

- **Address Validation**: Delivery address verification

- **Notification Service**: Customer delivery updates

- **Warehouse Management**: Picking lists and staff assignments

## Anti-Corruption Patterns

### Carrier API Integration

- **DHL Tracking Response** → Internal `ShipmentStatus` with standardized states

- **FedEx Shipment Data** → Internal `Shipment` aggregate with carrier metadata

- **UPS Delivery Confirmation** → Internal delivery event with proof details

### Warehouse Management System

- **WMS Pick List** → Internal `PickingList` with EFI item references

- **WMS Inventory Location** → Internal location mapping with warehouse zones

- **WMS Staff Assignment** → Internal picker assignment with performance tracking

### Legacy Fulfillment System

- **Old Shipment IDs** → New `ShipmentId` format with mapping table

- **Previous Tracking Numbers** → Current tracking system with historical reference

- **Historical Delivery Data** → Current delivery metrics with legacy data migration

## Context Boundaries

### What's Inside This Context

- Order fulfillment process (picking, packing, shipping)

- Shipment lifecycle management and tracking

- Carrier integration and delivery coordination

- Warehouse operations and staff management

- Delivery scheduling and customer communication

### What's Outside This Context

- Order creation and customer management

- Inventory management and stock levels

- Payment processing and billing

- Product catalog and pricing

- Customer service and support

### Integration Points

- **Order Management**: Fulfillment authorization and status updates

- **Inventory Management**: Stock allocation and location information

- **Customer Management**: Delivery preferences and contact information

- **Billing & Invoicing**: Payment confirmation for fulfillment authorization

- **Analytics**: Fulfillment metrics and performance tracking

## Performance Considerations

### Scalability Patterns

- **Fulfillment Queues**: Process fulfillment orders in priority queues

- **Carrier Load Balancing**: Distribute shipments across multiple carriers

- **Warehouse Zones**: Optimize picking routes within warehouse zones

- **Batch Processing**: Process multiple orders in picking batches

### Optimization Strategies

- **Route Optimization**: Minimize travel time for picking and delivery

- **Carrier Selection**: Choose optimal carrier based on cost and service

- **Inventory Placement**: Position fast-moving items in accessible locations

- **Staff Scheduling**: Balance workload across available staff members

This glossary ensures consistent terminology within the Shipping & Fulfillment context while maintaining clear boundaries and integration patterns with other bounded contexts.

# Inventory Domain

## Overview

The Inventory domain manages the tracking, control, and optimization of Elias Food Imports' physical product inventory across multiple warehouses and facilities. It ensures accurate stock levels, efficient inventory movement, and proper handling of specialty food products with unique storage requirements. As a critical operational domain, it directly impacts customer satisfaction through product availability while optimizing working capital.

## Strategic Classification

**Domain Type**: Supporting Domain

**Business Value**: High  
While not the primary value proposition, inventory management is critical to operational excellence and affects the customer experience through product availability and quality.

**Technical Complexity**: High  
The domain requires complex real-time tracking systems, integration with multiple contexts, and specialized handling for diverse product types with varying storage requirements.

**Volatility**: Medium  
Core inventory concepts are stable, but specific handling rules and integrations evolve with new product types, regulations, and supply chain optimizations.

## Core Domain Concepts

### Inventory Item

The central concept representing a specific product variant in a specific location with its current quantity and status.

**Key Attributes**:
- Product identifier (maps to a product in the Catalog domain)
- Location identifier (warehouse, section, shelf)
- Current quantity
- Reserved quantity (committed but not yet shipped)
- Available quantity (current minus reserved)
- Status (available, quarantined, expired, damaged)
- Lot/batch number
- Expiration date (for perishable items)
- Last inventory count timestamp
- Storage conditions (temperature, humidity requirements)

### Warehouse

A physical location where inventory items are stored and managed.

**Key Attributes**:
- Warehouse identifier
- Name and location
- Storage capacity
- Temperature zones (ambient, refrigerated, freezer)
- Specialty handling capabilities
- Operational hours
- Staff assignments

### Stock Movement

Represents the flow of inventory items between locations or state changes.

**Key Attributes**:
- Movement identifier
- Source location
- Destination location
- Inventory item reference
- Quantity moved
- Movement type (receipt, shipment, transfer, adjustment)
- Timestamp
- Requesting context (Order, Purchase, Quality Control)
- Movement status (planned, in-progress, completed)
- Handler/operator

### Inventory Count

A verification activity that reconciles physical inventory with system records.

**Key Attributes**:
- Count identifier
- Count type (cycle count, full inventory, spot check)
- Location scope
- Product scope
- Start and end timestamps
- Count status (scheduled, in-progress, completed, reconciled)
- Discrepancies detected
- Adjustment actions taken

### Inventory Reservation

A temporary allocation of inventory for a specific purpose, typically to fulfill an order.

**Key Attributes**:
- Reservation identifier
- Inventory item reference
- Quantity reserved
- Purpose (order fulfillment, quality check, etc.)
- Requesting entity identifier
- Expiration (when reservation becomes invalid)
- Priority (standard, expedited, VIP)
- Status (pending, confirmed, fulfilled, released)

### Storage Requirements

Specifies how specific products must be stored based on their characteristics.

**Key Attributes**:
- Temperature range (min/max)
- Humidity range (min/max)
- Light exposure limitations
- Special handling instructions
- Stacking limitations
- Segregation requirements (allergens, organics)
- Shelf life under proper conditions
- Monitoring frequency requirements

## Business Rules

### Inventory Accuracy and Control

1. System inventory levels must be reconciled with physical counts at minimum once per quarter, with accuracy targets ≥99.9%.
2. High-value items and perishables require cycle counts at least once monthly.
3. All inventory discrepancies exceeding €500 or 5% of expected quantity must be investigated and documented.
4. Inventory adjustments over €2,500 require management approval and detailed reason codes.
5. Each inventory item must maintain a complete audit trail of all quantity changes.
6. Negative inventory is not permitted in the system; prevention controls must block such transactions.

### Product Receipt and Putaway

1. All received products must be inspected for quality and quantity upon arrival.
2. Specialty food items require authentication verification before being added to available inventory.
3. Items with special storage requirements must be placed in appropriate zones within 30 minutes of receipt.
4. Cold chain products must have continuous temperature monitoring during receipt process.
5. Received items must be traceable to their source purchase order and supplier lot.
6. Imported products must have complete customs documentation verified before putaway.
7. FIFO (First In, First Out) principles must be enforced for all perishable inventory.

### Inventory Reservations

1. Inventory can only be reserved for valid, approved purposes (order fulfillment, quality inspection, etc.).
2. Reservations expire after 72 hours if not fulfilled, except for special orders with longer reservation periods.
3. VIP customer orders take reservation priority over standard orders for limited stock items.
4. Reserved inventory cannot be counted as available for new orders.
5. System must prevent double-booking of the same inventory units.
6. When available inventory falls below safety stock levels, new reservations require approval.

### Stock Movement and Transfers

1. All inventory movements must be authorized by designated personnel with appropriate permissions.
2. Inter-warehouse transfers require shipping and receiving confirmation from both locations.
3. Cold chain products must maintain temperature compliance during all movements.
4. Stock movements must update inventory levels in real-time to prevent overselling.
5. Emergency stock relocations due to facility issues must be prioritized over standard transfers.
6. Bulk transfers must include batch traceability information for each item.
7. When transferring allergen-containing products, appropriate cleaning protocols must be followed.

### Quality Control and Special Handling

1. Products failing quality inspections must be immediately quarantined and not available for sale.
2. Quarantined inventory requires manager approval and documented reason before release.
3. Temperature-sensitive products must have continuous monitoring with alerting for out-of-range conditions.
4. Products approaching expiration must be flagged with a minimum 30-day warning.
5. Expired products must be automatically quarantined and scheduled for proper disposal.
6. Products with protected designations of origin must maintain authentication documentation with the inventory record.
7. Organic and conventional versions of the same product must be physically segregated with clear labeling.

### Inventory Planning and Optimization

1. Safety stock levels must be maintained for all regular catalog items based on demand volatility.
2. Seasonal items must have inventory stocking plans established 90 days before season start.
3. Slow-moving inventory must be reviewed quarterly for potential markdown or alternative channels.
4. Stock levels must accommodate both forecasted baseline demand and promotional uplift.
5. Inventory turns targets must be set by product category, with exceptions documented.
6. Critical imported products must maintain buffer stock to mitigate supply chain disruptions.

## Domain Events

The Inventory domain publishes and consumes various events to maintain consistency with other bounded contexts.

### Published Events

#### InventoryItemCreated

**Description**: A new inventory item has been added to the system.

**Payload**:
```typescript
{
  inventoryId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: InventoryStatus;
  lot: string;
  expirationDate?: Date;
  createdAt: Date;
}
```

**Consumers**:
- Catalog Context: Updates product availability flags
- Analytics Context: Updates inventory metrics

#### InventoryLevelChanged

**Description**: The quantity of an inventory item has changed due to receipt, shipment, adjustment, or other movements.

**Payload**:
```typescript
{
  inventoryId: string;
  productId: string;
  warehouseId: string;
  previousQuantity: number;
  newQuantity: number;
  reason: InventoryChangeReason;
  referenceType?: string;
  referenceId?: string;
  timestamp: Date;
  userId: string;
}
```

**Consumers**:
- Catalog Context: Updates product availability status
- Order Context: Validates product availability for pending orders
- Purchase Context: Triggers replenishment if below threshold
- Analytics Context: Updates inventory metrics and trends

#### InventoryItemQuarantined

**Description**: An inventory item has been placed in quarantine status and is no longer available for regular sales.

**Payload**:
```typescript
{
  inventoryId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reason: QuarantineReason;
  notes?: string;
  quarantinedBy: string;
  quarantinedAt: Date;
  expectedResolutionDate?: Date;
}
```

**Consumers**:
- Order Context: Excludes quarantined items from availability
- Quality Control Context: Creates investigation task
- Purchase Context: May trigger replenishment for critical items
- Notification Context: Alerts inventory managers

#### InventoryItemReleased

**Description**: An inventory item previously in quarantine has been released back to available status.

**Payload**:
```typescript
{
  inventoryId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  previousStatus: InventoryStatus;
  notes?: string;
  releasedBy: string;
  releasedAt: Date;
  qualityCheckId?: string;
}
```

**Consumers**:
- Order Context: Updates product availability
- Catalog Context: Updates product availability status
- Quality Control Context: Closes investigation task
- Notification Context: Alerts relevant staff

#### InventoryReservationCreated

**Description**: Inventory has been reserved for a specific purpose (typically an order).

**Payload**:
```typescript
{
  reservationId: string;
  inventoryId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  purpose: ReservationPurpose;
  externalReferenceId: string; // e.g. orderId
  expiresAt: Date;
  createdAt: Date;
}
```

**Consumers**:
- Order Context: Confirms inventory allocation for order
- Fulfillment Context: Initiates picking process planning

#### InventoryReservationCancelled

**Description**: A previous inventory reservation has been cancelled and the inventory is available again.

**Payload**:
```typescript
{
  reservationId: string;
  inventoryId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reason: CancellationReason;
  externalReferenceId: string;
  cancelledAt: Date;
}
```

**Consumers**:
- Order Context: Updates order status if reservation failed
- Fulfillment Context: Removes item from picking list

#### InventoryCountScheduled

**Description**: An inventory count has been scheduled.

**Payload**:
```typescript
{
  countId: string;
  countType: InventoryCountType;
  warehouseId: string;
  scheduledStartDate: Date;
  scheduledEndDate: Date;
  productCategories?: string[];
  locations?: string[];
  assignedTo?: string[];
  priority: Priority;
}
```

**Consumers**:
- Operations Context: Staff scheduling and workload management
- Warehouse Management Context: Area access planning

### Consumed Events

#### OrderPlaced

**Description**: A new order has been placed.

**Source**: Order Context

**Reaction**: Creates inventory reservations for the ordered items.

#### OrderCancelled

**Description**: An existing order has been cancelled.

**Source**: Order Context

**Reaction**: Cancels any related inventory reservations, returning items to available status.

#### ShipmentCreated

**Description**: A shipment has been created for an order.

**Source**: Shipping Context

**Reaction**: Converts inventory reservations to confirmed allocations and prepares for stock movement.

#### ShipmentShipped

**Description**: A shipment has left the warehouse.

**Source**: Shipping Context

**Reaction**: Reduces inventory levels for the shipped items.

#### PurchaseOrderReceived

**Description**: A purchase order has been received at the warehouse.

**Source**: Purchasing Context

**Reaction**: Creates new inventory items or increases quantities of existing inventory.

#### ProductQualityCheckFailed

**Description**: A product has failed a quality check.

**Source**: Quality Control Context

**Reaction**: Quarantines the affected inventory until resolution.

#### ReturnReceived

**Description**: A customer return has been received at the warehouse.

**Source**: Returns Context

**Reaction**: Creates inventory items in pending status awaiting quality inspection.

## Aggregates

The Inventory domain is modeled with the following aggregates:

### InventoryItem Aggregate

**Root Entity**: InventoryItem

**Purpose**: Manages the lifecycle and state of inventory items including quantity tracking, status changes, and reservations.

**Entities**:
- InventoryItem (root)
- Reservation

**Value Objects**:
- InventoryStatus
- Location
- Quantity
- BatchInfo

**Invariants**:
- Available quantity cannot be negative
- Total inventory quantity must equal or exceed total reserved quantity
- Quarantined items cannot be reserved for orders

**Methods**:
- `createInventory(productId, warehouseId, quantity, lot, expirationDate?)`
- `adjustQuantity(quantity, reason, referenceId?)`
- `reserve(quantity, purpose, referenceId, expirationDate)`
- `releaseReservation(reservationId, reason?)`
- `fulfillReservation(reservationId)`
- `quarantine(quantity, reason, notes?)`
- `releaseFromQuarantine(quantity, notes?)`
- `moveToLocation(newLocationId, quantity?)`

**Example Implementation**:
```typescript
class InventoryItem extends AggregateRoot {
  private _id: InventoryId;
  private _productId: ProductId;
  private _warehouseId: WarehouseId;
  private _locationId: LocationId;
  private _currentQuantity: number;
  private _reservations: Reservation[] = [];
  private _status: InventoryStatus;
  private _lot: string;
  private _expirationDate?: Date;
  private _storageRequirements?: StorageRequirements;
  private _lastCountDate?: Date;
  
  constructor(id: InventoryId, productId: ProductId, warehouseId: WarehouseId, 
              locationId: LocationId, quantity: number, lot: string, 
              expirationDate?: Date, storageRequirements?: StorageRequirements) {
    super();
    this._id = id;
    this._productId = productId;
    this._warehouseId = warehouseId;
    this._locationId = locationId;
    this._currentQuantity = quantity;
    this._status = InventoryStatus.AVAILABLE;
    this._lot = lot;
    this._expirationDate = expirationDate;
    this._storageRequirements = storageRequirements;
    
    this.applyEvent(new InventoryItemCreated(id, productId, warehouseId, locationId, 
                                           quantity, lot, expirationDate));
  }
  
  get availableQuantity(): number {
    const reservedQuantity = this._reservations
      .filter(r => !r.isFulfilled && !r.isCancelled)
      .reduce((total, res) => total + res.quantity, 0);
    return this._status === InventoryStatus.AVAILABLE ? 
      this._currentQuantity - reservedQuantity : 0;
  }
  
  reserve(quantity: number, purpose: ReservationPurpose, 
          externalReferenceId: string, expiresAt: Date): Reservation {
    if (this._status !== InventoryStatus.AVAILABLE) {
      throw new Error(`Cannot reserve inventory in ${this._status} status`);
    }
    
    if (quantity <= 0) {
      throw new Error('Reservation quantity must be positive');
    }
    
    if (this.availableQuantity < quantity) {
      throw new Error(`Insufficient available quantity: ${this.availableQuantity}`);
    }
    
    const reservationId = new ReservationId();
    const reservation = new Reservation(reservationId, quantity, purpose, 
                                       externalReferenceId, expiresAt);
    
    this._reservations.push(reservation);
    this.applyEvent(new InventoryReservationCreated(reservationId, this._id, 
                                                 this._productId, this._warehouseId,
                                                 quantity, purpose, externalReferenceId,
                                                 expiresAt));
    return reservation;
  }
  
  // Additional methods omitted for brevity
}
```

### InventoryCount Aggregate

**Root Entity**: InventoryCount

**Purpose**: Manages the inventory counting process, including scheduling, execution, and reconciliation.

**Entities**:
- InventoryCount (root)
- CountLine

**Value Objects**:
- CountStatus
- CountType
- CountScope
- Discrepancy

**Invariants**:
- Count cannot be finalized until all count lines are completed
- Discrepancies must be resolved before count can be marked as reconciled
- Cycle counts cannot modify inventory levels without approval if discrepancy exceeds threshold

**Methods**:
- `scheduleCount(warehouseId, type, scopeDefinition, scheduledDate)`
- `startCount(operatorId)`
- `recordCountLine(inventoryId, expectedQuantity, actualQuantity, notes?)`
- `completeCount(operatorId)`
- `resolveDiscrepancy(inventoryId, adjustmentAction, approvedBy?)`
- `reconcileCount(operatorId)`

**Example Implementation**:
```typescript
class InventoryCount extends AggregateRoot {
  private _id: CountId;
  private _warehouseId: WarehouseId;
  private _countType: CountType;
  private _countLines: Map<string, CountLine> = new Map();
  private _status: CountStatus;
  private _scope: CountScope;
  private _scheduledDate: Date;
  private _startedAt?: Date;
  private _completedAt?: Date;
  private _reconcileAt?: Date;
  private _createdBy: UserId;
  
  constructor(id: CountId, warehouseId: WarehouseId, countType: CountType, 
              scope: CountScope, scheduledDate: Date, createdBy: UserId) {
    super();
    this._id = id;
    this._warehouseId = warehouseId;
    this._countType = countType;
    this._scope = scope;
    this._scheduledDate = scheduledDate;
    this._status = CountStatus.SCHEDULED;
    this._createdBy = createdBy;
    
    this.applyEvent(new InventoryCountScheduled(id, warehouseId, countType, 
                                              scope, scheduledDate, createdBy));
  }
  
  startCount(operatorId: UserId): void {
    if (this._status !== CountStatus.SCHEDULED) {
      throw new Error(`Count cannot be started from ${this._status} status`);
    }
    
    this._status = CountStatus.IN_PROGRESS;
    this._startedAt = new Date();
    
    this.applyEvent(new InventoryCountStarted(this._id, this._warehouseId, 
                                            operatorId, this._startedAt));
  }
  
  recordCountLine(inventoryId: string, expectedQuantity: number, 
                  actualQuantity: number, notes?: string): void {
    if (this._status !== CountStatus.IN_PROGRESS) {
      throw new Error(`Cannot add count lines when count is ${this._status}`);
    }
    
    const countLine = new CountLine(inventoryId, expectedQuantity, actualQuantity, notes);
    this._countLines.set(inventoryId, countLine);
    
    this.applyEvent(new InventoryCountLineRecorded(this._id, inventoryId, 
                                                expectedQuantity, actualQuantity,
                                                countLine.hasDiscrepancy,
                                                countLine.discrepancyAmount, 
                                                notes));
  }
  
  // Additional methods omitted for brevity
}
```

## Entities

The following entities are defined within the Inventory domain:

### Reservation

Represents a temporary allocation of inventory for a specific purpose.

**Attributes**:
- Reservation identifier
- Quantity
- Purpose (order fulfillment, quality check, etc.)
- External reference identifier (e.g., order ID)
- Expiration timestamp
- Status (pending, confirmed, fulfilled, cancelled)
- Creation timestamp

**Behavior**:
- Can be fulfilled (converts to an actual inventory reduction)
- Can be cancelled (releases the inventory back to available)
- Can expire (automatically releases inventory after timeout)
- Can be extended (updates the expiration timestamp)

**Example Implementation**:
```typescript
class Reservation extends Entity {
  private _id: ReservationId;
  private _quantity: number;
  private _purpose: ReservationPurpose;
  private _externalReferenceId: string;
  private _expiresAt: Date;
  private _createdAt: Date;
  private _fulfilledAt?: Date;
  private _cancelledAt?: Date;
  private _cancelReason?: string;
  
  constructor(id: ReservationId, quantity: number, purpose: ReservationPurpose,
              externalReferenceId: string, expiresAt: Date) {
    super();
    this._id = id;
    this._quantity = quantity;
    this._purpose = purpose;
    this._externalReferenceId = externalReferenceId;
    this._expiresAt = expiresAt;
    this._createdAt = new Date();
  }
  
  get id(): ReservationId {
    return this._id;
  }
  
  get quantity(): number {
    return this._quantity;
  }
  
  get isFulfilled(): boolean {
    return !!this._fulfilledAt;
  }
  
  get isCancelled(): boolean {
    return !!this._cancelledAt;
  }
  
  get isActive(): boolean {
    return !this.isFulfilled && !this.isCancelled && new Date() < this._expiresAt;
  }
  
  get isExpired(): boolean {
    return !this.isFulfilled && !this.isCancelled && new Date() >= this._expiresAt;
  }
  
  fulfill(): void {
    if (this.isFulfilled) {
      throw new Error('Reservation is already fulfilled');
    }
    
    if (this.isCancelled) {
      throw new Error('Cannot fulfill a cancelled reservation');
    }
    
    if (this.isExpired) {
      throw new Error('Cannot fulfill an expired reservation');
    }
    
    this._fulfilledAt = new Date();
  }
  
  cancel(reason?: string): void {
    if (this.isCancelled) {
      throw new Error('Reservation is already cancelled');
    }
    
    if (this.isFulfilled) {
      throw new Error('Cannot cancel a fulfilled reservation');
    }
    
    this._cancelledAt = new Date();
    this._cancelReason = reason;
  }
  
  extend(newExpirationDate: Date): void {
    if (this.isFulfilled || this.isCancelled) {
      throw new Error('Cannot extend a fulfilled or cancelled reservation');
    }
    
    if (newExpirationDate <= this._expiresAt) {
      throw new Error('New expiration date must be later than current');
    }
    
    this._expiresAt = newExpirationDate;
  }
}
```

### CountLine

Represents a single line in an inventory count, comparing expected and actual quantities.

**Attributes**:
- Inventory item reference
- Expected quantity
- Actual quantity
- Discrepancy calculation
- Notes/comments
- Status (pending, counted, reconciled)
- Adjustment action (if discrepancy exists)

**Behavior**:
- Calculates discrepancy between expected and actual quantities
- Tracks resolution status of discrepancies
- Records adjustment decisions

**Example Implementation**:
```typescript
class CountLine extends Entity {
  private _inventoryId: string;
  private _expectedQuantity: number;
  private _actualQuantity: number;
  private _notes?: string;
  private _adjustmentAction?: AdjustmentAction;
  private _adjustmentApprovedBy?: string;
  private _adjustmentTimestamp?: Date;
  
  constructor(inventoryId: string, expectedQuantity: number, actualQuantity: number, notes?: string) {
    super();
    this._inventoryId = inventoryId;
    this._expectedQuantity = expectedQuantity;
    this._actualQuantity = actualQuantity;
    this._notes = notes;
  }
  
  get inventoryId(): string {
    return this._inventoryId;
  }
  
  get expectedQuantity(): number {
    return this._expectedQuantity;
  }
  
  get actualQuantity(): number {
    return this._actualQuantity;
  }
  
  get hasDiscrepancy(): boolean {
    return this._expectedQuantity !== this._actualQuantity;
  }
  
  get discrepancyAmount(): number {
    return this._actualQuantity - this._expectedQuantity;
  }
  
  get discrepancyResolved(): boolean {
    return !this.hasDiscrepancy || !!this._adjustmentAction;
  }
  
  resolveDiscrepancy(action: AdjustmentAction, approvedBy?: string): void {
    if (!this.hasDiscrepancy) {
      throw new Error('No discrepancy exists to resolve');
    }
    
    if (this.discrepancyResolved) {
      throw new Error('Discrepancy already resolved');
    }
    
    this._adjustmentAction = action;
    this._adjustmentApprovedBy = approvedBy;
    this._adjustmentTimestamp = new Date();
  }
}
```

## Value Objects

The Inventory domain uses the following value objects to encapsulate key business concepts:

### InventoryId

A unique identifier for inventory items.

**Implementation**:
```typescript
class InventoryId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }
  
  private validate(): void {
    if (!this.value || !UUID_REGEX.test(this.value)) {
      throw new Error('Invalid inventory ID format');
    }
  }
  
  static create(): InventoryId {
    return new InventoryId(uuidv4());
  }
}
```

### InventoryStatus

Represents the current status of an inventory item.

**Implementation**:
```typescript
enum InventoryStatus {
  AVAILABLE = 'AVAILABLE',
  QUARANTINED = 'QUARANTINED',
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED',
  RESERVED = 'RESERVED',
  IN_TRANSIT = 'IN_TRANSIT',
  PENDING_QUALITY_CHECK = 'PENDING_QUALITY_CHECK'
}
```

### QuarantineStatus

Tracks the state of quarantined inventory items, as specified in the priority implementation plan.

**Implementation**:
```typescript
class QuarantineStatus extends ValueObject<{
  status: 'QUARANTINED',
  reason: QuarantineReason,
  quarantinedAt: Date,
  expectedResolutionDate?: Date,
  notes?: string,
  quarantinedBy: string
}> {
  constructor(props: {
    reason: QuarantineReason,
    quarantinedBy: string,
    notes?: string,
    expectedResolutionDate?: Date
  }) {
    super({
      status: 'QUARANTINED',
      reason: props.reason,
      quarantinedAt: new Date(),
      expectedResolutionDate: props.expectedResolutionDate,
      notes: props.notes,
      quarantinedBy: props.quarantinedBy
    });
  }
  
  get reason(): QuarantineReason {
    return this.value.reason;
  }
  
  get quarantinedAt(): Date {
    return this.value.quarantinedAt;
  }
  
  get expectedResolutionDate(): Date | undefined {
    return this.value.expectedResolutionDate;
  }
  
  get isExpectedResolutionOverdue(): boolean {
    return !!this.value.expectedResolutionDate && 
           new Date() > this.value.expectedResolutionDate;
  }
}
```

### ProductSettingsVO

Encapsulates product-specific inventory settings, in line with the prioritized implementation plan.

**Implementation**:
```typescript
class ProductSettingsVO extends ValueObject<{
  safetyStockLevel: number,
  reorderPoint: number,
  reorderQuantity: number,
  maxStockLevel: number,
  leadTimeInDays: number,
  minShelfLifeDays: number,
  storageRequirements: StorageRequirement[],
  isSeasonal: boolean,
  seasonStartMonth?: number,
  seasonEndMonth?: number
}> {
  constructor(props: {
    safetyStockLevel: number,
    reorderPoint: number,
    reorderQuantity: number,
    maxStockLevel: number,
    leadTimeInDays: number,
    minShelfLifeDays: number,
    storageRequirements: StorageRequirement[],
    isSeasonal: boolean,
    seasonStartMonth?: number,
    seasonEndMonth?: number
  }) {
    super(props);
    this.validate();
  }
  
  private validate(): void {
    if (this.value.safetyStockLevel < 0) {
      throw new Error('Safety stock level cannot be negative');
    }
    
    if (this.value.reorderPoint < this.value.safetyStockLevel) {
      throw new Error('Reorder point must be greater than or equal to safety stock level');
    }
    
    if (this.value.maxStockLevel < this.value.reorderPoint) {
      throw new Error('Max stock level must be greater than reorder point');
    }
    
    if (this.value.leadTimeInDays <= 0) {
      throw new Error('Lead time must be positive');
    }
    
    if (this.value.isSeasonal) {
      if (this.value.seasonStartMonth === undefined || this.value.seasonEndMonth === undefined) {
        throw new Error('Seasonal products must define start and end months');
      }
      
      if (this.value.seasonStartMonth < 1 || this.value.seasonStartMonth > 12 || 
          this.value.seasonEndMonth < 1 || this.value.seasonEndMonth > 12) {
        throw new Error('Season months must be between 1 and 12');
      }
    }
  }
  
  get isLowInventoryAlert(currentStock: number): boolean {
    return currentStock <= this.value.reorderPoint;
  }
  
  get isDangerouslyLowInventory(currentStock: number): boolean {
    return currentStock <= this.value.safetyStockLevel;
  }
  
  get isOverstocked(currentStock: number): boolean {
    return currentStock > this.value.maxStockLevel;
  }
}
```

### StorageRequirement

Represents the specific storage conditions required for a product.

**Implementation**:
```typescript
class StorageRequirement extends ValueObject<{
  temperatureRangeMin?: number,
  temperatureRangeMax?: number,
  humidityRangeMin?: number,
  humidityRangeMax?: number,
  requiresRefrigeration: boolean,
  requiresFreezing: boolean,
  lightSensitive: boolean,
  specialHandling?: string[]
}> {
  constructor(props: {
    temperatureRangeMin?: number,
    temperatureRangeMax?: number,
    humidityRangeMin?: number,
    humidityRangeMax?: number,
    requiresRefrigeration: boolean,
    requiresFreezing: boolean,
    lightSensitive: boolean,
    specialHandling?: string[]
  }) {
    super(props);
    this.validate();
  }
  
  private validate(): void {
    if (this.value.temperatureRangeMin !== undefined && 
        this.value.temperatureRangeMax !== undefined && 
        this.value.temperatureRangeMin > this.value.temperatureRangeMax) {
      throw new Error('Minimum temperature cannot be greater than maximum temperature');
    }
    
    if (this.value.humidityRangeMin !== undefined && 
        this.value.humidityRangeMax !== undefined && 
        this.value.humidityRangeMin > this.value.humidityRangeMax) {
      throw new Error('Minimum humidity cannot be greater than maximum humidity');
    }
    
    if (this.value.requiresFreezing && 
        this.value.temperatureRangeMax !== undefined && 
        this.value.temperatureRangeMax > 0) {
      throw new Error('Frozen products must have maximum temperature below 0°C');
    }
  }
  
  get isColdChain(): boolean {
    return this.value.requiresRefrigeration || this.value.requiresFreezing;
  }
  
  isCompliantWith(storageConditions: {
    temperature: number,
    humidity?: number,
    isLightProtected: boolean
  }): boolean {
    // Check temperature compliance
    if (this.value.temperatureRangeMin !== undefined && 
        storageConditions.temperature < this.value.temperatureRangeMin) {
      return false;
    }
    
    if (this.value.temperatureRangeMax !== undefined && 
        storageConditions.temperature > this.value.temperatureRangeMax) {
      return false;
    }
    
    // Check humidity compliance if applicable
    if (storageConditions.humidity !== undefined && 
        this.value.humidityRangeMin !== undefined && 
        storageConditions.humidity < this.value.humidityRangeMin) {
      return false;
    }
    
    if (storageConditions.humidity !== undefined && 
        this.value.humidityRangeMax !== undefined && 
        storageConditions.humidity > this.value.humidityRangeMax) {
      return false;
    }
    
    // Check light sensitivity compliance
    if (this.value.lightSensitive && !storageConditions.isLightProtected) {
      return false;
    }
    
    return true;
  }
}
```

## Domain Services

The Inventory domain defines several services that implement complex business logic:

### InventoryManagementService

Provides comprehensive inventory management capabilities across warehouses.

**Methods**:
| Method | Description | Parameters | Return Type |
|--------|-------------|------------|------------|
| `checkAvailability` | Checks if requested quantity is available | productId, quantity, warehouseId? | boolean |
| `findAvailableInventory` | Locates inventory for a product across warehouses | productId, quantity | InventoryAllocation[] |
| `createInventoryReservation` | Creates a reservation for specified inventory | productId, quantity, purpose, externalRef, expiry | Reservation |
| `releaseReservation` | Releases a previously created reservation | reservationId, reason | void |
| `recordInventoryReceipt` | Records receipt of new inventory | productId, warehouseId, quantity, lot, expiryDate? | InventoryItem |
| `transferInventory` | Transfers inventory between warehouses | inventoryId, sourceWarehouseId, destWarehouseId, quantity | StockMovement |
| `quarantineInventory` | Places inventory in quarantine | inventoryId, quantity, reason, notes?, expectedResolutionDate? | QuarantineAction |

**Implementation Example**:
```typescript
class InventoryManagementService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly warehouseRepository: WarehouseRepository,
    private readonly productRepository: ProductRepository,
    private readonly eventBus: EventBus
  ) {}

  async checkAvailability(
    productId: ProductId,
    quantity: number,
    warehouseId?: WarehouseId
  ): Promise<boolean> {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    
    if (warehouseId) {
      const inventory = await this.inventoryRepository.findByProductAndWarehouse(productId, warehouseId);
      return inventory !== null && inventory.availableQuantity >= quantity;
    } else {
      const inventoryItems = await this.inventoryRepository.findAllByProduct(productId);
      const totalAvailable = inventoryItems
        .filter(item => item.status === InventoryStatus.AVAILABLE)
        .reduce((sum, item) => sum + item.availableQuantity, 0);
      
      return totalAvailable >= quantity;
    }
  }
  
  async createInventoryReservation(
    productId: ProductId,
    quantity: number,
    purpose: ReservationPurpose,
    externalReferenceId: string,
    expiresAt: Date
  ): Promise<Reservation> {
    const inventoryItems = await this.inventoryRepository.findAllByProduct(productId);
    
    // Sort by expiration date (FEFO - First Expired, First Out)
    inventoryItems.sort((a, b) => {
      if (!a.expirationDate) return 1;
      if (!b.expirationDate) return -1;
      return a.expirationDate.getTime() - b.expirationDate.getTime();
    });
    
    let remainingToReserve = quantity;
    const allocations: {inventoryId: InventoryId, quantity: number}[] = [];
    
    for (const item of inventoryItems) {
      if (item.status !== InventoryStatus.AVAILABLE || item.availableQuantity <= 0) {
        continue;
      }
      
      const toReserve = Math.min(remainingToReserve, item.availableQuantity);
      const reservation = item.reserve(toReserve, purpose, externalReferenceId, expiresAt);
      
      await this.inventoryRepository.save(item);
      allocations.push({ inventoryId: item.id, quantity: toReserve });
      
      remainingToReserve -= toReserve;
      if (remainingToReserve <= 0) break;
    }
    
    if (remainingToReserve > 0) {
      throw new Error(`Insufficient inventory available: short by ${remainingToReserve}`);
    }
    
    return allocations;
  }
  
  // Additional methods omitted for brevity
}
```

### InventoryForecastingService

Predicts future inventory levels and identifies potential stockouts.

**Methods**:
| Method | Description | Parameters | Return Type |
|--------|-------------|------------|------------|
| `calculateDaysOfSupply` | Calculates how long current inventory will last based on historical demand | productId, warehouseId? | number |
| `predictStockout` | Predicts if and when a stockout will occur | productId, timeframeInDays | StockoutPrediction |
| `generateReplenishmentRecommendations` | Recommends orders based on current levels, demand forecast, and lead times | warehouseId?, categoryId? | ReplenishmentRecommendation[] |
| `calculateSeasonalDemandAdjustment` | Adjusts inventory forecasts based on seasonal patterns | productId, startDate, endDate | SeasonalDemandFactor |
| `analyzeInventoryTurns` | Calculates inventory turnover rate | productId, period | InventoryTurnRate |

### InventoryCountService

Manages scheduled and ad-hoc inventory counting processes.

**Methods**:
| Method | Description | Parameters | Return Type |
|--------|-------------|------------|------------|
| `scheduleCount` | Schedules an inventory count | countType, warehouseId, productScope?, scheduled | CountId |
| `generateCountSheet` | Generates count sheets for inventory counting | countId | CountSheet |
| `recordCountResults` | Records the results of inventory counting | countId, countResults[] | void |
| `reconcileCount` | Reconciles count discrepancies and applies adjustments | countId, adjustments[] | ReconciliationResult |
| `getCountPerformanceMetrics` | Retrieves metrics about count accuracy and efficiency | countId | CountPerformanceMetrics |

### InventoryQualityService

Manages the quality control aspects of inventory, including quarantine and release processes.

**Methods**:
| Method | Description | Parameters | Return Type |
|--------|-------------|------------|------------|
| `initiateQualityCheck` | Initiates a quality check for specific inventory | inventoryId, checkType, reason | QualityCheckId |
| `recordQualityCheckResult` | Records the result of a quality check | checkId, result, notes? | void |
| `quarantineInventory` | Places inventory in quarantine status | inventoryId, quantity, reason, notes? | QuarantineId |
| `releaseFromQuarantine` | Releases inventory from quarantine | quarantineId, disposition, notes? | void |
| `monitorExpirationDates` | Identifies inventory approaching expiration | daysToWarn, categoryId? | ExpiryWarning[] |

### Integration with the Prioritized Implementation Plan

In alignment with the prioritized implementation plan, the `InventoryManagementService` implements key features:

1. **Quality Verification Workflow** - Through the `quarantineInventory` and `releaseFromQuarantine` methods
2. **ProductSettingsVO Implementation** - Utilizes the ProductSettingsVO to determine reorder points and safety stock levels
3. **InventoryLow event generation** - Monitors inventory levels against ProductSettingsVO thresholds and triggers appropriate events

## Integration Points

The Inventory domain interacts with several other bounded contexts in the Elias Food Imports system:

### External Context Integration

| Bounded Context | Integration Type | Description |
|----------------|------------------|-------------|
| **Order** | Events | Receives OrderPlaced and OrderCancelled events to manage inventory reservations |
| **Catalog** | Synchronous | Queries for product information and storage requirements |
| **Purchase** | Events | Receives PurchaseOrderPlaced and PurchaseReceived events for inventory planning |
| **Quality Control** | Events | Exchanges events related to product quality verification and quarantine status |
| **Shipping** | Events | Receives ShipmentCreated events to finalize inventory deductions |
| **Returns** | Events | Processes ReturnCreated events for inventory returns/restocking |
| **Analytics** | Synchronous | Provides inventory metrics data for business intelligence |

### Integration Patterns

#### Domain Event Exchange

The Inventory domain publishes and consumes domain events to maintain loose coupling with other contexts:

```typescript
// Example event handler for OrderPlaced event
class OrderPlacedEventHandler implements EventHandler<OrderPlacedEvent> {
  constructor(private readonly inventoryService: InventoryManagementService) {}
  
  async handle(event: OrderPlacedEvent): Promise<void> {
    try {
      // Create inventory reservations for each line item
      for (const item of event.items) {
        await this.inventoryService.createInventoryReservation(
          new ProductId(item.productId),
          item.quantity,
          ReservationPurpose.ORDER_FULFILLMENT,
          event.orderId,
          addHours(new Date(), 24) // 24-hour reservation
        );
      }
    } catch (error) {
      // Log error and trigger compensating action
      console.error(`Failed to reserve inventory for order ${event.orderId}`, error);
      await this.notifyInventoryShortage(event);
    }
  }
  
  private async notifyInventoryShortage(event: OrderPlacedEvent): Promise<void> {
    // Notify order management about inventory shortage
  }
}
```

#### Synchronous API Integration

For real-time inventory information, the domain exposes several APIs to other contexts:

```typescript
// Example API controller for inventory availability
class InventoryApiController {
  constructor(private readonly inventoryService: InventoryManagementService) {}
  
  @Get('/products/:productId/availability')
  async checkAvailability(
    @Param('productId') productId: string,
    @Query('quantity') quantity: number,
    @Query('warehouseId') warehouseId?: string
  ) {
    try {
      const available = await this.inventoryService.checkAvailability(
        new ProductId(productId),
        quantity,
        warehouseId ? new WarehouseId(warehouseId) : undefined
      );
      
      return {
        productId,
        quantity,
        available,
        warehouseId: warehouseId || 'any'
      };
    } catch (error) {
      throw new HttpException('Failed to check availability', 500);
    }
  }
  
  // Additional endpoints for inventory operations
}
```

### Supplier Integration

As outlined in the implementation plan, the Inventory domain implements supplier integration:

1. **Adapters**: Custom adapters for each supplier's data format
2. **Synchronization Jobs**: Scheduled jobs to sync inventory data with supplier systems
3. **Webhooks**: Endpoints for suppliers to push inventory updates

```typescript
// Example supplier adapter implementation
interface SupplierInventoryAdapter {
  fetchAvailableInventory(productIds: ProductId[]): Promise<SupplierInventoryData[]>;
  submitPurchaseOrder(order: PurchaseOrder): Promise<PurchaseOrderResponse>;
  getExpectedDeliveryDate(orderId: string): Promise<Date>;
}

class OrganicProducerAdapter implements SupplierInventoryAdapter {
  // Implementation details for a specific supplier
}
```

## Implementation Considerations

### Technical Considerations

1. **Real-time Inventory Updates**
   - Use optimistic concurrency control to handle simultaneous updates to inventory records
   - Implement event sourcing for inventory transactions to enable accurate audit trails and rebuilding state
   - Apply CQRS pattern to separate read operations (availability checks) from write operations (reservations, movements)

2. **Cold Chain Monitoring**
   - Integrate with IoT temperature sensors for real-time monitoring of refrigerated and frozen products
   - Implement alerting system for temperature excursions with automated quarantine procedures
   - Store temperature history as part of inventory item history for compliance purposes

3. **Scalability and Performance**
   - Implement data partitioning by warehouse and product category to improve query performance
   - Use caching strategies for frequently accessed inventory data (availability, locations)
   - Design batch processing for high-volume operations (receiving large shipments, bulk adjustments)

4. **Reliability and Consistency**
   - Implement transactional outbox pattern to ensure consistent event publication
   - Create compensating transactions for failed inventory operations
   - Design fallback strategies for inventory verification during outages

### Data Management

1. **Historical Inventory Data**
   - Implement time-series storage for inventory levels to support forecasting and analytics
   - Define data retention policies based on regulatory requirements and business needs
   - Create aggregation strategies for older inventory data to optimize storage

2. **Lot and Batch Tracking**
   - Store comprehensive lot and batch information including certificates of authenticity
   - Implement GS1 standards for lot tracking to ensure compatibility with industry practices
   - Design efficient queries for trace-back and trace-forward scenarios

### Phased Implementation Approach

In alignment with the prioritized implementation plan:

#### Phase 1: Core Inventory Functionality
1. Implement basic inventory tracking and movement capabilities
2. Create the `ProductSettingsVO` value object for inventory settings
3. Develop `InventoryLow` event detection and publication
4. Implement core APIs for inventory availability checks

#### Phase 2: Quality Control and Provenance
1. Implement the Quality Verification Workflow with `QuarantineStatus` VO
2. Create quality check events (`QualityCheckPassed`/`QualityCheckFailed`)
3. Integrate with the Provenance Service for product authenticity verification

#### Phase 3: Advanced Features and Integration
1. Implement supplier integration adapters and sync jobs
2. Develop advanced forecasting capabilities
3. Create reporting and analytics integration

### Testing Strategy

1. **Unit Testing**
   - Test value objects validation logic thoroughly
   - Verify business rule enforcement within aggregates
   - Mock repositories and services for isolated tests

2. **Integration Testing**
   - Test event publication and consumption across bounded contexts
   - Verify database operations for complex inventory scenarios
   - Test API endpoints with realistic data volumes

3. **Performance Testing**
   - Benchmark high-volume inventory operations (bulk receiving, mass reservations)
   - Test concurrent inventory access patterns
   - Verify event processing throughput for peak inventory activity

4. **Business Scenario Testing**
   - Create test suites for complete inventory lifecycle scenarios
   - Validate regulatory compliance procedures
   - Test expiration and quality control workflows

## Success Metrics

In alignment with the business problem acceptance criteria, the Inventory domain's success will be measured using the following metrics:

### Accuracy and Reliability

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Inventory accuracy rate | ≥ 99.9% | (Accurate inventory records / Total inventory records) × 100% |
| Forecast accuracy | ≥ 85% | (1 - |Forecasted demand - Actual demand| / Actual demand) × 100% |
| Cold chain compliance | ≥ 99.9% | (Compliant cold chain readings / Total readings) × 100% |
| Stockout rate | < 0.5% | (Number of stockouts / Number of order lines) × 100% |
| Shrinkage rate | < 1% | (Value of lost inventory / Total inventory value) × 100% |

### Operational Efficiency

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Inventory turnover rate | Product category specific | COGS / Average inventory value |
| Days of inventory on hand | Product category specific | (Average inventory value / COGS) × 365 |
| Warehouse space utilization | > 85% | (Used storage capacity / Total storage capacity) × 100% |
| Inventory count completion time | ≤ 24 hours | Time from count initiation to reconciliation |
| Supplier lead time accuracy | ≥ 90% | (Orders received within expected lead time / Total orders) × 100% |

### System Performance

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Inventory query response time | ≤ 200ms | 95th percentile of API response times |
| Inventory operation throughput | ≥ 100/sec | Maximum sustainable operations per second |
| Event processing latency | ≤ 500ms | Time from event publication to consumption |
| System availability | ≥ 99.95% | (Uptime / Total time) × 100% |

### Business Impact

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Working capital efficiency | Improve by 15% | Reduction in inventory carrying costs while maintaining service levels |
| Expired/spoiled inventory cost | Reduce by 30% | Value of expired or spoiled inventory / Total inventory value |
| Perfect order rate | ≥ 98% | (Orders fulfilled completely and accurately / Total orders) × 100% |
| Fulfillment cycle time | Reduce by 20% | Time from order placement to shipment |

These metrics will be tracked continuously through dashboards and reviewed monthly to ensure the Inventory domain is delivering expected business value. Corrective actions will be taken when metrics fall below target thresholds, with a focus on continuous improvement.

## References

1. GS1 Standards for Supply Chain Management
2. FDA Requirements for Food Traceability
3. FEFO (First Expired, First Out) Inventory Management Principles
4. ISO 28000 - Supply Chain Security Management Systems
5. HACCP (Hazard Analysis Critical Control Points) Guidelines

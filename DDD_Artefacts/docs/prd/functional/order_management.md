# Order Management

[RELATED: ADR-004]

## Overview

> **Status:** Draft — auto-normalised. Update with meaningful content.

## Functional Requirements

> _TBD – add detailed requirements here._

## Benefits

> Establishes consistent documentation and enables lint compliance.


> **Status:** Draft — functional requirements outline

Order Management orchestrates the complete lifecycle of an order—from creation through fulfillment—ensuring data consistency, inventory reservation, and customer transparency.

## 1. Order Creation
- Validate cart contents, pricing, inventory, and promotions.
- Generate immutable `OrderID` (UUID v7).
- Persist initial state `Created`.
- Publish `OrderCreated` domain event.

## 2. Order Processing Workflow
| Step | State Transition | Key Actions |
|------|------------------|-------------|
| 1 | Created → Confirmed | Reserve inventory (FEFO), pre-authorize payment |
| 2 | Confirmed → Processing | Capture payment, initiate picking/packing |
| 3 | Processing → Fulfilled | Update stock, prepare shipment, emit `OrderFulfilled` |
| 4 | Fulfilled → Shipped | Carrier hand-off, tracking number attached |
| 5 | Shipped → Delivered | Delivery confirmation webhook |
| 6 | Any → Cancelled | Compensation logic (release stock, refund) |

## 3. Order Modification
- Allowed only before `Processing` state.
- Re-validation of totals and inventory.
- Emit `OrderModified` event.

## 4. Notifications
- Email/SMS on each state change.
- Integration with Notifications context via event bus.

## 5. Business Rules
- Max 50 items per order (see Order Management Rules).
- Orders ≥ €10 000 require manual approval.
- Cold-chain items flagged for expedited fulfillment.

## 6. Error Handling & Compensations
- Saga pattern with compensating actions for payment or inventory failures.

---

- Clear visibility into order status.
- Ensures eventual consistency across Payment, Inventory, and Fulfillment.

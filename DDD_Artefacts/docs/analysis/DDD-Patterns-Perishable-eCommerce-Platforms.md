# Domain‑Driven Design Patterns for Perishable E‑Commerce Platforms

## Introduction

Perishable food and beverage e‑commerce presents unique domain challenges due to expiration dates, storage requirements, and quality decay. Inventory value can quickly erode from spoilage, and strict cold-chain compliance is needed to ensure safety. **Domain-Driven Design (DDD)** provides a toolkit to tackle this complexity by modeling the business concepts (like batches, freshness, and temperature control) explicitly in software. This report explores DDD patterns for a perishable goods platform, focusing on back-office bounded contexts (Inventory, Batch Management, Shipping/Logistics, Cold Chain Monitoring, Pricing) and touching on consumer-facing aspects (freshness indicators, real-time expiration alerts). We will identify suitable bounded contexts, show how top DDD practitioners model expiration and quality degradation within aggregates and domain events, and outline an implementation blueprint using a MERN stack with Kafka for integrating context modules.

**Annotated Bibliography (2020–2025)** – *Authoritative sources informing this report:*

* **IBM Garage (2021) – Event-Driven Cold Chain Reference:** Describes a DDD and event-driven microservices design for refrigerated (reefer) container shipping of fresh goods. It defines core bounded contexts (Orders, Shipping, Voyage, Inventory, Cold Chain telemetrics) and uses an event backbone (Kafka topics per aggregate) to propagate events like *ContainerTemperatureAlert* and track spoiled cargo. This case study exemplifies modeling of cold-chain constraints and shipment lifecycle with domain events (e.g. *ReeferTelemetryReceived*, *ContainerSpoiled*) for real-time analytics and compliance.

* **Vernon, Vaughn (2016) – *DDD Distilled*, Ch.6:** Vaughn Vernon emphasizes modeling time-based occurrences (like an expiration deadline) as **Domain Events** rather than external commands. If a business cares that a time period elapsed (e.g. a batch's shelf life ended), that "fact" should trigger a domain event (e.g. *BatchExpired*) which the domain handles just like any other business event. This perspective guides how to represent expiration and scheduled quality checks within the domain model, treating them as first-class events that cannot be ignored or rejected.

* **Microsoft .NET Architecture Guides (2022) – Domain Events Design:** An official guide illustrating how to use domain events for side effects and eventual consistency in a microservice context. It distinguishes **domain events** (in-process, within a bounded context) from **integration events** (asynchronous, between bounded contexts). The guide's example shows an *OrderStarted* domain event updating a Buyer aggregate in the same service, and recommends publishing integration events (e.g. via a bus like Kafka) only after the transaction commits. This informs our use of Kafka to publish events like *BatchExpired* or *TemperatureThresholdBreached* for other services (Pricing, Notification) to consume.

* **ShipBob Inc. (2025) – FEFO Inventory Management:** An industry white-paper on the "First Expired, First Out" method of inventory rotation. It explains that FEFO prioritizes selling items with the earliest expiration dates to reduce waste and compliance risk. The guide outlines implementing FEFO via batch labeling, WMS alerts for approaching expiry, and strict rotation policies. This provides real-world context for our **Inventory/Batch** model: lot-level tracking with expiration dates, automated alerts for near-expiry stock, and ensuring the oldest (soonest-to-expire) batch is shipped first.

* **Alagarsamy, Indu, et al. (2023) – *Event-Driven Systems* (Podcast):** A panel discussion (Go Time #297) on microservice and event-driven architecture featuring Chris Richardson and Indu Alagarsamy. They use a **perishable order** scenario to illustrate bounded context autonomy: an Order service publishes an event, then a Warehouse/Inventory service “listens” and applies business rules for perishable shipping (special handling for a perishable item), while a Payment service simultaneously listens to process billing. This example underlines DDD’s approach of multiple bounded contexts reacting to a domain event (e.g. *OrderPlaced*) based on their own rules (e.g. check cold storage for perishable goods), rather than a single orchestrated transaction. It reinforces the value of decoupling contexts via events in perishable goods workflows.

---

## Bounded Contexts in a Perishable Goods Domain

To manage the broad complexity, the perishable e-commerce domain is divided into multiple **bounded contexts**, each encapsulating a specific sub-domain with its own data model and business logic. Figure 1 presents a context map of 8 key bounded contexts and their relationships, centered on back-office operations:

flowchart LR

    subgraph Consumer\_Frontend \[Consumer Frontend\]

      Order

    end

    subgraph Warehouse\_Backoffice \[Warehouse & Back-Office\]

      Inventory

      Batch

      Shipping

      ColdChain

      Pricing

      Notification

    end

    subgraph Catalog\_Support \[Product Catalog\]

      Catalog

    end

    Order \-- requests stock \--\> Inventory

    Order \-- queries price \--\> Pricing

    Order \-- ships via \--\> Shipping

    Inventory \-- contains \--\> Batch

    Inventory \-- feeds stock levels \--\> Shipping

    Inventory \-- publishes expiry events \--\> Notification

    Inventory \-- notifies \--\> Pricing

    Shipping \-- needs cold chain \--\> ColdChain

    ColdChain \-- alerts issues \--\> Inventory

    ColdChain \-- alerts issues \--\> Notification

    Pricing \-- provides rates \--\> Order

    Catalog \-- defines shelf life \--\> Inventory

    Catalog \-- provides product data \--\> Pricing

*Figure 1 – Proposed bounded contexts for a perishable e-commerce platform (and key integration relationships).*

**Inventory Context:** The core context responsible for tracking products in stock, particularly at the **batch/lot level** for perishables. It maintains current inventory counts and knows each batch’s expiration date and location. An **FEFO (First-Expired-First-Out)** policy is central here: inventory operations must always allocate or ship the **oldest expiring stock first**. This context enforces that no expired item is sold (removing or quarantining it at expiration) and manages reordering or disposal of spoiled goods. Inventory may rely on a **Batch sub-context** or module to manage detailed batch attributes (see **Batch Context**), or the two can be part of a single context depending on complexity. (In high-volume systems, Batch might be a distinct bounded context/service supplying lot-level data to Inventory.)

**Batch Context:** Focused on **batch or lot-level tracking** of perishable goods. Each batch (or lot) is a unit of stock with a unique ID, production/receive date, **expiration date**, and perhaps a manufacturing lot code. This context models the full lifecycle of a batch – from receipt into the warehouse, through partial allocations to orders, until its depletion or disposal. It encapsulates rules like *“a batch cannot be sold past its expiration”* and *“if a batch’s storage conditions are violated, it must be marked unsellable (spoiled)”*. By isolating batch logic, we cleanly handle **FEFO** allocation and regulatory record-keeping (e.g. for recalls or audits). In some designs, Batch is not a separate bounded context but rather an *Entity* or *Value Object* within the Inventory aggregate. However, treating it as its own context (with its own storage and services) can be beneficial if batch management is complex or if multiple systems need batch info. (For example, an external **Quality/Compliance** system could be a consumer of Batch events.)

**Shipping Context:** This context covers order fulfillment logistics – picking, packing, and delivering orders. It ensures each order is shipped with the appropriate method and timing. For perishables, Shipping interacts closely with Inventory and ColdChain: it must verify inventory availability (and reserve the right FEFO batch) and select shipping options that maintain product freshness. For instance, if an order contains a perishable item, Shipping might require a refrigerated vehicle or expedited delivery. Shipping also tracks the status of shipments (In Transit, Delivered, etc.) and might handle returns or refusals for spoiled items. In a DDD context map, **Order Management** often plays the *customer* role to Shipping’s *supplier* role – the Order context hands off fulfillment responsibility to Shipping. Shipping, in turn, depends on Inventory for stock data (e.g. to decrement quantities once shipped) and on ColdChain for monitoring conditions en route.

**Cold Chain Context:** This bounded context ensures **temperature-controlled handling** of products throughout storage and delivery. It monitors refrigeration units, freezers, and refrigerated trucks, often by ingesting IoT sensor data (telemetry). The ColdChain context issues alerts or events if conditions deviate from required ranges – for example, if a storage freezer rises above 5°C or if a delivery cooler’s temperature sensor breaks threshold. It also logs compliance data (time out of refrigeration, etc.) for audits. This context interacts with Shipping (for in-transit monitoring) and Inventory (for in-warehouse monitoring). For instance, if a warehouse cooler fails and items thaw, ColdChain would emit a *TemperatureThresholdBreached* event that the Inventory/Batch context listens to, so those batches can be marked spoiled. The IBM reefer shipping architecture is an analog: it separates a *Reefer Container* (cold-chain) subdomain that produces telemetric events, feeding a real-time analytics component. In our map, ColdChain similarly provides an **alert service** – it doesn’t directly change inventory, but publishes events that other contexts consume to enforce quality safeguards.

**Pricing Context:** This context handles product pricing, promotions, and markdowns. In a perishable goods business, pricing often ties into freshness: for example, items nearing expiration might be discounted to encourage quick sale. The Pricing context sets base prices from the Catalog context and adjusts prices based on rules or events. **Dynamic pricing policies** here can listen for Inventory events – e.g., a *BatchExpiringSoon* domain event from Inventory could trigger a rule to apply a 30% discount to that batch in the system. Pricing may also define **multi-buy deals** for soon-to-expire goods or update *“freshness scoring”* that is shown to customers (like *“40% off – Best before tomorrow\!”*). This bounded context is loosely coupled with Inventory (Inventory provides stock and expiry info; Pricing provides updated price info), typically through asynchronous events or queries. For instance, the Order context at checkout might call Pricing to get current prices for each item (making Pricing a supplier to Order), and Pricing would have already incorporated any near-expiry discounts based on the latest inventory state.

**Notification/Alerts Context:** This supporting context is responsible for real-time notifications and alerts, both internal (staff) and external (customers). It consumes events from other contexts and translates them into user-facing messages. For example, Inventory might publish an *ItemExpiringSoon* event when a batch is 2 days from expiry, and the Notification context would catch this and send an email or dashboard alert to managers to mark down or remove the item. Similarly, ColdChain might emit a *TemperatureAlarm* event if a cooler fails, and Notification will send an urgent alert to the maintenance team. From the consumer side, this context can drive **freshness indicators** on the e-commerce front-end – e.g., pushing updates to product pages (“Only 3 days left to enjoy optimal freshness\!”) or notifying customers who purchased a product about a recall/quality issue. In practice, these alerts are often automated by the WMS: warehouse management systems send notifications when items approach expiration. By modeling it as a context, we separate the concern of communication from the core logic – Inventory decides *what* happens (item expired), and Notification decides *how* to inform the relevant people/systems.

**Catalog Context:** This context (also called *Product Catalog* or *Master Data*) manages all product definitions and static attributes. For perishables, it stores information like each product’s **shelf life**, storage requirements (e.g. “Keep frozen below \-10°C”), and perhaps nutritional or regulatory info. The **ubiquitous language** around “expiration” differs here: in the Product (Catalog) context, *“expiry”* might denote the standard shelf life duration for an item, whereas in other contexts it refers to a specific batch’s date. Keeping Catalog separate ensures that product master data (which changes infrequently) is maintained independently of day-to-day inventory levels. Other contexts use Catalog as a reference: e.g., Inventory uses the shelf life to calculate an incoming batch’s expiration date; Pricing might use product category to apply rules (fresh produce vs. pantry goods); ColdChain uses the product’s required temperature range to set monitoring thresholds. The Catalog context typically integrates via published language or anti-corruption layers rather than frequent events, since product data changes relatively rarely. For instance, an update in Catalog (say a new shelf life for a product) could be published as an event that Inventory subscribes to and uses to update future batch calculations.

All these bounded contexts collaborate but remain decoupled through well-defined interfaces or events. For example, the **Order context** (part of the consumer-facing domain, not detailed above) orchestrates a purchase by interacting with Pricing (to get prices), Inventory (to reserve stock via FEFO), and Shipping (to initiate fulfillment). Each of those interactions crosses a context boundary (often implemented via asynchronous messaging or RESTful APIs), respecting that each context owns its data and rules. This separation aligns with DDD strategic design: *core domains* like Inventory and Shipping get the most attention, whereas *supporting domains* (Catalog, Notification) and *generic domains* (perhaps Payment processing) can be kept standard or outsourced.

## Modeling Expiration and Quality Degradation in the Domain

A central question is how to model **time-driven events** like expiration and **external influences** like quality decay within our domain model. DDD practitioners approach these concerns by making them explicit in the **ubiquitous language** and in the **design of aggregates and domain events**.

### Expiration as a First-Class Domain Event

In a perishable goods domain, the passing of time (leading to an item’s expiration) is not just a background detail – it’s a business event. Vaughn Vernon argues that if the business cares about a time period ending (e.g. an expiration date reached), that should be modeled as a **Domain Event, not a command**. Unlike a user-initiated action, an expiration is an incontrovertible fact of the domain that cannot be refused. Therefore, our model will include events such as **BatchExpired** (meaning a specific batch has reached its expiration date) as part of the ubiquitous language.

**How is this implemented?** One approach is to have a scheduled process (an **infrastructure service**) detect when the expiration time occurs and then tell the domain to handle it. The domain model (e.g. a Batch aggregate) can have a method like `expire()` which applies the rules for an expired batch – marking it unusable and raising a *BatchExpired* event internally. The key is that the trigger is time-based, but the reaction is domain-specific. By treating *time expiration* as a domain event, we ensure all invariants and side effects are handled consistently. For example, when a *BatchExpired* event is raised, it could be handled within the Inventory context to remove the batch from available stock and also published as an **integration event** to other contexts (Pricing, Notification). This separation of concerns follows the guidance that domain events capture something that *happened* in the past, while integration events propagate that fact to other bounded contexts after the transaction completes.

It’s worth noting that Eric Evans and early DDD thinkers did not highlight domain events in the original blue book, but later recognized their importance as a building block to model things like time-based changes. A domain event is immutable and represents a historical fact – in our case, “Batch \#123 *has expired on 2025-07-01*” is a fact that, once true, is recorded and cannot be undone. Treating expiration this way has multiple benefits: it decouples the detection of expiry from the business responses to it, and it provides a log of what happened when (useful for auditing and for driving other processes).

### Quality Degradation and Cold-Chain Events

Similar to time expiration, **quality degradation** events should be explicit. For example, if a temperature excursion occurs (a freezer breaks down, or a shipment goes out of the allowed range), that is a significant domain event: perhaps *TemperatureThresholdBreached* or *BatchSpoiled*. Top DDD practitioners recommend modeling even external occurrences as domain events when they matter to the business. In practical terms, our ColdChain context will translate raw sensor signals into higher-level events in the ubiquitous language. A sensor might emit “temp \= \-5°C” but the domain event would be *TemperatureThresholdBreached(shipmentId, currentTemp, threshold)* meaning “the rule ‘keep below \-10°C’ was violated for shipment X.”

Inside the ColdChain context, there might be an Aggregate (e.g. a *ShipmentTemperatureMonitor*) that tracks readings and determines when an event should fire. When it does, the ColdChain context publishes an event like *TemperatureThresholdBreached* or *ReeferAlarmRaised*. Other contexts then react. For instance, the Inventory/Batch context might listen for *TemperatureThresholdBreached* (with details of which batch or shipment was affected) and respond by marking those batches as **spoiled** (unusable for sale). A *BatchSpoiled* domain event could then be raised within Inventory to finalize that decision. This cascade of events ensures that quality issues propagate to all parts of the system that need to know, without tight coupling. It aligns with an **event-driven architecture** where each context reacts to events based on its own logic.

#### Example – Order Process with Quality Constraints

Indu Alagarsamy’s scenario provides a concrete illustration: When a customer places an order that includes a perishable item, the Order context emits an *OrderPlaced* event. The **Inventory context** hears this and must allocate stock – applying FEFO, it chooses the batch with the earliest expiry and reserves it. Meanwhile, the **Shipping context** also reacts to *OrderPlaced* (or perhaps an *OrderReadyForFulfillment* event from Order) and prepares shipment. If the item is perishable, Shipping might engage the **ColdChain context** (e.g. request a refrigerated truck or set up temperature tracking for the parcel). The ColdChain context doesn’t need to be told the item is perishable in an ad-hoc way – it could infer from product metadata or be triggered by a specific *PerishableOrderPlaced* event. Regardless, once the delivery is underway, ColdChain monitors it. If, say, the truck’s cooler fails, ColdChain raises *TemperatureThresholdBreached*. **Inventory** and **Notification** contexts would respond: Inventory marks the affected batch/order as spoiled (possibly triggering a *ShipmentSpoiled* event to the Order context to halt delivery), and Notification alerts the customer support team and the customer. Throughout this process, no single component holds the entire workflow; instead, each bounded context performs its piece upon receiving the relevant domain events. This decoupled, reactive pattern is essentially a **choreography-based saga** in microservices terms, which is a natural fit for DDD when modeling long-running business processes like order fulfillment with quality guarantees.

### Ensuring Invariants with Aggregates

Aggregates in DDD encapsulate state and enforce invariants within a bounded context. We identify a few key Aggregates for our domain (see Table 1 below). For example, a **Batch** aggregate enforces that *“quantity cannot go negative, and once expired, a batch cannot be sold.”* Likewise, a **Shipment** aggregate enforces that *“if a shipment contains perished goods, it cannot be marked Delivered successfully”* (perhaps it transitions to a Problematic state instead). The definition of aggregates and their invariants was guided by the rule that a transaction should only encompass one aggregate. Thus, each batch is its own consistency boundary; updating two batches for FEFO rotation would be two transactions (one per batch), coordinated by a domain service or sagas for higher-level consistency. We avoid overly large aggregates that combine too many concepts, because they become hard to maintain consistency as models evolve. Instead, **domain events** are used to ensure **consistency across aggregates** where needed. For instance, if *Batch A expired* (Aggregate A) and that should cause a *Pricing change* on Product (Aggregate B), we’d raise *BatchExpired* in A and handle it by updating B in response, rather than trying to lock both A and B in one transaction.

In summary, expiration and quality decay are modeled through a combination of **Aggregate logic** (rules within the model) and **Domain Events** (to notify other parts of the model or other contexts of what happened). This reflects DDD best practices: make the implicit domain truths explicit in code. As Alberto Brandolini quips, events can even represent “the result of time passing” or “the consequence of another event” in the domain narrative. By following this approach, our system captures real-world phenomena (time expiry, spoilage) in the ubiquitous language and architecture, leading to a design that is both robust and aligned with business reality.

## Aggregate and Event Definitions

To solidify the model, Tables 1 and 2 define the key Aggregates and Domain Events in our perishable inventory system. These focus on expiration, batch tracking, and cold-chain compliance aspects:

**Table 1 – Key Aggregates with Fields and Invariants** (bounded context in parentheses):

| Aggregate (Context) | Key Fields / Properties | Invariants & Business Rules |
| :---- | :---- | :---- |
| **Batch** (Inventory/Batch)  \*(Represents a lot of product with expiry)\* | batchId (identity); productId; quantityOnHand; expiryDate; status (e.g. *Active*, *Expired*, *Spoiled*); storageLocation; receivedDate; allowedStorageTemp (optional). | \- **Expiration Rule:** Must not allocate or sell if `currentDate > expiryDate` (if expired, status \= *Expired* and quantity cannot be used).  \- \*\*FEFO Allocation:\*\* When fulfilling orders, this batch should only be chosen if it’s the earliest-expiring among available batches (ensured by Inventory logic). \- \*\*Spoilage Rule:\*\* If a linked temperature breach event is received, set status \= \*Spoiled\* (batch is quarantined from sale). \- \*\*Quantity Rule:\*\* \`quantityOnHand\` cannot go negative; decrement on picks, increment on returns only if before expiry. |
| **InventoryItem** (Inventory)  \*(Stock for a specific product, may span batches)\* | productId (identity); totalQuantity; **batches** (list of Batch IDs or embedded batch value objects, sorted by expiry); locationId (warehouse). | \- **Consistency:** Sum of batch quantities \= `totalQuantity`.  \- \*\*FEFO Enforcement:\*\* For any outward movement (sale, allocation), must choose the batch with the earliest expiry (i.e., first in the sorted list) – e.g., cannot ship from a later-expiring batch if an earlier one is in stock. \- \*\*Stock Reconciliation:\*\* No batch can have quantity if already expired (expired batches should be excluded from \`totalQuantity\`). \- \*\*Batch Uniqueness:\*\* Each batch in the list has a unique batchId (no duplicates) and belongs to this same product. |
| **Shipment** (Shipping)  \*(Delivery of one order or consignment)\* | shipmentId; orderId (or list of orders in batch shipment); items (list of `<product, quantity, batchId>` allocated); status (*Pending*, *InTransit*, *Delivered*, *Cancelled*, *Failed*); deliveryDate (estimated/actual); requiredTempRange (if perishable, e.g. 2°C–8°C) | \- **Allocation Complete:** All `items` must be allocated from inventory before shipment can start (no item without a batchId once *InTransit*).  \- \*\*Temperature Compliance:\*\* If \`requiredTempRange\` is set, a ColdChain monitor must be attached before leaving warehouse. Shipment cannot depart without an assigned ColdChain tracking ID when carrying perishables. \- \*\*No Delivery of Spoiled Goods:\*\* If any item’s batch becomes \*Spoiled\* or \*Expired\* in transit, the shipment status should transition to \*Failed\* or \*Exception\* instead of \*Delivered\*. (Ensures we don’t consider it a successful delivery if quality was compromised.) \- \*\*Immutable Order Link:\*\* \`orderId\` (if one-to-one) is fixed; you cannot reassign a shipment to a different order once created. |
| **ReeferContainer** (ColdChain)  \*(Monitors conditions for a shipment or storage unit)\* | containerId (identity); currentTemp; targetTempRange; contents (maybe batch/product IDs being protected); status (*OK*, *Alert*, *Critical*); historyLog (events or readings log). | \- **Threshold Monitoring:** Must regularly record conditions (e.g. temperature every 10 min). If `currentTemp` goes outside `targetTempRange` for more than X minutes, raise an Alert (domain event) and set status \= *Alert*.  \- \*\*Autonomous Alerts:\*\* No external command needed to trigger an alert; the entity itself (or its context service) emits events when conditions violate policy. \- \*\*Recovery Rule:\*\* If conditions return to normal within allowable time, can downgrade alert, but all excursions are logged. \- \*\*Association:\*\* A ReeferContainer may be assigned to a Shipment or a storage Location; it should have at most one active assignment at a time. |

**Table 2 – Domain Events and Payloads** (with typical triggers and consumers):

| Domain Event | Payload (Key Data) | Description and Purpose |
| :---- | :---- | :---- |
| **BatchExpired** (Inventory) | batchId; productId; expiredOn (timestamp of expiration) | Indicates a batch’s expiration date has been reached. Emitted by Inventory/Batch context (often via a scheduler trigger) to signal that this batch is no longer sellable. Triggers removal from available inventory and informs other contexts: e.g., Pricing (to possibly drop price to zero or mark as unsellable) and Notification (to alert staff for disposal). As Vaughn Vernon notes, this time-based event is modeled as a domain fact, not a user action. |
| **BatchExpiringSoon** (Inventory) | batchId; productId; expiresOn; noticePeriod (e.g. 3 days) | A warning event that a batch is approaching its expiration (e.g. generated X days before `expiresOn`). The Inventory context may publish this proactively. Consumers include Pricing (to apply a discount or promotion on this batch/product) and Notification (to inform stakeholders or even customers, e.g. “freshness guarantee: this item expiring in 3 days”). This event helps implement FEFO by preparing the system to prioritize the batch before it actually expires. |
| **BatchSpoiled** (Inventory) | batchId; productId; spoilReason (e.g. "TempOutOfRange", "Expired"); timestamp | Declares that a batch has been **rendered unusable** due to quality issues (could be triggered by a ColdChain alert or a manual quality check). Inventory raises this to similar consumers as above, ensuring no orders ship from this batch. This may result in stock adjustments (removing the batch from available stock) and Notification alerts (e.g. urgent removal from shelves). If spoilReason was a temperature excursion, it implies a ColdChain event preceded it. |
| **TemperatureThresholdBreached** (ColdChain) | containerId (or shipmentId or storage unit ID); currentTemp; threshold; durationExceeded | Emitted by ColdChain when a refrigeration unit goes out of the safe range beyond allowable tolerance. This event’s payload gives details of the breach. Inventory context may subscribe (to flag all batches in that container as potentially spoiled), and Shipping subscribes to possibly halt or redirect a shipment. Notification will alert technicians or managers. This event is a key part of cold-chain compliance, creating an auditable record of a violation. |
| **ShipmentDelayed** (Shipping) – *Integration Event* | shipmentId; reason; expectedDelayDuration | (Not strictly a perishable-only event, but relevant if delays affect freshness.) Indicates a delivery delay that might risk product freshness. Emitted by Shipping, consumed by ColdChain/Inventory to possibly extend monitoring or by Pricing to decide if a markdown is needed for late arrival stock. For example, if a shipment of fresh food is delayed 2 days, the Inventory might mark those batches’ expiration sooner or notify customers. |
| **PriceAdjusted** (Pricing) – *Integration Event* | productId (or batchId); newPrice; oldPrice; adjustmentReason | Emitted by Pricing when it changes the price of a product/batch, often with reason “near expiry” or “overstock”. Other contexts (like the front-end or Order context) consume this to display updated pricing. In our domain, a common trigger is a BatchExpiringSoon event leading to a discount – this resulting PriceAdjusted event closes the loop by informing all systems of the new price. |

*Note:* Domain events are typically named in past tense (they signify something that **has occurred**). Some events above, like *BatchExpiringSoon*, can be seen as a scheduled **notification event** rather than a strictly past-tense fact; however, it’s representing the fact “it *became true* that this batch is within X days of expiry,” which justifies the past-tense naming as well. Also, we distinguish between **domain events** and **integration events** as needed. For example, *BatchExpired* might be both a domain event within Inventory (triggering internal adjustments) and an integration event to other contexts. *PriceAdjusted* is mainly an integration event (since it informs other bounded contexts) and might not even exist within the core domain model of perishable goods – it’s more about syncing derived information.

These aggregates and events work in concert. For instance, when a **ReeferContainer** detects a breach, it raises *TemperatureThresholdBreached*. The **Batch** aggregate(s) associated with that container will consume that event (likely via an application service in the Inventory context) and invoke their `spoil()` behavior, which sets status to *Spoiled* and raises *BatchSpoiled*. The **Shipment** aggregate might also receive a command to cancel or mark exception if it was in transit. Thanks to domain events, all these cascades can happen reactively without a god-object orchestrating them, and each aggregate’s invariants are respected (e.g., a Batch will never unknowingly remain “Active” if it should be spoiled – the event handling ensures it transitions state exactly once).

## MERN Stack Blueprint: Implementation Sketch

Finally, we outline how these DDD patterns can be implemented in a **MERN (MongoDB, Express, React, Node.js)** technology stack. The backend (Node/Express with MongoDB) will contain the domain logic for Inventory, Batch, etc., while leveraging **Agenda.js** (a Node job scheduler) and **Kafka** (as an event bus) for scheduling and integration. We provide pseudocode snippets to illustrate two key pieces: (1) a **Batch value object / entity** definition capturing expiration rules, and (2) an **Agenda job for scanning expirations** and emitting events, including a Kafka publish to integrate with other contexts.

// 1\. Domain Model: Batch Value Object (within Inventory context)

class Batch {

  constructor(batchId, productId, quantity, expiryDate, storageTempRange) {

    if (expiryDate \<= new Date()) {

      throw new Error("Cannot create Batch: expiry date must be in the future");

    }

    this.batchId \= batchId;

    this.productId \= productId;

    this.quantityOnHand \= quantity;

    this.expiryDate \= expiryDate;

    this.status \= 'ACTIVE';  // Other statuses: 'EXPIRED', 'SPOILED'

    this.storageTempRange \= storageTempRange || null;  // e.g. { min: 2, max: 8 } for refrigerated

  }

  get isExpired() {

    return new Date() \> this.expiryDate;

  }

  /\*\* Invariant enforcement: prevent using batch if expired or spoiled \*/

  canAllocate(amount) {

    return (this.status \=== 'ACTIVE' && \!this.isExpired && amount \<= this.quantityOnHand);

  }

  /\*\* Behavior: mark the batch as expired \*/

  expire() {

    if (this.status \!== 'EXPIRED') {

      this.status \= 'EXPIRED';

      // Domain event: BatchExpired

      DomainEvents.raise(new BatchExpired(this.batchId, this.productId, this.expiryDate));

    }

  }

  /\*\* Behavior: mark the batch as spoiled (e.g., due to temperature breach) \*/

  spoil(reason) {

    if (this.status \!== 'SPOILED') {

      this.status \= 'SPOILED';

      DomainEvents.raise(new BatchSpoiled(this.batchId, this.productId, reason));

    }

  }

  /\*\* Deduct quantity (e.g., when allocating to an order) \*/

  allocate(amount) {

    if (\!this.canAllocate(amount)) {

      throw new Error("Allocation failed: batch not available or insufficient.");

    }

    this.quantityOnHand \-= amount;

    if (this.isExpired) {

      // If allocation happened just as it expired, ensure no further use

      this.expire();

      throw new Error("Batch just expired during allocation process.");

    }

    if (this.quantityOnHand \=== 0\) {

      // Optionally: if batch is fully used up before expiry, we might complete it

      // (Though often batch stays in Active status until expiry even if quantity 0, for record)

    }

  }

}

In the above snippet, the `Batch` class (which could be a Mongoose schema or a plain domain object) encapsulates the rules for a batch. The `expire()` and `spoil()` methods raise domain events. Here we assume a simple DomainEvents dispatcher utility that collects events to be published after the transaction (a pattern per Udi Dahan and others) – implementing that is beyond our scope, but frameworks often provide it. Notice we don’t directly integrate with other contexts here; we only raise events. For example, `BatchExpired` event would be handled inside the Inventory context (perhaps to remove the batch from an InventoryItem aggregate) and also turned into an integration event for external contexts.

Next, we use **Agenda.js** to schedule a periodic job that scans for expiring batches. Agenda will run within the Inventory context as an infrastructure service. This job will find any batches whose expiry time has arrived (or is within some threshold) and invoke domain logic to expire them, thereby raising the events defined above. We will also use a Kafka producer to broadcast integration events to other bounded contexts (Pricing, Notification, etc.), following the pattern that integration events are published after the domain transaction commits.

// 2\. Agenda job: daily expiration scan, integrated with Kafka for events

const Agenda \= require('agenda');

const Kafka \= require('kafkajs').Kafka;

const mongoose \= require('mongoose');

// (Assume Mongoose models and Kafka config are set up elsewhere)

const mongoConnectionString \= process.env.MONGO\_URL;

const agenda \= new Agenda({ db: { address: mongoConnectionString, collection: 'jobs' } });

// Configure Kafka producer (pointing to broker service)

const kafka \= new Kafka({ brokers: \[process.env.KAFKA\_BROKER\] });

const producer \= kafka.producer();

await producer.connect();

// Define the job to check for expiring batches

agenda.define('check-expired-batches', async job \=\> {

  const now \= new Date();

  // Find all Active batches that are past their expiry

  const expiredBatches \= await BatchModel.find({ status: 'ACTIVE', expiryDate: { $lte: now } });

  for (let batch of expiredBatches) {

    batch.status \= 'EXPIRED';

    await batch.save();  // persist state change in MongoDB

    // Compose integration event message (BatchExpired)

    const eventPayload \= {

      eventType: 'BatchExpired',

      batchId: batch.batchId,

      productId: batch.productId,

      expiredOn: now.toISOString()

    };

    await producer.send({

      topic: 'InventoryEvents',   // using a topic per context/aggregate type:contentReference\[oaicite:47\]{index=47}

      messages: \[

        { key: String(batch.productId), value: JSON.stringify(eventPayload) }

      \]

    });

    console.log(\`Published BatchExpired for batch ${batch.batchId}\`);

  }

});

// (Optional) Define a similar job to warn about batches expiring soon (e.g. in 3 days)

agenda.define('notify-expiring-soon', async job \=\> {

  const inThreeDays \= new Date(Date.now() \+ 3\*24\*60\*60\*1000);

  const almostExpired \= await BatchModel.find({ status: 'ACTIVE', expiryDate: { $lte: inThreeDays, $gt: new Date() } });

  for (let batch of almostExpired) {

    const eventPayload \= {

      eventType: 'BatchExpiringSoon',

      batchId: batch.batchId,

      productId: batch.productId,

      expiresOn: batch.expiryDate.toISOString(),

      noticeDays: 3

    };

    await producer.send({ topic: 'InventoryEvents', messages: \[{ key: String(batch.productId), value: JSON.stringify(eventPayload) }\] });

    console.log(\`Published BatchExpiringSoon for batch ${batch.batchId}\`);

  }

});

// Schedule the jobs: e.g., run at 00:01 every day

await agenda.start();

await agenda.every('0 1 \* \* \*', 'check-expired-batches');   // daily at 1 AM

await agenda.every('0 2 \* \* \*', 'notify-expiring-soon');    // daily at 2 AM

In this pseudocode, we connect to MongoDB and set up Agenda. The job `'check-expired-batches'` runs daily (scheduling details can be adjusted) and finds all batches that should be expired. For each, it updates the database (ensuring the batch’s status is now "EXPIRED" – this is the domain state change). Then it sends a message to a Kafka topic named `"InventoryEvents"` with an event type `BatchExpired`. We use the productId as the message key so that all events for a given product go to the same partition (ordering guarantee, useful if needed by consumers). We similarly define a `'notify-expiring-soon'` job that could send out warnings ahead of time.

Other contexts would subscribe to these Kafka topics. For instance, a **Pricing service** (within the Pricing bounded context) might subscribe to `"InventoryEvents"` filtering for `"BatchExpiringSoon"` events – upon receiving one, it could automatically apply a discount to that product and perhaps emit a `PriceAdjusted` event of its own. A **Notification service** would subscribe for both `BatchExpiringSoon` (to inform relevant parties that “Batch X of Product Y will expire in 3 days” as per WMS alert best practices) and `BatchExpired` (to perhaps alert that “Batch X just expired and was removed from stock”). This asynchronous event-driven approach fits well with Node.js and Kafka, leveraging their non-blocking, scalable nature.

A few implementation notes aligning with DDD best practices and our earlier discussion:

* The **Agenda job** acts in the **application layer**, not inside the domain model. We're using it to trigger domain behavior (expiring batches) at the correct time. This is consistent with the idea that certain domain events originate from timers or schedules rather than direct user commands. The domain model (Batch) provides the `expire()` logic (as shown in the Batch class), but we invoke it from a scheduler. We could also call `batch.expire()` and have it raise a domain event which an in-memory handler then converts to a Kafka message. In our simple snippet, we shortcut by directly creating the Kafka message after marking the batch expired. In a richer design, we'd use a domain event dispatcher to ensure the event is recorded and possibly also update other in-process models immediately.

* We maintain **idempotence** in the scheduler: if a batch was already expired (status not Active), we skip it. This ensures that even if the job runs multiple times or a batch was manually expired earlier, we don't duplicate events or perform redundant work.

* We chose a **topic per context** strategy for Kafka (e.g. "InventoryEvents"). This follows the IBM reference architecture which used a topic per aggregate type. The advantage is that consumers can subscribe to a broad category and then filter by event type. Alternatively, we could use separate topics for each event type (e.g. "BatchExpiredEvents"), but grouping by context often aligns with ownership (Inventory service owns its topic and publishes various events to it). Each event payload includes an explicit type field to distinguish them.

* **Kafka integration pattern:** We are effectively implementing the **Publisher-Subscriber pattern** for integration events. Inventory (publisher) doesn't know who will consume *BatchExpired* or *BatchExpiringSoon*; it simply publishes to Kafka. Other bounded contexts (subscribers) have **autonomy** – e.g., the Notification context might choose to ignore certain events or throttle alerts, etc., without affecting Inventory. This loose coupling is crucial for microservices and aligns with DDD's bounded context isolation. It also means adding a new bounded context (say, an **Analytics** context that tracks spoilage statistics) is as simple as adding a new Kafka consumer for the relevant events, with no change to the Inventory service. This extensibility is a hallmark of well-designed DDD systems.

* The MERN stack front-end (React) can be wired to these patterns by consuming notifications or queries from the back-end. For example, when a customer views a product, the React app could call an API on the Inventory context to get a freshness indicator (e.g. the nearest expiration date of that product in stock). The Inventory service could compute that quickly (since it stores batches sorted by date) and respond, or perhaps the front-end subscribes to a WebSocket channel that the Notification context feeds with live “freshness” updates. These implementation details go beyond DDD, but the groundwork we laid (events, aggregates) makes such features easier to add.

In conclusion, by applying DDD patterns – clear bounded contexts, aggregates with enforced invariants, and domain events for things like expiration and quality degradation – we can design a perishable e-commerce system that is **resilient, modular, and true to the domain’s needs**. Warehouse and back-office processes (inventory rotation, cold-chain monitoring, dynamic pricing) are handled in their own contexts but remain in sync through an event-driven architecture. This ensures, for example, that when a yogurt batch expires in the warehouse, the system automatically pulls it from available stock, marks it down in price or removes it from sale, alerts a manager to dispose of it, and prevents any order from shipping it – all without manual intervention, and all traceable through domain events. Such a design not only reduces waste and prevents errors (a core goal of FEFO and food safety compliance) but also provides a clear mental model to evolve the software as the business grows. Each bounded context can be extended or refactored independently (for instance, swapping out the Notification technology or scaling the Inventory service) as long as it continues to speak the ubiquitous language on the outside. This alignment of software design with real-world perishable supply chain practices is the ultimate payoff of Domain-Driven Design in this domain.

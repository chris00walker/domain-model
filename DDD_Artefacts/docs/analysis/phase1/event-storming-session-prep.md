# Event Storming Session Preparation

> **Purpose**: Prepare domain experts for collaborative Event Storming sessions

**Session Date**: _[TO BE SCHEDULED]_
**Facilitator**: _[TO BE ASSIGNED]_
**Duration**: 2-3 hours per context

## Pre-Session Checklist

- [ ] Book conference room with wall space for sticky notes
- [ ] Prepare sticky notes (orange=events, blue=commands, yellow=aggregates, pink=external systems)
- [ ] Print context maps and PRDs for reference
- [ ] Invite domain experts and stakeholders
- [ ] Set up digital collaboration tool (Miro/Mural) as backup

## Session Agenda Template

1. **Context Introduction** (15 min) - Review PRD and business context
2. **Event Storming** (90 min) - Collaborative domain modeling
3. **Integration Points** (30 min) - Map context boundaries
4. **Validation** (15 min) - Review and validate model
5. **Next Steps** (10 min) - Assign follow-up actions

## BATCH TRACKING - Session Brief

### 📋 batch_tracking - Pre-Session Reading
- **PRD**: [batch_tracking Requirements](DDD_Artefacts/docs/prd/core/batch_tracking.md)
- **Context Map**: Review integration points with other contexts
- **Glossary**: [Domain Terms](DDD_Artefacts/docs/ubiquitous-language/batch-tracking-glossary.md)

### 🟠 batch_tracking - Known Domain Events (Starting Points)
- **ColdChainInspectionCompleted** - _What business condition triggers this?_

### 🔵 batch_tracking - Known Commands (Actions)
- **Complete** - _Who initiates this and why?_

### 📄 batch_tracking - Business Context
- **Purpose**: Manage the complete lifecycle of product batches throughout the supply chain, ensuring traceability, quality control, and regulatory compliance for perishable goods.
- **Business Capabilities**:
- End-to-end batch/lot tracking
- Expiration and shelf-life management
- Quality control integration
- Regulatory compliance and reporting

### 👥 batch_tracking - Assigned Agents
- Liam Patel (Core)
- William Martinez (Core)
- Elijah Walker (Core)
- Maria Gomez (Core)
- Sophia Davis (Core)
- Ethan Brown (Core)

### 📝 batch_tracking - Agent Action Items
- Review PRD and prepare domain assumptions
- Bring relevant data or metrics to discuss
- Identify potential risks or constraints

### ❓ batch_tracking - Key Business Questions for Session
1. What triggers a new batch to be created?
2. How do we handle batch splitting during processing?
3. What information must be tracked for regulatory compliance?
4. When does a batch expire or become invalid?
5. What compliance requirements must be met?
6. What external systems need integration?

### 🎯 batch_tracking - Session Success Criteria
- [ ] Complete event timeline for batch_tracking business processes
- [ ] Identify all domain events and their triggers
- [ ] Map commands to aggregates and business rules
- [ ] Define integration events with other contexts
- [ ] Validate model with domain experts
- [ ] Document hotspots and areas needing further analysis

---

## COLD CHAIN - Session Brief

### 📋 cold_chain - Pre-Session Reading
- **PRD**: [cold_chain Requirements](DDD_Artefacts/docs/prd/core/cold_chain.md)
- **Context Map**: Review integration points with other contexts
- **Glossary**: [Domain Terms](DDD_Artefacts/docs/ubiquitous-language/cold-chain-glossary.md)

### 🟠 cold_chain - Known Domain Events (Starting Points)
- **ColdChainMonitoringCompleted** - _What business condition triggers this?_
- **ColdChainMonitoringFailed** - _What business condition triggers this?_

### 🔵 cold_chain - Known Commands (Actions)
- **Complete** - _Who initiates this and why?_

### 📄 cold_chain - Business Context
- **Purpose**: Ensure the integrity of temperature-sensitive products throughout the supply chain, maintaining product quality, ensuring food safety, and meeting regulatory requirements for perishable goods.
- **Business Capabilities**:
- End-to-end temperature monitoring
- Real-time alerting and notification
- Equipment and device management
- Compliance reporting and auditing

### 👥 cold_chain - Assigned Agents
- Maria Gomez (Core)
- Sophia Davis (Core)
- Isabella Hernandez (Core)
- Ethan Brown (Core)

### 📝 cold_chain - Agent Action Items
- Review PRD and prepare domain assumptions
- Bring relevant data or metrics to discuss
- Identify potential risks or constraints

### ❓ cold_chain - Key Business Questions for Session
1. What temperature thresholds trigger alerts?
2. How do we handle temperature excursions?
3. What documentation is required for cold chain compliance?
4. How do we integrate with shipping carrier temperature monitoring?
5. What compliance requirements must be met?
6. What external systems need integration?

### 🎯 cold_chain - Session Success Criteria
- [ ] Complete event timeline for cold_chain business processes
- [ ] Identify all domain events and their triggers
- [ ] Map commands to aggregates and business rules
- [ ] Define integration events with other contexts
- [ ] Validate model with domain experts
- [ ] Document hotspots and areas needing further analysis

---

## INVENTORY MANAGEMENT - Session Brief

### 📋 inventory_management - Pre-Session Reading
- **PRD**: [inventory_management Requirements](DDD_Artefacts/docs/prd/core/inventory.md)
- **Context Map**: Review integration points with other contexts
- **Glossary**: [Domain Terms](DDD_Artefacts/docs/ubiquitous-language/inventory-management-glossary.md)

### 📄 inventory_management - Business Context
- **Purpose**: Provide comprehensive control over stock levels, locations, and movements of perishable goods, ensuring optimal inventory levels, minimizing waste, and maximizing service levels through FEFO (First-Expired-First-Out) inventory management and real-time visibility across the supply chain.
- **Business Capabilities**:
- Real-time inventory tracking and visibility
- FEFO and batch/lot management
- Demand forecasting and automated replenishment
- Inventory optimization and analytics

### 👥 inventory_management - Assigned Agents
- Liam Patel (Core)
- Ethan Brown (Core)
- Owen Bell (Integration)
- Maria Gomez (Core)
- Sophia Davis (Core)

### 📝 inventory_management - Agent Action Items
- Review PRD and prepare domain assumptions
- Bring relevant data or metrics to discuss
- Identify potential risks or constraints

### ❓ inventory_management - Key Business Questions for Session
1. How do we implement FEFO (First Expired, First Out) logic?
2. What triggers automatic reorder points?
3. How do we handle inventory reservations across channels?
4. What happens when inventory expires?
5. What compliance requirements must be met?
6. What external systems need integration?

### 🎯 inventory_management - Session Success Criteria
- [ ] Complete event timeline for inventory_management business processes
- [ ] Identify all domain events and their triggers
- [ ] Map commands to aggregates and business rules
- [ ] Define integration events with other contexts
- [ ] Validate model with domain experts
- [ ] Document hotspots and areas needing further analysis

---

## QUALITY CONTROL - Session Brief

### 📋 quality_control - Pre-Session Reading
- **PRD**: [quality_control Requirements](DDD_Artefacts/docs/prd/core/quality_control.md)
- **Context Map**: Review integration points with other contexts
- **Glossary**: [Domain Terms](DDD_Artefacts/docs/ubiquitous-language/quality-control-glossary.md)

### 📄 quality_control - Business Context
- **Purpose**: Ensure all products meet established quality standards throughout the supply chain by providing comprehensive tools for inspection, testing, compliance management, and continuous improvement, with special emphasis on perishable goods and regulatory requirements.
- **Business Capabilities**:
- Quality planning and standards management
- Inspection and testing workflows
- Non-conformance and CAPA management
- Regulatory compliance and reporting

### 👥 quality_control - Assigned Agents
- Maria Gomez (Core)
- Liam Patel (Core)
- Olivia Wang (Strategic)
- Sophia Davis (Core)

### 📝 quality_control - Agent Action Items
- Review PRD and prepare domain assumptions
- Bring relevant data or metrics to discuss
- Identify potential risks or constraints

### ❓ quality_control - Key Business Questions for Session
1. What triggers a quality inspection?
2. How do we handle failed quality checks?
3. What documentation is required for quality compliance?
4. How do we track quality metrics over time?
5. What compliance requirements must be met?
6. What external systems need integration?

### 🎯 quality_control - Session Success Criteria
- [ ] Complete event timeline for quality_control business processes
- [ ] Identify all domain events and their triggers
- [ ] Map commands to aggregates and business rules
- [ ] Define integration events with other contexts
- [ ] Validate model with domain experts
- [ ] Document hotspots and areas needing further analysis

---

## RETURNS - Session Brief

### 📋 returns - Pre-Session Reading
- **PRD**: [returns Requirements](DDD_Artefacts/docs/prd/supporting/returns.md)
- **Context Map**: Review integration points with other contexts
- **Glossary**: [Domain Terms](DDD_Artefacts/docs/ubiquitous-language/returns-glossary.md)

### 🟠 returns - Known Domain Events (Starting Points)
- **ReturnProcessed** - _What business condition triggers this?_

### 🔵 returns - Known Commands (Actions)
- **Process** - _Who initiates this and why?_

### 🔗 returns - Integration Points to Explore
- ReturnsMgmt --> InventoryShelfLife
- ReturnsMgmt --> QualityControl
- ReturnsMgmt --> NotificationsAlerts

### 📄 returns - Business Context
- **Purpose**: Handle the end-to-end product return lifecycle—from customer initiation through physical processing and financial settlement—while minimising cost, fraud, and customer effort.
- **Business Capabilities**:
- Self-service return initiation & label generation
- Automated authorisation based on policy (30-day window, exemptions for perishables)
- Receive & inspect returned goods with disposition decisions (donation* when safety criteria met, destroy)
- Refund & credit processing aligned with Payment & Billing

### 👥 returns - Assigned Agents
- James Wilson (Core)
- Abigail Hall (Core)
- Matthew Campbell (Supporting)
- Ethan Brown (Core)
- Maria Gomez (Core)

### 📝 returns - Agent Action Items
- Review PRD and prepare domain assumptions
- Bring relevant data or metrics to discuss
- Identify potential risks or constraints

### ❓ returns - Key Business Questions for Session
1. What external systems need integration?
2. Who needs to be notified and when?

### 🎯 returns - Session Success Criteria
- [ ] Complete event timeline for returns business processes
- [ ] Identify all domain events and their triggers
- [ ] Map commands to aggregates and business rules
- [ ] Define integration events with other contexts
- [ ] Validate model with domain experts
- [ ] Document hotspots and areas needing further analysis

---

## SHOPPING CART - Session Brief

### 📋 shopping_cart - Pre-Session Reading
- **PRD**: [shopping_cart Requirements](DDD_Artefacts/docs/prd/supporting/shopping_cart.md)
- **Context Map**: Review integration points with other contexts
- **Glossary**: [Domain Terms](DDD_Artefacts/docs/ubiquitous-language/shopping-cart-glossary.md)

### 🟠 shopping_cart - Known Domain Events (Starting Points)
- **CartUpdated** - _What business condition triggers this?_
- **CartRefundProcessed** - _What business condition triggers this?_
- **CartCheckoutCompleted** - _What business condition triggers this?_
- **CartItemQuantityUpdated** - _What business condition triggers this?_
- **CartRecoveryFailed** - _What business condition triggers this?_
- **CartSubscriptionCreated** - _What business condition triggers this?_
- **ColdChainAuditCompleted** - _What business condition triggers this?_

### 🔵 shopping_cart - Known Commands (Actions)
- **Update** - _Who initiates this and why?_
- **Submit** - _Who initiates this and why?_
- **Complete** - _Who initiates this and why?_
- **Process** - _Who initiates this and why?_
- **Create** - _Who initiates this and why?_

### 📄 shopping_cart - Business Context
- **Purpose**: Provide customers with a persistent, real-time cart that bridges browsing and order creation, ensuring seamless checkout and accurate inventory reservation.
- **Business Capabilities**:
- Temporary product holding & quantity management
- Real-time price & promotion calculation
- Inventory reservation & release
- Cart session persistence (guest & logged-in)

### 👥 shopping_cart - Assigned Agents
- Noah Smith (Supporting)
- Sebastian Perez (Supporting)
- Grace Parker (Supporting)
- Maria Gomez (Core)
- Ethan Brown (Core)
- Michael Young (Strategic)

### 📝 shopping_cart - Agent Action Items
- Review PRD and prepare domain assumptions
- Bring relevant data or metrics to discuss
- Identify potential risks or constraints

### ❓ shopping_cart - Key Business Questions for Session
1. What compliance requirements must be met?
2. What external systems need integration?
3. Who needs to be notified and when?

### 🎯 shopping_cart - Session Success Criteria
- [ ] Complete event timeline for shopping_cart business processes
- [ ] Identify all domain events and their triggers
- [ ] Map commands to aggregates and business rules
- [ ] Define integration events with other contexts
- [ ] Validate model with domain experts
- [ ] Document hotspots and areas needing further analysis

---

## MARKETING - Session Brief

### 📋 marketing - Pre-Session Reading
- **PRD**: [marketing Requirements](DDD_Artefacts/docs/prd/strategic/marketing.md)
- **Context Map**: Review integration points with other contexts
- **Glossary**: [Domain Terms](DDD_Artefacts/docs/ubiquitous-language/marketing-glossary.md)

### 🔗 marketing - Integration Points to Explore
- Marketing --> ProductCatalog
- Marketing --> HubSpot
- Marketing --> NotificationsAlerts
- Marketing --> HubSpot

### 📄 marketing - Business Context
- **Purpose**: Drive growth and customer engagement for Elias Food Imports by promoting authentic Levantine & Mediterranean food products through targeted campaigns and personalized experiences.
- **Business Capabilities**:
- Multi-channel campaign management (email, social, content)
- Customer segmentation for B2C and B2B audiences
- Promotional strategy for both retail and wholesale channels
- Performance analytics with HubSpot integration

### 👥 marketing - Assigned Agents
- Olivia Wang (Strategic)
- Benjamin Lewis (Core)
- Michael Young (Strategic)
- Alexander Scott (Strategic)

### 📝 marketing - Agent Action Items
- Review PRD and prepare domain assumptions
- Bring relevant data or metrics to discuss
- Identify potential risks or constraints

### ❓ marketing - Key Business Questions for Session
1. What compliance requirements must be met?
2. What external systems need integration?
3. Who needs to be notified and when?

### 🎯 marketing - Session Success Criteria
- [ ] Complete event timeline for marketing business processes
- [ ] Identify all domain events and their triggers
- [ ] Map commands to aggregates and business rules
- [ ] Define integration events with other contexts
- [ ] Validate model with domain experts
- [ ] Document hotspots and areas needing further analysis

---

## SUPPLIER TRACEABILITY - Session Brief

### 📋 supplier_traceability - Pre-Session Reading
- **PRD**: [supplier_traceability Requirements](DDD_Artefacts/docs/prd/core/supplier_traceability.md)
- **Context Map**: Review integration points with other contexts
- **Glossary**: [Domain Terms](DDD_Artefacts/docs/ubiquitous-language/supplier-traceability-glossary.md)

### 🟠 supplier_traceability - Known Domain Events (Starting Points)
- **BatchTraceabilityUpdated** - _What business condition triggers this?_
- **BatchTrackingUpdated** - _What business condition triggers this?_
- **ColdChainAuditCompleted** - _What business condition triggers this?_

### 🔵 supplier_traceability - Known Commands (Actions)
- **Update** - _Who initiates this and why?_
- **Complete** - _Who initiates this and why?_
- **Cancel** - _Who initiates this and why?_

### 📄 supplier_traceability - Business Context
- **Purpose**: Provide end-to-end visibility into the supply chain, enabling tracking of products from source to consumer while ensuring compliance with food safety regulations, quality assurance, and supply chain risk management.
- **Business Capabilities**:
- Supplier lifecycle management and qualification
- Product traceability and chain of custody
- Compliance documentation management
- Supply chain risk assessment

### 👥 supplier_traceability - Assigned Agents
- Liam Patel (Core)
- William Martinez (Core)
- Elijah Walker (Core)
- Maria Gomez (Core)
- Sophia Davis (Core)

### 📝 supplier_traceability - Agent Action Items
- Review PRD and prepare domain assumptions
- Bring relevant data or metrics to discuss
- Identify potential risks or constraints

### ❓ supplier_traceability - Key Business Questions for Session
1. What compliance requirements must be met?
2. What external systems need integration?
3. Who needs to be notified and when?

### 🎯 supplier_traceability - Session Success Criteria
- [ ] Complete event timeline for supplier_traceability business processes
- [ ] Identify all domain events and their triggers
- [ ] Map commands to aggregates and business rules
- [ ] Define integration events with other contexts
- [ ] Validate model with domain experts
- [ ] Document hotspots and areas needing further analysis

---

## NOTIFICATIONS ALERTS - Session Brief

### 📋 notifications_alerts - Pre-Session Reading
- **PRD**: [notifications_alerts Requirements](DDD_Artefacts/docs/prd/supporting/notifications_alerts.md)
- **Context Map**: Review integration points with other contexts
- **Glossary**: [Domain Terms](DDD_Artefacts/docs/ubiquitous-language/notifications-alerts-glossary.md)

### 🟠 notifications_alerts - Known Domain Events (Starting Points)
- **ColdChainMonitoringCompleted** - _What business condition triggers this?_

### 🔵 notifications_alerts - Known Commands (Actions)
- **Complete** - _Who initiates this and why?_

### 📄 notifications_alerts - Business Context
- **Purpose**: Deliver timely, reliable, and compliant communications across channels (email, SMS, push, in-app) for transactional notifications and operational alerts.
- **Business Capabilities**:
- Multi-channel message dispatch with preference management
- Severity-based alerting with escalation and suppression rules
- Template management and localisation
- Delivery tracking with metrics (opens, clicks, failures)

### 👥 notifications_alerts - Assigned Agents
- Olivia Wang (Strategic)
- Ava Johnson (Integration)
- Evelyn Nelson (Strategic)
- Maria Gomez (Core)
- William Martinez (Core)

### 📝 notifications_alerts - Agent Action Items
- Review PRD and prepare domain assumptions
- Bring relevant data or metrics to discuss
- Identify potential risks or constraints

### ❓ notifications_alerts - Key Business Questions for Session
1. What compliance requirements must be met?
2. What external systems need integration?
3. Who needs to be notified and when?

### 🎯 notifications_alerts - Session Success Criteria
- [ ] Complete event timeline for notifications_alerts business processes
- [ ] Identify all domain events and their triggers
- [ ] Map commands to aggregates and business rules
- [ ] Define integration events with other contexts
- [ ] Validate model with domain experts
- [ ] Document hotspots and areas needing further analysis

---

## ANALYTICS REPORTING - Session Brief

### 📋 analytics_reporting - Pre-Session Reading
- **PRD**: [analytics_reporting Requirements](DDD_Artefacts/docs/prd/supporting/analytics_reporting.md)
- **Context Map**: Review integration points with other contexts
- **Glossary**: [Domain Terms](DDD_Artefacts/docs/ubiquitous-language/analytics-reporting-glossary.md)

### 📄 analytics_reporting - Business Context
- **Purpose**: Provide unified, near-real-time insight into business & technical performance, enabling data-driven decisions across Elias Food Imports.
- **Business Capabilities**:
- Central metric & KPI catalogue
- Self-service dashboards and scheduled reports
- Cross-context event analytics & anomaly detection
- Alert routing to Notifications & Alerts context

### 👥 analytics_reporting - Assigned Agents
- Olivia Wang (Strategic)
- Ava Johnson (Integration)
- Emily King (Strategic)
- Charlotte Hill (Core)
- Maria Gomez (Core)
- Evelyn Nelson (Strategic)

### 📝 analytics_reporting - Agent Action Items
- Review PRD and prepare domain assumptions
- Bring relevant data or metrics to discuss
- Identify potential risks or constraints

### ❓ analytics_reporting - Key Business Questions for Session
1. What external systems need integration?
2. Who needs to be notified and when?

### 🎯 analytics_reporting - Session Success Criteria
- [ ] Complete event timeline for analytics_reporting business processes
- [ ] Identify all domain events and their triggers
- [ ] Map commands to aggregates and business rules
- [ ] Define integration events with other contexts
- [ ] Validate model with domain experts
- [ ] Document hotspots and areas needing further analysis

---

## REVIEWS RATINGS - Session Brief

### 📋 reviews_ratings - Pre-Session Reading
- **PRD**: [reviews_ratings Requirements](DDD_Artefacts/docs/prd/supporting/reviews_ratings.md)
- **Context Map**: Review integration points with other contexts
- **Glossary**: [Domain Terms](DDD_Artefacts/docs/ubiquitous-language/reviews-ratings-glossary.md)

### 🟠 reviews_ratings - Known Domain Events (Starting Points)
- **BatchQualityAssuranceFailed** - _What business condition triggers this?_

### 🔵 reviews_ratings - Known Commands (Actions)
- **Cancel** - _Who initiates this and why?_

### 📄 reviews_ratings - Business Context
- **Purpose**: Capture authentic customer feedback and quantitative satisfaction signals to build trust, inform product improvements, and power personalised recommendations.
- **Business Capabilities**:
- Verified-purchase review submissions with 1–5 star ratings
- Moderation workflows ensuring compliance & brand safety
- Real-time aggregate rating computation for product pages & search
- Sentiment analytics feeding Product Catalog and Marketing insights

### 👥 reviews_ratings - Assigned Agents
- Maria Gomez (Core)
- Liam Patel (Core)
- Olivia Wang (Strategic)
- Evelyn Nelson (Strategic)
- Charlotte Hill (Core)

### 📝 reviews_ratings - Agent Action Items
- Review PRD and prepare domain assumptions
- Bring relevant data or metrics to discuss
- Identify potential risks or constraints

### ❓ reviews_ratings - Key Business Questions for Session
1. What compliance requirements must be met?
2. What external systems need integration?
3. Who needs to be notified and when?

### 🎯 reviews_ratings - Session Success Criteria
- [ ] Complete event timeline for reviews_ratings business processes
- [ ] Identify all domain events and their triggers
- [ ] Map commands to aggregates and business rules
- [ ] Define integration events with other contexts
- [ ] Validate model with domain experts
- [ ] Document hotspots and areas needing further analysis

---

## SALES QUOTING - Session Brief

### 📋 sales_quoting - Pre-Session Reading
- **PRD**: [sales_quoting Requirements](DDD_Artefacts/docs/prd/strategic/sales_quoting.md)
- **Context Map**: Review integration points with other contexts
- **Glossary**: [Domain Terms](DDD_Artefacts/docs/ubiquitous-language/sales-quoting-glossary.md)

### 🟠 sales_quoting - Known Domain Events (Starting Points)
- **ColdChainAuditCompleted** - _What business condition triggers this?_

### 🔵 sales_quoting - Known Commands (Actions)
- **Complete** - _Who initiates this and why?_

### 📄 sales_quoting - Business Context
- **Purpose**: The Sales & Quoting context manages the creation, negotiation, and management of commercial sales quotes and contracts, ensuring alignment with pricing strategies and margin targets.
- **Business Capabilities**:
- **Quote Generation**: Create and manage commercial quotes with volume-based pricing
- **Contract Management**: Handle B2B and wholesale contracts with negotiated terms
- **Approval Workflows**: Manage multi-level approval processes for pricing exceptions
- **Margin Protection**: Enforce segment-specific gross margin floors

### 👥 sales_quoting - Assigned Agents
- Maria Gomez (Core)
- Liam Patel (Core)
- Olivia Wang (Strategic)
- Alexander Scott (Strategic)
- Michael Young (Strategic)

### 📝 sales_quoting - Agent Action Items
- Review PRD and prepare domain assumptions
- Bring relevant data or metrics to discuss
- Identify potential risks or constraints

### ❓ sales_quoting - Key Business Questions for Session
1. What compliance requirements must be met?
2. What external systems need integration?
3. Who needs to be notified and when?

### 🎯 sales_quoting - Session Success Criteria
- [ ] Complete event timeline for sales_quoting business processes
- [ ] Identify all domain events and their triggers
- [ ] Map commands to aggregates and business rules
- [ ] Define integration events with other contexts
- [ ] Validate model with domain experts
- [ ] Document hotspots and areas needing further analysis

---

## Post-Session Actions

1. **Digitize Results** - Transfer sticky note model to digital format
2. **Update PRDs** - Enhance requirements with session insights
3. **Create ADRs** - Document architectural decisions made
4. **Update Context Map** - Refine integration patterns
5. **Plan Implementation** - Create concrete development tasks
6. **Schedule Follow-ups** - Plan validation sessions with stakeholders


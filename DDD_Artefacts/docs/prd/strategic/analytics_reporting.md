# Analytics & Reporting

[RELATED: ADR-010]
[CONTEXT: Strategic]
[STATUS: Draft]
[VERSION: 1.0.0]
[OWNER: @data-engineering]

## 1. Business Context

- **Purpose**: Provide unified, near-real-time insight into business & technical performance, enabling data-driven decisions across Elias Food Imports.
- **Business Capabilities**:
  - Central metric & KPI catalogue
  - Self-service dashboards and scheduled reports
  - Cross-context event analytics & anomaly detection
  - Alert routing to Notifications & Alerts context
- **Success Metrics**:
  - < 5 min data latency from event to dashboard
  - 95 % stakeholder adoption of standard dashboards
  - < 1 s average dashboard load time (P95)
  - 99 % accuracy of KPIs vs. authoritative sources
- **Domain Experts**: Head of Data, CFO, VP Operations, Engineering Observability Lead

## 2. Domain Model

- **Key Entities**: `MetricDefinition`, `Dataset`, `Dashboard`, `Report`, `KPI`, `AlertRule`, `Visualization`, `DataSource` (external or internal)
- **Aggregates**:
  - `Dataset` (root) → contains raw & transformed data partitions
  - `Dashboard` (root) → aggregates `Visualization` widgets linked to `MetricDefinition`
- **Value Objects**: `TimeWindow`, `QueryParameters`, `Threshold`, `ColorPalette`
- **Domain Services**: `ReportGenerator`, `MetricCalculator`, `AlertEvaluator`
- **Domain Events**: `MetricCalculated`, `AlertTriggered`, `DashboardShared`

## 3. Functional Requirements

### 3.1 Metric & Dataset Management

- **FR-1**: As a data steward, I want to register a new `MetricDefinition` with formula, data source & refresh frequency so that KPIs are standardised.
  - **Acceptance Criteria**:
    - [ ] Validation of SQL/DSL expression
    - [ ] Ownership & data classification captured
  - **Dependencies**: ADR-010 (Observability store)

### 3.2 Dashboard Authoring

- **FR-2**: As a business user, I want to create dashboards via drag-and-drop widgets so that I can monitor KPIs relevant to my role.
  - **Acceptance Criteria**:
    - [ ] Role-based access enforced
    - [ ] Widgets auto-refresh every 60 s

### 3.3 Scheduled & Ad-hoc Reporting

- **FR-3**: As finance, I want daily revenue reports emailed at 06:00 local so that budgeting is timely.
  - **Acceptance Criteria**:
    - [ ] Report delivered in PDF & CSV
    - [ ] SLA: report generation < 2 min

### 3.4 Anomaly Detection & Alerts

- **FR-4**: As operations, I want anomalies in conversion-rate to trigger an alert so that we react within 15 min.
  - **Acceptance Criteria**:
    - [ ] Z-score or ML model identify anomaly
    - [ ] `AlertTriggered` event published with metadata

### 3.5 Business Rules

- All analytics-relevant domain events **must** be published to the Analytics & Reporting ingest queue and include `timestamp`, `source`, `eventType`, `actor`, and `context` fields.
- Data completeness ≥ 99 % and end-to-end latency ≤ 5 min for streaming pipelines.
- Every `MetricDefinition` is version-controlled and records owner, formula, data sources, and refresh frequency.
- Personally-identifiable or sensitive data (per ADR-009) **must** be anonymised, tokenised, or aggregated before persistence in the data warehouse.
- Dashboards **must** surface data-freshness indicators and data-source provenance.
- Access to metrics, datasets, and dashboards is enforced via ABAC policies and fully audited.
- Raw analytics events retained for 3 years; aggregated datasets for 7 years; older data archived to cold storage.
- Derived insights inherit the highest privacy classification of their source data.

## 4. Integration Points

### 4.1 Published Events

- `MetricCalculated`: Metric id, value, timeWindow, **Consumers**: NotificationsAlerts, PaymentBilling (financial reconciliation)
- `AlertTriggered`: Alert id, severity, message, **Consumers**: NotificationsAlerts, ShippingFulfillment
- `AnalyticsDataQualityIssueDetected`: Source system, issueType, affectedMetrics, severity, **Consumers**: NotificationsAlerts
- `AnalyticsInsightGenerated`: insightId, insightType, confidenceScore, relatedMetrics, **Consumers**: MarketingManagement, CustomerManagement

### 4.2 Consumed Events

Representative (non-exhaustive) event feed powering Analytics:

- `OrderPlaced`, `OrderCancelled` (Order Management) → sales & funnel metrics
- `PaymentCaptured`, `PaymentFailed`, `RefundProcessed` (Payment & Billing) → revenue & cash-flow KPIs
- `PriceChanged`, `DiscountApplied` (Pricing & Promotions) → margin impact analytics
- `InventoryLevelChanged`, `StockReplenished` (Inventory & Warehouse) → inventory turnover, stock-out heatmaps
- `ShipmentDelivered`, `DeliveryDelayed` (Shipping & Fulfillment) → delivery performance & carrier benchmarking
- `CustomerRegistered`, `CustomerProfileUpdated` (Customer Management) → acquisition & cohort analysis
- `SubscriptionRenewed`, `SubscriptionCancelled` (Subscriptions Management) → retention & churn KPIs
- `WebsitePageViewed`, `ProductSearchPerformed` (Digital Experience) → engagement & conversion funnels
- `NotificationEngagementRecorded` (Notifications & Alerts) → message effectiveness metrics

### 4.3 APIs/Services

- **REST/GraphQL**: `/analytics/metrics`, `/analytics/dashboards`, `/analytics/reports`
- **gRPC**: `AnalyticsAggregator` for high-volume ingest
- **External Services**: Tableau, Google Analytics export connector

## 5. Non-Functional Requirements

- **Performance**: Metric ingestion ≥ 5 k events/sec; dashboard render P95 < 1 s
- **Scalability**: Horizontal scaling to support 1 bn data points/day
- **Security**: ABAC per metric; data classified per ADR-009; TLS 1.2+
- **Reliability**: 99.9 % uptime; at-least-once event ingestion with idempotent processing
- **Maintainability**: Infrastructure-as-Code; > 80 % unit test coverage for calculators

## 6. Implementation Roadmap

_Phased delivery aligned with CI/CD pipeline (see ADR-012)._

| Phase | Scope | Milestones | Exit Criteria |
|-------|-------|------------|---------------|
| 0 – Foundations | Event ingestion pipeline MVP (Kafka topics, raw data lake), initial `Dataset` aggregate, core `MetricDefinition` catalogue. | Topics created, raw data persisted, 3 critical metrics calculated nightly. | Raw events persisted loss-free for ≥7 days. |
| 1 – Self-Service Dashboards | `Dashboard` aggregate, drag-and-drop builder, RBAC/ABAC enforcement. | 3 pilot teams build dashboards; access audited. | 90 % positive user CSAT; <1 s P95 load. |
| 2 – Real-Time KPIs | Stream processing (Kafka Streams/Flink), sub-5-minute latency, `MetricCalculated` event feed. | Near-real-time sales & ops KPIs live. | Latency SLA met for 95 % of windows. |
| 3 – Anomaly Detection & Alerts | ML/Statistical models, `AlertRule` configuration UI, `AlertTriggered` events routed to Notifications. | Conversion-rate anomaly POC in prod. | MTTR <15 min for critical KPI deviations. |
| 4 – Advanced Analytics | Predictive models, insights generation (`AnalyticsInsightGenerated`), export API for Data Science guild. | CLV model deployed, incremental retraining scheduled. | Forecast MAPE <10 %. |

## 7. Testing & Validation Strategy

- **Data Quality**: Unit tests on transformation jobs; automated schema validation via Great Expectations; `AnalyticsDataQualityIssueDetected` events on failure.
- **Metric Accuracy**: Golden-dataset regression tests comparing historical calculations.
- **Performance**: Load tests (JMeter) to 10 k events/sec; dashboard render under 1 s P95.
- **Security**: Automated SAST/DAST in CI; access-control integration tests; anonymisation e2e tests.
- **Model Governance**: A/B tests, bias & drift detection, explainability score thresholds.

## 8. Open Questions

- [ ] Which anomaly-detection technique (statistical vs. ML) offers best ROI?
- [ ] Should we support multi-tenant dashboards for supplier partners?

## 9. Out of Scope

- Predictive demand-forecast models (handled in Strategic Data Science roadmap)
- Direct customer-facing analytics widgets

## 10. References

- ADR-010: Observability & Monitoring Strategy
- ADR-008: Event-Driven Communication
- Context Map (context_map.puml)
- Data Classification (ADR-009)

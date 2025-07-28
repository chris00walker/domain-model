# Reviews & Ratings

[RELATED: ADR-002, ADR-008, ADR-009, ADR-012]
[CONTEXT: Supporting]
[STATUS: Draft]
[VERSION: 1.0.0]
[OWNER: @customer-insights]

## 1. Business Context

- **Purpose**: Capture authentic customer feedback and quantitative satisfaction signals to build trust, inform product improvements, and power personalised recommendations.
- **Business Capabilities**:
  - Verified-purchase review submissions with 1–5 star ratings
  - Moderation workflows ensuring compliance & brand safety
  - Real-time aggregate rating computation for product pages & search
  - Sentiment analytics feeding Product Catalog and Marketing insights
  - Regulatory & data-privacy compliant storage and display
- **Success Metrics**:
  - Review submission rate ≥ 5 % of completed orders
  - Average moderation turnaround time ≤ 12 h
  - Policy-violation publish rate < 0.1 % of reviews
  - Sentiment change detection latency ≤ 1 h
- **Domain Experts**:
<!--- agents:
  - role: CX Manager
  - role: Brand Reputation Lead
  - role: Data Scientist
  - role: Legal Counsel
-->

## 2. Domain Model

- **Key Entities**: `Review`, `Rating`, `ReviewModerationTicket`, `ProductSentimentSnapshot`
- **Aggregates**:
  - `Review` (root) → owns rating, content, status
- **Value Objects**: `RatingScore`, `SentimentScore`, `LanguageCode`, `ModerationStatus`
- **Domain Services**: `ModerationService`, `SentimentAnalysisService`, `RatingAggregationService`
- **Domain Events**: `ReviewSubmitted`, `ReviewApproved`, `ReviewRejected`, `RatingUpdated`, `SentimentSnapshotGenerated`

## 3. Functional Requirements

### 3.1 Review Submission

- **FR-1**: Verified customers can submit one review per purchased SKU within 60 days of delivery.
  - **Acceptance Criteria**:
    - [ ] Must include 1–5 star rating and text 20–1 000 chars
    - [ ] `ReviewSubmitted` event emitted with `moderation_status = pending`

### 3.2 Moderation Workflow

- **FR-2**: System automatically screens for prohibited content then routes to manual moderation if flagged.
  - **Acceptance Criteria**:
    - [ ] NLP filters (hate speech, PII, spam) run in <500 ms
    - [ ] Moderators can approve/reject/edit with audit log
    - [ ] `ReviewApproved` or `ReviewRejected` event emitted

### 3.3 Display & Aggregation

- **FR-3**: Approved reviews appear on product pages; aggregate rating updates in real time.
  - **Acceptance Criteria**:
    - [ ] Aggregate stored in Redis & search index
    - [ ] Cache invalidated within 30 s of new approval

### 3.4 Sentiment Insights

- **FR-4**: Hourly job generates sentiment snapshot per product.
  - **Acceptance Criteria**:
    - [ ] Sentiment delta triggers alert if >10 % drop QoQ

### 3.5 GDPR & Deletion Requests

- **FR-5**: Customers may delete their review and associated PII under GDPR.
  - **Acceptance Criteria**:
    - [ ] Soft-delete with anonymised placeholder
    - [ ] Deletion propagated to caches & search

### 3.6 Business Rules

- Verified purchasers may submit exactly one review per product; edits allowed within 30 days of submission.
- Reviews must include a 1–5 star rating and text (≥ 20 characters); submissions open 7 days post-delivery.
- Review content must be free of profanity, PII, and promotional material; attached images must relate to the product.
- All reviews pass moderation within 48 h; rejected reviews include a reason; critical product-safety concerns escalate to QA within 24 h.
- Display order prioritises helpful reviews and verified-purchase status; aggregate stats refresh ≤ 1 h after approval.
- Products with fewer than 5 reviews show an "Early Reviews" indicator; reviews older than 12 months are flagged accordingly.
- Three consecutive 1-star reviews or ≥ 1-point rating drop within 30 days triggers `ProductQualityAlertTriggered`.
- Moderation decisions are appealable once; immutable edit history is retained for audit.

## 4. Integration Points

### 4.1 Published Events

- `ReviewSubmitted` → Consumers: ProductCatalog, AnalyticsReporting, NotificationsAlerts
- `ReviewApproved` / `ReviewRejected` → Consumers: ProductCatalog, CustomerManagement, AnalyticsReporting
- `ReviewEdited` → Consumers: ProductCatalog, AnalyticsReporting
- `ReviewHelpfulnessVoted` → Consumers: AnalyticsReporting, MarketingManagement
- `ReviewResponseAdded` → Consumers: CustomerManagement, NotificationsAlerts
- `ProductQualityAlertTriggered` → Consumers: InventoryWarehouse, QualityAssurance, AnalyticsReporting
- `SentimentSnapshotGenerated` → Consumers: ProductCatalog, PricingPromotions, MarketingManagement

### 4.2 Consumed Events

- `OrderDelivered` (OrderManagement) → start 7-day review eligibility window
- `ProductPurchased` (OrderManagement) → verify purchase before review submission
- `ProductUpdated` (ProductCatalog) → maintain product reference data
- `ProductDiscontinued` (ProductCatalog) → update review display notices
- `CustomerAccountDeactivated` (CustomerManagement) → flag associated reviews
- `PricingRuleUpdated` (PricingPromotions) → adjust sentiment weighting rules
- `ProductDiscontinued` (ProductCatalog) → archive associated reviews

### 4.3 APIs/Services

- **REST/GraphQL**: `/products/{id}/reviews`, `/reviews/{id}`
- **Moderation API**: Internal gRPC `ModerationService.Approve/Reject`
- **External Services**: Perspective API for toxicity scoring

## 5. Non-Functional Requirements

- **Performance**: Review submission API ≤ 300 ms P95; product page rating load ≤ 100 ms
- **Scalability**: 100 k reviews/day; 10 M read req/day
- **Security**: XSS sanitisation; PII minimisation per ADR-009
- **Reliability**: 99.9 % uptime; circuit breaker around external NLP
- **Maintainability**: Moderation rules versioned; 90 % unit test coverage

## 6. Implementation Roadmap

### Phase 1 – Foundation (Weeks 1-2)

1. Implement `Review` aggregate persistence with purchase verification.
2. Expose `/reviews` REST and GraphQL endpoints.
3. Emit `ReviewSubmitted` and moderation events.

### Phase 2 – Moderation & Display (Weeks 3-5)

1. Integrate Perspective API toxicity scoring and manual moderation UI.
2. Implement real-time rating aggregation cached in Redis.
3. Achieve review submission latency ≤ 300 ms P95.

### Phase 3 – Analytics & Alerts (Weeks 6-8)

1. Launch sentiment analysis pipeline and `SentimentSnapshotGenerated` events.
2. Implement quality alert detection (`ProductQualityAlertTriggered`).
3. Provide supplier dashboards and engagement analytics.

### Phase 4 – Advanced Features (Weeks 9-11)

1. Introduce ML-based fraud detection for fake reviews.
2. Enable multimedia reviews (images/video) with automated moderation.
3. Experiment with review-driven recommendation tuning.

## 7. Testing & Validation Strategy

- **Unit Tests**: Review aggregate invariants, rating score validation, moderation status transitions.
- **Integration Tests**: End-to-end submission → moderation → display flow; event publication & consumption.
- **Performance Tests**: Submission P95 ≤ 300 ms; product page rating load ≤ 100 ms at 1 000 RPS.
- **Security Tests**: XSS sanitisation, PII redaction, rate-limiting abuse scenarios.
- **User Acceptance Tests**: Moderator workflows, supplier response flow, GDPR deletion.
- **CI/CD Gates**: 90 % unit test coverage, SAST/DAST, dependency scanning per ADR-012.

## 8. Open Questions

- [ ] Adopt user-generated image/video reviews in Phase-2?
- [ ] Public response feature for suppliers to reply to reviews?

## 9. Out of Scope

- Incentive programs for reviews (handled by Marketing)
- Seller feedback (future marketplace context)

## 10. References

- ADR-009: Data Protection Strategy
- ADR-002: Domain Event Design Patterns
- FDA Product Review Guidelines (Food Advertising)
- EU Consumer Protection Directive (EU 2019/2161)
- Context Map (context_map.puml)







## Event Storm Updates

### 2025-07-24

**New Events**
- RatingSubmitted

**New Commands**

## Event Storm Updates

### 2025-07-24

**New Events**
- RatingSubmitted

**New Commands**

## Event Storm Updates

### 2025-07-23

**New Events**
- RatingSubmitted

**New Commands**

## Event Storm Updates

### 2025-07-23

**New Events**
- RatingSubmitted

**New Commands**
- AggregateRatings

## Event Storm Updates

### 2025-07-23

**New Events**
- RatingSubmitted

**New Commands**

## Event Storm Updates

### 2025-07-23

**New Events**
- ProductRatingSubmitted

**New Commands**

## Event Storm Updates

### 2025-07-23

**New Events**
- TemperatureViolationReported
- BatchTemperatureViolationDetected
- TemperatureAlertIssued
- SubscriptionRenewed
- ColdChainBreachDetected
- BatchQualityAssuranceFailed
- CustomerFeedbackReceived
- SubscriptionCancelled

**New Commands**
- ReportTemperatureViolation
- DetectBatchTemperatureViolation
- IssueTemperatureAlert
- RenewSubscription
- DetectColdChainBreach
- PerformBatchQualityCheck
- CollectCustomerFeedback
- CancelSubscription

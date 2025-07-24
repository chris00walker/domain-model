# Marketing

[RELATED: ADR-008, ADR-004, ADR-012]
[CONTEXT: Strategic]
[STATUS: Draft]
[VERSION: 0.2.0]
[OWNER: @marketing-team]

## 1. Business Context

- **Purpose**: Drive growth and customer engagement for Elias Food Imports by promoting authentic Levantine & Mediterranean food products through targeted campaigns and personalized experiences.
- **Business Capabilities**:
  - Multi-channel campaign management (email, social, content)
  - Customer segmentation for B2C and B2B audiences
  - Promotional strategy for both retail and wholesale channels
  - Performance analytics with HubSpot integration
  - Lead nurturing for B2B customers
  - Product launch campaigns for new imports
- **Success Metrics**:
  - Customer acquisition cost (CAC) ≤ BBD 20 (retail), ≤ BBD 50 (B2B)
  - Email open rates ≥ 25%
  - Campaign conversion rates ≥ 3.5%
  - B2B lead response time < 2 hours
  - Social media engagement growth ≥ 15% MoM
- **Domain Experts**:
<!--- agents:
  - role: Head of Marketing (Primary Owner)
  - role: Digital Marketing Manager
  - role: B2B Sales Manager
  - role: Customer Insights Analyst
-->

## 2. Domain Model

- **Key Entities**:
  - `Campaign`: Multi-channel marketing initiatives (email, social, content)
  - `Promotion`: Time-bound offers and discounts
  - `CustomerSegment`: B2C (Diaspora, Foodies, Expats) and B2B (Restaurants, Retailers) segments
  - `MarketingAsset`: Digital content and creatives
  - `Lead`: B2B sales opportunities
  - `ContentCalendar`: Scheduled marketing activities

- **Aggregates**:
  - `Campaign` (root aggregate): Manages campaign lifecycle and assets
  - `Promotion` (root aggregate): Handles promotional rules and validation

- **Value Objects**:
  - `DiscountCode`: With validation rules for different customer segments
  - `TargetAudience`: Demographic and behavioral criteria
  - `BudgetAllocation`: With currency conversion for international campaigns
  - `ContentBrief`: Specifications for marketing assets

- **Domain Services**:
  - `CampaignOrchestrator`: Coordinates multi-channel campaigns
  - `SegmentManager`: Handles customer segmentation rules
  - `PromotionValidator`: Ensures promotions comply with business rules
  - `LeadScorer`: Prioritizes B2B leads based on potential value
  - `ContentScheduler`: Manages content calendar and approvals

- **Domain Events**:
  - `CampaignLaunched`: When a new marketing campaign is activated
  - `PromotionCreated`: When a new promotion is defined
  - `CustomerSegmented`: When a customer is added to a segment
  - `LeadQualified`: When a B2B lead meets qualification criteria
  - `ContentPublished`: When marketing content goes live
  - `CampaignPerformanceAlert`: When KPIs deviate from targets

## 3. Functional Requirements

### 3.1 Multi-Channel Campaign Management

- **FR-1**: As a Marketing Manager, I want to create omni-channel campaigns so that I can engage customers across multiple touchpoints
  - **Acceptance Criteria**:
    - [ ] Campaigns can target specific customer segments (Diaspora, Foodies, Expats, B2B)
    - [ ] Support for email, social media, and content marketing channels
    - [ ] Budget allocation across channels with currency conversion
    - [ ] Approval workflow with compliance checks for food marketing regulations
  - **Dependencies**: [Customer Management, Product Catalog, Compliance]

### 3.2 B2B Lead Management

- **FR-2**: As a B2B Sales Manager, I want to track and nurture leads so that I can convert them into wholesale customers
  - **Acceptance Criteria**:
    - [ ] Lead scoring based on company size, order potential, and engagement
    - [ ] Automated email sequences for lead nurturing
    - [ ] Integration with HubSpot for CRM functionality
    - [ ] Task assignment and follow-up reminders
  - **Dependencies**: [Customer Management, Order Management, HubSpot Integration]

### 3.3 Promotional Strategy

- **FR-3**: As a Marketing Specialist, I want to create targeted promotions so that I can drive sales of specific product categories
  - **Acceptance Criteria**:
    - [ ] Support for product category-specific promotions
    - [ ] Time-based and inventory-aware discounting
    - [ ] Promo code generation with usage limits
    - [ ] Real-time validation against order management
  - **Dependencies**: [Order Management, Inventory Management, Product Catalog]

### 3.4 Business Rules

#### Campaign Rules

- All campaigns must have a defined target audience, budget, timeline, and success metrics before launch.
- Campaign performance must be reviewed at pre-defined milestones and adjusted as necessary based on performance data.
- Campaigns targeting specific cultural or regional segments must undergo cultural appropriateness review by regional experts.
- Campaign ROI must be measured and must exceed the company benchmark of 3:1 to be considered successful.
- All campaign assets must adhere to Elias Food Imports brand guidelines and receive approval before public release.

#### Content Rules

- All product-related content must be factually accurate and verified against the Product Catalog.
- Cultural and regional content must be authored or reviewed by subject-matter experts from the specific region.
- Content must be localized for target markets, not merely translated.
- Content creation must follow the established editorial calendar and prioritization framework.
- All content must include appropriate metadata to facilitate proper indexing and searchability.

#### Customer Segmentation Rules

- Customer segments must be reviewed and updated quarterly based on the latest transaction and engagement data.
- Segmentation must consider both behavioral data (purchase history, engagement) and profile data (region, preferences).
- All marketing activities must target at least one defined customer segment.
- High-value customer segments must receive personalized marketing communications.
- Experimental segments require A/B testing validation before full-scale implementation.

#### Compliance Rules

- All marketing materials must comply with regional food marketing regulations in target markets.
- Customer data used for segmentation and targeting must comply with applicable privacy laws (GDPR, CCPA, etc.).
- Promotional pricing and discounts must align with the Pricing domain's policies and rules.
- Marketing claims about product authenticity must be verifiable through the Catalog Authentication domain.
- Opt-out requests must be processed within 24 hours of receipt.

## 4. Integration Points

### 4.1 Published Events

- `CampaignLaunched`: When a new marketing campaign is activated
  - Payload: { campaignId, name, channels: [email|social|content], targetSegments: [B2C|B2B], budget, currency, startDate, endDate }
  - Consumers: [Customer Management, Analytics, Notifications]
- `PromotionCreated`: When a new promotion is defined
  - Payload: { promotionId, code, type: [percentage|fixed], value, productCategories: [], validFrom, validTo, maxUsage, minOrderValue }
  - Consumers: [Order Management, E-commerce, Point of Sale]
- `LeadQualified`: When a B2B lead meets qualification criteria
  - Payload: { leadId, companyName, contactPerson, leadScore, assignedTo, nextActionDate }
  - Consumers: [Sales, Customer Management, HubSpot]
- `CampaignCreated`: When a new marketing campaign is created
  - Payload: { campaignId, name, type, startDate, endDate, targetSegments, budget, currency }
  - Consumers: [Analytics, Customer Management]
- `CampaignCompleted`: When a campaign ends
  - Payload: { campaignId, completionTimestamp, performanceSummary }
  - Consumers: [Analytics]
- `ContentPublished`: When marketing content goes live
  - Payload: { contentId, type, relatedProducts, publishTimestamp }
  - Consumers: [Catalog, Analytics]
- `SegmentCreated`: When a new customer segment is defined
  - Payload: { segmentId, name, criteria, estimatedSize }
  - Consumers: [Customer Management, Analytics]
- `SegmentUpdated`: When a customer segment definition is updated
  - Payload: { segmentId, updatedCriteria, changeLog }
  - Consumers: [Customer Management, Analytics]
- `CustomerOptedOut`: When a customer opts out of marketing
  - Payload: { customerId, preferences, timestamp }
  - Consumers: [Customer Management, Notifications]

### 4.2 Consumed Events

- `OrderPlaced`: From Order Management
  - Source: Order Management Context
  - Action: Track campaign attribution, update customer lifetime value, trigger post-purchase flows
- `CustomerRegistered`: From Customer Management
  - Source: Customer Management Context
  - Action: Add to appropriate segments, trigger welcome series, update lead scoring
- `ProductImported`: From Product Catalog
  - Source: Product Catalog Context
  - Action: Trigger new product launch campaigns, update marketing materials
- `InventoryLow`: From Inventory Management
  - Source: Inventory Context
  - Action: Pause promotions for low-stock items, create back-in-stock campaigns
- `CustomerProfileUpdated`: From Customer Management
  - Source: Customer Management Context
  - Action: Refresh segment assignments, update personalization data
- `SubscriptionStarted`: From Subscriptions
  - Source: Subscriptions Context
  - Action: Start subscription-specific marketing sequences
- `SubscriptionCancelled`: From Subscriptions
  - Source: Subscriptions Context
  - Action: Trigger win-back campaigns and collect cancellation feedback
- `CustomerSegmentAssigned`: From Customer Management
  - Source: Customer Management Context
  - Action: Deliver segment-specific communications

### 4.3 APIs/Services

- **REST/GraphQL**: Marketing Campaign API
  - Endpoints for campaign management, lead tracking, and analytics
  - Webhook subscriptions for real-time updates
- **HubSpot Integration**:
  - Sync customer data and segments
  - Track marketing interactions and lead scoring
  - Automate email campaigns and follow-ups
- **Analytics Services**:
  - Campaign performance dashboards
  - ROI calculation by channel and segment
  - Predictive analytics for customer behavior

## 5. Non-Functional Requirements

- **Performance**:
  - Support 500+ concurrent users in the marketing dashboard
  - Sub-second response times for campaign management actions
  - Near real-time updates for campaign analytics (≤ 5 min delay)
- **Scalability**:
  - Handle 10x traffic spikes during major promotions
  - Support 100,000+ customer segments
  - Process 1M+ marketing emails per month
- **Security**:
  - Role-based access control for marketing team members
  - PII protection in compliance with GDPR and CCPA
  - Audit logging for all marketing activities
  - Secure storage of API keys and credentials
- **Reliability**:
  - 99.9% uptime for campaign management interfaces
  - Automated failover for critical marketing systems
  - Data backup and recovery procedures
- **Compliance**:
  - Food marketing regulations compliance
  - Email marketing opt-in/opt-out management
  - Accessibility standards (WCAG 2.1 AA) for all customer-facing content

## 6. Implementation Roadmap

### Phase 1 – Foundation (Q1)

- Establish event-driven infrastructure (in-process event bus) per ADR-008.
- Implement core Campaign, Content, and Segment CRUD with approval workflows.
- Integrate email & social channels; enable `CampaignCreated` and `CampaignLaunched` events.
- **Exit Criteria**: Marketing team can create & launch campaigns across two channels; events visible in domain event catalog.

### Phase 2 – Automation & Personalization (Q2)

- Introduce automated segment recalculation and real-time personalization.
- Deploy A/B testing framework and dynamic content rendering.
- Add ROI dashboards and basic attribution reports.
- **Exit Criteria**: Automated segment updates, A/B test results captured, dashboards live.

### Phase 3 – Advanced Optimization (Q3)

- Predictive analytics for campaign outcome forecasting (leveraging Analytics context).
- Machine-learning driven budget optimization.
- Multi-armed bandit experimentation engine for channel mix.
- **Exit Criteria**: Predictive models achieving ≥5% lift in conversion compared to control.

## 7. Testing & Validation Strategy

- **Unit Tests**: Validate business rule enforcement for campaigns, content, and segments.
- **Integration Tests**: Verify event contracts with Customer, Order, Catalog, and Subscription contexts (see /contract-test workflow).
- **Performance Tests**: Ensure segment recalculation handles 100k segments and 10M customers within SLA (≤10 min).
- **Security Tests**: GDPR/CCPA compliance checks; ensure opt-out processing ≤24 h.
- **User Acceptance Tests**: Marketing personas validate campaign creation, launch, and reporting flows.
- **CI/CD Gates**: Enforce ≥80% coverage, static analysis, security scanning, and TruffleHog secrets scan per ADR-012.

## Event Storm Updates

### 2025-07-23

**New Events**
- CampaignLaunched
- CampaignPerformanceReviewed

**New Commands**
- LaunchCampaign
- ReviewCampaignPerformance

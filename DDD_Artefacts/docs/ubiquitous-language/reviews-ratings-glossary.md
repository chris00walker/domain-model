# Reviews & Ratings Context Glossary

Generated: 2025-07-21T13:40:29-03:00

## Purpose

This glossary defines terms specific to the Reviews & Ratings bounded context, focusing on customer feedback collection, review management, and reputation building for authentic Levantine and Mediterranean products.

## Context Overview

- **Business Purpose**: Collect and manage customer feedback to build trust and improve products
- **Core Responsibility**: Review collection, moderation, and reputation management
- **Key Metrics**: Review participation ≥20%, Average rating ≥4.2/5, Moderation time <24h
- **Integration Points**: Customer Management, Product Catalog, Order Management, Marketing

## Aggregates

### ProductReview

- **Definition**: Central aggregate representing a customer review of a product with rating, content, and moderation status
- **Implementation**: `ProductReview` class extends AggregateRoot
- **Properties**:
  - **reviewId**: Unique review identifier
  - **productId**: Reference to reviewed product
  - **customerId**: Reference to reviewing customer
  - **orderId**: Reference to purchase order (if applicable)
  - **rating**: Numerical rating (1-5 stars)
  - **title**: Review title or headline
  - **content**: Review text content
  - **reviewDate**: When review was submitted
  - **verifiedPurchase**: Whether reviewer purchased the product
  - **moderationStatus**: Current moderation status
  - **moderatedBy**: Staff member who moderated
  - **moderationDate**: When review was moderated
  - **moderationNotes**: Moderation notes and reasons
  - **helpfulVotes**: Number of helpful votes
  - **totalVotes**: Total votes received
  - **isRecommended**: Whether customer recommends product
  - **tags**: Review tags and categories
- **Responsibilities**:
  - Review content and rating management
  - Moderation status tracking
  - Helpfulness vote aggregation
  - Verification status maintenance
- **Business Rules**:
  - Only customers who purchased product can leave verified reviews
  - Reviews must pass moderation before publication
  - Ratings must be between 1 and 5 stars
  - Duplicate reviews from same customer prevented
- **Related Terms**: ReviewId, ProductRating, ModerationStatus, VerifiedPurchase

### ReviewResponse

- **Definition**: Aggregate representing business response to customer review
- **Implementation**: `ReviewResponse` class extends AggregateRoot
- **Properties**:
  - **responseId**: Unique response identifier
  - **reviewId**: Reference to original review
  - **responderId**: Reference to staff member responding
  - **responseContent**: Response text content
  - **responseDate**: When response was submitted
  - **responseType**: Type of response (public, private)
  - **isOfficial**: Whether response is official business response
  - **moderationStatus**: Response moderation status
  - **tags**: Response tags and categories
- **Responsibilities**:
  - Business response content management
  - Response type and visibility control
  - Official response designation
  - Response moderation tracking
- **Business Rules**:
  - Only authorized staff can post official responses
  - Responses must be professional and helpful
  - Private responses sent directly to customer
  - Public responses visible to all customers
- **Related Terms**: ResponseId, ResponseType, OfficialResponse, ResponseModeration

## Value Objects

### ReviewId

- **Definition**: Unique identifier for product reviews
- **Implementation**: `ReviewId` value object
- **Format**: UUID-based string identifier
- **Usage**: Internal tracking, customer references, moderation workflow
- **Business Rules**:
  - Globally unique across all reviews
  - Immutable once assigned
  - Used for moderation and analytics tracking
- **Related Terms**: ProductReview, UniqueEntityID

### ProductRating

- **Definition**: Numerical rating given by customer for product
- **Implementation**: `ProductRating` value object
- **Properties**:
  - **overallRating**: Overall product rating (1-5 stars)
  - **aspectRatings**: Ratings for specific aspects
  - **ratingScale**: Scale used for rating (e.g., 1-5, 1-10)
- **Aspect Ratings**:
  - **QUALITY**: Product quality rating
  - **VALUE**: Value for money rating
  - **TASTE**: Taste rating (for food products)
  - **AUTHENTICITY**: Authenticity rating
  - **PACKAGING**: Packaging quality rating
  - **DELIVERY**: Delivery experience rating
- **Business Rules**:
  - Overall rating required, aspect ratings optional
  - Ratings must be within valid scale range
  - Aspect ratings contribute to overall product score
  - Rating changes tracked for trend analysis
- **Related Terms**: RatingScale, AspectRating, ProductScore

### ModerationStatus

- **Definition**: Current status of review in moderation workflow
- **Implementation**: `ModerationStatus` enum
- **Statuses**:
  - **PENDING**: Review submitted, awaiting moderation
  - **APPROVED**: Review approved and published
  - **REJECTED**: Review rejected, not published
  - **FLAGGED**: Review flagged for additional review
  - **EDITED**: Review edited after moderation feedback
  - **SUSPENDED**: Review temporarily suspended
  - **SPAM**: Review identified as spam
  - **INAPPROPRIATE**: Review contains inappropriate content
- **Status Transitions**:
  - PENDING → APPROVED (passes moderation)
  - PENDING → REJECTED (fails moderation)
  - APPROVED → FLAGGED (community reports)
  - FLAGGED → APPROVED/REJECTED (re-moderation)
  - Any status → SPAM (spam detection)
- **Business Rules**:
  - Only APPROVED reviews visible to public
  - Status changes trigger customer notifications
  - Moderation decisions documented with reasons
  - Appeals process available for rejected reviews
- **Related Terms**: ModerationWorkflow, ReviewApproval, ContentModeration

### ReviewCategory

- **Definition**: Classification of reviews by type and content focus
- **Implementation**: `ReviewCategory` enum
- **Categories**:
  - **PRODUCT_QUALITY**: Focus on product quality and condition
  - **TASTE_FLAVOR**: Focus on taste and flavor profile
  - **AUTHENTICITY**: Focus on cultural authenticity
  - **VALUE_PRICE**: Focus on value for money
  - **PACKAGING_DELIVERY**: Focus on packaging and delivery
  - **CUSTOMER_SERVICE**: Focus on customer service experience
  - **RECIPE_USAGE**: Focus on recipe usage and cooking
  - **CULTURAL_SIGNIFICANCE**: Focus on cultural importance
  - **HEALTH_NUTRITION**: Focus on health and nutritional aspects
  - **COMPARISON**: Comparison with similar products
- **Business Rules**:
  - Categories help organize and filter reviews
  - Multiple categories can apply to single review
  - Categories used for analytics and insights
  - Category assignment can be automated or manual
- **Related Terms**: ReviewTags, ContentAnalysis, ReviewInsights

### HelpfulnessScore

- **Definition**: Score indicating how helpful other customers found the review
- **Implementation**: `HelpfulnessScore` value object
- **Properties**:
  - **helpfulVotes**: Number of "helpful" votes
  - **unhelpfulVotes**: Number of "not helpful" votes
  - **totalVotes**: Total number of votes
  - **helpfulnessRatio**: Ratio of helpful to total votes
  - **confidenceScore**: Statistical confidence in helpfulness
- **Business Rules**:
  - Only verified customers can vote on helpfulness
  - Customers cannot vote on their own reviews
  - Helpfulness affects review display order
  - Scores updated in real-time with new votes
- **Related Terms**: ReviewRanking, CustomerVoting, ReviewUtility

## Domain Services

### ReviewModerationService

- **Definition**: Service managing review moderation workflow and content approval
- **Implementation**: `ReviewModerationService` domain service
- **Responsibilities**:
  - Content moderation and approval workflow
  - Spam and inappropriate content detection
  - Moderation queue management
  - Appeal process coordination
- **Moderation Rules**:
  - All reviews moderated before publication
  - Automated filters catch obvious spam/inappropriate content
  - Human moderators review flagged content
  - Consistent moderation standards applied
- **Related Terms**: ContentModeration, SpamDetection, ModerationQueue

### ReviewAggregationService

- **Definition**: Service aggregating review data for product ratings and insights
- **Implementation**: `ReviewAggregationService` domain service
- **Responsibilities**:
  - Overall product rating calculation
  - Review statistics aggregation
  - Trend analysis and insights
  - Rating distribution analysis
- **Aggregation Rules**:
  - Overall ratings weighted by review recency and helpfulness
  - Statistics updated in real-time with new reviews
  - Trends calculated over time periods
  - Outlier reviews identified and handled appropriately
- **Related Terms**: RatingAggregation, ReviewStatistics, TrendAnalysis

### ReviewIncentiveService

- **Definition**: Service managing review incentives and engagement programs
- **Implementation**: `ReviewIncentiveService` domain service
- **Responsibilities**:
  - Review incentive program management
  - Customer engagement tracking
  - Reward distribution
  - Program effectiveness measurement
- **Incentive Rules**:
  - Incentives offered for verified purchase reviews
  - Rewards distributed after review approval
  - Program participation tracked for effectiveness
  - Fraud prevention measures in place
- **Related Terms**: ReviewIncentives, CustomerEngagement, RewardPrograms

## Domain Events

### ReviewSubmitted

- **Definition**: Published when customer submits new product review
- **Implementation**: `ReviewSubmitted` extends DomainEvent
- **Payload**: Review ID, product ID, customer ID, rating, verified purchase, timestamp
- **Consumers**: Moderation Queue, Analytics, Customer Management, Product Catalog
- **Business Impact**: Moderation workflow initiation, customer engagement tracking

### ReviewApproved

- **Definition**: Published when review passes moderation and is published
- **Implementation**: `ReviewApproved` extends DomainEvent
- **Payload**: Review ID, product ID, customer ID, rating, approval date, timestamp
- **Consumers**: Product Catalog, Analytics, Customer Notifications, Marketing
- **Business Impact**: Product rating updates, customer notifications, marketing content

### ReviewHelpfulnessVoted

- **Definition**: Published when customer votes on review helpfulness
- **Implementation**: `ReviewHelpfulnessVoted` extends DomainEvent
- **Payload**: Review ID, voter customer ID, vote type, helpfulness score, timestamp
- **Consumers**: Analytics, Review Ranking, Customer Engagement, Gamification
- **Business Impact**: Review ranking updates, customer engagement tracking

### ProductRatingUpdated

- **Definition**: Published when product's overall rating changes due to new reviews
- **Implementation**: `ProductRatingUpdated` extends DomainEvent
- **Payload**: Product ID, old rating, new rating, review count, rating distribution, timestamp
- **Consumers**: Product Catalog, Marketing, Analytics, Search Index
- **Business Impact**: Product display updates, search ranking, marketing insights

## Repository Interfaces

### IProductReviewRepository

- **Definition**: Persistence contract for product review aggregates
- **Implementation**: `IProductReviewRepository` interface
- **Standard Operations**:
  - `findById(id: ReviewId): Promise<ProductReview | null>`
  - `save(review: ProductReview): Promise<void>`
  - `findByProductId(productId: ProductId): Promise<ProductReview[]>`
- **Specialized Queries**:
  - `findByCustomerId(customerId: CustomerId): Promise<ProductReview[]>`
  - `findByModerationStatus(status: ModerationStatus): Promise<ProductReview[]>`
  - `findVerifiedPurchaseReviews(productId: ProductId): Promise<ProductReview[]>`
  - `findTopRatedReviews(productId: ProductId, limit: number): Promise<ProductReview[]>`
- **Business Rules**: All operations return Result pattern for error handling

### IReviewResponseRepository

- **Definition**: Persistence contract for review response aggregates
- **Implementation**: `IReviewResponseRepository` interface
- **Standard Operations**:
  - `findById(id: ResponseId): Promise<ReviewResponse | null>`
  - `save(response: ReviewResponse): Promise<void>`
  - `findByReviewId(reviewId: ReviewId): Promise<ReviewResponse[]>`
- **Specialized Queries**:
  - `findByResponderId(responderId: string): Promise<ReviewResponse[]>`
  - `findOfficialResponses(): Promise<ReviewResponse[]>`
  - `findByModerationStatus(status: ModerationStatus): Promise<ReviewResponse[]>`
  - `findPendingResponses(): Promise<ReviewResponse[]>`
- **Business Rules**: Responses linked to parent reviews

## Business Rules & Constraints

### Review Submission Rules

1. **Purchase Verification**: Verified purchase reviews given higher weight and visibility
2. **Duplicate Prevention**: Customers can only review each product once
3. **Content Requirements**: Reviews must meet minimum content and quality standards
4. **Rating Requirements**: Numerical rating required, text review optional
5. **Timing Restrictions**: Reviews can be submitted within reasonable time after purchase

### Moderation Rules

1. **Content Standards**: All reviews must meet community content standards
2. **Spam Prevention**: Automated and manual spam detection and removal
3. **Bias Detection**: Reviews checked for fake or biased content
4. **Response Time**: Reviews moderated within 24 hours of submission
5. **Appeal Process**: Rejected reviewers can appeal moderation decisions

### Aggregation Rules

1. **Rating Calculation**: Overall ratings calculated from approved reviews only
2. **Weighting Factors**: Recent and helpful reviews weighted more heavily
3. **Minimum Threshold**: Minimum number of reviews required for reliable rating
4. **Outlier Handling**: Extreme outlier reviews identified and handled appropriately
5. **Real-time Updates**: Product ratings updated in real-time with new reviews

## Integration Patterns

### Inbound Events (Consumed)

- **OrderCompleted** (Order Management) → Enable review submission
- **CustomerRegistered** (Customer Management) → Set up review preferences
- **ProductAdded** (Product Catalog) → Enable product reviews
- **CustomerServiceResolved** (Customer Service) → Request feedback review

### Outbound Events (Published)

- **ReviewSubmitted** → Moderation Queue for approval workflow
- **ProductRatingUpdated** → Product Catalog for rating display
- **ReviewApproved** → Customer Notifications for confirmation
- **ReviewHelpfulnessVoted** → Analytics for engagement tracking

### Service Dependencies

- **Content Moderation Service**: Automated content filtering and moderation
- **Notification Service**: Review-related customer notifications
- **Analytics Service**: Review performance and trend analysis
- **Search Service**: Review content indexing for search
- **Incentive Service**: Review reward and incentive management

## Anti-Corruption Patterns

### Content Moderation Integration

- **Moderation API Response** → Internal moderation status
- **Content Analysis Result** → Internal content classification
- **Spam Detection Result** → Internal spam indicators

### Analytics Integration

- **Analytics Data Format** → Internal review metrics
- **Trend Analysis Result** → Internal trend indicators
- **Performance Metrics** → Internal KPI format

## Context Boundaries

### What's Inside This Context

- Product review submission and management
- Review moderation and content approval
- Rating aggregation and calculation
- Review helpfulness voting and ranking
- Business response management

### What's Outside This Context

- Customer account management
- Product catalog management
- Order processing and fulfillment
- Customer service ticket management
- Marketing campaign management

### Integration Points

- **Customer Management**: Customer information and purchase verification
- **Product Catalog**: Product information and rating display
- **Order Management**: Purchase verification for reviews
- **Marketing**: Review content for marketing materials
- **Analytics**: Review performance and customer insights

This glossary ensures consistent terminology within the Reviews & Ratings context while maintaining clear boundaries and integration patterns with other bounded contexts.

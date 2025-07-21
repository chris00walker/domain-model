# Customer Management Context Glossary

Generated: 2025-07-21T12:19:38-03:00

## Purpose

This glossary defines terms specific to the Customer Management bounded context, focusing on customer identity, profile management, segmentation, and compliance operations.

## Context Overview

- **Business Purpose**: Manage complete customer lifecycle, profiles, preferences, and consent records

- **Core Responsibility**: Customer identity and profile management across all channels

- **Key Metrics**: Registration success ≥95%, Profile completeness ≥90%, GDPR compliance 100%

- **Integration Points**: Order Management, Subscription Management, Marketing, Payment & Billing

## Aggregates

### Customer

- **Definition**: Abstract root aggregate representing any person or organization that interacts with EFI

- **Implementation**: `Customer` abstract class extends AggregateRoot

- **Specializations**:

  - `FoodTruckCustomer` - B2B food truck operators

  - `HotelRestaurantCustomer` - B2B hotel and restaurant clients

  - `DiasporaCustomer` - B2C diaspora community members

- **Responsibilities**:

  - Customer identity and profile management

  - Contact information and preferences

  - Segmentation and classification

  - Compliance and consent tracking

- **Business Rules**:

  - Must have valid contact information

  - Must be classified by customer type and segment

  - Profile changes trigger CustomerUpdated events

- **Related Terms**: CustomerId, CustomerType, CustomerSegment, ContactInfo

### CustomerAccount

- **Definition**: Concrete implementation of Customer for account-based interactions

- **Implementation**: `CustomerAccount` extends Customer (TO BE IMPLEMENTED)

- **Additional Properties**:

  - Account credentials and authentication

  - Session management

  - Login history and security settings

- **Business Rules**:

  - Email uniqueness enforced across all accounts

  - Password complexity per OWASP recommendations

  - MFA required for high-value accounts

- **Related Terms**: Credential, SessionToken, AuthenticationService

## Value Objects

### CustomerId

- **Definition**: Unique identifier for customers across all EFI systems

- **Implementation**: `CustomerId` value object

- **Format**: UUID-based string identifier

- **Usage**: Primary key for customer references in all contexts

- **Business Rules**:

  - Globally unique across all customer types

  - Immutable once assigned

  - Used for cross-context customer references

- **Related Terms**: Customer, UniqueEntityID

### CustomerType

- **Definition**: Classification of customers by business segment and operational characteristics

- **Implementation**: `CustomerType` enum

- **B2C Segments**:

  - **DiasporaCommunity**: Caribbean diaspora seeking authentic products

  - **Tourist**: Visitors wanting local food experiences

  - **Expat**: Expatriates living in Barbados seeking familiar foods

  - **IndigenousFoodie**: Local food enthusiasts exploring Caribbean cuisine

- **B2B Segments**:

  - **FoodTruck**: Mobile food service operators

  - **PrivateChef**: Personal chef services

  - **SpecialtyMarket**: Specialty food retailers

  - **LimitedServiceRestaurant**: Quick-service restaurants

  - **FullServiceRestaurant**: Full-service dining establishments

  - **HotelRestaurant**: Hotel food service operations

- **Future Segments**:

  - **Importer**: Food import/distribution businesses

  - **RegionalSupermarket**: Regional grocery chains

  - **CruiseLineProvisioner**: Cruise ship food suppliers

  - **InternationalRetailer**: International retail partners

- **Business Impact**: Determines pricing tier, product access, and service levels

- **Related Terms**: CustomerSegment, PricingTier, Customer

### CustomerSegment

- **Definition**: Marketing and business classification for customer groups

- **Implementation**: `CustomerSegment` value object

- **Segmentation Criteria**:

  - Purchase behavior and frequency

  - Geographic location and delivery preferences

  - Product preferences and dietary restrictions

  - Business size and operational characteristics (B2B)

- **Business Rules**:

  - Segments can overlap (customer can be in multiple segments)

  - Segmentation drives marketing campaigns and personalization

  - Segment changes trigger CustomerSegmentChanged events

- **Related Terms**: CustomerType, MarketingCampaign, CustomerSegmentChanged

### ContactInfo

- **Definition**: Customer contact information and communication preferences

- **Implementation**: `ContactInfo` value object

- **Properties**:

  - **email**: Primary email address (required)

  - **phone**: Primary phone number (optional)

  - **alternatePhone**: Secondary phone number (optional)

  - **preferredContactMethod**: EMAIL | PHONE | EITHER

- **Business Rules**:

  - Email must be valid format and unique across system

  - Phone numbers must match regional format requirements

  - Preferred contact method determines notification delivery

- **Related Terms**: Email, PhoneNumber, NotificationPreferences

### Address

- **Definition**: Physical location information for delivery, billing, or business operations

- **Implementation**: `Address` value object (shared kernel)

- **Types**:

  - **ShippingAddress**: Delivery location for orders

  - **BillingAddress**: Billing information for payments

  - **BusinessAddress**: Business location for B2B customers

- **Properties**:

  - Street address, city, parish, postal code

  - Country (defaults to Barbados)

  - Address type and validation status

- **Business Rules**:

  - Must include required fields for delivery region

  - Validation against postal service database

  - Business addresses require additional verification

- **Related Terms**: DeliveryZone, ShippingAddress, BillingAddress

## Specialized Customer Types

### FoodTruckCustomer

- **Definition**: B2B customer operating mobile food service business

- **Implementation**: `FoodTruckCustomer` extends Customer

- **Additional Properties**:

  - **businessName**: Legal business name

  - **taxId**: Tax identification number

  - **businessLicenseNumber**: Operating license identifier

  - **cuisineType**: Array of cuisine types served

  - **operatingLocations**: Array of service locations

  - **storageCapacity**: Cold/dry storage capacity

  - **creditTerms**: Payment terms and credit limit

- **Business Rules**:

  - Must have valid business license and tax ID

  - Storage capacity affects order size limits

  - Credit terms determine payment options

  - Operating locations affect delivery scheduling

- **Related Terms**: BusinessLicense, CreditTerms, CuisineType

### HotelRestaurantCustomer

- **Definition**: B2B customer operating hotel food service operations

- **Implementation**: `HotelRestaurantCustomer` extends Customer

- **Additional Properties**:

  - **businessName**: Hotel or restaurant name

  - **taxId**: Business tax identification

  - **businessLicenseNumber**: Operating license

  - **hotelType**: BOUTIQUE | LUXURY | RESORT | BUSINESS | CHAIN | OTHER

  - **hotelSize**: Number of rooms (for hotels)

  - **numberOfRooms**: Room count for capacity planning

  - **restaurantCount**: Number of dining establishments

  - **hasRoomService**: Room service availability

  - **hasBanquetFacilities**: Event catering capabilities

  - **hasConferenceFacilities**: Business event services

- **Business Rules**:

  - Hotel size determines bulk ordering capabilities

  - Restaurant count affects delivery complexity

  - Facilities determine product mix requirements

- **Related Terms**: HotelType, BanquetServices, ConferenceFacilities

## Domain Services

### AuthenticationService

- **Definition**: Service managing customer authentication and session management

- **Implementation**: `AuthenticationService` domain service

- **Responsibilities**:

  - Customer login and logout processing

  - Session token generation and validation

  - Password reset and recovery workflows

  - Multi-factor authentication coordination

- **Business Rules**:

  - JWT tokens (RS256) with 1-hour expiry

  - Refresh token rotation for security

  - Optional MFA via TOTP or SMS

  - Account lockout after failed attempts

- **Related Terms**: SessionToken, Credential, MFA, JWT

### ConsentService

- **Definition**: Service managing customer consent and privacy compliance

- **Implementation**: `ConsentService` domain service (TO BE IMPLEMENTED)

- **Responsibilities**:

  - GDPR/CCPA consent collection and tracking

  - Data subject rights request processing

  - Consent withdrawal and data deletion

  - Privacy audit trail maintenance

- **Business Rules**:

  - Explicit consent required for data processing

  - Consent withdrawal must be honored within 30 days

  - Audit trail maintained for compliance verification

  - Data minimization principles enforced

- **Related Terms**: ConsentRecord, DataSubjectRights, GDPR, CCPA

### AccountMergeService

- **Definition**: Service managing customer account consolidation and deduplication

- **Implementation**: `AccountMergeService` domain service (TO BE IMPLEMENTED)

- **Responsibilities**:

  - Guest to registered user conversion

  - Duplicate account detection and merging

  - Order history consolidation

  - Preference and consent migration

- **Business Rules**:

  - Email-based account matching for merging

  - Order history preserved during merge

  - Most recent preferences take precedence

  - Consent records must be re-validated

- **Related Terms**: GuestAccount, AccountMerged, DuplicateDetection

## Domain Events

### CustomerRegistered

- **Definition**: Published when a new customer successfully registers

- **Implementation**: `CustomerRegistered` extends DomainEvent

- **Payload**: Customer ID, customer type, registration method, timestamp

- **Consumers**: Marketing, Analytics, Notifications, Subscription Management

- **Business Impact**: Triggers welcome sequence, segmentation, onboarding workflows

### CustomerUpdated

- **Definition**: Published when customer profile information changes

- **Implementation**: `CustomerUpdated` extends DomainEvent

- **Payload**: Customer ID, changed fields, previous values, timestamp

- **Consumers**: Order Management, Subscription Management, Marketing, Analytics

- **Business Impact**: Synchronizes profile changes across all contexts

### CustomerSegmentChanged

- **Definition**: Published when customer segment classification changes

- **Implementation**: `CustomerSegmentChanged` extends DomainEvent

- **Payload**: Customer ID, previous segment, new segment, change reason

- **Consumers**: Marketing, Pricing & Promotions, Analytics

- **Business Impact**: Triggers pricing updates, campaign adjustments, personalization

### CustomerLoggedIn

- **Definition**: Published when customer successfully authenticates

- **Implementation**: `CustomerLoggedIn` extends DomainEvent

- **Payload**: Customer ID, login method, session ID, IP address, timestamp

- **Consumers**: Analytics, Security Monitoring, Session Management

- **Business Impact**: Tracks engagement, security monitoring, session tracking

### ConsentUpdated

- **Definition**: Published when customer consent preferences change

- **Implementation**: `ConsentUpdated` extends DomainEvent

- **Payload**: Customer ID, consent type, granted/withdrawn, timestamp

- **Consumers**: Marketing, Analytics, Data Processing Services

- **Business Impact**: Ensures compliance, adjusts data processing permissions

### AccountMerged

- **Definition**: Published when customer accounts are consolidated

- **Implementation**: `AccountMerged` extends DomainEvent (TO BE IMPLEMENTED)

- **Payload**: Primary customer ID, merged customer ID, merge reason, timestamp

- **Consumers**: Order Management, Subscription Management, Analytics

- **Business Impact**: Consolidates customer history, updates references

## Repository Interfaces

### ICustomerRepository

- **Definition**: Persistence contract for customer aggregates

- **Implementation**: `ICustomerRepository` interface

- **Standard Operations**:

  - `findById(id: UniqueEntityID): Promise<Customer | null>`

  - `save(customer: Customer): Promise<void>`

  - `findByEmail(email: string): Promise<Customer | null>`

- **Specialized Queries**:

  - `findByCustomerType(type: CustomerType): Promise<Customer[]>`

  - `findBySegment(segment: CustomerSegment): Promise<Customer[]>`

  - `findDuplicateCandidates(email: string): Promise<Customer[]>`

- **Business Rules**: All operations return Result pattern for error handling

## Business Rules & Constraints

### Registration & Verification Rules

1. **Email Uniqueness**: Enforced across all customer types and accounts

2. **Password Complexity**: OWASP recommendations (min 8 chars, mixed case, numbers, symbols)

3. **Verification Required**: Email verification before checkout capability

4. **Profile Completeness**: Required fields vary by customer type

### Authentication & Session Rules

1. **Session Management**: JWT tokens with 1-hour expiry, refresh token rotation

2. **MFA Requirements**: Optional for B2C, required for high-value B2B accounts

3. **Account Lockout**: After 5 failed login attempts within 15 minutes

4. **Password Reset**: Secure token-based reset with 24-hour expiry

### Privacy & Compliance Rules

1. **GDPR Compliance**: Data subject request SLA ≤30 days (100% compliance)

2. **Consent Management**: Explicit consent required for marketing communications

3. **Data Minimization**: Only collect data necessary for business operations

4. **Right to Erasure**: Customer data deletion within 30 days of request

### Segmentation Rules

1. **Dynamic Segmentation**: Segments updated based on behavior and preferences

2. **Multi-Segment Membership**: Customers can belong to multiple segments

3. **Segment History**: Track segment changes for analytics and compliance

4. **Business Impact**: Segments drive pricing, promotions, and product access

## Integration Patterns

### Inbound Events (Consumed)

- **OrderCreated** (Order Management) → Update customer purchase history

- **SubscriptionCreated** (Subscription Management) → Update customer status

- **PaymentProcessed** (Payment & Billing) → Update payment history

- **ProductViewed** (Product Catalog) → Update preferences and interests

### Outbound Events (Published)

- **CustomerRegistered** → Marketing for welcome campaigns

- **CustomerUpdated** → All contexts for profile synchronization

- **CustomerSegmentChanged** → Marketing and Pricing for targeting updates

- **ConsentUpdated** → All contexts for compliance enforcement

### Service Dependencies

- **Authentication Provider**: OAuth integration for social login

- **Email Service**: Email verification and communication

- **SMS Service**: Phone verification and MFA

- **Address Validation**: Postal service integration for address verification

## Anti-Corruption Patterns

### Social OAuth Integration

- **GoogleUser** → Internal `Customer` with OAuth credentials

- **FacebookUser** → Internal `Customer` with social profile data

- **AppleUser** → Internal `Customer` with privacy-focused data

### Legacy Customer Data

- **Old Customer IDs** → New `CustomerId` format with mapping table

- **Previous Segmentation** → New segment classification system

- **Historical Preferences** → Current preference structure

### External CRM Integration

- **HubSpot Contact** → Internal `Customer` aggregate

- **Salesforce Lead** → Internal `Customer` with B2B classification

- **Mailchimp Subscriber** → Internal consent and preference data

## Context Boundaries

### What's Inside This Context

- Customer identity and profile management

- Authentication and session management

- Customer segmentation and classification

- Consent and privacy compliance

- Contact information and preferences

### What's Outside This Context

- Order processing (Order Management context)

- Payment processing (Payment & Billing context)

- Product recommendations (Product Catalog context)

- Marketing campaign execution (Marketing context)

### Integration Points

- **Order Management**: Customer validation for order processing

- **Subscription Management**: Customer profile for subscription setup

- **Payment & Billing**: Customer information for payment processing

- **Marketing**: Customer segments for campaign targeting

- **Product Catalog**: Customer preferences for personalization

This glossary ensures consistent terminology within the Customer Management context while maintaining clear boundaries and integration patterns with other bounded contexts.

# Customer Management

[RELATED: ADR-002, ADR-004, ADR-008, ADR-009, ADR-012]
[CONTEXT: Supporting]
[STATUS: Draft]
[VERSION: 1.0.0]
[OWNER: @customer-experience]

## 1. Business Context

- **Purpose**: Manage the full lifecycle of customer identities, profiles, preferences, and consent records to power personalization, compliance, and downstream processes.
- **Business Capabilities**:
  - Secure customer registration & authentication
  - Central profile & preference store with audit trail
  - Consent & privacy management (GDPR/CCPA)
  - Loyalty & tier tracking for marketing segmentation
  - Account merging & deduplication across channels (guest → user)
- **Success Metrics**:
  - Registration success rate ≥ 95 %
  - Profile completeness ≥ 90 % of required fields
  - < 0.1 % authentication-related incidents/month
  - GDPR data subject request SLA ≤ 30 days (100 % compliance)
- **Domain Experts**: Head of CX, Data Privacy Officer, Marketing Automation Lead

## 2. Domain Model

- **Key Entities**: `CustomerAccount`, `Credential`, `Address`, `ConsentRecord`, `LoyaltyTier`, `Preference`, `SessionToken`
- **Aggregates**:
  - `CustomerAccount` (root) → owns credentials, addresses, consents, preferences
- **Value Objects**: `Email`, `PhoneNumber`, `PasswordHash`, `Locale`, `SegmentTag`
- **Domain Services**: `AuthenticationService`, `ConsentService`, `AccountMergeService`
- **Domain Events**: `CustomerRegistered`, `CustomerUpdated`, `CustomerLoggedIn`, `ConsentUpdated`, `AccountMerged`

## 3. Functional Requirements

### 3.1 Registration & Verification

- **FR-1**: As a visitor, I can register via email/password or social OAuth so that I have an account.
  - **Acceptance Criteria**:
    - [ ] Email uniqueness enforced; password complexity ≥ OWASP recommendations
    - [ ] Verification email sent and must be confirmed before checkout
    - [ ] `CustomerRegistered` event emitted

### 3.2 Authentication & Session

- **FR-2**: As a customer, I can log in securely and maintain a session.
  - **Acceptance Criteria**:
    - [ ] JWT tokens (RS256) stored in HTTP-only cookies
    - [ ] Optional MFA via TOTP or SMS
    - [ ] Session expiry 1 h; refresh token rotation

### 3.3 Profile & Preference Management

- **FR-3**: Customers can update personal data, addresses, and communication preferences.
  - **Acceptance Criteria**:
    - [ ] Validation on country, phone formats
    - [ ] Audit trail created for GDPR

### 3.4 Consent & Privacy

- **FR-4**: System must capture explicit marketing and terms-of-service consents.
  - **Acceptance Criteria**:
    - [ ] Versioned consent records with timestamp & IP
    - [ ] Ability to export/erase personal data within 30 days of request

### 3.5 Account Merge

- **FR-5**: On login, guest cart and any guest profile should merge into existing account.
  - **Acceptance Criteria**:
    - [ ] Duplicate detection via email/phone hash
    - [ ] `AccountMerged` event emitted

### 3.6 Business Rules

- Every customer must have a unique identifier and at least one verified contact method (email or phone).
- Customer addresses must be validated against an external service before persistence.
- All personal data must comply with GDPR and CCPA, with explicit, versioned consent records.
- Each customer belongs to exactly one primary segment, recalculated upon qualifying attribute changes.
- Segment reassignment must trigger notifications to Marketing and Sales contexts.
- Accounts inactive for over 24 months are flagged for review.
- Account deletion requests must be completed within 30 days.
- Loyalty tier recalculations run monthly based on spending patterns.
- Changes to primary contact information require re-verification.
- Duplicate accounts detected on login are merged and emit `AccountMerged`.

## 4. Integration Points

### 4.1 Published Events

- `CustomerRegistered` → Consumers: Marketing, AnalyticsReporting, NotificationsAlerts
- `CustomerUpdated` → Consumers: OrderManagement, PaymentBilling, Subscriptions
- `CustomerPreferencesUpdated` → Consumers: Marketing, Catalog, Notification
- `CustomerAccountDeactivated` → Consumers: Marketing, OrderManagement, Subscriptions, Analytics
- `ConsentUpdated` → Consumers: NotificationsAlerts, Compliance
- `AccountMerged` → Consumers: OrderManagement, Marketing, AnalyticsReporting

### 4.2 Consumed Events

- `OrderPlaced` (OrderManagement) → Update purchase history & loyalty points
- `PaymentMethodAdded` (PaymentBilling) → Attach tokenized card metadata to profile
- `ProductReviewed` (ProductCatalog) → Update customer interests & preferences
- `CustomerSupportTicketCreated` (Support) → Append interaction record & sentiment

### 4.3 APIs/Services

- **REST/GraphQL**: `/customers`, `/customers/{id}/preferences`, `/consents`
- **gRPC**: `AuthService` for login/validate token
- **External Services**: Auth0 (fallback social OAuth), Twilio (SMS MFA)

## 5. Non-Functional Requirements

- **Performance**: Login response ≤ 300 ms (P95)
- **Scalability**: 5 M registered users; 1 k concurrent logins/sec
- **Security**: PCI-DSS scope exclusion; passwords hashed with bcrypt 12 rounds; data encrypted at rest (AES-256)
- **Reliability**: 99.95 % uptime; failover auth node within 30 s
- **Maintainability**: 85 % test coverage; OpenAPI contract versioned

## 6. Implementation Roadmap

### Phase 1 – Identity Foundation (Weeks 1-4)

1. Deliver registration, login, and consent APIs with Auth0 integration.
2. Implement GDPR-compliant consent storage and `CustomerRegistered` event emission.
3. Set up address validation and password policy enforcement.

### Phase 2 – Profile & Preferences (Weeks 5-8)

1. Launch profile & preference endpoints with audit trail.
2. Build segmentation recalculation and duplicate account merge workflow.
3. Integrate Notifications context for verification & consent emails.

### Phase 3 – Segmentation & Loyalty (Weeks 9-12)

1. Implement real-time segment engine and expose tags to Marketing context.
2. Deploy monthly loyalty tier calculator and `CustomerLoyaltyTierUpdated` event.
3. Provide dashboards for acquisition & data quality metrics.

### Phase 4 – Scale & Analytics (Weeks 13-16)

1. Scale auth cluster to 1 000 logins/s with horizontal pods.
2. Add AI duplicate detection and E.164 phone standardization.
3. Harden SLAs with load tests and chaos drills.

## 7. Testing & Validation Strategy

- **Unit Tests**: Entity validation, segmentation rules, duplicate detection logic.
- **Integration Tests**: Auth provider, PaymentBilling, Notifications flows.
- **Performance Tests**: 1 000 logins/s with P95 ≤ 300 ms.
- **Security Tests**: OWASP ASVS, GDPR data export/erase, RBAC checks.
- **User Acceptance Tests**: Registration, profile edits, consent update scenarios.
- **CI/CD Gates**: 85 % coverage, static analysis, dependency scanning per ADR-012.

## 8. Open Questions

- [ ] Should loyalty points live here or in Marketing context?
- [ ] Standardise phone number format using E.164 for all regions?

## 9. Out of Scope

- Payment authentication & 3DS flows (handled in Payment & Billing)
- B2B account hierarchy (future roadmap)

## 10. References

- ADR-009: Data Protection Strategy
- ADR-002: Domain Event Design Patterns
- Context Map (context_map.puml)

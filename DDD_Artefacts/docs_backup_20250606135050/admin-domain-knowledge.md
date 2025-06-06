# Admin Domain Knowledge

## Domain Overview

The Admin bounded context is responsible for all administrative functionality within Elias Food Imports, including management of administrative users, role-based access control, content moderation workflows, system configuration, and comprehensive audit logging for security and compliance. This context provides critical infrastructure for managing and governing the entire application ecosystem.

## Strategic Importance

The Admin domain serves as a **Supporting Domain** that enables operational control and governance across all other bounded contexts. While not directly related to the core business of importing specialty food products, it provides essential capabilities for:

1. **Security and Compliance** - Supporting regulatory requirements through comprehensive audit logging and role-based access control
2. **Content Governance** - Ensuring product descriptions, reviews, and other content meet quality standards and regulatory requirements
3. **System Configuration** - Providing flexibility to adapt system behavior without code changes
4. **Operation Management** - Enabling administrators to manage and monitor system health

## Core Concepts and Ubiquitous Language

### Administrative User Management

- **Admin User**: A specialized user account with elevated permissions to manage system functionality.
- **Role**: A named collection of permissions that can be assigned to admin users.
- **Permission**: An authorization to perform specific actions within the system, formatted as `CONTEXT.RESOURCE.ACTION`.
- **Multi-Factor Authentication (MFA)**: Additional security verification beyond passwords required for all admin accounts.

### Content Moderation

- **Moderation Task**: A unit of work requiring administrative review and approval/rejection.
- **Moderation Status**: The current state of content in the moderation workflow (PENDING, APPROVED, REJECTED, FLAGGED, AUTO_APPROVED).
- **Moderation Queue**: The collection of pending content items awaiting review.
- **Auto-Moderation**: AI-driven content screening that can automatically approve safe content.

### System Configuration

- **System Setting**: A configurable parameter that controls system behavior.
- **Feature Flag**: A toggleable setting that enables or disables specific functionality.
- **Security Setting**: Configuration parameters related to system security.

### Audit Logging

- **Audit Log Entry**: A record of an administrative action, including actor, target, action type, and context.
- **Access Auditing**: Tracking of authentication events and resource access.
- **Modification Auditing**: Tracking of data changes with before/after values.

## Business Rules

1. **Administrative Access**
   - All administrative accounts must have MFA enabled
   - Admin accounts can only be created by existing Super Admin users
   - Admin passwords must meet complexity requirements and expire after configured periods
   - Failed login attempts must be logged and trigger lockouts after threshold violations

2. **Role-Based Access Control**
   - Every admin user must have at least one assigned role
   - System roles (Super Admin, System Admin, Read-Only) cannot be modified
   - Custom roles can be created with granular permissions
   - Permission checks must occur at API boundaries and enforce least-privilege principle

3. **Content Moderation**
   - All user-generated content must pass through moderation before publication
   - Content rejections must include justification notes
   - AI moderation can auto-approve content only with ≥95% confidence
   - Flagged content requires review by at least two moderators

4. **System Configuration**
   - Security settings can only be modified by Super Admin users
   - All configuration changes must be logged with previous and new values
   - Feature flags must have documented fallback behavior

5. **Audit Requirements**
   - All administrative actions must be logged with complete context
   - Audit logs must include timestamp, user ID, IP address, and action details
   - Audit logs cannot be modified or deleted, only viewed
   - Audit logs must be retained for a configurable period (default: 1 year)

## Domain Events

1. **AdminUserCreatedEvent**
   - Triggered when a new administrative user is created
   - Payload: Admin user details (excluding password)

2. **AdminRoleChangedEvent**
   - Triggered when an admin user's roles are modified
   - Payload: User ID, new roles, previous roles

3. **AdminUserDeactivatedEvent**
   - Triggered when an admin user is deactivated
   - Payload: User ID, deactivation reason

4. **ModerationTaskCompletedEvent**
   - Triggered when content moderation is completed (approved/rejected)
   - Payload: Task ID, content ID, status, moderator ID

5. **SystemSettingUpdatedEvent**
   - Triggered when a system setting is changed
   - Payload: Setting key, new value, previous value, modifier ID

## Aggregates

1. **AdminUser**
   - Root Entity: AdminUser
   - Entities: None
   - Value Objects: AdminUserEmail, AdminUserStatus
   - Repository: IAdminUserRepository
   - Invariants:
     - Must have at least one role
     - Must have MFA enabled when active
     - Email must be unique

2. **ModerationTask**
   - Root Entity: ModerationTask
   - Entities: None
   - Value Objects: ModerationStatus
   - Repository: IModerationTaskRepository
   - Invariants:
     - Content must have valid source ID
     - Rejection requires notes
     - Status transitions must follow workflow rules

3. **SystemSetting**
   - Root Entity: SystemSetting
   - Entities: None
   - Value Objects: SystemSettingKey, SystemSettingValue
   - Repository: ISystemSettingRepository
   - Invariants:
     - Setting key must be unique
     - Values must conform to their defined type
     - Security settings must be encrypted

## Entities

1. **Role**
   - Properties: name, description, permissions, isSystemRole
   - Behaviors:
     - Add/remove permissions
     - Check if has specific permission
     - System roles are immutable

2. **AuditLogEntry**
   - Properties: actionType, performedBy, targetId, details, ipAddress, timestamp
   - Behaviors: Immutable record (no behaviors other than creation)

## Value Objects

1. **AdminUserEmail**
   - Properties: email address string
   - Validation: RFC 5322 compliant email format

2. **AdminUserStatus**
   - Values: PENDING_MFA, ACTIVE, INACTIVE, LOCKED
   - Behaviors: Status transition validation

3. **Permission**
   - Structure: CONTEXT.RESOURCE.ACTION format
   - Examples: CATALOG.PRODUCT.CREATE, ADMIN.USER.READ
   - Behaviors: Check permission hierarchy (e.g., READ, WRITE)

4. **ModerationStatus**
   - Values: PENDING, APPROVED, REJECTED, FLAGGED, AUTO_APPROVED
   - Behaviors:
     - Check if completed
     - Check if requires human review

5. **SystemSettingKey**
   - Format: UPPER_SNAKE_CASE
   - Behaviors:
     - Check if security setting
     - Check if feature flag

6. **SystemSettingValue**
   - Types: BOOLEAN, NUMBER, STRING, JSON, EMAIL_LIST
   - Behaviors:
     - Type-safe value access
     - Type-specific validation

## Domain Services

1. **AdminUserService**
   - Responsibilities:
     - Create admin users
     - Manage user roles
     - Deactivate users
     - Set up MFA

2. **ModerationService**
   - Responsibilities:
     - Create moderation tasks
     - Approve/reject content
     - Apply AI moderation
     - Generate moderation metrics

3. **SystemSettingService**
   - Responsibilities:
     - Manage system settings
     - Retrieve typed setting values
     - Manage feature flags
     - Track setting changes

4. **IAuditLogService**
   - Responsibilities:
     - Log administrative actions
     - Provide audit log querying
     - Ensure complete audit trail

## Integration Points

1. **Authentication Context**
   - Dependency: Admin uses shared authentication mechanisms
   - Integration Pattern: Shared Kernel
   - Data Exchange: User credentials, MFA verification

2. **Catalog Context**
   - Relationship: Admin moderates catalog content
   - Integration Pattern: Customer-Supplier
   - Data Exchange: Product descriptions for moderation

3. **Customer Context**
   - Relationship: Admin moderates customer reviews, profiles
   - Integration Pattern: Customer-Supplier
   - Data Exchange: Reviews and profiles for moderation

4. **All Bounded Contexts**
   - Relationship: Admin provides authorization
   - Integration Pattern: Published Language
   - Data Exchange: Permission checks via shared service

## Implementation Recommendations

1. **Security First Approach**
   - Implement comprehensive input validation
   - Apply principle of least privilege for all operations
   - Encrypt sensitive data at rest and in transit

2. **Scalable Audit Storage**
   - Design audit storage for high-volume write operations
   - Implement efficient indexing for query performance
   - Consider time-based partitioning for historical audit data

3. **Moderation Workflow Flexibility**
   - Implement moderation as a state machine pattern
   - Support customizable review workflows per content type
   - Design with future AI moderation enhancements in mind

4. **Testing Strategy**
   - Prioritize invariant testing for security-critical rules
   - Implement comprehensive permission testing
   - Mock external dependencies for isolation testing

## Implementation Status

### Completed Components

- ✅ Core domain model implementation (aggregates, entities, value objects)
- ✅ Domain service interfaces and implementations
- ✅ Repository interfaces
- ✅ Domain events definitions
- ✅ Critical invariant tests (e.g., MFA enforcement)
- ✅ Content moderation workflow validation tests
- ✅ System settings validation tests
- ✅ Domain documentation and diagrams
- ✅ Ubiquitous language definitions

### Pending Items

- 🔄 Infrastructure layer implementation
- 🔄 Application services and use cases (partially implemented)
- 🔄 Integration with other bounded contexts
- 🔄 API controllers and endpoints
- 🔄 Full test coverage for all aggregates
- 🔄 Performance testing for audit logging at scale

## Strategic Conclusions

The Admin bounded context, while classified as a Supporting Domain, is critical to the operation, security, and compliance of the entire Elias Food Imports platform. Its implementation follows Domain-Driven Design principles to ensure:

1. **Clear boundaries** between administrative concerns and business domain logic
2. **Strong invariants** to protect security-critical operations 
3. **Rich domain model** capturing the specialized needs of administrators
4. **Comprehensive audit trail** supporting compliance requirements

As the system evolves, the Admin context will need to maintain its strict security enforcement while adapting to support new bounded contexts and business capabilities.
   - Use secure audit logging patterns

2. **Scalable Moderation**
   - Design moderation queues for high throughput
   - Implement moderation prioritization algorithm
   - Develop AI-assisted moderation with human oversight

3. **Flexible Configuration**
   - Use type-safe configuration system
   - Implement caching for frequently accessed settings
   - Provide configuration validation
   - Support environment-specific overrides

4. **Comprehensive Auditing**
   - Design audit logs for efficient querying
   - Implement non-repudiation features
   - Separate audit storage for compliance

5. **Testing Strategy**
   - Unit test all permission logic
   - Integration test audit logging
   - Stress test moderation workflows
   - Security penetration testing for admin interfaces

## Success Metrics

1. **Security Compliance**
   - 100% of admin actions logged with complete audit trail
   - Zero security incidents related to admin access
   - All admin sessions properly authenticated with MFA

2. **Moderation Efficiency**
   - ≥99% moderation tasks completed within SLA  
   - ≥50% reduction in manual moderation through AI assistance
   - ≤1% error rate in moderation decisions

3. **System Reliability**
   - Zero critical system incidents from configuration changes
   - ≥99.9% uptime for admin interfaces
   - ≤5 second response time for admin operations

## Alignment with Ubiquitous Language

This domain model adheres to the Ubiquitous Language Consistency Framework by:

1. Following the established naming conventions for aggregates, entities and value objects
2. Using domain-driven terminology in all interface definitions
3. Maintaining consistency with cross-cutting concepts (e.g., user roles)
4. Documenting all domain terms in this knowledge base for reference

All domain events follow the entity-first, past-tense naming convention established in the Domain Event Naming Analysis.

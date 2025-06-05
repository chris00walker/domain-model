# Admin Bounded Context

## Overview

The Admin bounded context handles all administrative functionality for the Elias Food Imports system, including:

1. **Administrative User Management** - Creating, managing, and deactivating admin accounts with role-based permissions
2. **Content Moderation** - Review and approval workflows for user-generated content 
3. **System Configuration** - Managing configurable system settings and feature flags
4. **Audit Logging** - Tracking all administrative actions for security and compliance

## Strategic Classification

- **Domain Type**: Supporting Domain
- **Relationship Pattern**: Shared Kernel with Authentication, Customer Service with Content-related contexts
- **Integration Style**: Synchronous API calls with other admin functions, Asynchronous events for content moderation

## Core Concepts

### Administrative User Management

Manages the lifecycle of administrative users with fine-grained role-based access control:

- **AdminUser Aggregate** - Core entity representing an administrative user with associated roles
- **Role Entity** - Collection of permissions that can be assigned to admin users
- **Permission Value Object** - Hierarchical structure of context.resource.action permissions

### Content Moderation

Controls the review and approval process for user-generated content:

- **ModerationTask Aggregate** - Tracks the lifecycle of content requiring review
- **ModerationStatus Value Object** - Represents the workflow state of content moderation
- **ModerationService** - Handles business logic for moderating content

### System Configuration

Manages configurable aspects of the application:

- **SystemSetting Aggregate** - Key-value pairs for system configuration 
- **SystemSettingKey & SystemSettingValue Value Objects** - Strongly-typed setting components
- **SystemSettingService** - Manages access and modification of system settings

### Audit Logging

Records administrative actions for security and compliance:

- **AuditLogEntry Entity** - Records who did what, when, and to what
- **IAuditLogService** - Service interface for recording and querying audit logs

## Business Rules

1. All admin users must have Multi-Factor Authentication (MFA) enabled
2. Admin accounts require at least one role with associated permissions
3. System roles cannot be modified or deleted
4. Content moderation requires explicit approval or rejection with notes
5. Content can be auto-approved by AI only with high confidence (≥95%)
6. All administrative actions must be logged for audit purposes
7. Security settings require special permissions to modify

## Success Metrics

1. **Security Compliance**: 100% of admin actions logged with complete details
2. **Content Moderation**: ≥99% of content moderation tasks completed within SLA
3. **System Stability**: Configuration changes documented with zero regressions

## Integration Points

### Upstream (Consumers of Admin Services)

- **All Bounded Contexts** - Consume admin permissions for authorization
- **Catalog/Customer Contexts** - Submit content for moderation
- **All UI Components** - Consume system settings for feature configuration

### Downstream (Services Admin Context Consumes)

- **Authentication Context** - Verifies admin credentials
- **Catalog/Customer/etc. Contexts** - Content sources for moderation

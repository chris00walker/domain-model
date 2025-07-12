# API Design Guidelines

## Status
Draft (2025-07-04)

## Overview
This document provides comprehensive guidelines for designing APIs within the Elias Food Imports ecosystem. These guidelines ensure consistency, maintainability, and alignment with our domain-driven design principles.

## Table of Contents
1. [RESTful API Design](#restful-api-design)
2. [Resource Naming](#resource-naming)
3. [HTTP Methods and Status Codes](#http-methods-and-status-codes)
4. [Request and Response Formats](#request-and-response-formats)
5. [Versioning](#versioning)
6. [Error Handling](#error-handling)
7. [Pagination and Filtering](#pagination-and-filtering)
8. [Authentication and Authorization](#authentication-and-authorization)
9. [Rate Limiting](#rate-limiting)
10. [Documentation](#documentation)

## RESTful API Design

### Principles
- **Resource-Oriented**: Design APIs around resources, not actions
- **Stateless**: Each request should contain all necessary information
- **Cacheable**: Responses should define their cacheability
- **Uniform Interface**: Consistent use of HTTP methods and status codes

## Resource Naming

### Guidelines
- Use nouns (not verbs) to represent resources
- Use plural nouns for collections (e.g., `/products` not `/product`)
- Use hyphens for multi-word resource names (e.g., `product-categories`)
- Use forward slashes for hierarchy (e.g., `/products/{id}/reviews`)
- Use lowercase letters in URLs
- Avoid file extensions in URLs

### Examples
```
GET    /products                 # List all products
POST   /products                 # Create a new product
GET    /products/{id}            # Get a specific product
PUT    /products/{id}            # Update a product
DELETE /products/{id}            # Delete a product
GET    /products/{id}/reviews    # Get reviews for a product
```

## HTTP Methods and Status Codes

### Standard Methods
- `GET`: Retrieve a resource or collection
- `POST`: Create a new resource
- `PUT`: Update an existing resource (full update)
- `PATCH`: Partially update a resource
- `DELETE`: Remove a resource

### Common Status Codes
- `200 OK`: Successful GET, PUT, or PATCH
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Resource state conflict
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Request and Response Formats

### JSON Standards
- Use camelCase for property names
- Include resource identifiers in responses
- Use ISO 8601 for dates (e.g., `2025-07-04T18:30:00Z`)
- Use UTC for all timestamps

### Request Headers
```
Accept: application/json
Content-Type: application/json
Authorization: Bearer {token}
X-Request-ID: {uuid}
```

### Response Headers
```
Content-Type: application/json
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1625439600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

## Versioning

### Guidelines
- Include version in the URL (e.g., `/v1/products`)
- Maintain backward compatibility within major versions
- Document breaking changes in release notes
- Support multiple versions during transition periods

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "invalid_request",
    "message": "The request is missing a required parameter",
    "details": [
      {
        "field": "name",
        "issue": "required_field_missing",
        "description": "Name is a required field"
      }
    ],
    "request_id": "a1b2c3d4e5f6g7h8",
    "documentation_url": "https://docs.eliaseats.com/errors#invalid_request"
  }
}
```

### Common Error Codes
- `invalid_request`: Invalid request parameters
- `authentication_error`: Authentication failed
- `authorization_error`: Insufficient permissions
- `not_found`: Resource not found
- `rate_limit_exceeded`: Too many requests
- `server_error`: Internal server error

## Pagination and Filtering

### Pagination
```json
{
  "data": [...],
  "pagination": {
    "total_items": 100,
    "total_pages": 10,
    "current_page": 1,
    "per_page": 10,
    "next_url": "/products?page=2&per_page=10",
    "prev_url": null
  }
}
```

### Filtering
```
GET /products?category=produce&price[gte]=10&price[lte]=50&sort=-price,name
```

## Authentication and Authorization

### OAuth 2.0
- Use OAuth 2.0 with JWT bearer tokens
- Support for client credentials and authorization code flows
- Token expiration and refresh mechanisms

### Scopes
- Define fine-grained permissions
- Example: `products:read`, `orders:write`

## Rate Limiting

### Guidelines
- 1000 requests per hour per API key by default
- Include rate limit headers in all responses
- Return 429 status code when limit is exceeded

## Documentation

### Requirements
- Use OpenAPI 3.0 for API specifications
- Include examples for all endpoints
- Document all possible error responses
- Provide sample code in multiple languages

### Documentation Structure
1. Authentication
2. Getting Started
3. API Reference
4. Error Handling
5. Rate Limiting
6. Best Practices

## Related Documents
- [Ubiquitous Language in API Design](../ubiquitous-language/guides/api_design.md)
- [Domain Event Catalog](../domain-knowledge/integrations/events.md)
- [Bounded Context Map](../domain-knowledge/integrations/context-map.md)

## Changelog
- 2025-07-04: Initial version

## Future Enhancements (Notes)
- Optionally version the guideline with SemVer in its front-matter (`version: 1.0.0`) and manage updates via pull requests reviewed by the Architecture Guild.
- Best-practice extras (optional):
  - Introduce a Spectral lint rule in CI that validates OpenAPI specs against these guidelines.
  - Maintain an expanded change-log section so teams can track revisions without treating each update as a new ADR.

---

*This document is part of the Elias Food Imports API Governance Framework.*

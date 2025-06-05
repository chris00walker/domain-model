# Ubiquitous Language in API Design

## Purpose

This document provides guidance on integrating the ubiquitous language into API design for Elias Food Imports. Consistent terminology between the domain model and external interfaces ensures that the domain concepts are properly represented in all system interactions, reducing translation overhead and improving communication between teams.

## Importance of API Terminology Alignment

APIs serve as the contract between different parts of the system and with external systems. When API terminology aligns with the ubiquitous language:

1. **Reduced Cognitive Load**: Developers don't need to mentally translate between API terms and domain terms
2. **Improved Communication**: Teams can discuss API behavior using the same language as domain concepts
3. **Better Documentation**: API documentation naturally aligns with domain documentation
4. **Faster Onboarding**: New team members can more quickly understand the relationship between APIs and domain concepts
5. **Reduced Translation Errors**: Fewer errors from mistranslating between API and domain concepts

## API Design Principles

### 1. Resource Naming

Resource names should directly reflect domain entities and aggregates from the ubiquitous language:

| Domain Concept | API Resource | Example Endpoint |
|----------------|--------------|-----------------|
| Customer | customers | `/api/customers/{id}` |
| Subscription | subscriptions | `/api/subscriptions/{id}` |
| Order | orders | `/api/orders/{id}` |
| Product | products | `/api/products/{id}` |
| Line Item | lineItems | `/api/orders/{orderId}/lineItems/{id}` |

**Guidelines:**

- Use plural nouns for collection resources
- Use the exact term from the glossary for the resource name
- Nest resources when they represent a containment relationship in the domain
- Avoid technical terms like "entity" or "aggregate" in resource names

### 2. Property Naming

Property names in API responses and requests should match the attributes of domain objects:

| Domain Object Property | API Property | Notes |
|-----------------------|--------------|-------|
| Customer.name | name | Direct match |
| Customer.customerType | customerType | Direct match |
| Product.productOrigin | productOrigin | Direct match |
| Order.lineItems | lineItems | Direct match |

**Guidelines:**

- Use camelCase for property names (JavaScript convention)
- Use the exact term from the glossary for the property name
- Avoid technical prefixes or suffixes (e.g., "dto", "vo")
- Be consistent with pluralization (e.g., always use plural for collections)

### 3. Operation Naming

API operations should reflect domain operations and events:

| Domain Operation/Event | HTTP Method | API Endpoint | Example |
|------------------------|-------------|--------------|---------|
| PlaceOrder | POST | /api/orders | Create a new order |
| CancelOrder | PUT/PATCH | /api/orders/{id}/cancel | Cancel an existing order |
| AddLineItemToOrder | POST | /api/orders/{id}/lineItems | Add a line item to an order |
| CalculatePrice | GET | /api/pricing/calculate | Calculate price for a product |

**Guidelines:**

- Use domain verbs for operation-specific endpoints
- Map domain events to appropriate HTTP methods
- Use resource-based URLs for CRUD operations
- Use verb-based URLs for complex operations that don't map cleanly to CRUD

### 4. Parameter Naming

Query parameters and path parameters should use consistent terminology:

| Domain Concept | API Parameter | Example |
|----------------|---------------|---------|
| Customer Segment | customerSegment | `/api/customers?customerSegment=wholesale` |
| Delivery Frequency | deliveryFrequency | `/api/subscriptions?deliveryFrequency=weekly` |
| Product Category | productCategory | `/api/products?productCategory=cheese` |

**Guidelines:**

- Use the exact term from the glossary for parameter names
- Be consistent with camelCase for parameter names
- Use plural forms for multi-value parameters
- Avoid abbreviations unless they are part of the ubiquitous language

### 5. Error Messages

Error messages should use domain terminology when describing business rule violations:

| Domain Rule | Error Message | HTTP Status |
|-------------|---------------|-------------|
| Minimum Order Amount | "Order total is below the minimum order amount of $100" | 400 Bad Request |
| Product Authentication | "Product authentication failed: invalid authentication code" | 400 Bad Request |
| Subscription Frequency | "Invalid delivery frequency: must be weekly, bi-weekly, or monthly" | 400 Bad Request |

**Guidelines:**

- Use domain terms to describe the error condition
- Reference specific business rules when applicable
- Provide actionable information for resolving the error
- Use consistent error message structure across all APIs

## API Documentation

API documentation should explicitly reference the ubiquitous language:

### Example OpenAPI Documentation

```yaml
openapi: 3.0.0
info:
  title: Elias Food Imports API
  description: |
    API for Elias Food Imports using the ubiquitous language from our domain model.
    For definitions of domain terms, please refer to the glossary at
    [link to glossary].
  version: 1.0.0
paths:
  /api/orders:
    post:
      summary: Place a new order
      description: |
        Creates a new order in the system. An order represents a customer's
        request to purchase products, as defined in our domain model.
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrderRequest'
      responses:
        '201':
          description: Order successfully placed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
components:
  schemas:
    Order:
      type: object
      description: |
        An order represents a customer's request to purchase products.
        See domain glossary for more details on the Order concept.
      properties:
        orderId:
          type: string
          description: Unique identifier for the order
        customerId:
          type: string
          description: Reference to the customer placing the order
        orderStatus:
          type: string
          enum: [placed, processing, fulfilled, shipped, delivered, cancelled]
          description: |
            Current status of the order.
            See domain glossary for definitions of each status.
        lineItems:
          type: array
          description: |
            Line items in the order. A line item represents a specific product
            and quantity being ordered.
          items:
            $ref: '#/components/schemas/LineItem'
```

## Bounded Context Translation in APIs

When an API spans multiple bounded contexts, it should explicitly handle translation between contexts:

### Example: Order API that includes Pricing Context concepts

```yaml
components:
  schemas:
    Order:
      type: object
      properties:
        # Order Context properties
        orderId:
          type: string
        orderStatus:
          type: string
          enum: [placed, processing, fulfilled, shipped, delivered, cancelled]
        # Pricing Context properties (translated)
        pricing:
          type: object
          description: |
            Pricing information for this order.
            Note: These concepts come from the Pricing bounded context.
          properties:
            totalPrice:
              $ref: '#/components/schemas/Money'
            appliedDiscounts:
              type: array
              items:
                $ref: '#/components/schemas/Discount'
```

**Guidelines for Context Translation:**

1. **Document Context Boundaries**: Clearly document when properties come from different bounded contexts
2. **Maintain Consistent Terminology**: Use the terminology from the appropriate bounded context
3. **Avoid Leaking Implementation Details**: Don't expose internal bounded context implementation details
4. **Consider Separate Resources**: For complex translations, consider separate API resources

## Versioning and Evolution

As the ubiquitous language evolves, APIs must evolve as well:

1. **Version APIs**: Use API versioning to manage terminology changes
2. **Document Changes**: Clearly document terminology changes between versions
3. **Provide Migration Guides**: Help clients migrate when terminology changes
4. **Consider Compatibility**: Use techniques like property aliases to maintain backward compatibility

### Example Version Migration Documentation

```markdown
## API v2 Terminology Changes

The following terminology changes have been made in API v2 to better align with our evolving domain model:

| v1 Term | v2 Term | Reason for Change |
|---------|---------|-------------------|
| shippingDetails | deliveryDetails | Aligned with glossary term "Delivery" |
| orderItem | lineItem | Aligned with glossary term "Line Item" |
| recurringOrder | subscription | Aligned with glossary term "Subscription" |

For backward compatibility, v2 APIs will accept both old and new terminology in requests until 2025-12-31.
```

## Implementation Checklist

When designing a new API or updating an existing one:

- [ ] Review the ubiquitous language glossary for relevant terms
- [ ] Map API resources to domain entities and aggregates
- [ ] Ensure property names match domain object attributes
- [ ] Use domain terminology in operation names
- [ ] Document the relationship between API concepts and domain concepts
- [ ] Review the API design with domain experts
- [ ] Update the API when the ubiquitous language changes

## Common Anti-patterns

### 1. Technical Resource Names

**Anti-pattern**: `/api/customerEntities` or `/api/customerDtos`  
**Better approach**: `/api/customers`

### 2. Generic CRUD Operations Only

**Anti-pattern**: Only providing CRUD endpoints without domain-specific operations  
**Better approach**: Include endpoints for important domain operations like `/api/orders/{id}/cancel`

### 3. Inconsistent Pluralization

**Anti-pattern**: Mixing `/api/customer` and `/api/products`  
**Better approach**: Consistently use plural: `/api/customers` and `/api/products`

### 4. Technical Error Messages

**Anti-pattern**: "Entity validation failed: property 'x' failed constraint 'y'"  
**Better approach**: "Order total is below the minimum order amount of $100"

### 5. Exposing Internal Bounded Context Details

**Anti-pattern**: Exposing internal bounded context implementation details in APIs  
**Better approach**: Design APIs around public bounded context interfaces

## API Review Process

To ensure APIs align with the ubiquitous language:

1. **Include Domain Experts**: Have domain experts review API designs
2. **Terminology Review**: Explicitly review terminology used in the API
3. **Glossary Mapping**: Create a mapping between API terms and glossary terms
4. **Documentation Review**: Ensure API documentation uses consistent terminology
5. **Client Feedback**: Gather feedback from API clients on terminology clarity

## Example API Design Aligned with Ubiquitous Language

### Customer API

```yaml
openapi: 3.0.0
paths:
  /api/customers:
    get:
      summary: List customers
      parameters:
        - name: customerSegment
          in: query
          description: Filter by customer segment
          schema:
            type: string
            enum: [retail, wholesale, distributor]
    post:
      summary: Create a new customer
  /api/customers/{customerId}:
    get:
      summary: Get customer details
    put:
      summary: Update customer details
  /api/customers/{customerId}/customerSegment:
    put:
      summary: Change customer segment
      description: Updates the customer's segment, which affects pricing and available products
```

### Subscription API

```yaml
openapi: 3.0.0
paths:
  /api/subscriptions:
    get:
      summary: List subscriptions
    post:
      summary: Create a new subscription
  /api/subscriptions/{subscriptionId}:
    get:
      summary: Get subscription details
    put:
      summary: Update subscription details
  /api/subscriptions/{subscriptionId}/pause:
    put:
      summary: Pause a subscription
      description: Temporarily stops deliveries without cancelling the subscription
  /api/subscriptions/{subscriptionId}/resume:
    put:
      summary: Resume a paused subscription
  /api/subscriptions/{subscriptionId}/cancel:
    put:
      summary: Cancel a subscription
```

## Conclusion

Aligning API design with the ubiquitous language creates a seamless experience for developers and ensures that domain concepts are consistently represented across all system interfaces. By following the guidelines in this document, teams can create APIs that naturally express the domain model and facilitate clear communication between technical and business stakeholders.

---
*This document should be reviewed and updated as the domain model and APIs evolve. Last updated: 2025-06-04*

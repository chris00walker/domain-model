# API Design Guidelines

## Table of Contents

- [RESTful API Design](#restful-api-design)
- [Resource Naming](#resource-naming)
- [HTTP Methods](#http-methods)
- [Field Naming Conventions](#field-naming-conventions)
- [API Versioning and Evolution](#api-versioning-and-evolution)
- [Validation Messages](#validation-messages)
- [Documentation Standards](#documentation-standards)

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
- Use lowercase letters in URLs
- Avoid file extensions in URLs

### Examples

    GET    /products                 # List all products
    POST   /products                 # Create a new product
    GET    /products/{id}            # Get a specific product
    PUT    /products/{id}            # Update a product
    DELETE /products/{id}            # Delete a product
    GET    /products/{id}/reviews    # Get reviews for a product

## HTTP Methods

### Standard Methods

- `GET`: Retrieve a resource or collection
- `POST`: Create a new resource
- `PUT`: Update an existing resource (full update)
- `PATCH`: Partially update a resource
- `DELETE`: Remove a resource

### Resource Naming Examples

| Entity | Collection Endpoint | Item Endpoint |
|--------|---------------------|---------------|
| Product | `/products` | `/products/{productId}` |
| CustomerOrder | `/orders` | `/orders/{orderId}` |
| Subscription | `/subscriptions` | `/subscriptions/{subscriptionId}` |
| AuthenticationCertificate | `/authentication-certificates` | `/authentication-certificates/{certificateId}` |

## Field Naming Conventions

- Use `camelCase` for field names in JSON payloads
- Be consistent with domain terminology
- Avoid abbreviations unless widely understood
- Use boolean fields with `is`, `has`, or `can` prefixes

## Standard HTTP Methods

    GET    /products                 # List all products
    POST   /products                 # Create a new product
    GET    /products/{id}            # Get a specific product
    PUT    /products/{id}            # Update a product
    DELETE /products/{id}            # Delete a product
    GET    /products/{id}/reviews    # Get reviews for a product

## Common Patterns

    {
      "id": "prod-12345",
      "name": "Organic Bananas",
      "price": {
        "amount": 1.99,
        "currency": "USD"
      },
      "isPerishable": true
    }

## Domain-Aligned DTOs

Data Transfer Objects should directly reflect domain entities and value objects:

    // Product DTO reflecting Product entity
    {
      "productId": "EFI-IT-123456",
      "productName": "Aged Balsamic Vinegar",
      "productCategory": "VINEGAR",
      "countryOfOrigin": "IT",
      "regionOfOrigin": "Modena",
      "price": {
        "amount": 24.99,
        "currency": "USD"
      },
      "authenticationType": "BLOCKCHAIN",
      "productAttributes": [
        {
          "name": "agingDuration",
          "value": "12",
          "unit": "YEARS"
        }
      ]
    }

## Validation Messages

API validation messages must use ubiquitous language terminology and be meaningful in domain terms:

### Good validation message

    {
      "errors": [
        {
          "code": "invalid-product-code",
          "message": "Product code EFI-XX-123456 has invalid country code XX. Valid country codes are: IT, FR, ES, GR, MX, JP, IN, TH, VN, MA",
          "field": "productCode"
        }
      ]
    }

### Poor validation message

    {
      "error": "400",
      "message": "Invalid input",
      "field": "prod_code"
    }

## Domain Events in APIs

When exposing domain events via APIs (such as webhooks or event streaming endpoints):

1. Use the exact event names from the domain model
2. Include all relevant domain data in the event payload
3. Maintain the same event structure defined in the domain model

### Example domain event representation

    {
      "eventType": "ProductAuthenticated",
      "eventId": "evt_123456",
      "occurredAt": "2025-06-06T14:22:10Z",
      "data": {
        "productId": "EFI-IT-123456",
        "authenticationType": "BLOCKCHAIN",
        "authenticationResult": "AUTHENTIC",
        "authenticatedAt": "2025-06-06T14:22:05Z",
        "authenticatedBy": "auth_service_blockchain",
        "provenanceLink": "https://provenance.eliasfoodimports.com/EFI-IT-123456",
        "certificateId": "cert_789012"
      },
      "metadata": {
        "version": "1.0",
        "boundedContext": "Catalog-Authentication"
      }
    }

## API Versioning and Evolution

API versioning strategy must support the evolution of the domain model while maintaining backward compatibility:

1. **Major Version Changes**: When domain concepts fundamentally change
   - Example: `/v2/orders` when the Order aggregate changes significantly
2. **Minor Version Changes**: When adding new fields or optional capabilities
   - Use HTTP headers: `Accept: application/json; version=1.2`
3. **Deprecation Process**:
   - Document when domain concepts are deprecated
   - Provide migration paths to new domain concepts
   - Set clear timelines aligned with domain model evolution

## Context Mapping in APIs

APIs should respect bounded context boundaries, with clear context mapping strategies:

1. **Separate API groups by bounded context**:
   - `/catalog-api/products`
   - `/ordering-api/orders`
   - `/authentication-api/certificates`
2. **Context translation at API boundaries**:
   - Different bounded contexts may use similar terms with different meanings
   - API documentation should clarify these differences
   - Consider using different field names when necessary to avoid confusion
3. **Anticorruption Layer patterns**:
   - When exposing legacy systems that don't align with the current domain model
   - Translate between legacy terms and current ubiquitous language

## Documentation Standards

API documentation must reflect the ubiquitous language and provide domain context:

1. **Domain Concept References**:
   - Link each API resource to relevant domain concepts
   - Explain business rules and constraints using domain terminology
2. **Example Business Scenarios**:
   - Provide example API flows that reflect real business processes
   - Use realistic domain data in examples
3. **Glossary Integration**:
   - Link unfamiliar domain terms to the ubiquitous language glossary
   - Maintain consistency with the latest glossary version

### Example documentation snippet

## Product Authentication API

This API enables verification of Product authenticity using our established Authentication mechanisms. The Authentication process aligns with our [Product Authentication Domain](../../domain-knowledge/bounded-contexts/product-catalog/README.md) and follows the rules specified for our Authentication process.

### Authentication Methods

- **Blockchain Authentication**: Verification using distributed ledger records
- **NFC Tag Authentication**: Physical tag verification using NFC technology
- **Certificate Verification**: Manual certificate lookup and verification

See the [Authentication Types](../glossary.md#authentication) section in the Domain Glossary for detailed descriptions.

## Implementation Examples

### Example 1: Order API Reflecting Order Domain Concepts

    // Order Controller aligning with Order domain
    @Controller('orders')
    export class OrderController {
      @Post()
      createOrder(@Body() createOrderDto: CreateOrderDto): Promise<OrderDto> {
        // Maps to PlaceOrder command in the domain
      }
      @Patch(':orderId/status')
      updateOrderStatus(
        @Param('orderId') orderId: string,
        @Body() updateStatusDto: UpdateStatusDto
      ): Promise<OrderDto> {
        // Implementation
      }
      @Post(':orderId/fulfillment')
      requestFulfillment(
        @Param('orderId') orderId: string
      ): Promise<FulfillmentDto> {
        // Maps to RequestOrderFulfillment command in the domain
      }
    }
    // DTO reflecting Order domain entity
    export class OrderDto {
      orderId: string;
      orderStatus: OrderStatus; // Uses exact enum from domain model
      customerInfo: CustomerInfoDto;
      orderLines: OrderLineDto[];
      shippingAddress: AddressDto;
      paymentStatus: PaymentStatus; // Uses exact enum from domain model
      totalAmount: MoneyDto; // Uses Money value object structure
      placedAt: Date;
      lastModified: Date;
    }

### Example 2: Product Authentication API

    @Controller('products')
    export class ProductAuthenticationController {
      @Post(':productId/authentication')
      authenticateProduct(
        @Param('productId') productId: string,
        @Body() authenticationRequest: AuthenticationRequestDto
      ): Promise<AuthenticationResultDto> {
        // Maps to AuthenticateProduct command in the domain
      }
      @Get(':productId/provenance')
      getProductProvenance(
        @Param('productId') productId: string
      ): Promise<ProvenanceRecordDto> {
        // Maps to RetrieveProvenance query in the domain
      }
    }
    // DTO reflecting Authentication domain concepts
    export class AuthenticationRequestDto {
      authenticationType: AuthenticationType; // Exact enum from domain
      authenticationToken: string;
      scanLocation?: GeoLocationDto;
      scannedBy?: string;
    }
    export class AuthenticationResultDto {
      status: AuthenticationStatus; // Exact enum from domain
      authenticatedAt: Date;
      certificateId?: string;
      provenanceLink?: string;
      verificationSteps: VerificationStepDto[];
    }

## API Review Checklist

When reviewing APIs for ubiquitous language consistency:

1. ☐ Do all resource names match domain entities or aggregates?
2. ☐ Do all field names match their domain model counterparts?
3. ☐ Do operation names reflect domain operations?
4. ☐ Are validation messages using domain terminology?
5. ☐ Is the API respecting bounded context boundaries?
6. ☐ Do response DTOs accurately reflect domain objects?
7. ☐ Is domain-specific documentation provided?
8. ☐ Does the API versioning strategy align with domain evolution?
9. ☐ Are complex domain operations represented appropriately?
10. ☐ Do error messages reflect domain exceptions?

## Governance

The API Review Board, working with the Domain Language Stewards, will:

1. Review all new APIs for ubiquitous language compliance
2. Maintain API design standards aligned with domain model
3. Resolve terminology conflicts between APIs and domain model
4. Ensure APIs evolve in sync with the domain model

## References

- [Domain Event Catalog](../../domain-knowledge/integrations/events.md)
- [Ubiquitous Language Guidelines](../guides/ubiquitous_language_guidelines.md)
- [API Design Guidelines](../../guidelines/api-design-guidelines.md)
- [Bounded Context Map](../../domain-knowledge/integrations/context-map.md)

*This guide ensures that our APIs serve as a faithful representation of our domain model, using consistent terminology that bridges technical implementation and business concepts.*

---

⚑ Related

- [Domain Glossary](../glossary.md)

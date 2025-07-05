          ---
title: "Ubiquitous Language in API Design"
version: "2.0"
last_updated: "2025-06-06"
status: "Final"
---
##
title: "Ubiquitous Language in API Design"
version: "1.0"
last_updated: "2025-06-06"
## status: "Draft"
status: "Draft"
title: Ubiquitous Language in API Design
version: "1.0"
status: active
owner: API Design Team
last_updated: 2025-06-06
# Ubiquitous Language in API Design
## Overview
This document provides guidelines for applying the ubiquitous language in API design across the Elias Food Imports system. It ensures that all APIs reflect the core domain terminology and concepts consistently.
This guide outlines how to consistently apply the Elias Food Imports ubiquitous language in API design, ensuring that our external interfaces reflect our domain model accurately.
## Core Principles
1. **Domain Reflection**: APIs should directly reflect domain concepts, aggregates, and operations
2. **Terminology Consistency**: Use the exact terms from the ubiquitous language glossary
3. **Intent Revelation**: API designs should reveal domain intent, not technical implementation
4. **Bounded Context Boundaries**: Respect bounded context boundaries in API organization
5. **Domain Evolution Support**: API versioning strategy must support domain model evolution
## API Naming Guidelines
### Resource Naming
Use domain entities and aggregates as API resources:
| Domain Concept | API Resource | Example Endpoint |
|----------------|--------------|-----------------|
| Product | `/products` | `/products/{productId}` |
| CustomerOrder | `/orders` | `/orders/{orderId}` |
| Subscription | `/subscriptions` | `/subscriptions/{subscriptionId}` |
| AuthenticationCertificate | `/Authentication-certificates` | `/Authentication-certificates/{certificateId}` |
**Good Resource Names**:
- `/Catalog-items` (maps to CatalogItem entity)
- `/price-calculations` (maps to PriceCalculation domain service operation)
- `/provenance-records` (maps to ProvenanceRecord entity)
**Poor Resource Names**:
- `/get-items` (verb-based, not noun-based)
- `/item-data` (generic, not specific to domain concept)
- `/Product-info` (inconsistent with Product entity name)
### Field Naming
Field names in requests and responses must use the exact terminology from the ubiquitous language:
| Domain Term | API Field | Not Acceptable |
|-------------|-----------|----------------|
| productCode | productCode | itemCode, prodCode |
| quantityInStock | quantityInStock | qtyAvailable, stock |
| countryOfOrigin | countryOfOrigin | originCountry, country |
| authenticatedAt | authenticatedAt | authDate, verifiedAt |
| subscriptionStatus | subscriptionStatus | subStatus, status |
### Operation Naming
RESTful operations should reflect domain operations and use standardized HTTP methods:
| Domain Operation | HTTP Method + Path | Example |
|------------------|-------------------|---------|
| Place Order | POST /orders | Create a new Order |
| Cancel Order | PATCH /orders/{id} | Update Order status to canceled |
| Authenticate Product | POST /products/{id}/Authentication | Perform Authentication operation |
| Calculate Price | POST /price-calculations | Calculate price for a given context |
For complex domain operations that don't fit RESTful CRUD, use domain-aligned action resources:
- POST `/orders/{orderId}/fulfillment`
- POST `/products/{productId}/Authentication-verification`
- POST `/subscriptions/{subscriptionId}/pause`
## Request/Response Patterns
### Domain-Aligned DTOs
Data Transfer Objects should directly reflect domain entities and value objects:
```json
// Product DTO reflecting Product entity
{
  "productId": "EFI-IT-123456",
  "productName": "Aged Balsamic Vinegar",
  "productCategory": "VINEGAR",
  "countryOfOrigin": "IT",
  "regionOfOrigin": "Modena",
  "price": {
```
"amount": 24.99,
"currency": "USD"
```
  },
  "authenticationType": "BLOCKCHAIN",
  "productAttributes": [
```
{
```
      "name": "agingDuration",
      "value": "12",
      "unit": "YEARS"
```
}
```
  ]
}
```
### Validation Messages
API validation messages must use ubiquitous language terminology and be meaningful in domain terms:
**Good validation message**:
```json
{
  "error": "INVALID*PRODUCT*CODE",
  "message": "Product code EFI-XX-123456 has invalid country code XX. Valid country codes are: IT, FR, ES, GR, MX, JP, IN, TH, VN, MA",
  "field": "productCode"
}
```
**Poor validation message**:
```json
{
  "error": "400",
  "message": "Invalid input",
  "field": "prod_code"
}
```
### Domain Events in APIs
When exposing domain events via APIs (such as webhooks or event streaming endpoints):
1. Use the exact event names from the domain model
2. Include all relevant domain data in the event payload
3. Maintain the same event structure defined in the domain model
Example domain event representation:
```json
{
  "eventType": "ProductAuthenticated",
  "eventId": "evt_123456",
  "occurredAt": "2025-06-06T14:22:10Z",
  "data": {
```
"productId": "EFI-IT-123456",
"authenticationType": "BLOCKCHAIN",
"authenticationResult": "AUTHENTIC",
"authenticatedAt": "2025-06-06T14:22:05Z",
"authenticatedBy": "auth*service*blockchain",
"provenanceLink": "https://provenance.eliasfoodimports.com/EFI-IT-123456",
"certificateId": "cert_789012"
```
  },
  "metadata": {
```
"version": "1.0",
"boundedContext": "Catalog-Authentication"
```
  }
}
```
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
   - `/Catalog-api/products`
   - `/ordering-api/orders`
   - `/Authentication-api/certificates`
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
Example documentation snippet:
```markdown
## Product Authentication API
This API enables verification of Product authenticity using our established
Authentication mechanisms. The Authentication process aligns with our
[Product Authentication Domain](../../domain-knowledge/bounded-contexts/product-catalog/README.md)
and follows the rules specified for our Authentication process.
### Authentication Methods
- **Blockchain Authentication**: Verification using distributed ledger records
- **NFC Tag Authentication**: Physical tag verification using NFC technology
- **Certificate Verification**: Manual certificate lookup and verification
See the [Authentication Types](../glossary.md#authentication) section in the Domain Glossary for detailed descriptions.
```
## Implementation Examples
### Example 1: Order API Reflecting Order Domain Concepts
```typescript
// Order Controller aligning with Order domain
@Controller('orders')
export class OrderController {
  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto): Promise<OrderDto> {
```
// Maps to PlaceOrder command in the domain
```
  }
  @Patch(':orderId/status')
  updateOrderStatus(
```
@Param('orderId') orderId: string,
@Body() updateStatusDto: UpdateOrderStatusDto
```
  ): Promise<OrderDto> {
```
// Maps to ChangeOrderStatus command in the domain
```
  }
  @Post(':orderId/fulfillment')
  requestFulfillment(
```
@Param('orderId') orderId: string
```
  ): Promise<FulfillmentDto> {
```
// Maps to RequestOrderFulfillment command in the domain
```
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
```
### Example 2: Product Authentication API
```typescript
@Controller('products')
export class ProductAuthenticationController {
  @Post(':productId/Authentication')
  authenticateProduct(
```
@Param('productId') productId: string,
@Body() authenticationRequest: AuthenticationRequestDto
```
  ): Promise<AuthenticationResultDto> {
```
// Maps to AuthenticateProduct command in the domain
```
  }
  @Get(':productId/provenance')
  getProductProvenance(
```
@Param('productId') productId: string
```
  ): Promise<ProvenanceRecordDto> {
```
// Maps to RetrieveProvenance query in the domain
```
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
```
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
- [Ubiquitous Language Evolution Process](./ubiquitous_language_evolution.md)

↩ [Back to Framework TOC](../README.md)

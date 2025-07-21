# ADR-015: Integration Layer & Anti-Corruption Strategy

## Status

Proposed (2025-07-11)

## Context

EFI’s modular monolith exposes multiple domain APIs internally and consumes external vendor APIs. To prevent leakage of third-party semantics into our domain model and to offer cohesive contract surfaces to front-end and partner applications, we need a clear Integration Layer strategy covering:

• Public API exposure (REST/GraphQL)  
• Internal BFFs for web / mobile  
• Anti-Corruption Layers (ACLs) towards legacy systems & SaaS  
• Cross-context API gateway, security, observability and versioning

## Decision

Adopt a **three-tier Integration Layer**:

1. **Edge API Gateway (Kong / Envoy)**  
   • TLS termination, rate-limiting, auth enforcement (JWT, OAuth)  
   • Canary routing and blue/green support  
   • OpenAPI spec registry & automated docs

2. **Backend-for-Frontend (BFF) Services**  
   • One per client type (web storefront, mobile app, partner portal)  
   • Aggregate calls across bounded-context ports; handle view model shaping  
   • Stateless; scaled independently

3. **Anti-Corruption Layer (ACL) Adapters**  
   • Each external/legacy system wrapped by an adapter implementing a domain port interface  
   • Data mapping & transformation isolated inside adapter  
   • Circuit-breaker & retry logic per ADR-005 Saga guidelines

### Supporting Practices

• **Versioning** – SemVer on all public endpoints; additive changes only in minor versions.  
• **Documentation** – OpenAPI / AsyncAPI generated from code, published to developer portal.  
• **Observability** – Structured logs, metrics, distributed traces per ADR-010.  
• **Security** – Mutual TLS internal, OAuth2 external, secrets via Vault (ADR-009).  
• **Testing** – Contract tests with consumer-driven mocks; performance tests in CI.

## Consequences

+ Consistent, secure, observable entry & exit points.  
+ Decouples domain model from vendor churn.  
+ Enables progressive extraction to micro-services if needed.  
− Additional deployment artefacts (gateway, BFFs) to maintain.

## Alternatives Considered

• Direct client access to domain modules – rejected due to coupling/security.  
• Monolithic gateway inside application – limits scalability and policy control.

## Related

+ ADR-007: Hexagonal Modular Monolith  
+ ADR-008: Event-Driven Communication (for async integration)  
+ ADR-011: Multi-Layered Caching (edge & BFF caching)  
+ ADR-014: External Integrations Strategy  

## Related Governance

+ API Design Guidelines: docs/guidelines/api-design-guidelines.md  

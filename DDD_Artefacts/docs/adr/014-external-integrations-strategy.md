# ADR-014: External Integrations Strategy

## Status
Proposed (2025-07-11)

## Context
Elias Food Imports (EFI) depends on third-party SaaS platforms (Stripe, HubSpot, Tableau, Odoo ERP, Google APIs, carrier systems, etc.) to deliver business value. Previous documentation attempted to describe these systems as PRDs, but they are not bounded contexts we own. We need a clear, uniform strategy that governs why and how we integrate, contract management, SLAs, exit criteria, and compliance obligations.

## Decision
Adopt a consolidated **External Integrations Strategy** with the following pillars:

1. **Integration Catalogue**
   • Maintain a central YAML catalogue (`integrations/catalog.yml`) listing each vendor, purpose, criticality, data exchanged, auth method, SLA, and exit criteria.

2. **Contract-First Approach**
   • Store OpenAPI / AsyncAPI specs under `integrations/<vendor>/` and treat them as version-controlled contracts.
   • Break changes require version bump + migration plan.

3. **Abstraction & Adapter Layer**
   • Each vendor API consumed via an adapter exposing a **domain-language port** (hexagonal architecture per ADR-007).
   • Allows vendor swap with minimal core impact.

4. **SLAs & Monitoring**
   • Vendor SLA targets and alert thresholds captured in the catalogue.
   • Integrate with Observability stack (ADR-010) for uptime & latency dashboards.

5. **Security & Compliance**
   • OAuth 2.0 / API keys stored in HashiCorp Vault.
   • Data protection aligned with ADR-009 (PCI/PII scope).

6. **Exit Strategy**
   • Each integration entry must define an exit path (alternate vendor, build-in-house) and data repatriation steps.

## Consequences
+ Reduces duplication and ad-hoc integration decisions.
+ Provides clear impact analysis when vendors change terms or pricing.
+ Improves audit readiness (PCI DSS, GDPR).
− Requires governance effort to keep catalogue up to date.

## Alternatives Considered
• Continue documenting integrations piecemeal in PRDs – rejected for lack of clarity.
• Build all capabilities in-house – impractical.

## Related
- ADR-007: Hexagonal Modular Monolith Architecture
- ADR-009: Data Protection Strategy
- ADR-010: Observability & Monitoring Strategy
- integrations/catalog.yml (to be created)

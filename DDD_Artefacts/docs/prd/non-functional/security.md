# Security Requirements

## Data Encryption

- Encrypt data at rest with **AES-256** and in transit with **TLS 1.2+**.
- Keys managed in **HashiCorp Vault**; rotate quarterly.

## Vulnerability Management

- Weekly dependency scans (Snyk) with SLA: High-severity issues fixed ≤ 7 days.
- Quarterly penetration tests; critical findings patched ≤ 14 days.

## Compliance & Privacy

- GDPR and PCI-DSS scope; maintain RoPA and DPA artefacts.
- PII fields encrypted and masked in logs (see `pii_encryption_required: true`).

---

See also:

- [ADR-009: Data Protection Strategy](../../adr/009-data-protection-strategy.md)
- [ADR-010: Observability & Monitoring](../../adr/010-observability-monitoring-strategy.md)

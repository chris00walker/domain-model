# [Bounded Context Name]

[RELATED: ADR-XXX]
[CONTEXT: Core/Strategic/Supporting/Integration/External]
[STATUS: Draft/Review/Approved/Deprecated]
[VERSION: 1.0.0]
[OWNER: @team-or-username]

## 1. Business Context

- **Purpose**: [Why this context exists]
- **Business Capabilities**: [What business capabilities it enables]
- **Success Metrics**: [How we measure success]
- **Domain Experts**: [Key stakeholders/experts]

## 2. Domain Model

- **Key Entities**: [List main domain objects]
- **Aggregates**: [Key aggregates and their boundaries]
- **Value Objects**: [Key value objects]
- **Domain Services**: [Key domain services]
- **Domain Events**: [Key events published/consumed]

## 3. Functional Requirements

### 3.1 [Feature Area]

- **FR-1**: [As a [role], I want [feature] so that [benefit]]
  - **Acceptance Criteria**:
    - [ ] [Testable condition]
    - [ ] [Testable condition]
  - **Dependencies**: [Links to other PRDs/ADRs]

### 3.2 Business Rules

- List the domain-specific rules and invariants this context owns (e.g., temperature window, credit-limit checks).
- Avoid duplicating organisation-wide policies; instead link to the relevant rule file in `docs/rules/`.

## 4. Integration Points

### 4.1 Published Events

- `EventName`: [Description]
  - Payload: [Key fields]
  - Consumers: [List of consuming contexts]

### 4.2 Consumed Events

- `EventName`: [Description]
  - Source: [Publishing context]
  - Action: [What this context does when received]

### 4.3 APIs/Services

- **REST/GraphQL**: [Endpoint documentation]
- **gRPC**: [Service definitions]
- **External Services**: [Third-party integrations]

## 5. Non-Functional Requirements

- **Performance**: [SLAs, throughput, response times]
- **Scalability**: [Expected load, growth projections]
- **Security**: [Auth, data protection, compliance]
- **Reliability**: [Uptime, error rates]
- **Maintainability**: [Code quality, documentation standards]

## 6. Open Questions

- [ ] [Unresolved question with context]

## 7. Out of Scope

- [What's explicitly not included]

## 8. References

- [Links to related ADRs, technical specs, research]

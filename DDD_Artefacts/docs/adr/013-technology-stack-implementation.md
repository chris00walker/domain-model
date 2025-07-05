---
version: '1.0.0'
status: 'proposed'
last_updated: '2025-07-04'
owner: 'Core Architecture Team'
---

# ADR-013: Technology Stack Implementation

## Status

Proposed (2025-07-04)

## Version History

- 1.0.0 (2025-07-04): Initial version

## Context

As we begin implementation of the Elias Food Imports platform, we need to make concrete technology choices that align with our architectural principles while ensuring developer productivity and system maintainability. This ADR documents our technology stack decisions for the initial implementation, with a focus on leveraging the MERN (MongoDB, Express, React, Node.js) stack and its modern variants.

## Decision

### 1. Application Framework

- **Backend Framework**: NestJS (built on Express.js)
- **HTTP Server**: Express.js (default in NestJS)
- **Frontend Framework**: Next.js (React framework)
- **Runtime**: Node.js (LTS version)
- **Rationale**:
  - NestJS provides a robust, modular architecture that aligns with our hexagonal architecture
  - Express.js offers battle-tested HTTP server capabilities that NestJS leverages
  - Next.js offers server-side rendering and API routes out of the box
  - Both frameworks have strong TypeScript support
  - Large ecosystem and community support
- **Implementation**:
  - Backend services built with NestJS modules
  - Frontend applications using Next.js with React 18+
  - Shared TypeScript types between frontend and backend
  - API-first development approach with OpenAPI/Swagger documentation

### 2. Primary Database

- **Technology**: MongoDB (via Mongoose) with optional PostgreSQL adapter
- **Rationale**:
  - MongoDB aligns with our MERN stack preference and allows for schema flexibility during rapid iteration
  - Optional PostgreSQL support provides a migration path for relational data needs
  - Mongoose provides schema validation and business logic hooks
- **Implementation**:
  - Repository interfaces will be database-agnostic
  - Two implementations: `MongoOrderRepo` and `PgOrderRepo`
  - Default to MongoDB for initial development
  - Database migrations using Mongoose or TypeORM for PostgreSQL

### 3. Containerization

- **Technology**: Docker
- **Rationale**:
  - Ensures consistent development and deployment environments
  - Simplifies onboarding of new developers
  - Enables reproducible builds
  - Facilitates scaling in production
- **Implementation**:
  - Multi-stage `Dockerfile` for the NestJS application
  - `docker-compose.yml` for local development with MongoDB and Redis
  - Documentation for common Docker workflows
  - Production-optimized images

### 4. API Style

- **Primary**: REST
- **Secondary**: GraphQL (optional module)
- **Rationale**:
  - REST provides a simple, well-understood interface for core operations
  - GraphQL module can be enabled for complex data fetching requirements
  - Next.js API routes for frontend-specific endpoints
- **Implementation**:
  - REST endpoints as default using NestJS controllers
  - GraphQL module in `src/api/graphql/` (disabled by default)
  - Next.js API routes in `pages/api/` for frontend-specific needs
  - OpenAPI/Swagger documentation
  - Clear documentation for enabling and using GraphQL

### 5. CI/CD Pipeline

- **Technology**: GitHub Actions
- **Rationale**:
  - Tight integration with our GitHub repository
  - Sufficient for our current scale and team size
  - Good community support and documentation
  - Native support for container workflows
- **Implementation**:
  - Workflow for linting, testing, and building
  - Integration with Windsurf's `/run-domain-tests` workflow
  - Automated deployment to staging environment
  - Security scanning and dependency updates
  - Deployment to production with manual approval

### 6. Frontend Implementation

#### 6.1 Framework

- **Technology**: Next.js 14+ (React 18+)
- **Rationale**:
  - Server-side rendering for improved SEO and performance
  - Built-in API routes and dynamic routing
  - Image optimization and code splitting
- **Key Features**:
  - SSR & SSG for optimal performance
  - Built-in image optimization
  - File-system based routing
  - API routes for backend integration

#### 6.2 State Management

- **Primary**: Redux Toolkit 2.x
- **Key Features**:
  - Centralized store for global state (cart, user session, UI state)
  - Immutable updates with `createSlice` and Immer
  - RTK Query for data fetching and caching
  - DevTools integration for debugging
- **Implementation**:
  - Store slices for each domain (e.g., `cartSlice`, `authSlice`)
  - RTK Query for API interactions
  - Selectors for efficient data access

#### 6.3 Styling & UI Components

- **CSS Framework**: Tailwind CSS 4.x
- **Component Library**: shadcn/ui
- **Rationale**:
  - Utility-first approach for rapid development
  - Small bundle size through PurgeCSS
  - Accessible, customizable components
- **Implementation**:
  - Theme configuration for brand colors and typography
  - Component variants for consistent styling
  - Dark mode support

#### 6.4 Progressive Web App (PWA)

- **Technology**: next-pwa + Firebase Cloud Messaging
- **Features**:
  - Offline functionality with service workers
  - Installable on devices
  - Push notifications for order updates
  - Background sync for offline actions
- **Implementation**:
  - Service worker configuration for asset caching
  - Background sync for failed requests
  - Web push notifications via FCM

#### 6.5 Accessibility

- **Tools**: axe-core, react-axe
- **Standards**: WCAG 2.1 AA compliance
- **Implementation**:
  - Automated accessibility testing in CI
  - Screen reader testing with NVDA and VoiceOver
  - Keyboard navigation testing
  - Color contrast verification

#### 6.6 Internationalization

- **Library**: i18next (react-i18next 13.x)
- **Features**:
  - Multi-language support with JSON translation files
  - Server-side rendering compatible
  - Dynamic language switching
  - Fallback to English
- **Implementation**:
  - Translation files per locale (e.g., `en.json`, `es.json`)
  - Language detection from browser settings
  - RTL language support

#### 6.7 Performance Targets

- **First Contentful Paint**: <1.8s
- **Time to Interactive**: <3.5s
- **Bundle Size**: <160KB (gzipped JS)
- **Lighthouse Score**: >90 (Performance)
- **Image Optimization**: WebP format with fallbacks
  
#### 6.8 Developer Experience

- **Hot Module Replacement**: For faster development
- **Storybook**: For component development and testing
- **TypeScript**: Strict mode for type safety
- **ESLint/Prettier**: Code quality and formatting
- **Husky**: Git hooks for pre-commit checks

### 7. Repository Strategy

- **Approach**: Monorepo
- **Rationale**:
  - Simplifies dependency management
  - Ensures version consistency across services
  - Keeps Windsurf artifacts and workflows centralized
  - Enables code sharing between frontend and backend
- **Implementation**:
  - Structure:
    ```
    /
    ├── apps/
    │   ├── admin/         # Admin dashboard (Next.js)
    │   └── web/           # Customer-facing website (Next.js)
    ├── packages/
    │   ├── api/           # Shared API types and clients
    │   ├── config/        # Shared configuration
    │   ├── db/            # Database models and migrations
    │   └── ui/            # Shared UI components
    └── services/          # Backend services (NestJS)
    ```
  - Workspace configuration for package management
  - Clear documentation for adding new packages
  - Shared ESLint, Prettier, and TypeScript configs

## 5. Messaging & Event Bus

### 5.1 Message Broker
- **RabbitMQ 3.11.x** (clustered)
  - **Use Cases**:
    - Order events (`order.created`, `order.paid`, `order.shipped`)
    - Email queue for async processing
    - Inventory updates
  - **Deployment**: Kubernetes with HA configuration
  - **Security**: TLS mutual authentication, credential rotation

### 5.2 Search & Analytics
- **Elasticsearch 8.x**
  - Full-text product search
  - Faceted filtering
  - Real-time analytics
  - **Deployment**: 3 master nodes + 2 data nodes

## 6. Security Infrastructure

### 6.1 Authentication & Authorization
- **JWT (RS256)** with 1-hour expiry
- **OAuth 2.0** via Auth0 for social login/SSO
- **Refresh tokens** with rotation
- **Role-based access control**

### 6.2 Data Protection
- **Encryption**:
  - TLS 1.3 enforced
  - AES-256 for data at rest
  - Secrets management with HashiCorp Vault
- **Web Application Firewall**:
  - Cloudflare WAF with OWASP rules
  - Rate limiting for sensitive endpoints

## 7. Observability Stack

### 7.1 Logging & Metrics
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
  - Centralized logging
  - 30-day hot storage, 1-year warm storage
- **Prometheus + Grafana**
  - System and application metrics
  - Custom dashboards
  - Alerting via PagerDuty

### 7.2 Application Performance
- **New Relic APM**
  - End-to-end tracing
  - Performance monitoring
  - Business KPI tracking

## 8. Testing Framework

### 8.1 Testing Strategy
- **Unit Testing**: Jest (90%+ coverage)
- **Integration**: Postman/Newman
- **E2E**: Cypress
- **Performance**: JMeter (10k concurrent users)
- **Security**: OWASP ZAP

### 8.2 Test Automation
- CI/CD integration
- Automated regression testing
- Performance benchmarking
- Security scanning in pipeline

## 9. Infrastructure & Deployment

### 9.1 CI/CD Pipeline
- **GitHub Actions**
  - Multi-stage pipeline
  - Automated testing and deployment
  - Manual approval for production

### 9.2 Container Orchestration
- **Kubernetes**
  - Self-healing deployments
  - Horizontal pod autoscaling
  - Namespace isolation

### 9.3 Caching Strategy
- **Redis 7.x**
  - Session storage
  - API response caching
  - Rate limiting
- **CDN**: Cloudflare
  - Global edge caching
  - DDoS protection

## 10. Implementation Impact

### Benefits
- **Comprehensive Solution**: End-to-end technology coverage
- **Enterprise-Grade Security**: Multiple layers of protection
- **High Performance**: Optimized at every layer
- **Scalability**: Designed for growth
- **Developer Productivity**: Streamlined workflows
- **Observability**: Full-stack monitoring

### Trade-offs
- **Operational Complexity**: More components to manage
- **Learning Curve**: Broad technology surface area
- **Resource Requirements**: Higher infrastructure needs
- **Integration Effort**: More moving parts to connect
- **Maintenance Overhead**: Regular updates and monitoring required

## Related ADRs

- [ADR-007: Hexagonal Modular Monolith Architecture](../adr/007-hexagonal-modular-monolith.md)
- [ADR-008: Event-Driven Communication](../adr/008-event-driven-communication.md)
- [ADR-012: CI/CD Pipeline Strategy](../adr/012-cicd-pipeline-strategy.md)

## Change Log

| Version | Date       | Description                             | Author                 |
| ------- | ---------- | --------------------------------------- | ---------------------- |
| 1.0.0   | 2025-07-04 | Initial version with MERN stack details | Core Architecture Team |

## Approval

| Role          | Name | Date | Comments |
| ------------- | ---- | ---- | -------- |
| Architect     |      |      |          |
| Tech Lead     |      |      |          |
| Product Owner |      |      |          |

> _"Commit to the LORD whatever you do, and He will establish your plans."_ — Proverbs 16:3

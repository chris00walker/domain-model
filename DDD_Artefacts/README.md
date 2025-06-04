# Elias Food Imports - Domain-Driven Design Implementation

This repository contains the Domain-Driven Design (DDD) artifacts for the Elias Food Imports (EFI) e-commerce platform. The implementation follows DDD principles and patterns to model the complex domain of specialty food importation, inventory management, order fulfillment, and subscription services.

## Project Structure

```
DDD_Artefacts/
├── src/                      # Source code (organized by bounded contexts)
│   ├── app/                   # Application layer services
│   ├── catalog/               # Catalog bounded context
│   │   ├── domain/             # Domain models, entities, value objects
│   │   └── tests/              # Unit tests for catalog context
│   │
│   ├── customers/             # Customer management bounded context
│   │   ├── domain/             # Customer domain models
│   │   └── tests/              # Unit tests for customer context
│   │
│   ├── domain/                # Shared domain layer components
│   │   ├── events/             # Domain events
│   │   └── value-objects/      # Reusable value objects
│   │
│   ├── infra/                 # Infrastructure layer
│   │   └── persistence/        # Data access implementations
│   │
│   ├── ordering/              # Order management bounded context
│   │   ├── domain/             # Order domain models
│   │   └── tests/              # Unit tests for ordering context
│   │
│   ├── pricing/               # Pricing and promotions bounded context
│   │   ├── domain/             # Pricing domain models
│   │   └── tests/              # Unit tests for pricing logic
│   │
│   ├── shared/                # Shared utilities and cross-cutting concerns
│   │   ├── domain/             # Shared domain components
│   │   └── tests/              # Tests for shared components
│   │
│   └── subscriptions/         # Subscription management bounded context
│       ├── domain/             # Subscription domain models
│       └── tests/              # Unit tests for subscription context
│
├── docs/                     # Documentation
│   ├── diagrams/              # System diagrams
│   ├── 2-EFI-Software-Architecture.md  # Comprehensive architecture document
│   ├── cqrs-proposal.md      # CQRS architecture proposal
│   └── glossary.md           # Ubiquitous language definitions
│
└── tests/                    # Test suite
    ├── integration/         # Integration tests across bounded contexts
    └── invariant/            # Domain invariant tests
        └── Order.spec.ts     # Order aggregate invariant tests
```

## Bounded Contexts

The project implements the following key bounded contexts:

1. **Catalog**: Product catalog management including items, categories, and inventory.
2. **Customers**: Customer profiles, preferences, and account management.
3. **Ordering**: Order processing, validation, and fulfillment workflow.
4. **Pricing**: Price calculations, promotions, and discounts logic.
5. **Subscriptions**: Recurring order management and subscription services.

## Development Guidelines

- Path aliases are configured in tsconfig.json to simplify imports
- The `update-imports.sh` script can be used to normalize import paths
- Follow the hexagonal architecture pattern for new modules
- Unit tests should be co-located with their respective domain components

## Key Documentation

Refer to the `docs` directory for detailed architecture documentation including:

- Comprehensive software architecture (`2-EFI-Software-Architecture.md`)
- Domain glossary defining the ubiquitous language
- CQRS implementation proposal

_Last updated: June 4, 2025_

## Key Artifacts

### Domain Model

- **Order Aggregate**: The central aggregate root for order processing
- **Value Objects**: `Money`, `OrderItem`, `CustomerId`, etc.
- **Domain Events**: `OrderCreated`, `OrderPaid`, `OrderFulfilled`, etc.

### Bounded Contexts

1. **Order Management**: Core domain for order processing
2. **Inventory Management**: Tracks product availability
3. **Customer Management**: Handles customer data and preferences
4. **Payment Processing**: Handles payment transactions
5. **Fulfillment**: Manages order fulfillment and shipping

### Integration Patterns

- **Saga Pattern**: For managing distributed transactions (CheckoutSaga)
- **Domain Events**: For eventual consistency between aggregates
- **Adapters**: For integrating with external services (e.g., Stripe)

## Getting Started

1. **Prerequisites**
   - Node.js (v16+)
   - npm or yarn

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## Development

- **Code Style**: Follows TypeScript best practices with ESLint and Prettier
- **Testing**: Uses Jest for unit and integration tests
- **Documentation**: Key design decisions are documented in the `/docs` folder

## Deployment

This is a domain model implementation and is not directly deployable. It should be integrated into a larger application framework (e.g., NestJS) with appropriate infrastructure components.

## License

Proprietary - © 2025 Elias Food Imports

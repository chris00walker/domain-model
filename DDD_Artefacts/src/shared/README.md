# Shared Infrastructure and Domain Components

## Overview
This module contains shared infrastructure components and domain primitives used across all bounded contexts in the Elias Food Imports system. It provides common patterns, utilities, and cross-cutting concerns to ensure consistency throughout the application.

## Core Domain Components

### Domain Primitives
- **Entity**: Base class for domain entities with identity
- **ValueObject**: Base class for immutable value objects
- **AggregateRoot**: Base class for aggregate roots
- **DomainEvent**: Base class for domain events
- **Identifier**: Base class for entity identifiers

### Result Pattern
- **Result**: Encapsulates success or failure outcomes with error information
- **Guard**: Validation utility for enforcing invariants and preconditions

## Infrastructure Components

### Authentication & Authorization
- **AuthenticationService**: Handles user authentication and token management
- **AuthorizationService**: Manages permissions and access control

### Logging & Monitoring
- **LoggingService**: Centralized logging with structured log format
- **MonitoringService**: Application metrics, health checks, and alerting

### Event Handling
- **EventHandlingInfrastructure**: Base infrastructure for event handling
- **IEventPublisher**: Interface for publishing domain events
- **RabbitMQEventInfrastructure**: RabbitMQ implementation for event publishing/subscribing

### API Infrastructure
- **ApiInfrastructure**: Common API handling components
- **ControllerBase**: Base controller with common functionality
- **ApiResponse**: Standardized API response format

### Validation
- **ValidationService**: Input validation and sanitization
- **ObjectValidator**: Validates complex objects against rules

### Anti-Corruption Layer
- **AntiCorruptionLayer**: Translates between bounded contexts
- **TranslationService**: Converts between different domain models

## Dependencies
- TypeScript 4.5+
- Node.js 16+
- RabbitMQ (for event infrastructure)
- Winston (for logging)
- Prometheus client (for monitoring)
- JWT (for authentication)

## Configuration

### Event Bus Configuration
```typescript
// Event bus configuration
{
  "eventBus": {
    "type": "rabbitmq",
    "connection": {
      "host": "${RABBITMQ_HOST}",
      "port": "${RABBITMQ_PORT}",
      "username": "${RABBITMQ_USERNAME}",
      "password": "${RABBITMQ_PASSWORD}",
      "vhost": "${RABBITMQ_VHOST}"
    },
    "exchange": "elias.events",
    "deadLetterExchange": "elias.events.dlx",
    "retryCount": 3,
    "retryDelay": 1000
  }
}
```

### Logging Configuration
```typescript
// Logging configuration
{
  "logging": {
    "level": "${LOG_LEVEL}",
    "format": "json",
    "transports": [
      {
        "type": "console",
        "colorize": true
      },
      {
        "type": "file",
        "filename": "logs/application.log",
        "maxsize": 10485760,
        "maxFiles": 10
      }
    ]
  }
}
```

### Authentication Configuration
```typescript
// Authentication configuration
{
  "auth": {
    "jwtSecret": "${JWT_SECRET}",
    "tokenExpiryMinutes": 60,
    "refreshTokenExpiryDays": 7,
    "passwordHashRounds": 10
  }
}
```

## Environment Variables
- `NODE_ENV`: Environment (development, test, production)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)
- `RABBITMQ_HOST`: RabbitMQ host
- `RABBITMQ_PORT`: RabbitMQ port
- `RABBITMQ_USERNAME`: RabbitMQ username
- `RABBITMQ_PASSWORD`: RabbitMQ password
- `RABBITMQ_VHOST`: RabbitMQ virtual host
- `JWT_SECRET`: Secret for JWT token signing
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS

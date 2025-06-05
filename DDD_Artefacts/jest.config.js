/**
 * Jest Configuration for Domain-Driven Design Architecture
 * 
 * This configuration supports testing at different layers of the DDD architecture:
 * - Unit tests: Testing individual domain objects in isolation
 * - Integration tests: Testing interactions between objects within a bounded context
 * - Domain tests: Testing business invariants and domain rules
 * - Application tests: Testing application services and use cases
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Include both domain code and dedicated test directories
  roots: [
    '<rootDir>/src', 
    '<rootDir>/tests'
  ],
  // Path aliases for cleaner imports across bounded contexts
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@customers/(.*)$': '<rootDir>/src/customers/$1',
    '^@catalog/(.*)$': '<rootDir>/src/catalog/$1',
    '^@ordering/(.*)$': '<rootDir>/src/ordering/$1',
    '^@subscriptions/(.*)$': '<rootDir>/src/subscriptions/$1',
    '^@payments/(.*)$': '<rootDir>/src/payments/$1',
    '^@pricing/(.*)$': '<rootDir>/src/pricing/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@admin/(.*)$': '<rootDir>/src/admin/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@infra/(.*)$': '<rootDir>/src/infra/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  // Test files can be placed in `tests` directory or alongside domain code with various test naming patterns
  testMatch: [
    '**/__tests__/**/*.+(ts|js)',
    '**/tests/**/*.+(ts|js)',
    '**/?(*.)+(spec|test|Tests).+(ts|js)'
  ],
  // Allow running specific test types with Jest tags
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  // Better output formatting for domain-focused tests
  verbose: true,
  // Coverage reporting by bounded context
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageDirectory: './coverage',
  // Coverage thresholds by bounded context
  coverageThreshold: {
    'src/shared/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'src/catalog/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'src/customers/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'src/ordering/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'src/subscriptions/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'src/pricing/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'src/admin/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  // Group test results by bounded context for better reporting
  reporters: ['default']
}

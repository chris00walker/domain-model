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
    '<rootDir>/code', 
    '<rootDir>/tests'
  ],
  // Path aliases for cleaner imports across bounded contexts
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/code/shared/$1',
    '^@customers/(.*)$': '<rootDir>/code/customers/$1',
    '^@catalog/(.*)$': '<rootDir>/code/catalog/$1',
    '^@ordering/(.*)$': '<rootDir>/code/ordering/$1',
    '^@subscriptions/(.*)$': '<rootDir>/code/subscriptions/$1',
    '^@payments/(.*)$': '<rootDir>/code/payments/$1',
    '^@pricing/(.*)$': '<rootDir>/code/pricing/$1',
    '^@app/(.*)$': '<rootDir>/code/app/$1',
    '^@domain/(.*)$': '<rootDir>/code/domain/$1',
    '^@infra/(.*)$': '<rootDir>/code/infra/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  // Test files can be placed in `tests` directory or alongside domain code with .spec.ts extension
  testRegex: '(/(tests|code)/.*\\.(test|spec))\\.(ts|js)$',
  // Allow running specific test types with Jest tags
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  // Better output formatting for domain-focused tests
  verbose: true,
  // Coverage reporting by bounded context
  collectCoverageFrom: [
    'code/**/*.{ts,js}',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageDirectory: './coverage',
  // Coverage thresholds by bounded context
  coverageThreshold: {
    'code/shared/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'code/catalog/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'code/customers/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'code/ordering/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'code/subscriptions/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'code/pricing/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  // Group test results by bounded context for better reporting
  reporters: ['default']
}

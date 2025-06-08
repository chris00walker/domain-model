module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // ✅ ignore the legacy artefact tests for now
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/DDD_Artefacts/tests/'
  ],
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/DDD_Artefacts/src/$1',
    '^@app/(.*)$': '<rootDir>/DDD_Artefacts/src/app/$1',
    '^@domain/(.*)$': '<rootDir>/DDD_Artefacts/src/domain/$1',
    '^@infra/(.*)$': '<rootDir>/DDD_Artefacts/src/infra/$1',
    '^@ordering/(.*)$': '<rootDir>/DDD_Artefacts/src/ordering/$1',
    '^@invoicing/(.*)$': '<rootDir>/DDD_Artefacts/src/invoicing/$1',
    '^@shipping/(.*)$': '<rootDir>/DDD_Artefacts/src/shipping/$1',
    '^@subscriptions/(.*)$': '<rootDir>/DDD_Artefacts/src/subscriptions/$1',
    '^@catalog/(.*)$': '<rootDir>/DDD_Artefacts/src/catalog/$1',
    '^@pricing/(.*)$': '<rootDir>/DDD_Artefacts/src/pricing/$1',
    '^@customers/(.*)$': '<rootDir>/DDD_Artefacts/src/customers/$1',
    '^@payments/(.*)$': '<rootDir>/DDD_Artefacts/src/payments/$1',
    '^@admin/(.*)$': '<rootDir>/DDD_Artefacts/src/admin/$1',
    '^@shared/(.*)$': '<rootDir>/DDD_Artefacts/src/shared/$1'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true
};

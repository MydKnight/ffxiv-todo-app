module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.type.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/test-setup.ts'],
  testTimeout: 10000,
  // Allow running specific test files or patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  // Useful for debugging
  verbose: true,
  // Run tests serially to avoid database conflicts
  maxWorkers: 1,
  // Environment variables for tests
  setupFiles: ['<rootDir>/tests/setup/test-env.ts']
};
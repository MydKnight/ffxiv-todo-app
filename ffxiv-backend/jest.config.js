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
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/database/seed.ts',  
  ],
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
  setupFiles: ['<rootDir>/tests/setup/test-env.ts'],
  
  // ==================== ENHANCED CONFIGURATION ====================
  
  // Module name mapping for easier imports
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
    "@tests/(.*)": "<rootDir>/tests/$1"
  },
  
  // Clear mocks automatically between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Reset modules between tests to prevent state leakage
  resetModules: true,
  
  // Coverage thresholds to maintain code quality
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Specific thresholds for critical components
    './src/clients/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/utils/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Coverage output formats
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  // Test result processors for better output
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './coverage',
      outputName: 'junit.xml'
    }]
  ],
  
  // Global test configuration
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    }
  },
  
  
  // Error handling
  errorOnDeprecated: true,
  
  // Additional test utilities
  testResultsProcessor: undefined, // Can be used for custom processing
  
  // Performance monitoring
  detectOpenHandles: true,
  forceExit: false,
  
  // Watch mode configuration
  watchman: true,
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/.git/'
  ]
};
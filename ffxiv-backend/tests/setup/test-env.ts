// tests/setup/test-env.ts
// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce logging noise during tests

// If you have other environment-specific settings, add them here
// process.env.DATABASE_URL will be set dynamically in test-setup.ts
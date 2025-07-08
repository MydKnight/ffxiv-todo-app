import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Create a unique test database for each test run to avoid conflicts
const testDbName = `test_${Date.now()}_${Math.random().toString(36).substring(7)}.db`;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:./${testDbName}`
    }
  }
});

beforeAll(async () => {
  try {
    // Set the test database URL as environment variable
    const testDatabaseUrl = `file:./${testDbName}`;
    process.env.DATABASE_URL = testDatabaseUrl;
    
    console.log(`Setting up test database: ${testDbName}`);
    
    // Run migrations on the test database
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: testDatabaseUrl }
    });
    
    // Connect to ensure database is ready
    await prisma.$connect();
    
    console.log(`Test database setup complete: ${testDbName}`);
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await prisma.$disconnect();
    
    // Clean up test database file
    const fs = require('fs');
    if (fs.existsSync(testDbName)) {
      fs.unlinkSync(testDbName);
      console.log(`Test database cleaned up: ${testDbName}`);
    }
  } catch (error) {
    console.error('Failed to cleanup test database:', error);
  }
});

afterEach(async () => {
  // Clean up after each test - more robust approach
  try {
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
    
    // Get all table names excluding system tables
    const tables = await prisma.$queryRaw<{ name: string }[]>`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%' 
      AND name NOT LIKE '_prisma_migrations';
    `;
    
    // Delete all data from tables in reverse order to handle foreign keys
    for (const table of tables.reverse()) {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table.name}";`);
    }
    
    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
  } catch (error) {
    console.error('Failed to cleanup test data:', error);
    throw error;
  }
});

// Export both prisma instance and test database name for debugging
export { prisma, testDbName };
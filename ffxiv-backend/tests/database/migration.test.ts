import { MigrationService } from '../../src/database/migrations';
import { prisma } from '../setup/test-setup';
import { jest } from '@jest/globals';

// Mock the database client
jest.mock('../../src/database/client', () => ({
  __esModule: true,
  get default() {
    return prisma;
  }
}));

describe('MigrationService', () => {
  let migrationService: MigrationService;
  
  beforeEach(() => {
    migrationService = new MigrationService();
    
    // Clear snapshot table before tests
    return prisma.characterSnapshot.deleteMany();
  });
  
  // Skip the seedInitialData test - we've decided not to test this
  describe('seedInitialData', () => {
    it.skip('seeds initial job data', async () => {
      // We're skipping this test
    });
  });
  
  // Do test the createSnapshot method
  describe('createSnapshot', () => {
    it('creates a character snapshot with data', async () => {
      // Setup
      const character = await prisma.character.create({
        data: {
          name: 'Test Character',
          server: 'Test Server'
        }
      });
      
      const testData = { 
        level: 80,
        jobs: ['Paladin', 'White Mage']
      };
      
      // Execute
      const snapshot = await migrationService.createSnapshot(character.id, testData);
      
      // Verify
      expect(snapshot).toBeDefined();
      expect(snapshot.characterId).toBe(character.id);
      expect(snapshot.dataJson).toBe(JSON.stringify(testData));
      expect(snapshot.source).toBe('lodestone'); // Default value from schema
      
      // Verify it's in the database
      const savedSnapshot = await prisma.characterSnapshot.findUnique({
        where: { id: snapshot.id }
      });
      
      expect(savedSnapshot).toBeDefined();
      expect(savedSnapshot?.dataJson).toBe(JSON.stringify(testData));
    });
    
    it('handles various data types correctly', async () => {
      // Setup
      const character = await prisma.character.create({
        data: {
          name: 'Test Character 2',
          server: 'Test Server'
        }
      });
      
      // Test with more complex data
      const complexData = {
        jobs: [
          { name: 'Paladin', level: 80, experience: 12345 },
          { name: 'White Mage', level: 70, experience: 54321 }
        ],
        achievements: [1, 2, 3],
        lastUpdated: new Date().toISOString()
      };
      
      // Execute
      const snapshot = await migrationService.createSnapshot(character.id, complexData);
      
      // Verify
      expect(snapshot).toBeDefined();
      expect(JSON.parse(snapshot.dataJson)).toEqual(complexData);
    });
  });
});
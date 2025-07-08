import { DatabaseService } from '../../src/services/database.service';
import { testHelpers } from '../setup/test-helpers';
import '../setup/test-setup'; 
import { prisma } from '../setup/test-setup'; 

describe('DatabaseService', () => {
  let dbService: DatabaseService;

  beforeEach(() => {
    dbService = new DatabaseService(prisma);
  });

  describe('Character Operations', () => {
    it('should create a character', async () => {
      const name = 'Test Character ';
      const server = 'Gilgamesh';
      
      const character = await dbService.createCharacter(name, server);
      
      expect(character).toBeDefined();
      expect(character.name).toBe(name);
      expect(character.server).toBe(server);
      expect(character.id).toBeDefined();
      expect(character.createdAt).toBeDefined();
      expect(character.isActive).toBe(true);
    });

    it('should create a character with lodestone ID', async () => {
      const name = 'Test Character 4';
      const server = 'Gilgamesh';
      const lodestoneId = '12345678';
      
      const character = await dbService.createCharacter(name, server, lodestoneId);
      
      expect(character.lodestoneId).toBe(lodestoneId);
    });

    it('should not create duplicate characters', async () => {
      const name = 'Duplicate Test';
      const server = 'Gilgamesh';
      
      await dbService.createCharacter(name, server);
      
      // Should throw error on duplicate
      await expect(
        dbService.createCharacter(name, server)
      ).rejects.toThrow();
    });

    it('should get character by ID', async () => {
      const character = await testHelpers.createTestCharacter();
      
      const foundCharacter = await dbService.getCharacter(character.id);
      
      expect(foundCharacter).toBeDefined();
      expect(foundCharacter!.id).toBe(character.id);
      expect(foundCharacter!.jobs).toBeDefined();
      expect(foundCharacter!.achievements).toBeDefined();
    });

    it('should get character by name and server', async () => {
      const name = 'Unique Character';
      const server = 'Unique Server';
      const character = await dbService.createCharacter(name, server);
      
      const foundCharacter = await dbService.getCharacterByNameAndServer(name, server);
      
      expect(foundCharacter).toBeDefined();
      expect(foundCharacter!.id).toBe(character.id);
    });

    it('should return null for non-existent character', async () => {
      const character = await dbService.getCharacter('non-existent-id');
      
      expect(character).toBeNull();
    });
  });

  describe('Job Operations', () => {
    it('should create a job', async () => {
      const name = 'Test Job';
      const category = 'Test Category';
      const maxLevel = 80;
      
      const job = await dbService.createJob(name, category, maxLevel);
      
      expect(job).toBeDefined();
      expect(job.name).toBe(name);
      expect(job.category).toBe(category);
      expect(job.maxLevel).toBe(maxLevel);
    });

    it('should get or create job', async () => {
      const name = 'Paladin';
      const category = 'Tank';
      
      // First call should create
      const job1 = await dbService.getOrCreateJob(name, category);
      expect(job1.name).toBe(name);
      
      // Second call should return existing
      const job2 = await dbService.getOrCreateJob(name, category);
      expect(job2.id).toBe(job1.id);
    });

    it('should determine job category correctly', async () => {
      // Test a few job categorizations
      const paladin = await dbService.getOrCreateJob('Paladin', 'Tank');
      expect(paladin.category).toBe('Tank');
      
      const whm = await dbService.getOrCreateJob('White Mage', 'Healer');
      expect(whm.category).toBe('Healer');
      
      const ninja = await dbService.getOrCreateJob('Ninja', 'Melee DPS');
      expect(ninja.category).toBe('Melee DPS');
    });
  });

  describe('Character Job Operations', () => {
    it('should update character job', async () => {
      const character = await testHelpers.createTestCharacter();
      const level = 85;
      const experience = 2500000;
      
      const characterJob = await dbService.updateCharacterJob(
        character.id,
        'Paladin',
        level,
        experience
      );
      
      expect(characterJob).toBeDefined();
      expect(characterJob.level).toBe(level);
      expect(characterJob.experience).toBe(experience);
      expect(characterJob.characterId).toBe(character.id);
    });

    it('should update existing character job', async () => {
      const character = await testHelpers.createTestCharacter();
      
      // Create initial job level
      await dbService.updateCharacterJob(character.id, 'Paladin', 50, 1000000);
      
      // Update the same job
      const updatedJob = await dbService.updateCharacterJob(
        character.id,
        'Paladin',
        60,
        1500000
      );
      
      expect(updatedJob.level).toBe(60);
      expect(updatedJob.experience).toBe(1500000);
    });

    it('should create multiple jobs for same character', async () => {
      const character = await testHelpers.createTestCharacter();
      
      const paladin = await dbService.updateCharacterJob(character.id, 'Paladin', 80, 2000000);
      const whm = await dbService.updateCharacterJob(character.id, 'White Mage', 75, 1800000);
      
      expect(paladin.characterId).toBe(character.id);
      expect(whm.characterId).toBe(character.id);
      expect(paladin.jobId).not.toBe(whm.jobId);
    });
  });

  describe('Snapshot Operations', () => {
    it('should create snapshot', async () => {
      const character = await testHelpers.createTestCharacter();
      const testData = { level: 80, jobs: ['Paladin', 'White Mage'] };
      
      const snapshot = await dbService.createSnapshot(character.id, testData);
      
      expect(snapshot).toBeDefined();
      expect(snapshot.characterId).toBe(character.id);
      expect(snapshot.dataJson).toBe(JSON.stringify(testData));
      expect(snapshot.source).toBe('lodestone');
    });

    it('should create snapshot with custom source', async () => {
      const character = await testHelpers.createTestCharacter();
      const testData = { level: 80 };
      
      const snapshot = await dbService.createSnapshot(character.id, testData, 'manual');
      
      expect(snapshot.source).toBe('manual');
    });

    it('should get latest snapshot', async () => {
      const character = await testHelpers.createTestCharacter();
      
      // Create multiple snapshots
      await dbService.createSnapshot(character.id, { level: 75 });
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const latest = await dbService.createSnapshot(character.id, { level: 80 });
      
      const retrieved = await dbService.getLatestSnapshot(character.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(latest.id);
      expect(retrieved!.dataJson).toBe(JSON.stringify({ level: 80 }));
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete character workflow', async () => {
      // Create character
      const character = await dbService.createCharacter('Integration Test', 'Test Server');
      
      // Add job levels
      await dbService.updateCharacterJob(character.id, 'Paladin', 85, 2500000);
      await dbService.updateCharacterJob(character.id, 'White Mage', 72, 1800000);
      
      // Create snapshot
      const snapshotData = {
        jobs: [
          { name: 'Paladin', level: 85, experience: 2500000 },
          { name: 'White Mage', level: 72, experience: 1800000 }
        ]
      };
      await dbService.createSnapshot(character.id, snapshotData);
      
      // Retrieve complete character data
      const fullCharacter = await dbService.getCharacter(character.id);
      
      expect(fullCharacter).toBeDefined();
      expect(fullCharacter!.jobs).toHaveLength(2);
      expect(fullCharacter!.jobs[0].level).toBeGreaterThan(0);
    });
  });
});
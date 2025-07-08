// tests/setup/test-helpers.test.ts
import { testHelpers } from './test-helpers';
import { prisma } from './test-setup';

describe('Test Helpers', () => {
  describe('Utility Functions', () => {
    test('generateRandomString should create string of specified length', () => {
      const result = testHelpers.generateRandomString(5);
      expect(result).toHaveLength(5);
      expect(typeof result).toBe('string');
    });

    test('generateRandomEmail should create valid email format', () => {
      const email = testHelpers.generateRandomEmail();
      expect(email).toMatch(/^test_[a-z0-9]+@example\.com$/);
    });

    test('generateRandomNumber should be within specified range', () => {
      const num = testHelpers.generateRandomNumber(10, 20);
      expect(num).toBeGreaterThanOrEqual(10);
      expect(num).toBeLessThanOrEqual(20);
    });
  });

  describe('Database Helpers', () => {
    test('createTestCharacter should create character in database', async () => {
      const character = await testHelpers.createTestCharacter('Test Char', 'Test Server');
      
      expect(character).toBeTruthy();
      expect(character.name).toBe('Test Char');
      expect(character.server).toBe('Test Server');
      expect(character.id).toBeTruthy();
      
      // Verify it exists in database
      const found = await prisma.character.findUnique({
        where: { id: character.id }
      });
      expect(found).toBeTruthy();
    });

    test('createTestJob should create job in database', async () => {
      const job = await testHelpers.createTestJob('Warrior', 'Tank');
      
      expect(job).toBeTruthy();
      expect(job.name).toBe('Warrior');
      expect(job.category).toBe('Tank');
      expect(job.id).toBeTruthy();
      
      // Verify it exists in database
      const found = await prisma.job.findUnique({
        where: { id: job.id }
      });
      expect(found).toBeTruthy();
    });

    test('createTestCharacterJob should create character-job relationship', async () => {
      const character = await testHelpers.createTestCharacter();
      const job = await testHelpers.createTestJob();
      
      const characterJob = await testHelpers.createTestCharacterJob(
        character.id, 
        job.id, 
        50, 
        1000000
      );
      
      expect(characterJob).toBeTruthy();
      expect(characterJob.characterId).toBe(character.id);
      expect(characterJob.jobId).toBe(job.id);
      expect(characterJob.level).toBe(50);
      expect(characterJob.experience).toBe(1000000);
    });

    test('createTestAchievement should create achievement in database', async () => {
      const achievement = await testHelpers.createTestAchievement(
        'Test Achievement',
        'Test description'
      );
      
      expect(achievement).toBeTruthy();
      expect(achievement.name).toBe('Test Achievement');
      expect(achievement.description).toBe('Test description');
      expect(achievement.id).toBeTruthy();
    });

    test('createCompleteTestCharacter should create character with related data', async () => {
      const completeChar = await testHelpers.createCompleteTestCharacter(
        'Complete Character',
        'Complete Server'
      );
      
      expect(completeChar.character).toBeTruthy();
      expect(completeChar.character.name).toBe('Complete Character');
      expect(completeChar.jobs).toHaveLength(2);
      expect(completeChar.characterJobs).toHaveLength(2);
      expect(completeChar.achievements).toHaveLength(2);
      
      // Verify character exists with relationships
      const foundCharacter = await prisma.character.findUnique({
        where: { id: completeChar.character.id },
        include: {
          jobs: true,
          achievements: true
        }
      });
      
      expect(foundCharacter).toBeTruthy();
      expect(foundCharacter?.jobs).toHaveLength(2);
      expect(foundCharacter?.achievements).toHaveLength(2);
    });
  });

  describe('Validation Helpers', () => {
    test('expectRecordToExist should find existing record', async () => {
      const character = await testHelpers.createTestCharacter();
      
      const found = await testHelpers.expectRecordToExist('character', character.id);
      expect(found.id).toBe(character.id);
    });

    test('expectRecordNotToExist should not find non-existent record', async () => {
      const fakeId = testHelpers.generateRandomString();
      
      await testHelpers.expectRecordNotToExist('character', fakeId);
    });
  });
});
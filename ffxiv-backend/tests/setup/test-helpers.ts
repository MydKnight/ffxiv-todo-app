import { prisma } from './test-setup';

// Test data factories - create test data directly with Prisma
export const testHelpers = {
  // Character helpers
  async createTestCharacter(
    name: string = 'Test Character', 
    server: string = 'Test Server',
    additionalData: any = {}
  ) {
    try {
      return await prisma.character.create({
        data: {
          name,
          server,
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Failed to create test character:', error);
      throw error;
    }
  },

  // Job helpers
  async createTestJob(
    name: string = 'Test Job', 
    category: string = 'Test Category',
    additionalData: any = {}
  ) {
    try {
      return await prisma.job.create({
        data: {
          name,
          category,
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Failed to create test job:', error);
      throw error;
    }
  },

  // Character Job Progress helpers
  async createTestCharacterJob(
    characterId: string,
    jobId: string,
    level: number = 1,
    experience: number = 0,
    additionalData: any = {}
  ) {
    try {
      return await prisma.characterJob.create({
        data: {
          characterId,
          jobId,
          level,
          experience,
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Failed to create test character job:', error);
      throw error;
    }
  },

  // Achievement helpers
  async createTestAchievement(
    name: string = 'Test Achievement',
    description: string = 'Test achievement description',
    additionalData: any = {}
  ) {
    try {
      return await prisma.achievement.create({
        data: {
          gameId: additionalData.gameId || Math.floor(Math.random() * 1000000) + 1,
          name,
          description,
          category: additionalData.category || 'Test Category',
          points: additionalData.points || 10,
          icon: additionalData.icon || null,
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Failed to create test achievement:', error);
      throw error;
    }
  },

  // Character Achievement helpers
  async createTestCharacterAchievement(
    characterId: string,
    achievementId: string,
    completedAt: Date = new Date(),
    additionalData: any = {}
  ) {
    try {
      return await prisma.characterAchievement.create({
        data: {
          characterId,
          achievementId,
          earnedAt: new Date(),
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Failed to create test character achievement:', error);
      throw error;
    }
  },

  // Utility helpers
  generateRandomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, length + 2);
  },

  generateRandomEmail(): string {
    return `test_${this.generateRandomString(8)}@example.com`;
  },

  generateRandomNumber(min: number = 1, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Data validation helpers
  async expectRecordToExist(tableName: string, id: string) {
    const record = await (prisma as any)[tableName].findUnique({
      where: { id }
    });
    expect(record).toBeTruthy();
    return record;
  },

  async expectRecordNotToExist(tableName: string, id: string) {
    const record = await (prisma as any)[tableName].findUnique({
      where: { id }
    });
    expect(record).toBeFalsy();
  },

  // Clean up specific test data
  async cleanupTestData() {
    // This will be handled by the afterEach in test-setup
    // But can be used for specific cleanup needs
    console.log('Cleanup handled by test-setup afterEach');
  },

  // Create a full test character with jobs and achievements
  async createCompleteTestCharacter(
    name: string = 'Complete Test Character',
    server: string = 'Test Server'
  ) {
    const character = await this.createTestCharacter(name, server);
    
    // Create some test jobs
    const job1 = await this.createTestJob('Paladin', 'Tank');
    const job2 = await this.createTestJob('White Mage', 'Healer');
    
    // Create character-job relationships
    const charJob1 = await this.createTestCharacterJob(character.id, job1.id, 50, 1000000);
    const charJob2 = await this.createTestCharacterJob(character.id, job2.id, 30, 500000);
    
    // Create some achievements
    const achievement1 = await this.createTestAchievement('First Steps', 'Complete your first quest');
    const achievement2 = await this.createTestAchievement('Level 50', 'Reach level 50 on any job');
    
    // Create character-achievement relationships
    await this.createTestCharacterAchievement(character.id, achievement1.id);
    await this.createTestCharacterAchievement(character.id, achievement2.id);
    
    return {
      character,
      jobs: [job1, job2],
      characterJobs: [charJob1, charJob2],
      achievements: [achievement1, achievement2]
    };
  }
};
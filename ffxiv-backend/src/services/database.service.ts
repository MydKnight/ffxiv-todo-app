import { PrismaClient } from '@prisma/client';
import prisma from '../database/client';
import { Character, Job, CharacterJob } from '@prisma/client';

export class DatabaseService {
  private prisma: PrismaClient;

  constructor(prismaInstance?: PrismaClient) {
    this.prisma = prismaInstance || prisma;
  }

  // Character operations
  async createCharacter(name: string, server: string, lodestoneId?: string): Promise<Character> {
    return await this.prisma.character.create({
      data: {
        name,
        server,
        lodestoneId,
      },
    });
  }

  async getCharacter(id: string) {
    return await this.prisma.character.findUnique({
      where: { id },
      include: {
        jobs: {
          include: {
            job: true,
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });
  }

  async getCharacterByNameAndServer(name: string, server: string) {
    return await this.prisma.character.findUnique({
      where: {
        name_server: {
          name,
          server,
        },
      },
    });
  }

  // Job operations
  async createJob(name: string, category: string, maxLevel: number = 90): Promise<Job> {
    return await this.prisma.job.create({
      data: {
        name,
        category,
        maxLevel,
      },
    });
  }

  async getOrCreateJob(name: string, category: string): Promise<Job> {
    const existingJob = await this.prisma.job.findUnique({
      where: { name },
    });

    if (existingJob) {
      return existingJob;
    }

    return this.createJob(name, category);
  }

  // Character job operations
  async updateCharacterJob(
    characterId: string,
    jobName: string,
    level: number,
    experience: number
  ): Promise<CharacterJob> {
    // Determine job category
    const jobCategory = this.determineJobCategory(jobName);
    
    // Get or create job
    const job = await this.getOrCreateJob(jobName, jobCategory);

    // Update or create character job
    return await this.prisma.characterJob.upsert({
      where: {
        characterId_jobId: {
          characterId,
          jobId: job.id,
        },
      },
      update: {
        level,
        experience,
        lastUpdated: new Date(),
      },
      create: {
        characterId,
        jobId: job.id,
        level,
        experience,
      },
    });
  }

  // Snapshot operations
  async createSnapshot(characterId: string, data: any, source: string = 'lodestone') {
    return await this.prisma.characterSnapshot.create({
      data: {
        characterId,
        dataJson: JSON.stringify(data),
        source,
      },
    });
  }

  async getLatestSnapshot(characterId: string) {
    return await this.prisma.characterSnapshot.findFirst({
      where: { characterId },
      orderBy: { snapshotAt: 'desc' },
    });
  }

  // Utility methods
  private determineJobCategory(jobName: string): string {
    const jobCategories = {
      'Tank': ['Paladin', 'Warrior', 'Dark Knight', 'Gunbreaker'],
      'Healer': ['White Mage', 'Scholar', 'Astrologian', 'Sage'],
      'Melee DPS': ['Monk', 'Dragoon', 'Ninja', 'Samurai', 'Reaper'],
      'Ranged DPS': ['Bard', 'Machinist', 'Dancer'],
      'Magical DPS': ['Black Mage', 'Summoner', 'Red Mage', 'Blue Mage'],
      'Crafter': ['Carpenter', 'Blacksmith', 'Armorer', 'Goldsmith', 'Leatherworker', 'Weaver', 'Alchemist', 'Culinarian'],
      'Gatherer': ['Miner', 'Botanist', 'Fisher'],
    };

    for (const [category, jobs] of Object.entries(jobCategories)) {
      if (jobs.includes(jobName)) {
        return category;
      }
    }

    return 'Unknown';
  }
}

export const dbService = new DatabaseService();
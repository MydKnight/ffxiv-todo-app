import prisma from './client';

export class MigrationService {
  async seedInitialData() {
    // Seed basic job data
    const jobs = [
      { name: 'Paladin', category: 'Tank', maxLevel: 90 },
      { name: 'White Mage', category: 'Healer', maxLevel: 90 },
      { name: 'Black Mage', category: 'DPS', maxLevel: 90 },
      // ... more jobs
    ];

    for (const job of jobs) {
      await prisma.job.upsert({
        where: { name: job.name },
        update: {},
        create: job,
      });
    }
  }

  async createSnapshot(characterId: string, data: any) {
    return await prisma.characterSnapshot.create({
      data: {
        characterId,
        dataJson: JSON.stringify(data),
      },
    });
  }
}
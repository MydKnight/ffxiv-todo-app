import { 
  createGameData, 
  GameDataType,
  getGameDataByType, 
  updateGameData, 
  deleteGameData, 
  getGameDataVersion 
} from '../../src/repositories/game-data-repository';
import prisma from '../../src/database/client';

const sampleType: GameDataType = 'jobs';

describe('Game Data Repository', () => {
  const sampleData = {
    type: sampleType,
    data: [{ name: 'Paladin', category: 'Tank' }]
  };

  beforeEach(async () => {
    await prisma.characterJob.deleteMany();
    await prisma.character.deleteMany();
    await prisma.job.deleteMany();
  });

  it('should create new game data entry', async () => {
    await createGameData(sampleData.type, sampleData.data);
    const jobsInDb = await prisma.job.findMany();
    expect(jobsInDb).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Paladin' })
      ])
    );
  });

  it('should retrieve game data by type', async () => {
    await createGameData(sampleData.type, sampleData.data);
    const result = await getGameDataByType(sampleType);
    expect(result).not.toBeNull(); // Fails if result is null
    expect(result!.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Paladin',
            category: 'Tank',
            maxLevel: 90 // optional, if you want to check
          })
        ])
    );
  });

  it('should update existing game data entry', async () => {
    await createGameData(sampleData.type, sampleData.data);
    const newData = [{ name: 'Paladin', category: 'Tank'}, { name: 'Warrior', category: 'Tank' }];
    const result = await updateGameData(sampleData.type, newData);
    expect(result).not.toBeNull(); // Fails if result is null
    expect(result!.data).toEqual(newData); // Safe to access .data
  });

  it('should delete game data entry', async () => {
    await createGameData(sampleData.type, sampleData.data);
    await deleteGameData(sampleData.type);
    const result = await getGameDataByType(sampleData.type);
    expect(result).toBeNull();
  });


  it('should return null for non-existent data type', async () => {
    const result = await getGameDataByType('items');
    expect(result).toBeNull();
  });

  it('should not create duplicate jobs', async () => {
    const jobData = [
      { name: 'Paladin', category: 'Tank', maxLevel: 90 },
      { name: 'Paladin', category: 'Tank', maxLevel: 90 } // duplicate by name
    ];
    await createGameData('jobs', jobData);

    const jobsInDb = await prisma.job.findMany({ where: { name: 'Paladin' } });
    expect(jobsInDb.length).toBe(1); // Only one Paladin should exist
  });

  it('should not create duplicate achievements', async () => {
    const achievementData = [
      { gameId: 1001, name: 'First Blood', category: 'Combat', description: '', points: 10 },
      { gameId: 1001, name: 'First Blood', category: 'Combat', description: '', points: 10 } // duplicate by gameId
    ];
    await createGameData('achievements', achievementData);

    const achievementsInDb = await prisma.achievement.findMany({ where: { gameId: 1001 } });
    expect(achievementsInDb.length).toBe(1); // Only one achievement with gameId 1001
  });

  // Add more edge cases as needed, e.g., invalid input, concurrent updates, etc.
});

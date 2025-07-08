import prisma from './client';

async function seed() {
  console.log('🌱 Seeding database...');

  // Seed jobs
  const jobs = [
    // Tanks
    { name: 'Paladin', category: 'Tank', maxLevel: 90 },
    { name: 'Warrior', category: 'Tank', maxLevel: 90 },
    { name: 'Dark Knight', category: 'Tank', maxLevel: 90 },
    { name: 'Gunbreaker', category: 'Tank', maxLevel: 90 },
    
    // Healers
    { name: 'White Mage', category: 'Healer', maxLevel: 90 },
    { name: 'Scholar', category: 'Healer', maxLevel: 90 },
    { name: 'Astrologian', category: 'Healer', maxLevel: 90 },
    { name: 'Sage', category: 'Healer', maxLevel: 90 },
    
    // DPS
    { name: 'Monk', category: 'Melee DPS', maxLevel: 90 },
    { name: 'Dragoon', category: 'Melee DPS', maxLevel: 90 },
    { name: 'Ninja', category: 'Melee DPS', maxLevel: 90 },
    { name: 'Samurai', category: 'Melee DPS', maxLevel: 90 },
    { name: 'Reaper', category: 'Melee DPS', maxLevel: 90 },
    
    { name: 'Bard', category: 'Ranged DPS', maxLevel: 90 },
    { name: 'Machinist', category: 'Ranged DPS', maxLevel: 90 },
    { name: 'Dancer', category: 'Ranged DPS', maxLevel: 90 },
    
    { name: 'Black Mage', category: 'Magical DPS', maxLevel: 90 },
    { name: 'Summoner', category: 'Magical DPS', maxLevel: 90 },
    { name: 'Red Mage', category: 'Magical DPS', maxLevel: 90 },
    { name: 'Blue Mage', category: 'Magical DPS', maxLevel: 70 },
    
    // Crafters
    { name: 'Carpenter', category: 'Crafter', maxLevel: 90 },
    { name: 'Blacksmith', category: 'Crafter', maxLevel: 90 },
    { name: 'Armorer', category: 'Crafter', maxLevel: 90 },
    { name: 'Goldsmith', category: 'Crafter', maxLevel: 90 },
    { name: 'Leatherworker', category: 'Crafter', maxLevel: 90 },
    { name: 'Weaver', category: 'Crafter', maxLevel: 90 },
    { name: 'Alchemist', category: 'Crafter', maxLevel: 90 },
    { name: 'Culinarian', category: 'Crafter', maxLevel: 90 },
    
    // Gatherers
    { name: 'Miner', category: 'Gatherer', maxLevel: 90 },
    { name: 'Botanist', category: 'Gatherer', maxLevel: 90 },
    { name: 'Fisher', category: 'Gatherer', maxLevel: 90 },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { name: job.name },
      update: {},
      create: job,
    });
  }

  // Create a test character
  const testCharacter = await prisma.character.upsert({
    where: {
      name_server: {
        name: 'Test Character',
        server: 'Gilgamesh',
      },
    },
    update: {},
    create: {
      name: 'Test Character',
      server: 'Gilgamesh',
      lodestoneId: '12345678',
    },
  });

  // Add some job levels to test character
  const paladinJob = await prisma.job.findUnique({ where: { name: 'Paladin' } });
  const whiteMargeJob = await prisma.job.findUnique({ where: { name: 'White Mage' } });

  if (paladinJob) {
    await prisma.characterJob.upsert({
      where: {
        characterId_jobId: {
          characterId: testCharacter.id,
          jobId: paladinJob.id,
        },
      },
      update: {},
      create: {
        characterId: testCharacter.id,
        jobId: paladinJob.id,
        level: 85,
        experience: 2500000,
      },
    });
  }

  if (whiteMargeJob) {
    await prisma.characterJob.upsert({
      where: {
        characterId_jobId: {
          characterId: testCharacter.id,
          jobId: whiteMargeJob.id,
        },
      },
      update: {},
      create: {
        characterId: testCharacter.id,
        jobId: whiteMargeJob.id,
        level: 72,
        experience: 1800000,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
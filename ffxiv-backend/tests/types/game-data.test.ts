// tests/types/game-data.test.ts
import { 
  validateJob, 
  validateItem, 
  validateAchievement,
  validateQuest,
  isValidJobCategory,
  isValidItemCategory,
  isValidAchievementCategory,
  JobCategory,
  ItemCategory,
  AchievementCategory
} from '../../src/types/game-data';

describe('Game Data Types Validation', () => {
  describe('Job Validation', () => {
    it('should validate a complete job object', () => {
      const validJob = {
        id: 1,
        name: 'Paladin',
        abbreviation: 'PLD',
        category: 'Tank' as JobCategory,
        maxLevel: 90,
        startingLevel: 1,
        classJob: 'Gladiator',
        unlockQuest: 'Way of the Gladiator',
        jobStone: 'Soul of the Paladin',
        primaryAttribute: 'Vitality',
        isStartingClass: false,
        expansionRequired: null
      };

      expect(validateJob(validJob)).toBe(true);
    });

    it('should reject job with missing required fields', () => {
      const invalidJob = {
        id: 1,
        name: 'Paladin',
        // missing abbreviation
        category: 'Tank' as JobCategory,
        maxLevel: 90
      };

      expect(validateJob(invalidJob)).toBe(false);
    });

    it('should reject job with invalid category', () => {
      const invalidJob = {
        id: 1,
        name: 'Paladin',
        abbreviation: 'PLD',
        category: 'InvalidCategory' as JobCategory,
        maxLevel: 90,
        startingLevel: 1,
        classJob: 'Gladiator',
        unlockQuest: 'Way of the Gladiator',
        jobStone: 'Soul of the Paladin',
        primaryAttribute: 'Vitality',
        isStartingClass: false,
        expansionRequired: null
      };

      expect(validateJob(invalidJob)).toBe(false);
    });

    it('should reject job with invalid level range', () => {
      const invalidJob = {
        id: 1,
        name: 'Paladin',
        abbreviation: 'PLD',
        category: 'Tank' as JobCategory,
        maxLevel: 0, // invalid
        startingLevel: 1,
        classJob: 'Gladiator',
        unlockQuest: 'Way of the Gladiator',
        jobStone: 'Soul of the Paladin',
        primaryAttribute: 'Vitality',
        isStartingClass: false,
        expansionRequired: null
      };

      expect(validateJob(invalidJob)).toBe(false);
    });
  });

  describe('Item Validation', () => {
    it('should validate a complete item object', () => {
      const validItem = {
        id: 12345,
        name: 'Excalibur',
        description: 'A legendary sword',
        category: 'Weapon' as ItemCategory,
        subCategory: 'Sword',
        itemLevel: 535,
        requiredLevel: 80,
        rarity: 'Legendary',
        stackSize: 1,
        vendorPrice: 0,
        canBeHq: true,
        tradeable: true,
        desynthable: false,
        dyeable: false,
        stats: {
          'Physical Damage': 120,
          'Magic Damage': 85,
          'Strength': 145
        },
        jobs: ['PLD', 'GLD'],
        obtainedFrom: ['Raid', 'Extreme Trial']
      };

      expect(validateItem(validItem)).toBe(true);
    });

    it('should reject item with missing required fields', () => {
      const invalidItem = {
        id: 12345,
        name: 'Excalibur',
        // missing description
        category: 'Weapon' as ItemCategory,
        itemLevel: 535
      };

      expect(validateItem(invalidItem)).toBe(false);
    });

    it('should reject item with invalid category', () => {
      const invalidItem = {
        id: 12345,
        name: 'Excalibur',
        description: 'A legendary sword',
        category: 'InvalidCategory' as ItemCategory,
        subCategory: 'Sword',
        itemLevel: 535,
        requiredLevel: 80,
        rarity: 'Legendary',
        stackSize: 1,
        vendorPrice: 0,
        canBeHq: true,
        tradeable: true,
        desynthable: false,
        dyeable: false,
        stats: {},
        jobs: ['PLD'],
        obtainedFrom: ['Raid']
      };

      expect(validateItem(invalidItem)).toBe(false);
    });

    it('should reject item with negative item level', () => {
      const invalidItem = {
        id: 12345,
        name: 'Excalibur',
        description: 'A legendary sword',
        category: 'Weapon' as ItemCategory,
        subCategory: 'Sword',
        itemLevel: -1, // invalid
        requiredLevel: 80,
        rarity: 'Legendary',
        stackSize: 1,
        vendorPrice: 0,
        canBeHq: true,
        tradeable: true,
        desynthable: false,
        dyeable: false,
        stats: {},
        jobs: ['PLD'],
        obtainedFrom: ['Raid']
      };

      expect(validateItem(invalidItem)).toBe(false);
    });
  });

  describe('Achievement Validation', () => {
    it('should validate a complete achievement object', () => {
      const validAchievement = {
        id: 1001,
        name: 'Tank You, Paladin',
        description: 'Obtain the Paladin job',
        category: 'Battle' as AchievementCategory,
        subCategory: 'Job',
        points: 20,
        title: 'Defender of the Realm',
        icon: 'achievement_icon_001.png',
        isSecret: false,
        requirements: ['Complete job quest'],
        rewards: ['Title', 'Achievement Points'],
        series: 'Paladin Mastery',
        order: 1
      };

      expect(validateAchievement(validAchievement)).toBe(true);
    });

    it('should reject achievement with missing required fields', () => {
      const invalidAchievement = {
        id: 1001,
        name: 'Tank You, Paladin',
        // missing description
        category: 'Battle' as AchievementCategory,
        points: 20
      };

      expect(validateAchievement(invalidAchievement)).toBe(false);
    });

    it('should reject achievement with invalid category', () => {
      const invalidAchievement = {
        id: 1001,
        name: 'Tank You, Paladin',
        description: 'Obtain the Paladin job',
        category: 'InvalidCategory' as AchievementCategory,
        subCategory: 'Job',
        points: 20,
        title: 'Defender of the Realm',
        icon: 'achievement_icon_001.png',
        isSecret: false,
        requirements: ['Complete job quest'],
        rewards: ['Title', 'Achievement Points'],
        series: 'Paladin Mastery',
        order: 1
      };

      expect(validateAchievement(invalidAchievement)).toBe(false);
    });

    it('should reject achievement with negative points', () => {
      const invalidAchievement = {
        id: 1001,
        name: 'Tank You, Paladin',
        description: 'Obtain the Paladin job',
        category: 'Battle' as AchievementCategory,
        subCategory: 'Job',
        points: -5, // invalid
        title: 'Defender of the Realm',
        icon: 'achievement_icon_001.png',
        isSecret: false,
        requirements: ['Complete job quest'],
        rewards: ['Title', 'Achievement Points'],
        series: 'Paladin Mastery',
        order: 1
      };

      expect(validateAchievement(invalidAchievement)).toBe(false);
    });
  });

  describe('Quest Validation', () => {
    it('should validate a complete quest object', () => {
      const validQuest = {
        id: 65001,
        name: 'The Path of the Righteous',
        description: 'Speak with the guild master',
        type: 'Job Quest',
        level: 1,
        jobRequired: 'GLD',
        levelRequired: 1,
        expansionRequired: null,
        prerequisites: [],
        rewards: {
          experience: 1000,
          gil: 500,
          items: ['Iron Sword'],
          unlocks: ['Next job quest']
        },
        objectives: [
          'Speak with Lulutsu',
          'Equip your weapon',
          'Complete the trial'
        ],
        location: 'Ul\'dah',
        npcGiver: 'Lulutsu',
        isMainScenario: false,
        isSideQuest: false,
        isJobQuest: true,
        isClassQuest: true,
        isRepeatable: false
      };

      expect(validateQuest(validQuest)).toBe(true);
    });

    it('should reject quest with missing required fields', () => {
      const invalidQuest = {
        id: 65001,
        name: 'The Path of the Righteous',
        // missing description
        type: 'Job Quest',
        level: 1
      };

      expect(validateQuest(invalidQuest)).toBe(false);
    });

    it('should reject quest with invalid level', () => {
      const invalidQuest = {
        id: 65001,
        name: 'The Path of the Righteous',
        description: 'Speak with the guild master',
        type: 'Job Quest',
        level: 0, // invalid
        jobRequired: 'GLD',
        levelRequired: 1,
        expansionRequired: null,
        prerequisites: [],
        rewards: {
          experience: 1000,
          gil: 500,
          items: [],
          unlocks: []
        },
        objectives: ['Speak with Lulutsu'],
        location: 'Ul\'dah',
        npcGiver: 'Lulutsu',
        isMainScenario: false,
        isSideQuest: false,
        isJobQuest: true,
        isClassQuest: true,
        isRepeatable: false
      };

      expect(validateQuest(invalidQuest)).toBe(false);
    });
  });

  describe('Category Validation Helper Functions', () => {
    it('should validate job categories', () => {
      expect(isValidJobCategory('Tank')).toBe(true);
      expect(isValidJobCategory('Healer')).toBe(true);
      expect(isValidJobCategory('Melee DPS')).toBe(true);
      expect(isValidJobCategory('Ranged DPS')).toBe(true);
      expect(isValidJobCategory('Caster DPS')).toBe(true);
      expect(isValidJobCategory('Crafter')).toBe(true);
      expect(isValidJobCategory('Gatherer')).toBe(true);
      expect(isValidJobCategory('InvalidCategory')).toBe(false);
    });

    it('should validate item categories', () => {
      expect(isValidItemCategory('Weapon')).toBe(true);
      expect(isValidItemCategory('Armor')).toBe(true);
      expect(isValidItemCategory('Accessory')).toBe(true);
      expect(isValidItemCategory('Consumable')).toBe(true);
      expect(isValidItemCategory('Material')).toBe(true);
      expect(isValidItemCategory('Tool')).toBe(true);
      expect(isValidItemCategory('Furnishing')).toBe(true);
      expect(isValidItemCategory('Miscellany')).toBe(true);
      expect(isValidItemCategory('InvalidCategory')).toBe(false);
    });

    it('should validate achievement categories', () => {
      expect(isValidAchievementCategory('Battle')).toBe(true);
      expect(isValidAchievementCategory('PvP')).toBe(true);
      expect(isValidAchievementCategory('Character')).toBe(true);
      expect(isValidAchievementCategory('Items')).toBe(true);
      expect(isValidAchievementCategory('Crafting')).toBe(true);
      expect(isValidAchievementCategory('Gathering')).toBe(true);
      expect(isValidAchievementCategory('Quests')).toBe(true);
      expect(isValidAchievementCategory('Exploration')).toBe(true);
      expect(isValidAchievementCategory('Grand Company')).toBe(true);
      expect(isValidAchievementCategory('Legacy')).toBe(true);
      expect(isValidAchievementCategory('InvalidCategory')).toBe(false);
    });
  });
});
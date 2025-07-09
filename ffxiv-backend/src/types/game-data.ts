// src/types/game-data.ts

// Job-related types
export type JobCategory = 
  | 'Tank'
  | 'Healer'
  | 'Melee DPS'
  | 'Ranged DPS'
  | 'Caster DPS'
  | 'Crafter'
  | 'Gatherer';

export interface Job {
  id: number;
  name: string;
  abbreviation: string;
  category: JobCategory;
  maxLevel: number;
  startingLevel: number;
  classJob: string;
  unlockQuest: string;
  jobStone: string | null;
  primaryAttribute: string;
  isStartingClass: boolean;
  expansionRequired: string | null;
}

// Item-related types
export type ItemCategory = 
  | 'Weapon'
  | 'Armor'
  | 'Accessory'
  | 'Consumable'
  | 'Material'
  | 'Tool'
  | 'Furnishing'
  | 'Miscellany';

export interface Item {
  id: number;
  name: string;
  description: string;
  category: ItemCategory;
  subCategory: string;
  itemLevel: number;
  requiredLevel: number;
  rarity: string;
  stackSize: number;
  vendorPrice: number;
  canBeHq: boolean;
  tradeable: boolean;
  desynthable: boolean;
  dyeable: boolean;
  stats: Record<string, number>;
  jobs: string[];
  obtainedFrom: string[];
}

// Achievement-related types
export type AchievementCategory = 
  | 'Battle'
  | 'PvP'
  | 'Character'
  | 'Items'
  | 'Crafting'
  | 'Gathering'
  | 'Quests'
  | 'Exploration'
  | 'Grand Company'
  | 'Legacy';

export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: AchievementCategory;
  subCategory: string;
  points: number;
  title: string | null;
  icon: string;
  isSecret: boolean;
  requirements: string[];
  rewards: string[];
  series: string | null;
  order: number;
}

// Quest-related types
export interface QuestRewards {
  experience: number;
  gil: number;
  items: string[];
  unlocks: string[];
}

export interface Quest {
  id: number;
  name: string;
  description: string;
  type: string;
  level: number;
  jobRequired: string | null;
  levelRequired: number;
  expansionRequired: string | null;
  prerequisites: string[];
  rewards: QuestRewards;
  objectives: string[];
  location: string;
  npcGiver: string;
  isMainScenario: boolean;
  isSideQuest: boolean;
  isJobQuest: boolean;
  isClassQuest: boolean;
  isRepeatable: boolean;
}

export interface ItemSearchParams {
  name?: string;
  category?: ItemCategory;
  categories?: ItemCategory[];
  level?: number;
  jobRestriction?: string;
  limit?: number;
  page?: number;
}

export interface AchievementSearchParams {
  name?: string;
  category?: AchievementCategory;
  points?: number;
  limit?: number;
  page?: number;
}

export interface QuestSearchParams {
  name?: string;
  type?: string;
  level?: number;
  jobRequired?: string;
  isMainScenario?: boolean;
  limit?: number;
  page?: number;
}

// Validation functions
export function isValidJobCategory(category: string): category is JobCategory {
  const validCategories: JobCategory[] = [
    'Tank', 'Healer', 'Melee DPS', 'Ranged DPS', 'Caster DPS', 'Crafter', 'Gatherer'
  ];
  return validCategories.includes(category as JobCategory);
}

export function isValidItemCategory(category: string): category is ItemCategory {
  const validCategories: ItemCategory[] = [
    'Weapon', 'Armor', 'Accessory', 'Consumable', 'Material', 'Tool', 'Furnishing', 'Miscellany'
  ];
  return validCategories.includes(category as ItemCategory);
}

export function isValidAchievementCategory(category: string): category is AchievementCategory {
  const validCategories: AchievementCategory[] = [
    'Battle', 'PvP', 'Character', 'Items', 'Crafting', 'Gathering', 'Quests', 'Exploration', 'Grand Company', 'Legacy'
  ];
  return validCategories.includes(category as AchievementCategory);
}

export function validateJob(job: any): job is Job {
  if (!job || typeof job !== 'object') return false;
  
  // Required fields validation
  if (
    typeof job.id !== 'number' ||
    typeof job.name !== 'string' ||
    typeof job.abbreviation !== 'string' ||
    typeof job.maxLevel !== 'number' ||
    typeof job.startingLevel !== 'number' ||
    typeof job.classJob !== 'string' ||
    typeof job.unlockQuest !== 'string' ||
    typeof job.primaryAttribute !== 'string' ||
    typeof job.isStartingClass !== 'boolean'
  ) {
    return false;
  }

  // Category validation
  if (!isValidJobCategory(job.category)) {
    return false;
  }

  // Level validation
  if (job.maxLevel <= 0 || job.startingLevel <= 0 || job.startingLevel > job.maxLevel) {
    return false;
  }

  // Optional fields validation
  if (job.jobStone !== null && typeof job.jobStone !== 'string') {
    return false;
  }

  if (job.expansionRequired !== null && typeof job.expansionRequired !== 'string') {
    return false;
  }

  return true;
}

export function validateItem(item: any): item is Item {
  if (!item || typeof item !== 'object') return false;
  
  // Required fields validation
  if (
    typeof item.id !== 'number' ||
    typeof item.name !== 'string' ||
    typeof item.description !== 'string' ||
    typeof item.subCategory !== 'string' ||
    typeof item.itemLevel !== 'number' ||
    typeof item.requiredLevel !== 'number' ||
    typeof item.rarity !== 'string' ||
    typeof item.stackSize !== 'number' ||
    typeof item.vendorPrice !== 'number' ||
    typeof item.canBeHq !== 'boolean' ||
    typeof item.tradeable !== 'boolean' ||
    typeof item.desynthable !== 'boolean' ||
    typeof item.dyeable !== 'boolean'
  ) {
    return false;
  }

  // Category validation
  if (!isValidItemCategory(item.category)) {
    return false;
  }

  // Level validation
  if (item.itemLevel < 0 || item.requiredLevel < 0) {
    return false;
  }

  // Object/array validation
  if (
    !item.stats || typeof item.stats !== 'object' ||
    !Array.isArray(item.jobs) ||
    !Array.isArray(item.obtainedFrom)
  ) {
    return false;
  }

  // Validate jobs array contains only strings
  if (!item.jobs.every((job: any) => typeof job === 'string')) {
    return false;
  }

  // Validate obtainedFrom array contains only strings
  if (!item.obtainedFrom.every((source: any) => typeof source === 'string')) {
    return false;
  }

  return true;
}

export function validateAchievement(achievement: any): achievement is Achievement {
  if (!achievement || typeof achievement !== 'object') return false;
  
  // Required fields validation
  if (
    typeof achievement.id !== 'number' ||
    typeof achievement.name !== 'string' ||
    typeof achievement.description !== 'string' ||
    typeof achievement.subCategory !== 'string' ||
    typeof achievement.points !== 'number' ||
    typeof achievement.icon !== 'string' ||
    typeof achievement.isSecret !== 'boolean' ||
    typeof achievement.order !== 'number'
  ) {
    return false;
  }

  // Category validation
  if (!isValidAchievementCategory(achievement.category)) {
    return false;
  }

  // Points validation
  if (achievement.points < 0) {
    return false;
  }

  // Optional fields validation
  if (achievement.title !== null && typeof achievement.title !== 'string') {
    return false;
  }

  if (achievement.series !== null && typeof achievement.series !== 'string') {
    return false;
  }

  // Array validation
  if (
    !Array.isArray(achievement.requirements) ||
    !Array.isArray(achievement.rewards)
  ) {
    return false;
  }

  // Validate requirements array contains only strings
  if (!achievement.requirements.every((req: any) => typeof req === 'string')) {
    return false;
  }

  // Validate rewards array contains only strings
  if (!achievement.rewards.every((reward: any) => typeof reward === 'string')) {
    return false;
  }

  return true;
}

export function validateQuest(quest: any): quest is Quest {
  if (!quest || typeof quest !== 'object') return false;
  
  // Required fields validation
  if (
    typeof quest.id !== 'number' ||
    typeof quest.name !== 'string' ||
    typeof quest.description !== 'string' ||
    typeof quest.type !== 'string' ||
    typeof quest.level !== 'number' ||
    typeof quest.levelRequired !== 'number' ||
    typeof quest.location !== 'string' ||
    typeof quest.npcGiver !== 'string' ||
    typeof quest.isMainScenario !== 'boolean' ||
    typeof quest.isSideQuest !== 'boolean' ||
    typeof quest.isJobQuest !== 'boolean' ||
    typeof quest.isClassQuest !== 'boolean' ||
    typeof quest.isRepeatable !== 'boolean'
  ) {
    return false;
  }

  // Level validation
  if (quest.level <= 0 || quest.levelRequired < 0) {
    return false;
  }

  // Optional fields validation
  if (quest.jobRequired !== null && typeof quest.jobRequired !== 'string') {
    return false;
  }

  if (quest.expansionRequired !== null && typeof quest.expansionRequired !== 'string') {
    return false;
  }

  // Array validation
  if (
    !Array.isArray(quest.prerequisites) ||
    !Array.isArray(quest.objectives)
  ) {
    return false;
  }

  // Validate prerequisites array contains only strings
  if (!quest.prerequisites.every((prereq: any) => typeof prereq === 'string')) {
    return false;
  }

  // Validate objectives array contains only strings
  if (!quest.objectives.every((objective: any) => typeof objective === 'string')) {
    return false;
  }

  // Rewards validation
  if (!quest.rewards || typeof quest.rewards !== 'object') {
    return false;
  }

  const { rewards } = quest;
  if (
    typeof rewards.experience !== 'number' ||
    typeof rewards.gil !== 'number' ||
    !Array.isArray(rewards.items) ||
    !Array.isArray(rewards.unlocks)
  ) {
    return false;
  }

  // Validate rewards arrays contain only strings
  if (
    !rewards.items.every((item: any) => typeof item === 'string') ||
    !rewards.unlocks.every((unlock: any) => typeof unlock === 'string')
  ) {
    return false;
  }

  return true;
}
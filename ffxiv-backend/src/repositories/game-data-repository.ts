// Types for game data
import prisma from '../database/client';
export type GameDataType = 'jobs' | 'items' | 'achievements' | 'quests';

export interface GameDataEntry {
  type: GameDataType;
  data: any;
}

// Create a new game data entry
export async function createGameData(
  type: GameDataType,
  data: any[]
): Promise<GameDataEntry> {
  switch (type) {
    case 'jobs':
      for (const job of data) {
        const exists = await prisma.job.findUnique({ where: { name: job.name } });
        if (!exists) {
          await prisma.job.create({ data: job });
        }
      }
      break;
    case 'achievements':
      for (const achievement of data) {
        // Assuming 'gameId' is the unique field for achievements
        const exists = await prisma.achievement.findUnique({ where: { gameId: achievement.gameId } });
        if (!exists) {
          await prisma.achievement.create({ data: achievement });
        }
      }
      break;
    // Add more cases for other types as needed
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
  return { type, data };
}

// Retrieve game data by type
export async function getGameDataByType(type: GameDataType): Promise<GameDataEntry | null> {
    let data: any[] = [];
    switch (type) {
      case 'jobs':
        data = await prisma.job.findMany();
        break;
      case 'achievements':
        data = await prisma.achievement.findMany();
        break;
      // Add more cases as needed
      default:
        return null;
    }

    return {
        type,
        data
    };
}

// Update existing game data entry
export async function updateGameData(
  type: GameDataType,
  data: any
): Promise<GameDataEntry | null> {
  // Implementation will be added later
  return null;
}

// Delete game data entry
export async function deleteGameData(
  type: GameDataType
): Promise<void> {
  // Implementation will be added later
}

// Get the version string for a data type
export async function getGameDataVersion(
  type: GameDataType
): Promise<string | null> {
  // Implementation will be added later
  return null;
}

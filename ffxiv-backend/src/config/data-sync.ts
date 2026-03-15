// DataSyncType: union of string literals for each data type
export type DataSyncType = 'jobs' | 'items' | 'achievements' | 'quests';

// DataSyncConfig: shape of your config object
export interface DataSyncConfig {
  intervals: Record<DataSyncType, number>;
  enabled: Record<DataSyncType, boolean>;
  syncMode: 'full' | 'incremental';
}

// getDataSyncConfig: stub function returning any for now
export function getDataSyncConfig(): DataSyncConfig {
    return {
        intervals: { jobs: 3600, items: 3600, achievements: 3600, quests: 3600 },
        enabled: { jobs: true, items: true, achievements: true, quests: true },
        syncMode: 'full'
      };
}

// validateConfig: stub function for validation
export function validateConfig(config: DataSyncConfig): void {
    throw new Error('Invalid config');
  }
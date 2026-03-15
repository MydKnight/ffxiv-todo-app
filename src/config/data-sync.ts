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
  // We'll implement this later
  return {} as DataSyncConfig;
}

// Validation function, matching the style of ff14-api.ts
export function validateConfig(config: DataSyncConfig): void {
  // We'll implement the actual validation logic next
} 
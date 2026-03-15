import { getDataSyncConfig, DataSyncConfig, DataSyncType, validateConfig } from '../../src/config/data-sync';

describe('Data Sync Configuration', () => {
  it('should provide default sync intervals for all data types', () => {
    const config = getDataSyncConfig();
    expect(config.intervals.jobs).toBeGreaterThan(0);
    expect(config.intervals.items).toBeGreaterThan(0);
    expect(config.intervals.achievements).toBeGreaterThan(0);
    expect(config.intervals.quests).toBeGreaterThan(0);
  });

  it('should allow enabling/disabling sync for each data type', () => {
    const config: DataSyncConfig = getDataSyncConfig();
    expect(typeof config.enabled.jobs).toBe('boolean');
    expect(typeof config.enabled.items).toBe('boolean');
    expect(typeof config.enabled.achievements).toBe('boolean');
    expect(typeof config.enabled.quests).toBe('boolean');
  });

  it('should validate that all required data types are present', () => {
    const config = getDataSyncConfig();
    const requiredTypes: DataSyncType[] = ['jobs', 'items', 'achievements', 'quests'];
    requiredTypes.forEach(type => {
      expect(config.intervals[type]).toBeDefined();
      expect(config.enabled[type]).toBeDefined();
    });
  });

  it('should throw or return error for invalid configuration', () => {
    // Simulate loading an invalid config (e.g., negative interval)
    expect(() => {
      // You might have a validateConfig function or similar
      validateConfig({
        intervals: { jobs: -10, items: 0, achievements: 0, quests: 0 },
        enabled: { jobs: true, items: true, achievements: true, quests: true },
        syncMode: 'full'
      });
    }).toThrow();
  });

  it('should support custom sync options (e.g., full vs. incremental)', () => {
    const config = getDataSyncConfig();
    expect(['full', 'incremental']).toContain(config.syncMode);
  });
}); 
import { FF14ApiConfig, validateConfig, getEndpointUrl, FF14ApiConfigType } from '../../src/config/ff14-api';

describe('FF14ApiConfig', () => {
  describe('validateConfig', () => {
    it('should validate a complete configuration', () => {
      const config = {
        baseUrl: 'https://xivapi.com',
        timeout: 5000,
        rateLimit: {
          requestsPerSecond: 20,
          burstLimit: 100
        },
        endpoints: {
          character: '/character',
          freeCompany: '/freecompany',
          linkshell: '/linkshell',
          pvpTeam: '/pvpteam',
          search: '/search',
          servers: '/servers',
          jobs: '/classjob',
          items: '/item',
          achievements: '/achievement',
          quests: '/quest',
          actions: '/action',
          mounts: '/mount',
          minions: '/companion',
          emotes: '/emote'
        }
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should throw error for missing baseUrl', () => {
      const config = {
        timeout: 5000,
        rateLimit: { requestsPerSecond: 20, burstLimit: 100 },
        endpoints: { character: '/character' }
      };

      expect(() => validateConfig(config as any)).toThrow('baseUrl is required');
    });

    it('should throw error for invalid baseUrl format', () => {
      const config = {
        baseUrl: 'not-a-url',
        timeout: 5000,
        rateLimit: { requestsPerSecond: 20, burstLimit: 100 },
        endpoints: { character: '/character' }
      } as FF14ApiConfigType;

      expect(() => validateConfig(config)).toThrow('baseUrl must be a valid URL');
    });

    it('should throw error for missing endpoints', () => {
      const config = {
        baseUrl: 'https://xivapi.com',
        timeout: 5000,
        rateLimit: { requestsPerSecond: 20, burstLimit: 100 }
      };

      expect(() => validateConfig(config as any)).toThrow('endpoints configuration is required');
    });

    it('should throw error for negative timeout', () => {
      const config = {
        baseUrl: 'https://xivapi.com',
        timeout: -1000,
        rateLimit: { requestsPerSecond: 20, burstLimit: 100 },
        endpoints: { character: '/character' }
      }as FF14ApiConfigType;

      expect(() => validateConfig(config)).toThrow('timeout must be a positive number');
    });

    it('should throw error for invalid rate limit configuration', () => {
      const config = {
        baseUrl: 'https://xivapi.com',
        timeout: 5000,
        rateLimit: { requestsPerSecond: -5, burstLimit: 100 },
        endpoints: { character: '/character' }
      } as FF14ApiConfigType;

      expect(() => validateConfig(config)).toThrow('requestsPerSecond must be a positive number');
    });

    it('should use default values for optional fields', () => {
      const config = {
        baseUrl: 'https://xivapi.com',
        endpoints: { character: '/character' }
      }as FF14ApiConfigType;

      expect(() => validateConfig(config)).not.toThrow();
    });
  });

  describe('getEndpointUrl', () => {
    const mockConfig = {
      baseUrl: 'https://xivapi.com',
      timeout: 5000,
      rateLimit: { requestsPerSecond: 20, burstLimit: 100 },
      endpoints: {
        character: '/character',
        search: '/search',
        items: '/item'
      }
    } as FF14ApiConfigType;

    it('should construct correct URL for character endpoint', () => {
      const url = getEndpointUrl(mockConfig, 'character');
      expect(url).toBe('https://xivapi.com/character');
    });

    it('should construct correct URL with character ID', () => {
      const url = getEndpointUrl(mockConfig, 'character', '12345');
      expect(url).toBe('https://xivapi.com/character/12345');
    });

    it('should construct correct URL with query parameters', () => {
      const url = getEndpointUrl(mockConfig, 'search', undefined, { name: 'test', server: 'gilgamesh' });
      expect(url).toBe('https://xivapi.com/search?name=test&server=gilgamesh');
    });

    it('should construct correct URL with ID and query parameters', () => {
      const url = getEndpointUrl(mockConfig, 'items', '1675', { columns: 'ID,Name,Description' });
      expect(url).toBe('https://xivapi.com/item/1675?columns=ID%2CName%2CDescription');
    });

    it('should throw error for unknown endpoint', () => {
      expect(() => getEndpointUrl(mockConfig, 'unknown' as any)).toThrow('Unknown endpoint: unknown');
    });

    it('should handle empty query parameters', () => {
      const url = getEndpointUrl(mockConfig, 'character', '12345', {});
      expect(url).toBe('https://xivapi.com/character/12345');
    });
  });

  describe('default configuration', () => {
    it('should export a valid default configuration', () => {
      expect(() => validateConfig(FF14ApiConfig)).not.toThrow();
    });

    it('should have all required endpoints defined', () => {
      const requiredEndpoints = [
        'character', 'freeCompany', 'linkshell', 'pvpTeam', 'search', 
        'servers', 'jobs', 'items', 'achievements', 'quests', 'actions',
        'mounts', 'minions', 'emotes'
      ];

      requiredEndpoints.forEach(endpoint => {
        expect(FF14ApiConfig.endpoints).toHaveProperty(endpoint);
        expect(typeof FF14ApiConfig.endpoints[endpoint]).toBe('string');
      });
    });

    it('should have reasonable default values', () => {
      expect(FF14ApiConfig.baseUrl).toBe('https://xivapi.com');
      expect(FF14ApiConfig.timeout).toBeGreaterThan(0);
      expect(FF14ApiConfig.rateLimit.requestsPerSecond).toBeGreaterThan(0);
      expect(FF14ApiConfig.rateLimit.burstLimit).toBeGreaterThan(0);
    });
  });
});
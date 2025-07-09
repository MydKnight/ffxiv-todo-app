// tests/clients/ff14-api-client.test.ts
import { FF14APIClient, FF14APIClientError, createFF14APIClient } from '../../src/clients/ff14-api-client';
import { HttpClient } from '../../src/clients/http-client';
import { RateLimiter } from '../../src/utils/rate-limiter';
import { FF14ApiConfigType, getConfig } from '../../src/config/ff14-api';
import { Job, Item, Achievement, Quest, ItemSearchParams, AchievementSearchParams } from '../../src/types/game-data';

// Mock dependencies
jest.mock('../../src/clients/http-client');
jest.mock('../../src/utils/rate-limiter');
jest.mock('../../src/config/ff14-api');

const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;
const MockRateLimiter = RateLimiter as jest.MockedClass<typeof RateLimiter>;
const MockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>;

describe('FF14APIClient', () => {
  let mockHttpClient: jest.Mocked<HttpClient>;
  let mockRateLimiter: jest.Mocked<RateLimiter>;
  let apiClient: FF14APIClient;
  let mockConfig: FF14ApiConfigType;

  const mockJob: Job = {
    id: 1,
    name: 'Paladin',
    abbreviation: 'PLD',
    category: 'Tank',
    startingLevel: 1,
    maxLevel: 90,
    classJob: 'Paladin',
    jobStone: 'Paladin Stone',
    isStartingClass: false,
    unlockQuest: 'A Knight’s Beginning',
    expansionRequired: 'A Realm Reborn',
    primaryAttribute: 'Strength'
  };

  const mockItem: Item = {
    id: 1,
    name: 'Iron Sword',
    description: 'A basic iron sword',
    category: 'Weapon',
    rarity: 'common',
    stackSize: 1,
    itemLevel: 1,
    subCategory: 'Sword',
    requiredLevel: 1,
    vendorPrice: 100,
    canBeHq: true,
    tradeable: true,
    desynthable: false,
    dyeable: false,
    stats: {},
    jobs: ['Paladin', 'Warrior'],
    obtainedFrom: ['Vendors']
  };

  const mockAchievement: Achievement = {
    id: 1,
    name: 'First Steps',
    description: 'Complete your first quest',
    category: 'Quests',
    subCategory: 'General',
    icon: 'achievement_icon.png',
    title: 'Adventurer',
    isSecret: false,
    rewards: ['title'],
    series: 'A Realm Reborn',
    order: 1,
    points: 10,
    requirements: ['Complete any quest']
  };

  const mockQuest: Quest = {
    id: 1,
    name: 'A New Beginning',
    type: 'Main Scenario',
    jobRequired: 'Adventurer',
    levelRequired: 1,
    expansionRequired: 'A Realm Reborn',
    objectives: ['Speak with the Adventurers\' Guild'],
    location: 'Gridania',
    npcGiver: 'Adventurers\' Guild',
    isMainScenario: true,
    isSideQuest: false,
    isJobQuest: false,
    isClassQuest: false,
    isRepeatable: false,
    description: 'Start your adventure',
    level: 1,
    prerequisites: [],
    rewards: {
      experience: 100,
      gil: 0,
      items: [],
      unlocks: []
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock HTTP client
    mockHttpClient = {
      get: jest.fn().mockResolvedValue({})
    } as any as jest.Mocked<HttpClient>;
    MockHttpClient.mockImplementation(() => mockHttpClient);

    // Mock rate limiter
    mockRateLimiter = {
      tryConsume: jest.fn().mockReturnValue({ allowed: true, tokensRemaining: 50 })
    } as any as jest.Mocked<RateLimiter>;
    MockRateLimiter.mockImplementation(() => mockRateLimiter);

    // Mock config
    mockConfig = {
      baseUrl: 'https://api.ff14.com',
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
    MockGetConfig.mockReturnValue(mockConfig);

    apiClient = new FF14APIClient();
  });

  describe('constructor', () => {
    it('should create client with default options', () => {
      const client = new FF14APIClient();
      expect(client).toBeInstanceOf(FF14APIClient);
    });

    it('should create client with custom options', () => {
      const options = {
        baseUrl: 'https://custom.api.com',
        timeout: 10000,
        retryAttempts: 5,
        retryDelay: 2000,
        rateLimit: {
          maxTokens: 100,     // Not maxRequests
          refillRate: 100,    // Missing
          refillInterval: 60000  // Not windowMs
        }
      };

      const client = new FF14APIClient(options);
      expect(client).toBeInstanceOf(FF14APIClient);
      expect(MockGetConfig).toHaveBeenLastCalledWith({
        baseUrl: options.baseUrl,
        timeout: options.timeout
      });
    });

    it('should use default rate limit if not provided', () => {
      new FF14APIClient();
      expect(MockRateLimiter).toHaveBeenCalledWith({
        maxTokens: 100,
        refillRate: 100,
        refillInterval: 60000
      });
    });
  });

  describe('getJobs', () => {
    it('should return array of jobs', async () => {
      const jobs = [mockJob];
      mockHttpClient.get.mockResolvedValue(jobs);

      const result = await apiClient.getJobs();

      expect(mockRateLimiter.tryConsume).toHaveBeenCalled();
      expect(mockHttpClient.get).toHaveBeenCalledWith('https://api.ff14.com/jobs');
      expect(result).toEqual(jobs);
    });

    it('should handle empty job array', async () => {
      mockHttpClient.get.mockResolvedValue([]);

      const result = await apiClient.getJobs();

      expect(result).toEqual([]);
    });

    it('should validate job data structure', async () => {
      const invalidJob = { id: 1, name: 'Test' }; // Missing required fields
      mockHttpClient.get.mockResolvedValue([invalidJob]);

      await expect(apiClient.getJobs()).rejects.toThrow(FF14APIClientError);
    });
  });

  describe('getJob', () => {
    it('should return specific job by ID', async () => {
      mockHttpClient.get.mockResolvedValue(mockJob);

      const result = await apiClient.getJob(1);

      expect(mockHttpClient.get).toHaveBeenCalledWith('https://api.ff14.com/jobs/1');
      expect(result).toEqual(mockJob);
    });

    it('should handle job not found', async () => {
      const error = new Error('HTTP 404: Not Found');
      mockHttpClient.get.mockRejectedValue(error);

      await expect(apiClient.getJob(999)).rejects.toThrow(FF14APIClientError);
    });
  });

  describe('searchItems', () => {
    it('should return items without parameters', async () => {
      const items = [mockItem];
      mockHttpClient.get.mockResolvedValue(items);

      const result = await apiClient.searchItems();

      expect(mockHttpClient.get).toHaveBeenCalledWith('https://api.ff14.com/items');
      expect(result).toEqual(items);
    });

    it('should return items with search parameters', async () => {
      const items = [mockItem];
      const params: ItemSearchParams = { name: 'sword', category: 'Weapon', level: 1 };
      mockHttpClient.get.mockResolvedValue(items);

      const result = await apiClient.searchItems(params);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://api.ff14.com/items?name=sword&category=Weapon&level=1'
      );
      expect(result).toEqual(items);
    });

    it('should handle array parameters', async () => {
      const items = [mockItem];
      const params: ItemSearchParams = { categories: ['Weapon', 'Armor'] };
      mockHttpClient.get.mockResolvedValue(items);

      await apiClient.searchItems(params);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://api.ff14.com/items?categories=Weapon&categories=Armor'
      );
    });

    it('should skip undefined and null parameters', async () => {
      const items = [mockItem];
      const params = { name: 'sword', category: undefined, minLevel: null, maxLevel: '' };
      mockHttpClient.get.mockResolvedValue(items);

      await apiClient.searchItems(params);

      expect(mockHttpClient.get).toHaveBeenCalledWith('https://api.ff14.com/items?name=sword');
    });
  });

  describe('getItem', () => {
    it('should return specific item by ID', async () => {
      mockHttpClient.get.mockResolvedValue(mockItem);

      const result = await apiClient.getItem(1);

      expect(mockHttpClient.get).toHaveBeenCalledWith('https://api.ff14.com/items/1');
      expect(result).toEqual(mockItem);
    });
  });

  describe('searchAchievements', () => {
    it('should return achievements without parameters', async () => {
      const achievements = [mockAchievement];
      mockHttpClient.get.mockResolvedValue(achievements);

      const result = await apiClient.searchAchievements();

      expect(mockHttpClient.get).toHaveBeenCalledWith('https://api.ff14.com/achievements');
      expect(result).toEqual(achievements);
    });

    it('should return achievements with search parameters', async () => {
      const achievements = [mockAchievement];
      const params: AchievementSearchParams = { category: 'Quests', points: 15 };
      mockHttpClient.get.mockResolvedValue(achievements);

      const result = await apiClient.searchAchievements(params);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://api.ff14.com/achievements?category=Quests&points=15'
      );
      expect(result).toEqual(achievements);
    });
  });

  describe('getAchievement', () => {
    it('should return specific achievement by ID', async () => {
      mockHttpClient.get.mockResolvedValue(mockAchievement);

      const result = await apiClient.getAchievement(1);

      expect(mockHttpClient.get).toHaveBeenCalledWith('https://api.ff14.com/achievements/1');
      expect(result).toEqual(mockAchievement);
    });
  });

  describe('searchQuests', () => {
    it('should return quests without parameters', async () => {
      const quests = [mockQuest];
      mockHttpClient.get.mockResolvedValue(quests);

      const result = await apiClient.searchQuests();

      expect(mockHttpClient.get).toHaveBeenCalledWith('https://api.ff14.com/quests');
      expect(result).toEqual(quests);
    });

    it('should return quests with search parameters', async () => {
      const quests = [mockQuest];
      const params = { level: 10 };
      mockHttpClient.get.mockResolvedValue(quests);

      const result = await apiClient.searchQuests(params);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://api.ff14.com/quests?level=10'
      );
      expect(result).toEqual(quests);
    });
  });

  describe('getQuest', () => {
    it('should return specific quest by ID', async () => {
      mockHttpClient.get.mockResolvedValue(mockQuest);

      const result = await apiClient.getQuest(1);

      expect(mockHttpClient.get).toHaveBeenCalledWith('https://api.ff14.com/quests/1');
      expect(result).toEqual(mockQuest);
    });
  });

  describe('healthCheck', () => {
    it('should return ok status when API is healthy', async () => {
      const healthResponse = { status: 'ok', timestamp: '2024-01-01T00:00:00Z' };
      mockHttpClient.get.mockResolvedValue(healthResponse);

      const result = await apiClient.healthCheck();

      expect(mockHttpClient.get).toHaveBeenCalledWith('https://api.ff14.com/health');
      expect(result).toEqual({ status: 'ok', timestamp: '2024-01-01T00:00:00Z' });
    });

    it('should return error status when API is unhealthy', async () => {
      const healthResponse = { status: 'error', timestamp: '2024-01-01T00:00:00Z' };
      mockHttpClient.get.mockResolvedValue(healthResponse);

      const result = await apiClient.healthCheck();

      expect(result).toEqual({ status: 'error', timestamp: '2024-01-01T00:00:00Z' });
    });

    it('should handle missing timestamp in response', async () => {
      const healthResponse = { status: 'ok' };
      mockHttpClient.get.mockResolvedValue(healthResponse);

      const result = await apiClient.healthCheck();

      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });

    it('should return error status when request fails', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'));

      const result = await apiClient.healthCheck();

      expect(result.status).toBe('error');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return rate limit status', () => {
      const status = { remaining: 25, resetTime: Date.now() + 30000 };
      
      // Add getStatus to your mock object
      mockRateLimiter.getStatus = jest.fn().mockReturnValueOnce({
        allowed: true,
        tokensRemaining: status.remaining,
        resetTime: status.resetTime
      });

      const result = apiClient.getRateLimitStatus();

      expect(result).toEqual(status);
    });
  });

  describe('error handling', () => {
    it('should throw FF14APIClientError when rate limit exceeded', async () => {
      mockRateLimiter.tryConsume.mockReturnValueOnce({ 
        allowed: false, 
        tokensRemaining: 0,
        resetTime: Date.now() + 60000
      });

      await expect(apiClient.getJobs()).rejects.toThrow(FF14APIClientError);
    });

    it('should include rate limit message in error', async () => {
      mockRateLimiter.tryConsume.mockReturnValueOnce({ 
        allowed: false, 
        tokensRemaining: 0,
        resetTime: Date.now() + 60000
      });

      await expect(apiClient.getJobs()).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle HTTP errors', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('HTTP 500: Internal Server Error'));

      await expect(apiClient.getJobs()).rejects.toThrow(FF14APIClientError);
    });

    it('should handle network errors', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('ENOTFOUND'));

      await expect(apiClient.getJobs()).rejects.toThrow(FF14APIClientError);
      await expect(apiClient.getJobs()).rejects.toThrow('Network error');
    });

    it('should handle 404 errors with fallback for arrays', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('HTTP 404: Not Found'));

      const result = await apiClient.getJobs();

      expect(result).toEqual([]);
    });

    it('should throw error for 404 on single item requests', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('HTTP 404: Not Found'));

      await expect(apiClient.getJob(999)).rejects.toThrow(FF14APIClientError);
    });

    it('should handle unknown errors gracefully', async () => {
      mockHttpClient.get.mockRejectedValue('Unknown error');

      await expect(apiClient.getJobs()).rejects.toThrow(FF14APIClientError);
    });
  });

  describe('createFF14APIClient factory', () => {
    it('should create client with default options', () => {
      const client = createFF14APIClient();
      expect(client).toBeInstanceOf(FF14APIClient);
    });

    it('should create client with custom options', () => {
      const options = { baseURL: 'https://test.com', timeout: 3000 };
      const client = createFF14APIClient(options);
      expect(client).toBeInstanceOf(FF14APIClient);
    });
  });
});

describe('FF14APIClientError', () => {
  it('should create error with message only', () => {
    const error = new FF14APIClientError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('FF14APIClientError');
    expect(error.statusCode).toBeUndefined();
    expect(error.endpoint).toBeUndefined();
    expect(error.originalError).toBeUndefined();
  });

  it('should create error with all properties', () => {
    const originalError = new Error('Original error');
    const error = new FF14APIClientError('Test error', 404, '/api/test', originalError);
    
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(404);
    expect(error.endpoint).toBe('/api/test');
    expect(error.originalError).toBe(originalError);
  });
});
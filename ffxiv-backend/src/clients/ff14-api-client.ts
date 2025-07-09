import { HttpClient } from './http-client';
import { RateLimiter, RateLimitConfig } from '../utils/rate-limiter';
import { FF14ApiConfig, FF14ApiConfigType, getConfig } from '../config/ff14-api';
import {
  Job,
  Item,
  Achievement,
  Quest,
  ItemSearchParams,
  AchievementSearchParams,
  QuestSearchParams,
  validateJob,
  validateItem,
  validateAchievement,
  validateQuest
} from '../types/game-data';

export interface FF14APIClientOptions {
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  rateLimit?: {
    maxTokens: number;
    refillRate: number;
    refillInterval: number;
  };
}

export class FF14APIClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'FF14APIClientError';
  }
}

export class FF14APIClient {
  private httpClient: HttpClient;
  private rateLimiter: RateLimiter;
  private config: FF14ApiConfigType;
  private readonly rateLimitKey = 'ff14-api-client'; // Single key for all requests

  constructor(options: FF14APIClientOptions = {}) {
    // Use the getConfig function to properly merge configurations
    this.config = getConfig({
      baseUrl: options.baseUrl,
      timeout: options.timeout,
      // Note: retryAttempts and retryDelay are not part of FF14ApiConfigType
      // They will be handled directly by HttpClient
    });

    this.httpClient = new HttpClient({
      timeout: this.config.timeout,
      maxRetries: options.retryAttempts,
      retryDelay: options.retryDelay
    });

    // Convert rate limit options to match RateLimiter expected format
    const rateLimit = options.rateLimit || { 
      maxTokens: 100, 
      refillRate: 100, 
      refillInterval: 60000 // 100 requests per minute
    };
    
    this.rateLimiter = new RateLimiter({
      maxTokens: rateLimit.maxTokens,
      refillRate: rateLimit.refillRate,
      refillInterval: rateLimit.refillInterval
    });
  }

  /**
   * Get all jobs with their information
   */
  async getJobs(): Promise<Job[]> {
    return this.makeRequest<Job[]>('jobs', [], validateJob);
  }

  /**
   * Get a specific job by ID
   */
  async getJob(id: number): Promise<Job> {
    return this.makeRequest<Job>(`jobs/${id}`, null, validateJob);
  }

  /**
   * Search for items with optional filters
   */
  async searchItems(params: ItemSearchParams = {}): Promise<Item[]> {
    const queryParams = this.buildQueryParams(params);
    const endpoint = queryParams ? `items?${queryParams}` : 'items';
    return this.makeRequest<Item[]>(endpoint, [], validateItem);
  }

  /**
   * Get a specific item by ID
   */
  async getItem(id: number): Promise<Item> {
    return this.makeRequest<Item>(`items/${id}`, null, validateItem);
  }

  /**
   * Search for achievements with optional filters
   */
  async searchAchievements(params: AchievementSearchParams = {}): Promise<Achievement[]> {
    const queryParams = this.buildQueryParams(params);
    const endpoint = queryParams ? `achievements?${queryParams}` : 'achievements';
    return this.makeRequest<Achievement[]>(endpoint, [], validateAchievement);
  }

  /**
   * Get a specific achievement by ID
   */
  async getAchievement(id: number): Promise<Achievement> {
    return this.makeRequest<Achievement>(`achievements/${id}`, null, validateAchievement);
  }

  /**
   * Search for quests with optional filters
   */
  async searchQuests(params: QuestSearchParams = {}): Promise<Quest[]> {
    const queryParams = this.buildQueryParams(params);
    const endpoint = queryParams ? `quests?${queryParams}` : 'quests';
    return this.makeRequest<Quest[]>(endpoint, [], validateQuest);
  }

  /**
   * Get a specific quest by ID
   */
  async getQuest(id: number): Promise<Quest> {
    return this.makeRequest<Quest>(`quests/${id}`, null, validateQuest);
  }

  /**
   * Check if the API is available
   */
  async healthCheck(): Promise<{ status: 'ok' | 'error'; timestamp: string }> {
    try {
      const rateLimitResult = this.rateLimiter.tryConsume(this.rateLimitKey);
      if (!rateLimitResult.allowed) {
        throw new Error('Rate limit exceeded');
      }

      const response = await this.httpClient.get(
        `${this.config.baseUrl}/health`
      ) as { status: string; timestamp: string };
      
      return {
        status: response.status === 'ok' ? 'ok' : 'error',
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get current rate limit status
   */
 getRateLimitStatus(): { remaining: number; resetTime: number } {
  // Use getStatus instead of tryConsume to avoid consuming tokens
  const result = this.rateLimiter.getStatus(this.rateLimitKey);
  return { 
    remaining: result.tokensRemaining, 
    resetTime: result.resetTime
  };
}

  /**
   * Make a rate-limited request to the API
   */
  private async makeRequest<T>(
    endpoint: string,
    fallbackValue: T | null,
    validator: (data: any) => boolean
  ): Promise<T> {
    try {
      // Check rate limit
      const rateLimitResult = this.rateLimiter.tryConsume(this.rateLimitKey);
      if (!rateLimitResult.allowed) {
        throw new FF14APIClientError(
          'Rate limit exceeded. Please try again later.',
          429,
          endpoint
        );
      }

      // Make the request - use the correct baseUrl property
      const url = `${this.config.baseUrl}/${endpoint}`;
      const response = await this.httpClient.get(url) as T;

      // Validate response based on expected type
      if (Array.isArray(response)) {
        // For arrays, validate each item
        for (const item of response) {
          if (!validator(item)) {
            throw new FF14APIClientError(
              `Invalid data structure received from ${endpoint}`,
              200,
              endpoint
            );
          }
        }
      } else if (response !== null && !validator(response)) {
        throw new FF14APIClientError(
          `Invalid data structure received from ${endpoint}`,
          200,
          endpoint
        );
      }

      return response;
    } catch (error) {
      if (error instanceof FF14APIClientError) {
        throw error;
      }

      // Handle rate limit errors
      if (error instanceof Error && error.message.includes('Rate limit')) {
        throw new FF14APIClientError(
          'Rate limit exceeded. Please try again later.',
          429,
          endpoint,
          error
        );
      }

      // Handle HTTP errors
      if (error instanceof Error && error.message.includes('HTTP')) {
        const statusMatch = error.message.match(/HTTP (\d+)/);
        const statusCode = statusMatch ? parseInt(statusMatch[1]) : undefined;
        
        if (statusCode === 404 && fallbackValue !== null) {
          return fallbackValue;
        }
        
        throw new FF14APIClientError(
          `API request failed: ${error.message}`,
          statusCode,
          endpoint,
          error
        );
      }

      // Handle network errors
      throw new FF14APIClientError(
        `Network error when accessing ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        endpoint,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Build query parameters string from search params
   */
  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    }
    
    return searchParams.toString();
  }
}

// Factory function for easy instantiation
export function createFF14APIClient(options: FF14APIClientOptions = {}): FF14APIClient {
  return new FF14APIClient(options);
}
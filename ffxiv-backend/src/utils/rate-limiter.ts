/**
 * Rate Limiter using Token Bucket Algorithm
 * 
 * Features:
 * - Token bucket rate limiting per key
 * - Configurable token refill rate and interval
 * - Memory cleanup for unused buckets
 * - Thread-safe operations
 * - Detailed rate limit information
 */

export interface RateLimitConfig {
  /** Maximum number of tokens in the bucket */
  maxTokens: number;
  
  /** Number of tokens to add per refill interval */
  refillRate: number;
  
  /** Interval in milliseconds between token refills */
  refillInterval: number;
  
  /** How often to clean up unused buckets (default: 5 minutes) */
  cleanupInterval?: number;
  
  /** Time in milliseconds after which unused buckets are cleaned up (default: 10 minutes) */
  bucketTTL?: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  
  /** Number of tokens remaining in the bucket */
  tokensRemaining: number;
  
  /** Timestamp when the bucket will be fully refilled */
  resetTime: number;
  
  /** Time in milliseconds until next token is available */
  retryAfter?: number;
}

interface TokenBucket {
  /** Current number of tokens */
  tokens: number;
  
  /** Last time the bucket was refilled */
  lastRefill: number;
  
  /** Last time the bucket was accessed */
  lastAccessed: number;
}

export class RateLimiter {
  private readonly config: Required<RateLimitConfig>;
  private readonly buckets: Map<string, TokenBucket> = new Map();
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: RateLimitConfig) {
    this.validateConfig(config);
    
    this.config = {
      maxTokens: config.maxTokens,
      refillRate: config.refillRate,
      refillInterval: config.refillInterval,
      cleanupInterval: config.cleanupInterval ?? 5 * 60 * 1000, // 5 minutes
      bucketTTL: config.bucketTTL ?? 10 * 60 * 1000, // 10 minutes
    };

    this.startCleanupTimer();
  }

  /**
   * Attempt to consume a token from the bucket for the given key
   * @param key - Unique identifier for the rate limit bucket
   * @returns Rate limit result with current status
   */
  public tryConsume(key: string): RateLimitResult {
    const bucket = this.getOrCreateBucket(key);
    const now = Date.now();

    // Update bucket's last accessed time
    bucket.lastAccessed = now;

    // Refill tokens based on elapsed time
    this.refillBucket(bucket, now);

    // Check if token is available
    if (bucket.tokens > 0) {
      bucket.tokens--;
      return {
        allowed: true,
        tokensRemaining: bucket.tokens,
        resetTime: this.calculateResetTime(bucket),
      };
    } else {
      // Calculate retry after time
      const tokensNeeded = 1;
      const timePerToken = this.config.refillInterval / this.config.refillRate;
      const retryAfter = Math.max(0, tokensNeeded * timePerToken);

      return {
        allowed: false,
        tokensRemaining: 0,
        resetTime: this.calculateResetTime(bucket),
        retryAfter,
      };
    }
  }

  /**
   * Get current status of a rate limit bucket without consuming tokens
   * @param key - Unique identifier for the rate limit bucket
   * @returns Current rate limit status
   */
  public getStatus(key: string): RateLimitResult {
    const bucket = this.getOrCreateBucket(key);
    const now = Date.now();

    // Update bucket's last accessed time
    bucket.lastAccessed = now;

    // Refill tokens based on elapsed time
    this.refillBucket(bucket, now);

    return {
      allowed: bucket.tokens > 0,
      tokensRemaining: bucket.tokens,
      resetTime: this.calculateResetTime(bucket),
    };
  }

  /**
   * Reset a specific rate limit bucket
   * @param key - Unique identifier for the rate limit bucket
   */
  public reset(key: string): void {
    this.buckets.delete(key);
  }

  /**
   * Reset all rate limit buckets
   */
  public resetAll(): void {
    this.buckets.clear();
  }

  /**
   * Get current bucket count (useful for monitoring)
   */
  public getBucketCount(): number {
    return this.buckets.size;
  }

  /**
   * Clean up unused buckets
   */
  public cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, bucket] of this.buckets) {
      if (now - bucket.lastAccessed > this.config.bucketTTL) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.buckets.delete(key);
    }
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.buckets.clear();
  }

  private validateConfig(config: RateLimitConfig): void {
    if (config.maxTokens <= 0) {
      throw new Error('maxTokens must be greater than 0');
    }

    if (config.refillRate < 0) {
      throw new Error('refillRate must be non-negative');
    }

    if (config.refillInterval <= 0) {
      throw new Error('refillInterval must be greater than 0');
    }

    if (config.cleanupInterval !== undefined && config.cleanupInterval <= 0) {
      throw new Error('cleanupInterval must be greater than 0');
    }

    if (config.bucketTTL !== undefined && config.bucketTTL <= 0) {
      throw new Error('bucketTTL must be greater than 0');
    }
  }

  private getOrCreateBucket(key: string): TokenBucket {
    let bucket = this.buckets.get(key);
    
    if (!bucket) {
      const now = Date.now();
      bucket = {
        tokens: this.config.maxTokens,
        lastRefill: now,
        lastAccessed: now,
      };
      this.buckets.set(key, bucket);
    }

    return bucket;
  }

  private refillBucket(bucket: TokenBucket, now: number): void {
    if (this.config.refillRate === 0) {
      return; // No refill if rate is 0
    }

    // Handle edge case where time goes backwards
    if (now < bucket.lastRefill) {
      bucket.lastRefill = now;
      return;
    }

    const timeSinceLastRefill = now - bucket.lastRefill;
    const refillIntervals = Math.floor(timeSinceLastRefill / this.config.refillInterval);

    if (refillIntervals > 0) {
      const tokensToAdd = refillIntervals * this.config.refillRate;
      bucket.tokens = Math.min(this.config.maxTokens, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now - (timeSinceLastRefill % this.config.refillInterval);
    }
  }

  private calculateResetTime(bucket: TokenBucket): number {
    if (bucket.tokens >= this.config.maxTokens) {
      return Date.now();
    }

    const tokensNeeded = this.config.maxTokens - bucket.tokens;
    const timePerToken = this.config.refillInterval / this.config.refillRate;
    const timeToFullRefill = tokensNeeded * timePerToken;

    return Date.now() + timeToFullRefill;
  }

  private startCleanupTimer(): void {
    if (this.config.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.config.cleanupInterval);

      // Don't keep the process alive just for cleanup
      if (this.cleanupTimer.unref) {
        this.cleanupTimer.unref();
      }
    }
  }
}

/**
 * Create a rate limiter with common presets
 */
export const createRateLimiter = {
  /**
   * Create a rate limiter for API requests (100 requests per minute)
   */
  forAPI: () => new RateLimiter({
    maxTokens: 100,
    refillRate: 100,
    refillInterval: 60 * 1000, // 1 minute
  }),

  /**
   * Create a rate limiter for web scraping (10 requests per minute)
   */
  forScraping: () => new RateLimiter({
    maxTokens: 10,
    refillRate: 10,
    refillInterval: 60 * 1000, // 1 minute
  }),

  /**
   * Create a rate limiter for burst traffic (50 requests, refill 1 per second)
   */
  forBurst: () => new RateLimiter({
    maxTokens: 50,
    refillRate: 1,
    refillInterval: 1000, // 1 second
  }),

  /**
   * Create a custom rate limiter
   */
  custom: (config: RateLimitConfig) => new RateLimiter(config),
};
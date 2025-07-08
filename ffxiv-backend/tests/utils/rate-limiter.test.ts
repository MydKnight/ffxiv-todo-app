import { RateLimiter, RateLimitResult, RateLimitConfig } from '../../src/utils/rate-limiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Token Bucket Algorithm', () => {
    it('should allow requests when tokens are available', () => {
      const config: RateLimitConfig = {
        maxTokens: 10,
        refillRate: 5,
        refillInterval: 1000,
      };
      const limiter = new RateLimiter(config);

      const result = limiter.tryConsume('test-key');
      
      expect(result.allowed).toBe(true);
      expect(result.tokensRemaining).toBe(9);
      expect(result.resetTime).toBeGreaterThan(0);
    });

    it('should deny requests when no tokens available', () => {
      const config: RateLimitConfig = {
        maxTokens: 1,
        refillRate: 1,
        refillInterval: 1000,
      };
      const limiter = new RateLimiter(config);

      // Consume the only token
      limiter.tryConsume('test-key');
      
      // Next request should be denied
      const result = limiter.tryConsume('test-key');
      
      expect(result.allowed).toBe(false);
      expect(result.tokensRemaining).toBe(0);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should refill tokens at specified intervals', () => {
      const config: RateLimitConfig = {
        maxTokens: 5,
        refillRate: 2,
        refillInterval: 1000,
      };
      const limiter = new RateLimiter(config);

      // Consume all tokens
      for (let i = 0; i < 5; i++) {
        limiter.tryConsume('test-key');
      }

      // Should be denied
      expect(limiter.tryConsume('test-key').allowed).toBe(false);

      // Fast forward time
      jest.advanceTimersByTime(1000);

      // Should have 2 tokens refilled
      const result = limiter.tryConsume('test-key');
      expect(result.allowed).toBe(true);
      expect(result.tokensRemaining).toBe(1);
    });

    it('should not exceed maximum tokens when refilling', () => {
      const config: RateLimitConfig = {
        maxTokens: 3,
        refillRate: 5,
        refillInterval: 1000,
      };
      const limiter = new RateLimiter(config);

      // Fast forward time without consuming tokens
      jest.advanceTimersByTime(2000);

      const result = limiter.tryConsume('test-key');
      expect(result.allowed).toBe(true);
      expect(result.tokensRemaining).toBe(2); // Should cap at maxTokens - 1
    });
  });

  describe('Multiple Keys', () => {
    it('should maintain separate buckets for different keys', () => {
      const config: RateLimitConfig = {
        maxTokens: 2,
        refillRate: 1,
        refillInterval: 1000,
      };
      const limiter = new RateLimiter(config);

      // Consume tokens for key1
      limiter.tryConsume('key1');
      limiter.tryConsume('key1');

      // key1 should be exhausted
      expect(limiter.tryConsume('key1').allowed).toBe(false);

      // key2 should still have tokens
      expect(limiter.tryConsume('key2').allowed).toBe(true);
    });

    it('should handle concurrent access to different keys', () => {
      const config: RateLimitConfig = {
        maxTokens: 1,
        refillRate: 1,
        refillInterval: 1000,
      };
      const limiter = new RateLimiter(config);

      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(limiter.tryConsume(`key-${i}`));
      }

      // All should succeed as they're different keys
      results.forEach(result => {
        expect(result.allowed).toBe(true);
      });
    });
  });

  describe('Cleanup and Memory Management', () => {
    it('should clean up unused buckets', () => {
      const config: RateLimitConfig = {
        maxTokens: 1,
        refillRate: 1,
        refillInterval: 1000,
        cleanupInterval: 2000,
        bucketTTL: 1500,
      };
      const limiter = new RateLimiter(config);

      // Use a bucket
      limiter.tryConsume('test-key');

      // Fast forward past TTL
      jest.advanceTimersByTime(3000);

      // Manually trigger cleanup (in real implementation this would be automatic)
      limiter.cleanup();

      // After cleanup, should start with fresh bucket
      const result = limiter.tryConsume('test-key');
      expect(result.tokensRemaining).toBe(0); // Fresh bucket with maxTokens - 1
    });

    it('should not clean up recently used buckets', () => {
      const config: RateLimitConfig = {
        maxTokens: 3,
        refillRate: 1,
        refillInterval: 1000,
        cleanupInterval: 2000,
        bucketTTL: 1500,
      };
      const limiter = new RateLimiter(config);

      // Use bucket and consume 2 tokens
      limiter.tryConsume('test-key');
      limiter.tryConsume('test-key');

      // Fast forward but not past TTL
      jest.advanceTimersByTime(1000);

      // Use bucket again to update last accessed
      limiter.tryConsume('test-key');

      // Fast forward past original TTL
      jest.advanceTimersByTime(1000);

      // Cleanup should not remove bucket as it was recently accessed
      limiter.cleanup();

      // Should have 1 token remaining after refills and consumption
      const result = limiter.tryConsume('test-key');
      expect(result.allowed).toBe(true);
      expect(result.tokensRemaining).toBe(1); // Changed from 0 to 1
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero refill rate', () => {
      const config: RateLimitConfig = {
        maxTokens: 1,
        refillRate: 0,
        refillInterval: 1000,
      };
      const limiter = new RateLimiter(config);

      // Consume token
      limiter.tryConsume('test-key');

      // Fast forward time
      jest.advanceTimersByTime(5000);

      // Should still be denied as no refill
      expect(limiter.tryConsume('test-key').allowed).toBe(false);
    });

    it('should handle very high refill rates', () => {
      const config: RateLimitConfig = {
        maxTokens: 100,
        refillRate: 1000,
        refillInterval: 100,
      };
      const limiter = new RateLimiter(config);

      // Consume all tokens
      for (let i = 0; i < 100; i++) {
        limiter.tryConsume('test-key');
      }

      // Fast forward minimal time
      jest.advanceTimersByTime(100);

      // Should be able to consume many tokens
      const results = [];
      for (let i = 0; i < 50; i++) {
        results.push(limiter.tryConsume('test-key'));
      }

      expect(results.filter(r => r.allowed).length).toBeGreaterThan(0);
    });

    it('should handle negative time scenarios gracefully', () => {
      const config: RateLimitConfig = {
        maxTokens: 5,
        refillRate: 1,
        refillInterval: 1000,
      };
      const limiter = new RateLimiter(config);

      // Mock Date.now to return decreasing values
      const originalDateNow = Date.now;
      let mockTime = 10000;
      jest.spyOn(Date, 'now').mockImplementation(() => mockTime);

      limiter.tryConsume('test-key');

      // Simulate time going backwards
      mockTime = 5000;

      // Should handle gracefully without crashing
      const result = limiter.tryConsume('test-key');
      expect(result).toBeDefined();
      expect(typeof result.allowed).toBe('boolean');

      // Restore original Date.now
      (Date.now as jest.Mock).mockRestore();
    });
  });

  describe('Configuration Validation', () => {
    it('should throw error for invalid maxTokens', () => {
      expect(() => {
        new RateLimiter({
          maxTokens: 0,
          refillRate: 1,
          refillInterval: 1000,
        });
      }).toThrow('maxTokens must be greater than 0');
    });

    it('should throw error for invalid refillInterval', () => {
      expect(() => {
        new RateLimiter({
          maxTokens: 10,
          refillRate: 1,
          refillInterval: 0,
        });
      }).toThrow('refillInterval must be greater than 0');
    });

    it('should throw error for negative refillRate', () => {
      expect(() => {
        new RateLimiter({
          maxTokens: 10,
          refillRate: -1,
          refillInterval: 1000,
        });
      }).toThrow('refillRate must be non-negative');
    });
  });
});
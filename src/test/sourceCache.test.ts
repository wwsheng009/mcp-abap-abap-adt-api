import { SourceCache, type CacheEntry } from '../lib/sourceCache';

describe('SourceCache', () => {
  let cache: SourceCache;

  beforeEach(() => {
    cache = new SourceCache(1000, 5); // 1 second TTL, max 5 entries
  });

  afterEach(() => {
    cache.stopCleanup();
  });

  describe('set and get', () => {
    it('should store and retrieve cache entry', () => {
      const entry: Omit<CacheEntry, 'timestamp' | 'expiresAt'> = {
        token: '1706140800000_a3f5b8c2d9e1f4a6',
        changedAt: 1706140800000,
        lineCount: 100,
        objectUrl: '/sap/bc/adt/programs/programs/ztest'
      };

      cache.set('test-key', entry);
      const retrieved = cache.get('test-key');

      expect(retrieved).toBeDefined();
      expect(retrieved?.token).toBe(entry.token);
      expect(retrieved?.lineCount).toBe(entry.lineCount);
    });

    it('should return undefined for non-existent key', () => {
      expect(cache.get('non-existent')).toBeUndefined();
    });

    it('should include includeType in cache entry', () => {
      const entry: Omit<CacheEntry, 'timestamp' | 'expiresAt'> = {
        token: '1706140800000_a3f5b8c2d9e1f4a6',
        changedAt: 1706140800000,
        lineCount: 100,
        objectUrl: '/sap/bc/adt/oo/cl/ztest',
        includeType: 'main'
      };

      cache.set('test-key', entry);
      const retrieved = cache.get('test-key');

      expect(retrieved?.includeType).toBe('main');
    });
  });

  describe('expiration', () => {
    it('should expire entries after TTL', async () => {
      const entry: Omit<CacheEntry, 'timestamp' | 'expiresAt'> = {
        token: '1706140800000_a3f5b8c2d9e1f4a6',
        changedAt: 1706140800000,
        lineCount: 100,
        objectUrl: '/sap/bc/adt/programs/programs/ztest'
      };

      cache.set('test-key', entry);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(cache.get('test-key')).toBeUndefined();
    });

    it('should not expire entries before TTL', async () => {
      const entry: Omit<CacheEntry, 'timestamp' | 'expiresAt'> = {
        token: '1706140800000_a3f5b8c2d9e1f4a6',
        changedAt: 1706140800000,
        lineCount: 100,
        objectUrl: '/sap/bc/adt/programs/programs/ztest'
      };

      cache.set('test-key', entry);

      // Check before expiration
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(cache.get('test-key')).toBeDefined();
    });
  });

  describe('validateToken', () => {
    it('should return true for matching token', () => {
      const entry: Omit<CacheEntry, 'timestamp' | 'expiresAt'> = {
        token: '1706140800000_a3f5b8c2d9e1f4a6',
        changedAt: 1706140800000,
        lineCount: 100,
        objectUrl: '/sap/bc/adt/programs/programs/ztest'
      };

      cache.set('test-key', entry);

      expect(cache.validateToken('test-key', '1706140800000_a3f5b8c2d9e1f4a6')).toBe(true);
    });

    it('should return false for non-matching token', () => {
      const entry: Omit<CacheEntry, 'timestamp' | 'expiresAt'> = {
        token: '1706140800000_a3f5b8c2d9e1f4a6',
        changedAt: 1706140800000,
        lineCount: 100,
        objectUrl: '/sap/bc/adt/programs/programs/ztest'
      };

      cache.set('test-key', entry);

      expect(cache.validateToken('test-key', '1706140900000_different')).toBe(false);
    });

    it('should return false for expired entry', async () => {
      const entry: Omit<CacheEntry, 'timestamp' | 'expiresAt'> = {
        token: '1706140800000_a3f5b8c2d9e1f4a6',
        changedAt: 1706140800000,
        lineCount: 100,
        objectUrl: '/sap/bc/adt/programs/programs/ztest'
      };

      cache.set('test-key', entry);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(cache.validateToken('test-key', '1706140800000_a3f5b8c2d9e1f4a6')).toBe(false);
    });
  });

  describe('invalidate', () => {
    it('should remove specified entry', () => {
      const entry: Omit<CacheEntry, 'timestamp' | 'expiresAt'> = {
        token: '1706140800000_a3f5b8c2d9e1f4a6',
        changedAt: 1706140800000,
        lineCount: 100,
        objectUrl: '/sap/bc/adt/programs/programs/ztest'
      };

      cache.set('test-key', entry);
      expect(cache.get('test-key')).toBeDefined();

      cache.invalidate('test-key');
      expect(cache.get('test-key')).toBeUndefined();
    });

    it('should handle non-existent key gracefully', () => {
      expect(() => cache.invalidate('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', {
        token: '1706140800000_a3f5b8c2d9e1f4a6',
        changedAt: 1706140800000,
        lineCount: 100,
        objectUrl: '/sap/bc/adt/programs/programs/ztest1'
      });

      cache.set('key2', {
        token: '1706140900000_b4g6c9d3e0f2g5b7',
        changedAt: 1706140900000,
        lineCount: 200,
        objectUrl: '/sap/bc/adt/programs/programs/ztest2'
      });

      expect(cache.size).toBe(2);

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest entry when max size is exceeded', () => {
      // Fill cache to max size
      for (let i = 0; i < 5; i++) {
        cache.set(`key${i}`, {
          token: `1706140800${i}_hash`,
          changedAt: 1706140800000 + i,
          lineCount: 100,
          objectUrl: `/sap/bc/adt/programs/programs/ztest${i}`
        });
      }

      expect(cache.size).toBe(5);

      // Add one more entry
      cache.set('key5', {
        token: '17061408005_newest',
        changedAt: 1706140800005,
        lineCount: 100,
        objectUrl: '/sap/bc/adt/programs/programs/ztest5'
      });

      // Size should still be max size
      expect(cache.size).toBe(5);

      // Oldest entry should be evicted
      expect(cache.get('key0')).toBeUndefined();

      // Newest entries should still be there
      expect(cache.get('key1')).toBeDefined();
      expect(cache.get('key5')).toBeDefined();
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      // Add entries that will expire
      cache.set('expire1', {
        token: '1706140800000_a3f5b8c2d9e1f4a6',
        changedAt: 1706140800000,
        lineCount: 100,
        objectUrl: '/sap/bc/adt/programs/programs/ztest1'
      });

      cache.set('expire2', {
        token: '1706140900000_b4g6c9d3e0f2g5b7',
        changedAt: 1706140900000,
        lineCount: 200,
        objectUrl: '/sap/bc/adt/programs/programs/ztest2'
      });

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      const removed = cache.cleanup();

      expect(removed).toBe(2);
      expect(cache.size).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cache.set('key1', {
        token: '1706140800000_a3f5b8c2d9e1f4a6',
        changedAt: 1706140800000,
        lineCount: 100,
        objectUrl: '/sap/bc/adt/programs/programs/ztest1',
        includeType: 'main'
      });

      const stats = cache.getStats();

      expect(stats.size).toBe(1);
      expect(stats.entries).toHaveLength(1);
      expect(stats.entries[0].key).toBe('key1');
      expect(stats.entries[0].lineCount).toBe(100);
      expect(stats.entries[0].includeType).toBe('main');
      expect(stats.entries[0].ttl).toBeGreaterThan(0);
    });

    it('should return empty stats for empty cache', () => {
      const stats = cache.getStats();

      expect(stats.size).toBe(0);
      expect(stats.entries).toHaveLength(0);
    });
  });

  describe('size property', () => {
    it('should return correct size', () => {
      expect(cache.size).toBe(0);

      cache.set('key1', {
        token: '1706140800000_a3f5b8c2d9e1f4a6',
        changedAt: 1706140800000,
        lineCount: 100,
        objectUrl: '/sap/bc/adt/programs/programs/ztest1'
      });

      expect(cache.size).toBe(1);

      cache.set('key2', {
        token: '1706140900000_b4g6c9d3e0f2g5b7',
        changedAt: 1706140900000,
        lineCount: 200,
        objectUrl: '/sap/bc/adt/programs/programs/ztest2'
      });

      expect(cache.size).toBe(2);
    });
  });
});

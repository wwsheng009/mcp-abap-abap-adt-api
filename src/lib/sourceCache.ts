/**
 * Cache entry for source code metadata
 */
export interface CacheEntry {
  token: string;
  changedAt: number;
  lineCount: number;
  timestamp: number;
  expiresAt: number;
  objectUrl: string;
  includeType?: string;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  size: number;
  entries: CacheEntryInfo[];
}

export interface CacheEntryInfo {
  key: string;
  lineCount: number;
  includeType?: string;
  expiresAt: number;
  ttl: number;
}

/**
 * Source cache for V2 optimization
 * LRU + TTL hybrid strategy
 */
export class SourceCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL: number;
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(ttl = 5 * 60 * 1000, maxSize = 100) {
    this.defaultTTL = ttl;
    this.maxSize = maxSize;

    // Start periodic cleanup
    this.startCleanup();
  }

  /**
   * Get cache entry
   */
  get(key: string): CacheEntry | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // Update access time for LRU
    entry.timestamp = Date.now();
    return entry;
  }

  /**
   * Set cache entry
   */
  set(key: string, entry: Omit<CacheEntry, 'timestamp' | 'expiresAt'>): void {
    const now = Date.now();
    const cacheEntry: CacheEntry = {
      ...entry,
      timestamp: now,
      expiresAt: now + this.defaultTTL
    };

    this.cache.set(key, cacheEntry);

    // Enforce max size (LRU)
    if (this.cache.size > this.maxSize) {
      this.evictOldest();
    }
  }

  /**
   * Validate token against cached entry
   */
  validateToken(key: string, token: string): boolean {
    const entry = this.get(key);
    if (!entry) return false;
    return entry.token === token;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Evict oldest entry (LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // Every minute
  }

  /**
   * Stop periodic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const now = Date.now();
    const entries: CacheEntryInfo[] = [];

    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key,
        lineCount: entry.lineCount,
        includeType: entry.includeType,
        expiresAt: entry.expiresAt,
        ttl: Math.max(0, entry.expiresAt - now)
      });
    }

    return {
      size: this.cache.size,
      entries
    };
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }
}

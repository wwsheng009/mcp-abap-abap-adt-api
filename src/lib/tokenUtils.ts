import { createHash } from 'crypto';

/**
 * Token utilities for V2 source cache optimization
 * Format: changedAt_hash (16 chars of sha256)
 */
export class TokenUtils {
  /**
   * Generate a token from changedAt timestamp and content
   */
  static generateToken(changedAt: number, content: string): string {
    const hash = createHash('sha256')
      .update(content)
      .digest('hex')
      .substring(0, 16);
    return `${changedAt}_${hash}`;
  }

  /**
   * Validate token format
   */
  static isValidToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('_');
    if (parts.length !== 2) return false;
    const [changedAtStr, hash] = parts;
    // changedAt must be a number
    if (isNaN(Number(changedAtStr))) return false;
    // hash must be 16 hex characters
    return /^[a-f0-9]{16}$/i.test(hash);
  }

  /**
   * Extract changedAt from token
   */
  static extractChangedAt(token: string): number | null {
    if (!this.isValidToken(token)) return null;
    const changedAtStr = token.split('_')[0];
    return Number(changedAtStr);
  }

  /**
   * Calculate content hash
   */
  static hashContent(content: string): string {
    return createHash('sha256')
      .update(content)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Verify if token matches the content
   */
  static verifyToken(token: string, content: string): boolean {
    if (!this.isValidToken(token)) return false;
    const hash = this.hashContent(content);
    return token.endsWith(hash);
  }
}

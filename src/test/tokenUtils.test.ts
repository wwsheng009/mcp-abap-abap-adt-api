import { TokenUtils } from '../lib/tokenUtils';

describe('TokenUtils', () => {
  describe('generateToken', () => {
    it('should generate token with correct format', () => {
      const changedAt = 1706140800000;
      const content = 'Hello, World!';
      const token = TokenUtils.generateToken(changedAt, content);

      expect(token).toBe('1706140800000_' + TokenUtils.hashContent(content));
      expect(token).toMatch(/^\d+_[a-f0-9]{16}$/i);
    });

    it('should generate different tokens for different content', () => {
      const changedAt = 1706140800000;
      const token1 = TokenUtils.generateToken(changedAt, 'content1');
      const token2 = TokenUtils.generateToken(changedAt, 'content2');

      expect(token1).not.toBe(token2);
    });

    it('should generate different tokens for different timestamps', () => {
      const content = 'same content';
      const token1 = TokenUtils.generateToken(1706140800000, content);
      const token2 = TokenUtils.generateToken(1706140900000, content);

      expect(token1).not.toBe(token2);
    });

    it('should generate same token for same content and timestamp', () => {
      const changedAt = 1706140800000;
      const content = 'same content';
      const token1 = TokenUtils.generateToken(changedAt, content);
      const token2 = TokenUtils.generateToken(changedAt, content);

      expect(token1).toBe(token2);
    });

    it('should handle empty content', () => {
      const token = TokenUtils.generateToken(1706140800000, '');
      expect(token).toMatch(/^\d+_[a-f0-9]{16}$/i);
    });

    it('should handle special characters', () => {
      const content = 'REPORT ztest.\n*&%$#@!\n中文测试';
      const token = TokenUtils.generateToken(1706140800000, content);
      expect(TokenUtils.isValidToken(token)).toBe(true);
    });
  });

  describe('isValidToken', () => {
    it('should return true for valid token', () => {
      const token = '1706140800000_a3f5b8c2d9e1f4a6';
      expect(TokenUtils.isValidToken(token)).toBe(true);
    });

    it('should return false for invalid format - missing underscore', () => {
      expect(TokenUtils.isValidToken('1706140800000a3f5b8c2d9e1f4a6')).toBe(false);
    });

    it('should return false for invalid format - too many parts', () => {
      expect(TokenUtils.isValidToken('1706140800000_a3f5b8c2d9e1f4a6_extra')).toBe(false);
    });

    it('should return false for invalid timestamp', () => {
      expect(TokenUtils.isValidToken('invalid_a3f5b8c2d9e1f4a6')).toBe(false);
    });

    it('should return false for invalid hash', () => {
      expect(TokenUtils.isValidToken('1706140800000_invalidhash!')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(TokenUtils.isValidToken('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(TokenUtils.isValidToken(null as any)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(TokenUtils.isValidToken(undefined as any)).toBe(false);
    });
  });

  describe('extractChangedAt', () => {
    it('should extract timestamp from valid token', () => {
      const token = '1706140800000_a3f5b8c2d9e1f4a6';
      expect(TokenUtils.extractChangedAt(token)).toBe(1706140800000);
    });

    it('should return null for invalid token', () => {
      expect(TokenUtils.extractChangedAt('invalid')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(TokenUtils.extractChangedAt('')).toBeNull();
    });
  });

  describe('hashContent', () => {
    it('should generate consistent hash for same content', () => {
      const content = 'Hello, World!';
      const hash1 = TokenUtils.hashContent(content);
      const hash2 = TokenUtils.hashContent(content);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(16);
    });

    it('should generate different hash for different content', () => {
      const hash1 = TokenUtils.hashContent('content1');
      const hash2 = TokenUtils.hashContent('content2');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle multi-line content', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const hash = TokenUtils.hashContent(content);

      expect(hash).toHaveLength(16);
      expect(/^[a-f0-9]{16}$/i.test(hash)).toBe(true);
    });

    it('should be case sensitive', () => {
      const hash1 = TokenUtils.hashContent('hello');
      const hash2 = TokenUtils.hashContent('HELLO');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyToken', () => {
    it('should return true when token matches content', () => {
      const content = 'Hello, World!';
      const changedAt = 1706140800000;
      const token = TokenUtils.generateToken(changedAt, content);

      expect(TokenUtils.verifyToken(token, content)).toBe(true);
    });

    it('should return false when token does not match content', () => {
      const token = TokenUtils.generateToken(1706140800000, 'original content');

      expect(TokenUtils.verifyToken(token, 'different content')).toBe(false);
    });

    it('should return false for invalid token', () => {
      expect(TokenUtils.verifyToken('invalid', 'content')).toBe(false);
    });

    it('should work with large content', () => {
      const content = 'A'.repeat(10000);
      const changedAt = 1706140800000;
      const token = TokenUtils.generateToken(changedAt, content);

      expect(TokenUtils.verifyToken(token, content)).toBe(true);
    });
  });

  describe('Token edge cases', () => {
    it('should handle very large timestamps', () => {
      const changedAt = 9999999999999;
      const token = TokenUtils.generateToken(changedAt, 'content');

      expect(TokenUtils.isValidToken(token)).toBe(true);
      expect(TokenUtils.extractChangedAt(token)).toBe(changedAt);
    });

    it('should handle timestamp of 0', () => {
      const token = TokenUtils.generateToken(0, 'content');

      expect(TokenUtils.isValidToken(token)).toBe(true);
      expect(TokenUtils.extractChangedAt(token)).toBe(0);
    });

    it('should handle Unicode content', () => {
      const content = 'REPORT ztest.\n* 评论 with 中文 🚀\nWRITE: /1/ "Test".';
      const token = TokenUtils.generateToken(1706140800000, content);

      expect(TokenUtils.isValidToken(token)).toBe(true);
      expect(TokenUtils.verifyToken(token, content)).toBe(true);
    });
  });
});

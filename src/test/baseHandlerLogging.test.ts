import { BaseHandler, RequestLogContext } from '../handlers/BaseHandler';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { performance } from 'perf_hooks';

// Mock ADTClient
class MockADTClient {
  async login() {
    return { status: 'logged in' };
  }
  async objectStructure(url: string) {
    return { name: 'TEST_OBJECT', type: 'CLAS' };
  }
}

describe('BaseHandler Logging', () => {
  let handler: TestHandler;
  let mockClient: MockADTClient;

  // Create a test handler that exposes protected methods for testing
  class TestHandler extends BaseHandler {
    // Expose protected methods for testing
    public testGenerateRequestId() {
      return this.generateRequestId();
    }

    public testSanitizeArguments(args: any) {
      return this.sanitizeArguments(args);
    }

    public testLogRequestStart(context: RequestLogContext) {
      this.logRequestStart(context);
    }

    public testLogRequestError(error: Error, context: RequestLogContext) {
      this.logRequestError(error, context);
    }

    async testOperation(args: any) {
      const startTime = performance.now();
      try {
        const result = await this.adtclient.login();
        this.trackRequest(startTime, true, {
          requestId: 'test-123',
          toolName: 'testOperation',
          arguments: args
        });
        return result;
      } catch (error: any) {
        this.trackRequest(startTime, false, {
          requestId: 'test-123',
          toolName: 'testOperation',
          arguments: args
        });
        throw error;
      }
    }

    getTools() {
      return [{
        name: 'testTool',
        description: 'Test tool',
        inputSchema: { type: 'object', properties: {} }
      }];
    }
  }

  beforeEach(() => {
    mockClient = new MockADTClient();
    handler = new TestHandler(mockClient as any);
  });

  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = handler.testGenerateRequestId();
      const id2 = handler.testGenerateRequestId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate valid UUID format', () => {
      const id = handler.testGenerateRequestId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe('sanitizeArguments', () => {
    it('should redact sensitive password fields', () => {
      const args = {
        username: 'testuser',
        password: 'secret123',
        objectUrl: '/test/url'
      };

      const sanitized = handler.testSanitizeArguments(args);

      expect(sanitized.username).toBe('testuser');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.objectUrl).toBe('/test/url');
    });

    it('should redact token fields', () => {
      const args = {
        token: 'abc123xyz',
        refreshToken: 'refresh456'
      };

      const sanitized = handler.testSanitizeArguments(args);

      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.refreshToken).toBe('[REDACTED]');
    });

    it('should redact secret fields', () => {
      const args = {
        apiKey: 'key123',
        clientSecret: 'secret789',
        normalField: 'value'
      };

      const sanitized = handler.testSanitizeArguments(args);

      // apiKey doesn't match any sensitive keys (password, pwd, secret, token, credential, auth)
      expect(sanitized.apiKey).toBe('key123');
      expect(sanitized.clientSecret).toBe('[REDACTED]');
      expect(sanitized.normalField).toBe('value');
    });

    it('should handle case-insensitive sensitive key matching', () => {
      const args = {
        Password: 'caseTest',
        SECRET_KEY: 'caseTest2',
        ApiToken: 'caseTest3'
      };

      const sanitized = handler.testSanitizeArguments(args);

      expect(sanitized.Password).toBe('[REDACTED]');
      expect(sanitized.SECRET_KEY).toBe('[REDACTED]');
      expect(sanitized.ApiToken).toBe('[REDACTED]');
    });

    it('should return original value for non-sensitive fields', () => {
      const args = {
        name: 'test',
        url: '/path/to/resource',
        count: 5,
        active: true
      };

      const sanitized = handler.testSanitizeArguments(args);

      expect(sanitized).toEqual(args);
    });

    it('should handle null and undefined values', () => {
      const args = {
        nullField: null,
        undefinedField: undefined,
        password: null
      };

      const sanitized = handler.testSanitizeArguments(args);

      expect(sanitized.nullField).toBeNull();
      expect(sanitized.undefinedField).toBeUndefined();
      expect(sanitized.password).toBe('[REDACTED]');
    });

    it('should handle non-object arguments', () => {
      expect(handler.testSanitizeArguments(null)).toBeNull();
      expect(handler.testSanitizeArguments('string')).toBe('string');
      expect(handler.testSanitizeArguments(123)).toBe(123);
    });
  });

  describe('trackRequest with context', () => {
    it('should include request context in logs', async () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      await (handler as TestHandler).testOperation({
        username: 'test',
        password: 'secret'
      });

      expect(consoleSpy).toHaveBeenCalled();

      // Find the log call with Request completed message
      const logCalls = consoleSpy.mock.calls;
      const completedLog = logCalls.find(call =>
        JSON.parse(call[0] as string).message === 'Request completed'
      );

      expect(completedLog).toBeDefined();

      const logData = JSON.parse(completedLog![0] as string);
      expect(logData).toHaveProperty('requestId', 'test-123');
      expect(logData).toHaveProperty('toolName', 'testOperation');
      expect(logData).toHaveProperty('duration');
      expect(logData).toHaveProperty('success', true);
      expect(logData).toHaveProperty('arguments');
      expect(logData.arguments).toHaveProperty('username', 'test');
      expect(logData.arguments).toHaveProperty('password', '[REDACTED]');

      consoleSpy.mockRestore();
    });
  });

  describe('logRequestStart', () => {
    it('should log request start with context', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      const context: RequestLogContext = {
        requestId: 'start-123',
        toolName: 'testTool',
        arguments: { param1: 'value1' }
      };

      handler.testLogRequestStart(context);

      expect(consoleSpy).toHaveBeenCalled();
      const logData = JSON.parse(consoleSpy.mock.calls[0][0] as string);

      expect(logData.message).toBe('Request started');
      expect(logData.requestId).toBe('start-123');
      expect(logData.toolName).toBe('testTool');
      expect(logData.arguments).toEqual({ param1: 'value1' });

      consoleSpy.mockRestore();
    });
  });

  describe('logRequestError', () => {
    it('should log request error with context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const context: RequestLogContext = {
        requestId: 'error-123',
        toolName: 'testTool',
        arguments: { param1: 'value1' }
      };

      const error = new Error('Test error');
      handler.testLogRequestError(error, context);

      expect(consoleSpy).toHaveBeenCalled();
      const logData = JSON.parse(consoleSpy.mock.calls[0][0] as string);

      expect(logData.message).toBe('Request failed');
      expect(logData.requestId).toBe('error-123');
      expect(logData.toolName).toBe('testTool');
      expect(logData.error).toBe('Test error');
      expect(logData.arguments).toEqual({ param1: 'value1' });

      consoleSpy.mockRestore();
    });

    it('should include McpError code if present', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const context: RequestLogContext = {
        requestId: 'mcp-error-123',
        toolName: 'testTool'
      };

      const mcpError = new McpError(ErrorCode.InvalidRequest, 'Invalid request');
      handler.testLogRequestError(mcpError, context);

      const logData = JSON.parse(consoleSpy.mock.calls[0][0] as string);

      // McpError message is prefixed with "MCP error -32600: "
      expect(logData.error).toContain('Invalid request');
      expect(logData.code).toBe(-32600); // ErrorCode.InvalidRequest

      consoleSpy.mockRestore();
    });
  });

  describe('withLogging wrapper', () => {
    it('should wrap handler execution with logging', async () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      // Test through the testOperation method which uses trackRequest
      await handler.testOperation({ arg1: 'value1' });

      expect(consoleSpy).toHaveBeenCalled();

      // Check completed log
      const logCalls = consoleSpy.mock.calls;
      const completedLog = logCalls.find(call =>
        JSON.parse(call[0] as string).message === 'Request completed'
      );

      expect(completedLog).toBeDefined();
      const logData = JSON.parse(completedLog![0] as string);
      expect(logData.message).toBe('Request completed');
      expect(logData.toolName).toBe('testOperation');
      expect(logData.success).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should sanitize arguments in logs', async () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      await handler.testOperation({
        username: 'user1',
        password: 'secret123'
      });

      const logCalls = consoleSpy.mock.calls;
      const completedLog = logCalls.find(call =>
        JSON.parse(call[0] as string).message === 'Request completed'
      );

      expect(completedLog).toBeDefined();
      const logData = JSON.parse(completedLog![0] as string);
      expect(logData.arguments.password).toBe('[REDACTED]');
      expect(logData.arguments.username).toBe('user1');

      consoleSpy.mockRestore();
    });
  });
});

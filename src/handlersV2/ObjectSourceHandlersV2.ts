import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import type { ADTClient } from "abap-adt-api";
import { BaseHandler } from '../handlers/BaseHandler';
import type { ToolDefinition } from '../types/tools';
import { SourceCache } from '../lib/sourceCache';
import { TokenUtils } from '../lib/tokenUtils';

interface GrepMatch {
  lineNumber: number;
  content: string;
  contextBefore?: string[];
  contextAfter?: string[];
}

/**
 * Parameter validation utilities
 */
class ParamValidator {
  /**
   * Validate source URL
   */
  static validateSourceUrl(sourceUrl: any): void {
    if (!sourceUrl || typeof sourceUrl !== 'string') {
      throw new McpError(ErrorCode.InvalidRequest,
        'sourceUrl parameter is missing or invalid: must be a non-empty string');
    }
    const trimmed = sourceUrl.trim();
    if (trimmed.length === 0) {
      throw new McpError(ErrorCode.InvalidRequest,
        'sourceUrl cannot be an empty string');
    }
    if (!trimmed.startsWith('/')) {
      throw new McpError(ErrorCode.InvalidRequest,
        'sourceUrl format is invalid: must be an absolute path starting with /');
    }
  }

  /**
   * Validate line number (positive integer)
   */
  static validateLineNumber(value: any, paramName: string): number {
    if (value === undefined || value === null) {
      throw new McpError(ErrorCode.InvalidRequest,
        `${paramName} parameter is missing`);
    }
    const num = Number(value);
    if (!Number.isInteger(num)) {
      throw new McpError(ErrorCode.InvalidRequest,
        `${paramName} must be an integer, received: ${value}`);
    }
    if (num < 1) {
      throw new McpError(ErrorCode.InvalidRequest,
        `${paramName} must be >= 1, received: ${value}`);
    }
    return num;
  }

  /**
   * Validate line range
   * @returns [startLine, endLine] with defaults applied
   */
  static validateLineRange(startLine: any, endLine: any, maxLines: number): [number, number] {
    const start = startLine !== undefined ? this.validateLineNumber(startLine, 'startLine') : 1;
    const end = endLine !== undefined ? this.validateLineNumber(endLine, 'endLine') : maxLines;

    if (end < start) {
      throw new McpError(ErrorCode.InvalidRequest,
        `endLine (${end}) cannot be less than startLine (${start})`);
    }

    if (start > maxLines) {
      throw new McpError(ErrorCode.InvalidRequest,
        `startLine (${start}) exceeds total file lines (${maxLines})`);
    }

    if (end > maxLines) {
      throw new McpError(ErrorCode.InvalidRequest,
        `endLine (${end}) exceeds total file lines (${maxLines})`);
    }

    return [start, end];
  }

  /**
   * Validate non-empty string
   */
  static validateNonEmptyString(value: any, paramName: string): string {
    if (!value || typeof value !== 'string') {
      throw new McpError(ErrorCode.InvalidRequest,
        `${paramName} parameter is missing or invalid: must be a non-empty string`);
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new McpError(ErrorCode.InvalidRequest,
        `${paramName} cannot be an empty string`);
    }
    return trimmed;
  }

  /**
   * Validate boolean parameter
   */
  static validateBoolean(value: any, paramName: string, defaultValue: boolean): boolean {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    if (typeof value !== 'boolean') {
      throw new McpError(ErrorCode.InvalidRequest,
        `${paramName} must be a boolean value, received: ${typeof value}`);
    }
    return value;
  }

  /**
   * Validate positive integer
   */
  static validatePositiveInteger(value: any, paramName: string, defaultValue: number): number {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    const num = Number(value);
    if (!Number.isInteger(num) || num < 1) {
      throw new McpError(ErrorCode.InvalidRequest,
        `${paramName} must be a positive integer, received: ${value}`);
    }
    return num;
  }

  /**
   * Validate non-negative integer
   */
  static validateNonNegativeInteger(value: any, paramName: string, defaultValue: number): number {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    const num = Number(value);
    if (!Number.isInteger(num) || num < 0) {
      throw new McpError(ErrorCode.InvalidRequest,
        `${paramName} must be a non-negative integer, received: ${value}`);
    }
    return num;
  }

  /**
   * Validate regex pattern
   */
  static validatePattern(pattern: any): string {
    const str = this.validateNonEmptyString(pattern, 'pattern');
    try {
      new RegExp(str);
      return str;
    } catch (error: any) {
      throw new McpError(ErrorCode.InvalidRequest,
        `pattern regex is invalid: ${str} - ${error.message}`);
    }
  }
}

// Extended input schema type with enum and default support
interface ExtendedInputSchemaProperty {
  type: string;
  description?: string;
  optional?: boolean;
  enum?: string[];
  default?: any;
}

interface ExtendedInputSchema {
  type: string;
  properties: Record<string, ExtendedInputSchemaProperty>;
  required?: string[];
}

interface ExtendedToolDefinition extends Omit<ToolDefinition, 'inputSchema'> {
  inputSchema: ExtendedInputSchema;
}

/**
 * V2 Object Source Handlers with caching and optimization
 * Features:
 * - Line range support
 * - Version token mechanism for conflict detection
 * - Server-side grep
 *
 * Usage: Pass the direct source URL (e.g., from objectStructure sourceUri)
 */
export class ObjectSourceHandlersV2 extends BaseHandler {
  private cache: SourceCache;

  constructor(adtclient: ADTClient, cache?: SourceCache) {
    super(adtclient);
    this.cache = cache || new SourceCache();
  }

  /**
   * Get tool definitions
   */
  getTools(): ExtendedToolDefinition[] {
    return [
      // getObjectSourceV2
      {
        name: 'getObjectSourceV2',
        description: 'Read ABAP source code with line range support and version token. Pass the direct source URL',
        inputSchema: {
          type: 'object',
          properties: {
            sourceUrl: {
              type: 'string',
              description: 'Source code URL (get from objectStructure abapsource:sourceUri)'
            },
            startLine: {
              type: 'number',
              description: 'Start line number (1-based, inclusive, default: 1)'
            },
            endLine: {
              type: 'number',
              description: 'End line number (1-based, inclusive, default: end of file)'
            }
          },
          required: ['sourceUrl']
        }
      },
      // grepObjectSource
      {
        name: 'grepObjectSource',
        description: 'Search source code for lines matching a pattern (regex)',
        inputSchema: {
          type: 'object',
          properties: {
            sourceUrl: {
              type: 'string',
              description: 'Source code URL'
            },
            pattern: {
              type: 'string',
              description: 'Search pattern (supports regex)'
            },
            caseInsensitive: {
              type: 'boolean',
              description: 'Case insensitive search',
              default: false
            },
            contextLines: {
              type: 'number',
              description: 'Number of context lines',
              default: 0
            },
            maxMatches: {
              type: 'number',
              description: 'Maximum number of matches',
              default: 100
            }
          },
          required: ['sourceUrl', 'pattern']
        }
      },
      // setObjectSourceV2
      {
        name: 'setObjectSourceV2',
        description: 'Modify source code for a specific line range with version conflict detection',
        inputSchema: {
          type: 'object',
          properties: {
            sourceUrl: {
              type: 'string',
              description: 'Source code URL'
            },
            token: {
              type: 'string',
              description: 'Version token returned by getObjectSourceV2'
            },
            startLine: {
              type: 'number',
              description: 'Start line number (1-based, inclusive)'
            },
            endLine: {
              type: 'number',
              description: 'End line number (1-based, inclusive)'
            },
            content: {
              type: 'string',
              description: 'New content (will replace the specified line range)'
            },
            lockHandle: {
              type: 'string',
              description: 'Object lock handle (obtained via lock tool)'
            },
            transport: {
              type: 'string',
              description: 'Transport request number (optional)'
            },
            skipConflictCheck: {
              type: 'boolean',
              description: 'Skip conflict check (not recommended)',
              default: false
            }
          },
          required: ['sourceUrl', 'token', 'startLine', 'endLine', 'content', 'lockHandle']
        }
      }
    ];
  }

  /**
   * Handle tool requests
   */
  async handle(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'getObjectSourceV2':
        return this.handleGetObjectSourceV2(args);
      case 'grepObjectSource':
        return this.handleGrepObjectSource(args);
      case 'setObjectSourceV2':
        return this.handleSetObjectSourceV2(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
    }
  }

  /**
   * Get source code with line range support
   * Returns a token (content hash) for conflict detection
   */
  private async handleGetObjectSourceV2(args: any): Promise<any> {
    const startTime = performance.now();
    try {
      // 1. Validate parameters
      ParamValidator.validateSourceUrl(args.sourceUrl);

      // 2. Get source code
      const fullSource = await this.adtclient.getObjectSource(args.sourceUrl);
      const lines = fullSource.split('\n');
      const lineCount = lines.length;

      // 3. Validate and apply line range
      const [startLine, endLine] = ParamValidator.validateLineRange(
        args.startLine,
        args.endLine,
        lineCount
      );

      // 4. Extract content
      const content = lines.slice(startLine - 1, endLine).join('\n');

      // 5. Generate token (content hash)
      const token = TokenUtils.generateToken(Date.now(), fullSource);

      // 6. Cache
      this.cache.set(args.sourceUrl, {
        token,
        changedAt: Date.now(),
        lineCount,
        objectUrl: args.sourceUrl
      });

      this.trackRequest(startTime, true);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            data: {
              content,
              token,
              lineCount,
              startLine,
              endLine
            }
          })
        }]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      // Re-throw McpError as-is
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get source: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Search source code by pattern
   */
  private async handleGrepObjectSource(args: any): Promise<any> {
    const startTime = performance.now();
    try {
      // 1. Validate parameters
      ParamValidator.validateSourceUrl(args.sourceUrl);
      const pattern = ParamValidator.validatePattern(args.pattern);
      const caseInsensitive = ParamValidator.validateBoolean(args.caseInsensitive, 'caseInsensitive', false);
      const contextLines = ParamValidator.validateNonNegativeInteger(args.contextLines, 'contextLines', 0);
      const maxMatches = ParamValidator.validatePositiveInteger(args.maxMatches, 'maxMatches', 100);

      // 2. Get source code
      const fullSource = await this.adtclient.getObjectSource(args.sourceUrl);
      const lines = fullSource.split('\n');

      // 3. Compile regex
      const flags = caseInsensitive ? 'gi' : 'g';
      const regex = new RegExp(pattern, flags);

      // 4. Search matches
      const matches: GrepMatch[] = [];

      for (let i = 0; i < lines.length && matches.length < maxMatches; i++) {
        const line = lines[i];

        if (regex.test(line)) {
          regex.lastIndex = 0;

          const match: GrepMatch = {
            lineNumber: i + 1,
            content: line
          };

          if (contextLines > 0) {
            const start = Math.max(0, i - contextLines);
            const end = Math.min(lines.length, i + contextLines + 1);

            match.contextBefore = lines.slice(start, i);
            match.contextAfter = lines.slice(i + 1, end);
          }

          matches.push(match);
        }
      }

      this.trackRequest(startTime, true);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            data: {
              matches,
              matchCount: matches.length,
              lineCount: lines.length,
              pattern,
              truncated: matches.length >= maxMatches
            }
          })
        }]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      // Re-throw McpError as-is
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to grep source: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Set source code with line range support
   * Uses token for conflict detection
   */
  private async handleSetObjectSourceV2(args: any): Promise<any> {
    const startTime = performance.now();
    try {
      // 1. Validate required parameters
      ParamValidator.validateSourceUrl(args.sourceUrl);
      const token = ParamValidator.validateNonEmptyString(args.token, 'token');
      const lockHandle = ParamValidator.validateNonEmptyString(args.lockHandle, 'lockHandle');
      const content = ParamValidator.validateNonEmptyString(args.content, 'content');
      const skipConflictCheck = ParamValidator.validateBoolean(args.skipConflictCheck, 'skipConflictCheck', false);

      // Optional: transport
      const transport = args.transport ? String(args.transport).trim() : undefined;

      // 2. Get current full source to validate line range
      const fullSource = await this.adtclient.getObjectSource(args.sourceUrl);
      const lines = fullSource.split('\n');
      const lineCount = lines.length;

      // 3. Validate line range
      const [startLine, endLine] = ParamValidator.validateLineRange(
        args.startLine,
        args.endLine,
        lineCount
      );

      // 4. Validate token (conflict detection)
      const cached = this.cache.get(args.sourceUrl);

      if (cached && cached.token !== token && !skipConflictCheck) {
        this.cache.invalidate(args.sourceUrl);
        throw new McpError(ErrorCode.InvalidRequest, JSON.stringify({
          error: 'Version conflict: source code has been modified',
          details: {
            resolution: 'Please call getObjectSourceV2 to get the latest content and token'
          }
        }));
      }

      // 5. Apply modification
      const newLines = [
        ...lines.slice(0, startLine - 1),
        ...content.split('\n'),
        ...lines.slice(endLine)
      ];
      const newSource = newLines.join('\n');

      // 6. Submit
      await this.adtclient.setObjectSource(
        args.sourceUrl,
        newSource,
        lockHandle,
        transport
      );

      // 7. Invalidate cache
      this.cache.invalidate(args.sourceUrl);

      this.trackRequest(startTime, true);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            data: {
              updated: true,
              lineCount: newLines.length,
              oldRange: [startLine, endLine],
              newRange: [startLine, startLine + content.split('\n').length - 1]
            }
          })
        }]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      // Re-throw McpError as-is
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to set source: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Get cache for testing purposes
   */
  getCache(): SourceCache {
    return this.cache;
  }
}

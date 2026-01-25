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
        description: '读取 ABAP 源代码，支持行号范围和版本标识。直接传入 sourceUrl',
        inputSchema: {
          type: 'object',
          properties: {
            sourceUrl: {
              type: 'string',
              description: '源代码 URL (可直接从 objectStructure 的 abapsource:sourceUri 获取)'
            },
            startLine: {
              type: 'number',
              description: '起始行号 (1-based, 包含, 默认: 1)'
            },
            endLine: {
              type: 'number',
              description: '结束行号 (1-based, 包含, 默认: 文件末尾)'
            }
          },
          required: ['sourceUrl']
        }
      },
      // grepObjectSource
      {
        name: 'grepObjectSource',
        description: '在源代码中搜索匹配的行（正则表达式）',
        inputSchema: {
          type: 'object',
          properties: {
            sourceUrl: {
              type: 'string',
              description: '源代码 URL'
            },
            pattern: {
              type: 'string',
              description: '搜索模式 (支持正则表达式)'
            },
            caseInsensitive: {
              type: 'boolean',
              description: '忽略大小写',
              default: false
            },
            contextLines: {
              type: 'number',
              description: '上下文行数',
              default: 0
            },
            maxMatches: {
              type: 'number',
              description: '最大匹配数',
              default: 100
            }
          },
          required: ['sourceUrl', 'pattern']
        }
      },
      // setObjectSourceV2
      {
        name: 'setObjectSourceV2',
        description: '修改源代码的指定行号范围，支持版本冲突检测',
        inputSchema: {
          type: 'object',
          properties: {
            sourceUrl: {
              type: 'string',
              description: '源代码 URL'
            },
            token: {
              type: 'string',
              description: 'getObjectSourceV2 返回的版本标识'
            },
            startLine: {
              type: 'number',
              description: '起始行号 (1-based, 包含)'
            },
            endLine: {
              type: 'number',
              description: '结束行号 (1-based, 包含)'
            },
            content: {
              type: 'string',
              description: '新的内容 (将替换指定行号范围)'
            },
            lockHandle: {
              type: 'string',
              description: '对象锁定句柄 (通过 lock 工具获取)'
            },
            transport: {
              type: 'string',
              description: '传输请求号 (可选)'
            },
            skipConflictCheck: {
              type: 'boolean',
              description: '跳过冲突检查 (不推荐)',
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
      // 1. Get source code directly
      const fullSource = await this.adtclient.getObjectSource(args.sourceUrl);
      const lines = fullSource.split('\n');

      // 2. Slice by line range
      const startLine = args.startLine ?? 1;
      const endLine = args.endLine ?? lines.length;
      const content = lines.slice(startLine - 1, endLine).join('\n');

      // 3. Generate token (content hash)
      const token = TokenUtils.generateToken(Date.now(), fullSource);

      // 4. Cache
      this.cache.set(args.sourceUrl, {
        token,
        changedAt: Date.now(),
        lineCount: lines.length,
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
              lineCount: lines.length,
              startLine,
              endLine
            }
          })
        }]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
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
      // 1. Get source code
      const fullSource = await this.adtclient.getObjectSource(args.sourceUrl);
      const lines = fullSource.split('\n');

      // 2. Compile regex
      const flags = args.caseInsensitive ? 'gi' : 'g';
      let regex: RegExp;

      try {
        regex = new RegExp(args.pattern, flags);
      } catch (error: any) {
        throw new McpError(ErrorCode.InvalidRequest,
          `Invalid regular expression: ${args.pattern}`);
      }

      // 3. Search matches
      const matches: GrepMatch[] = [];
      const maxMatches = args.maxMatches ?? 100;
      const contextLines = args.contextLines ?? 0;

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
              pattern: args.pattern,
              truncated: matches.length >= maxMatches
            }
          })
        }]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
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
      // 1. Validate token (conflict detection)
      const cached = this.cache.get(args.sourceUrl);

      if (cached && cached.token !== args.token && !args.skipConflictCheck) {
        this.cache.invalidate(args.sourceUrl);
        throw new McpError(ErrorCode.InvalidRequest, JSON.stringify({
          error: '版本冲突：源代码已被修改',
          details: {
            resolution: '请调用 getObjectSourceV2 重新获取最新内容和 token'
          }
        }));
      }

      // 2. Get current full source
      const fullSource = await this.adtclient.getObjectSource(args.sourceUrl);
      const lines = fullSource.split('\n');

      // 3. Validate line range
      if (args.startLine < 1 || args.endLine > lines.length) {
        throw new McpError(ErrorCode.InvalidRequest,
          `行号超出范围：文件共 ${lines.length} 行，请求范围 ${args.startLine}-${args.endLine}`);
      }

      // 4. Apply modification
      const newLines = [
        ...lines.slice(0, args.startLine - 1),
        ...args.content.split('\n'),
        ...lines.slice(args.endLine)
      ];
      const newSource = newLines.join('\n');

      // 5. Submit
      await this.adtclient.setObjectSource(
        args.sourceUrl,
        newSource,
        args.lockHandle,
        args.transport
      );

      // 6. Invalidate cache
      this.cache.invalidate(args.sourceUrl);

      this.trackRequest(startTime, true);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            data: {
              updated: true,
              lineCount: newLines.length
            }
          })
        }]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      if (error.code && error.message) {
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

import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs';
import path from 'path';

export class HelpHandler extends BaseHandler {
  private getHelpDirectory(): string {
    // 1. Environment variable
    if (process.env.MCP_HELP_DIR) {
      return process.env.MCP_HELP_DIR;
    }

    // Search candidate paths in order
    const candidates = [
      // Current working directory
      path.join(process.cwd(), 'help-docs'),
      // Relative to this file (dist/handlers/ or src/handlers/) -> root/help-docs
      path.resolve(__dirname, '../../help-docs'),
      // Relative to the entry script location (process.argv[1])
      path.join(path.dirname(process.argv[1]), 'help-docs'),
      // One level up from entry script (e.g. if running from bin/ or dist/)
      path.join(path.dirname(process.argv[1]), '../help-docs')
    ];

    for (const candidate of candidates) {
      try {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
          this.logger.debug('Found help directory', { path: candidate });
          return candidate;
        }
      } catch (error) {
        // Ignore access errors and continue search
      }
    }

    // Fallback if nothing found
    const defaultPath = path.resolve(__dirname, '../../help-docs');
    this.logger.warn('Could not find help-docs directory in common locations, defaulting to relative path', { path: defaultPath });
    return defaultPath;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'help',
        description: 'Get detailed help and usage examples for a specific tool',
        inputSchema: {
          type: 'object',
          properties: {
            toolName: {
              type: 'string',
              description: 'The name of the tool to get help for. If omitted, lists all available help topics.'
            }
          }
        }
      }
    ];
  }

  async handle(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'help':
        return this.handleHelp(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
    }
  }

  private async handleHelp(args: any) {
    const helpDir = this.getHelpDirectory();
    let availableTopics: string[] = [];

    try {
      if (fs.existsSync(helpDir)) {
        availableTopics = fs.readdirSync(helpDir)
          .filter(f => f.endsWith('.md'))
          .map(f => f.replace('.md', ''));
      }
    } catch (error) {
      this.logger.error('Error listing help directory', { error, helpDir });
    }

    // 1. No tool name provided -> List all topics
    if (!args || !args.toolName || typeof args.toolName !== 'string' || args.toolName.trim() === '') {
      return {
        content: [
          {
            type: 'text',
            text: `Available help topics:\n\n${availableTopics.join(', ')}\n\nRun 'help <toolName>' for details on a specific tool.`
          }
        ]
      };
    }

    const requestedTool = args.toolName;
    
    // Security check: prevent directory traversal
    if (requestedTool.includes('/') || requestedTool.includes('\\') || requestedTool.includes('..')) {
      throw new McpError(ErrorCode.InvalidParams, 'Invalid tool name');
    }

    try {
      // 2. Check exact match
      const exactPath = path.join(helpDir, `${requestedTool}.md`);
      if (fs.existsSync(exactPath)) {
        const content = fs.readFileSync(exactPath, 'utf-8');
        return {
          content: [
            {
              type: 'text',
              text: content
            }
          ]
        };
      }

      // 3. Search for fuzzy matches
      // (availableTopics already loaded)

      const lowerTool = requestedTool.toLowerCase();
      
      // Case-insensitive exact match
      const caseMatch = availableTopics.find(t => t.toLowerCase() === lowerTool);
      if (caseMatch) {
        const content = fs.readFileSync(path.join(helpDir, `${caseMatch}.md`), 'utf-8');
        return {
          content: [
            {
              type: 'text',
              text: content
            }
          ]
        };
      }

      // Partial match
      const partialMatches = availableTopics.filter(t => t.toLowerCase().includes(lowerTool));
      
      if (partialMatches.length > 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Help documentation for '${requestedTool}' not found, but similar tools were found:\n\n${partialMatches.join('\n')}\n\nPlease run the help tool again with one of these exact names.`
            }
          ]
        };
      }

      // No matches found
      return {
        content: [
          {
            type: 'text',
            text: `Help documentation for '${requestedTool}' not found.\n\nAvailable help topics:\n${availableTopics.join(', ')}`
          }
        ]
      };
    } catch (error) {
      this.logger.error('Error reading help file', { error, requestedTool, helpDir });
      throw new McpError(ErrorCode.InternalError, `Failed to read help documentation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler';
import type { ToolDefinition } from '../types/tools';

export class ObjectRegistrationHandlers extends BaseHandler {
  getTools(): ToolDefinition[] {
    return [
      {
        name: 'objectRegistrationInfo',
        description: 'Get registration information for an ABAP object',
        inputSchema: {
          type: 'object',
          properties: {
            objectUrl: { type: 'string' }
          },
          required: ['objectUrl']
        }
      },
      {
        name: 'validateNewObject',
        description: 'Validate parameters for a new ABAP object',
        inputSchema: {
          type: 'object',
          properties: {
            options: { type: 'string' }
          },
          required: ['options']
        }
      },
      {
        name: 'createObject',
        description: 'Create a new ABAP object',
        inputSchema: {
          type: 'object',
          properties: {
            objtype: { type: 'string' },
            name: { type: 'string' },
            parentName: { type: 'string' },
            description: { type: 'string' },
            parentPath: { type: 'string' },
            responsible: { type: 'string', optional: true },
            transport: { type: 'string', optional: true },
            // 包创建所需的额外参数
            swcomp: { type: 'string', description: 'Software component (only required for DEVC/K objects)', optional: true },
            transportLayer: { type: 'string', description: 'Transport layer (only required for DEVC/K objects)', optional: true },
            packagetype: { type: 'string', description: 'Package type (only required for DEVC/K objects)', optional: true }
          },
          required: ['objtype', 'name', 'parentName', 'description', 'parentPath']
        }
      }
    ];
  }

  async handle(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'objectRegistrationInfo':
        return this.handleObjectRegistrationInfo(args);
      case 'validateNewObject':
        return this.handleValidateNewObject(args);
      case 'createObject':
        return this.handleCreateObject(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown object registration tool: ${toolName}`);
    }
  }

  async handleObjectRegistrationInfo(args: any): Promise<any> {
    const startTime = performance.now();
    try {
      const info = await this.adtclient.objectRegistrationInfo(args.objectUrl);
      this.trackRequest(startTime, true);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            info
          })
        }]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get registration info: ${error.message || 'Unknown error'}`
      );
    }
  }

  async handleValidateNewObject(args: any): Promise<any> {
    const startTime = performance.now();
    try {
      const result = await this.adtclient.validateNewObject(args.options);
      this.trackRequest(startTime, true);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            result
          })
        }]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to validate new object: ${error.message || 'Unknown error'}`
      );
    }
  }

  async handleCreateObject(args: any): Promise<any> {    
    const startTime = performance.now();
    try {
      // 如果是包对象且有额外参数，则使用带额外参数的调用
      if (args.objtype === 'DEVC/K' && (args.swcomp !== undefined || args.transportLayer !== undefined || args.packagetype !== undefined)) {
        const result = await this.adtclient.createObject(
          args.objtype,
          args.name,
          args.parentName,
          args.description,
          args.parentPath,
          args.responsible,
          args.transport,
          args.swcomp,
          args.transportLayer,
          args.packagetype
        );
        this.trackRequest(startTime, true);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              result
            })
          }]
        };
      } else {
        // 对于其他对象类型，使用原来的调用方式
        const result = await this.adtclient.createObject(
          args.objtype,
          args.name,
          args.parentName,
          args.description,
          args.parentPath,
          args.responsible,
          args.transport
        );
        this.trackRequest(startTime, true);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              result
            })
          }]
        };
      }
    } catch (error: any) {
      this.trackRequest(startTime, false);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create object: ${error.message || 'Unknown error'}`
      );
    }
  }
}

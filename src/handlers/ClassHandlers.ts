import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient } from 'abap-adt-api';

export class ClassHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'classIncludes',
                description: 'Get class includes structure',
                inputSchema: {
                    type: 'object',
                    properties: {
                        clas: {
                            type: 'string',
                            description: 'The class name'
                        }
                    },
                    required: ['clas']
                }
            },
            {
                name: 'classComponents',
                description: 'List class components',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: 'The URL of the class'
                        }
                    },
                    required: ['url']
                }
            },
            {
                name: 'createTestInclude',
                description: 'Create test include for class',
                inputSchema: {
                    type: 'object',
                    properties: {
                        clas: {
                            type: 'string',
                            description: 'The class name'
                        },
                        lockHandle: {
                            type: 'string',
                            description: 'The lock handle'
                        },
                        transport: {
                            type: 'string',
                            description: 'The transport number',
                            optional: true
                        }
                    },
                    required: ['clas', 'lockHandle']
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'classIncludes':
                return this.handleClassIncludes(args);
            case 'classComponents':
                return this.handleClassComponents(args);
            case 'createTestInclude':
                return this.handleCreateTestInclude(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown class tool: ${toolName}`);
        }
    }

    async handleClassIncludes(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            // 首先搜索类对象以获取其URI
            const searchResults = await this.adtclient.searchObject(args.clas, 'CLAS/OC', 1);
            if (!searchResults || searchResults.length === 0) {
                throw new Error(`Class ${args.clas} not found`);
            }
            
            // 获取第一个搜索结果的URI
            const classUri = searchResults[0]["adtcore:uri"];
            
            // 获取类的结构信息
            const classStructure = await this.adtclient.objectStructure(classUri);
            
            // 检查是否是类结构（包含includes属性）并且includes是数组
            if ('includes' in classStructure && Array.isArray(classStructure.includes)) {
                // 然后使用classIncludes方法获取包含信息
                const result = ADTClient.classIncludes(classStructure);
                this.trackRequest(startTime, true);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                status: 'success',
                                result: Object.fromEntries(result) // 将Map转换为对象以便JSON序列化
                            })
                        }
                    ]
                };
            } else {
                throw new Error(`Object ${args.clas} is not a class or does not have includes or includes is not an array`);
            }
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get class includes: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleClassComponents(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.classComponents(args.url);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            result
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get class components: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleCreateTestInclude(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.createTestInclude(
                args.clas,
                args.lockHandle,
                args.transport
            );
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            result
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to create test include: ${error.message || 'Unknown error'}`
            );
        }
    }
}

import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient, UnitTestRunFlags } from 'abap-adt-api';

export class UnitTestHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'unitTestRun',
                description: 'Runs unit tests.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: 'The URL of the object to test.'
                        },
                        flags: {
                            type: 'string',
                            description: 'Flags for the unit test run.',
                            optional: true
                        }
                    },
                    required: ['url']
                }
            },
            {
                name: 'unitTestEvaluation',
                description: 'Evaluates unit test results.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        clas: {
                            type: 'string',
                            description: 'The class to evaluate.'
                        },
                        flags: {
                            type: 'string',
                            description: 'Flags for the unit test evaluation.',
                            optional: true
                        }
                    },
                    required: ['clas']
                }
            },
            {
                name: 'unitTestOccurrenceMarkers',
                description: 'Retrieves unit test occurrence markers.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: 'The URL of the object.'
                        },
                        source: {
                            type: 'string',
                            description: 'The source code.'
                        }
                    },
                    required: ['url', 'source']
                }
            },
            {
                name: 'createTestInclude',
                description: 'Creates a test include for a class.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        clas: {
                            type: 'string',
                            description: 'The class name.'
                        },
                        lockHandle: {
                            type: 'string',
                            description: 'The lock handle.'
                        },
                        transport: {
                            type: 'string',
                            description: 'The transport.',
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
            case 'unitTestRun':
                return this.handleUnitTestRun(args);
            case 'unitTestEvaluation':
                return this.handleUnitTestEvaluation(args);
            case 'unitTestOccurrenceMarkers':
                return this.handleUnitTestOccurrenceMarkers(args);
            case 'createTestInclude':
                return this.handleCreateTestInclude(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown unit test tool: ${toolName}`);
        }
    }

    async handleUnitTestRun(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.unitTestRun(args.url, args.flags);
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
                `Failed to run unit test: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleUnitTestEvaluation(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            // 首先需要获取类的信息以构建 UnitTestClass 对象
            // 通过搜索对象获取类的URI和其他信息
            const searchResults = await this.adtclient.searchObject(args.clas, 'CLAS/OC', 1);
            if (!searchResults || searchResults.length === 0) {
                throw new Error(`Class ${args.clas} not found`);
            }
            
            // 获取类的结构信息
            const classUri = searchResults[0]["adtcore:uri"];
            const classStructure = await this.adtclient.objectStructure(classUri);
            
            // 构建一个基本的 UnitTestClass 对象
            // 注意：这里我们只是构建一个基本结构，实际的 testmethods 需要通过其他方式获取
            const unitTestClass = {
                "adtcore:uri": classUri,
                "adtcore:name": args.clas,
                "adtcore:type": "CLAS/OC",
                uriType: "object",
                durationCategory: "short",
                riskLevel: "harmless",
                testmethods: [], // 可能需要通过其他方法获取测试方法
                alerts: []
            };
            
            const result = await this.adtclient.unitTestEvaluation(unitTestClass, args.flags);
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
                `Failed to evaluate unit test: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleUnitTestOccurrenceMarkers(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const markers = await this.adtclient.unitTestOccurrenceMarkers(args.url, args.source);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            markers
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get unit test markers: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleCreateTestInclude(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.createTestInclude(args.clas, args.lockHandle, args.transport);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            result,
                            message: 'Test include created successfully'
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

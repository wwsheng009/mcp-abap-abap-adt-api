import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient, PackageValueHelpType } from 'abap-adt-api';

export class DdicHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'annotationDefinitions',
                description: 'Retrieves annotation definitions.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'ddicElement',
                description: 'Retrieves information about a DDIC element (table, structure, view, etc.).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'The DDIC element name (e.g., "ZJG_REST_LOG", "USR01", "SPFLI"). Use table/view name only, not full ADT URI.'
                        },
                        getTargetForAssociation: {
                            type: 'boolean',
                            description: 'Whether to get the target for association.',
                            optional: true
                        },
                        getExtensionViews: {
                            type: 'boolean',
                            description: 'Whether to get extension views.',
                            optional: true
                        },
                        getSecondaryObjects: {
                            type: 'boolean',
                            description: 'Whether to get secondary objects.',
                            optional: true
                        }
                    },
                    required: ['path']
                }
            },
            {
                name: 'ddicRepositoryAccess',
                description: 'Accesses the DDIC repository for data source information.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'The DDIC data source name (e.g., table name, CDS view name).'
                        }
                    },
                    required: ['path']
                }
            },
            {
                name: 'packageSearchHelp',
                description: 'Performs a package search help.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            description: 'The package value help type.'
                        },
                        name: {
                            type: 'string',
                            description: 'The package name.',
                            optional: true
                        }
                    },
                    required: ['type']
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'annotationDefinitions':
                return this.handleAnnotationDefinitions(args);
            case 'ddicElement':
                return this.handleDdicElement(args);
            case 'ddicRepositoryAccess':
                return this.handleDdicRepositoryAccess(args);
            case 'packageSearchHelp':
                return this.handlePackageSearchHelp(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown DDIC tool: ${toolName}`);
        }
    }

    async handleAnnotationDefinitions(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.annotationDefinitions();
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
                `Failed to get annotation definitions: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDdicElement(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            // Validate path format - should be table/view name, not ADT URI
            let path = args.path;
            if (path && (path.startsWith('/') || path.startsWith('/sap/bc/adt'))) {
                throw new McpError(
                    ErrorCode.InvalidRequest,
                    `Invalid path format. Use table/view name only (e.g., "ZJG_REST_LOG"), not ADT URI. Received: "${path}"`
                );
            }

            const result = await this.adtclient.ddicElement(
                path,
                args.getTargetForAssociation,
                args.getExtensionViews,
                args.getSecondaryObjects
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
                `Failed to get DDIC element: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDdicRepositoryAccess(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.ddicRepositoryAccess(args.path);
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
                `Failed to access DDIC repository: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handlePackageSearchHelp(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.packageSearchHelp(args.type, args.name);
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
                `Failed to get package search help: ${error.message || 'Unknown error'}`
            );
        }
    }
}

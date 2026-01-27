"use strict";
/**
 * Streamable HTTP Client Example
 *
 * Demonstrates using StreamableHTTPClientTransport with MCP SDK
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/client/streamableHttp.js");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const serverUrl = new URL('http://localhost:3000/mcp');
        // Create Streamable HTTP transport
        const transport = new streamableHttp_js_1.StreamableHTTPClientTransport(serverUrl, {
            reconnectionOptions: {
                maxRetries: 3,
                initialReconnectionDelay: 1000,
                maxReconnectionDelay: 30000,
                reconnectionDelayGrowFactor: 1.5
            }
        });
        // Create client
        const client = new index_js_1.Client({
            name: 'streamable-example-client',
            version: '1.0.0'
        }, {
            capabilities: {}
        });
        try {
            // Connect to server
            yield client.connect(transport);
            console.error('✓ Connected to MCP ABAP ADT API Server');
            console.error(`  Session ID: ${transport.sessionId}\n`);
            // List available tools
            console.error('=== Available Tools ===');
            const tools = yield client.listTools();
            console.error(`Total tools: ${tools.tools.length}`);
            tools.tools.slice(0, 10).forEach((tool) => {
                console.error(`  • ${tool.name}`);
            });
            if (tools.tools.length > 10) {
                console.error(`  ... and ${tools.tools.length - 10} more`);
            }
            console.error('');
            // Call streamingDemo tool
            console.error('=== Calling streamingDemo ===');
            const result = yield client.callTool({
                name: 'streamingDemo',
                arguments: {
                    steps: 3,
                    delayMs: 500
                }
            });
            console.error(result.content[0].text);
            console.error('');
            // Call healthcheck
            console.error('=== Calling healthcheck ===');
            const health = yield client.callTool({
                name: 'healthcheck',
                arguments: {}
            });
            console.error(health.content[0].text);
            console.error('');
            // List tools again to verify session persistence
            console.error('=== Session Persistence Check ===');
            const tools2 = yield client.listTools();
            console.error(`Session still active: ${transport.sessionId}`);
            console.error(`Tool count consistent: ${tools.tools.length === tools2.tools.length}`);
        }
        catch (error) {
            console.error('Error:', error.message);
            if (error.code) {
                console.error('Error code:', error.code);
            }
        }
        finally {
            // Close connection
            yield transport.close();
            console.error('\n✓ Connection closed');
        }
    });
}
main().catch(console.error);

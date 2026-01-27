"use strict";
/**
 * Example HTTP/SSE client for MCP ABAP ADT API Server
 *
 * This demonstrates how to connect to the server using HTTP/SSE transport
 * instead of stdio.
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
const sse_js_1 = require("@modelcontextprotocol/sdk/client/sse.js");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Connect to the HTTP/SSE server
        const transport = new sse_js_1.SSEClientTransport(new URL('http://localhost:3000/sse'));
        const client = new index_js_1.Client({
            name: 'example-http-client',
            version: '1.0.0'
        }, {
            capabilities: {}
        });
        try {
            // Connect to the server
            yield client.connect(transport);
            console.error('Connected to MCP ABAP ADT API Server via HTTP/SSE');
            // List available tools
            const toolsList = yield client.listTools();
            console.error('\n=== Available Tools ===');
            console.error(`Total tools: ${toolsList.tools.length}`);
            toolsList.tools.slice(0, 5).forEach(tool => {
                console.error(`  - ${tool.name}: ${tool.description}`);
            });
            if (toolsList.tools.length > 5) {
                console.error(`  ... and ${toolsList.tools.length - 5} more`);
            }
            // Example: Call healthcheck tool
            console.error('\n=== Calling healthcheck ===');
            const healthResult = yield client.callTool({
                name: 'healthcheck',
                arguments: {}
            });
            console.error(healthResult.content[0].text);
            // Example: Login (requires valid SAP credentials in .env)
            console.error('\n=== Calling login ===');
            try {
                const loginResult = yield client.callTool({
                    name: 'login',
                    arguments: {}
                });
                console.error(loginResult.content[0].text);
            }
            catch (error) {
                console.error('Login failed:', error.message);
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
        finally {
            yield client.close();
            console.error('\nConnection closed');
        }
    });
}
main().catch(console.error);

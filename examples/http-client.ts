/**
 * Example HTTP/SSE client for MCP ABAP ADT API Server
 *
 * This demonstrates how to connect to the server using HTTP/SSE transport
 * instead of stdio.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

async function main() {
  // Connect to the HTTP/SSE server
  const transport = new SSEClientTransport(
    new URL('http://localhost:3000/sse')
  );

  const client = new Client({
    name: 'example-http-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  try {
    // Connect to the server
    await client.connect(transport);
    console.error('Connected to MCP ABAP ADT API Server via HTTP/SSE');

    // List available tools
    const toolsList = await client.listTools();
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
    const healthResult = await client.callTool({
      name: 'healthcheck',
      arguments: {}
    });
    console.error(healthResult.content[0].text);

    // Example: Login (requires valid SAP credentials in .env)
    console.error('\n=== Calling login ===');
    try {
      const loginResult = await client.callTool({
        name: 'login',
        arguments: {}
      });
      console.error(loginResult.content[0].text);
    } catch (error: any) {
      console.error('Login failed:', error.message);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.error('\nConnection closed');
  }
}

main().catch(console.error);

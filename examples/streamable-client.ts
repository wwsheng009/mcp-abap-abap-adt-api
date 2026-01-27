/**
 * Streamable HTTP Client Example
 *
 * Demonstrates using StreamableHTTPClientTransport with MCP SDK
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

async function main() {
  const serverUrl = new URL('http://localhost:3000/mcp');

  // Create Streamable HTTP transport
  const transport = new StreamableHTTPClientTransport(serverUrl, {
    reconnectionOptions: {
      maxRetries: 3,
      initialReconnectionDelay: 1000,
      maxReconnectionDelay: 30000,
      reconnectionDelayGrowFactor: 1.5
    }
  });

  // Create client
  const client = new Client(
    {
      name: 'streamable-example-client',
      version: '1.0.0'
    },
    {
      capabilities: {}
    }
  );

  try {
    // Connect to server
    await client.connect(transport);
    console.error('✓ Connected to MCP ABAP ADT API Server');
    console.error(`  Session ID: ${transport.sessionId}\n`);

    // List available tools
    console.error('=== Available Tools ===');
    const tools = await client.listTools();
    console.error(`Total tools: ${tools.tools.length}`);
    tools.tools.slice(0, 10).forEach((tool: any) => {
      console.error(`  • ${tool.name}`);
    });
    if (tools.tools.length > 10) {
      console.error(`  ... and ${tools.tools.length - 10} more`);
    }
    console.error('');

    // Call streamingDemo tool
    console.error('=== Calling streamingDemo ===');
    const result = await client.callTool({
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
    const health = await client.callTool({
      name: 'healthcheck',
      arguments: {}
    });
    console.error(health.content[0].text);
    console.error('');

    // List tools again to verify session persistence
    console.error('=== Session Persistence Check ===');
    const tools2 = await client.listTools();
    console.error(`Session still active: ${transport.sessionId}`);
    console.error(`Tool count consistent: ${tools.tools.length === tools2.tools.length}`);

  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    // Close connection
    await transport.close();
    console.error('\n✓ Connection closed');
  }
}

main().catch(console.error);

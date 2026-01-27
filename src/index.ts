#!/usr/bin/env node

/**
 * Stdio Server Entry Point
 * 
 * Simple wrapper that uses the shared AbapAdtServerBase class.
 */

import { config } from 'dotenv';
import path from 'path';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Load environment variables
config({ path: path.resolve(__dirname, '../.env') });

import { AbapAdtServerBase } from './server/AbapAdtServerBase.js';
import { getEnabledToolGroups, getEnabledToolNames, TOOL_GROUPS } from './toolGroups.js';

async function main() {
  const server = new AbapAdtServerBase(
    "mcp-abap-abap-adt-api",
    "0.2.0"
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log enabled tool groups
  const enabledGroups = getEnabledToolGroups();
  const enabledTools = getEnabledToolNames();

  console.error('MCP ABAP ADT API server running on stdio');
  console.error(`Enabled tool groups (${enabledGroups.length}): ${enabledGroups.join(', ')}`);
  console.error(`Total tools available: ${enabledTools.size}`);

  // List available tool groups for reference
  const allGroups = Object.keys(TOOL_GROUPS);
  const disabledGroups = allGroups.filter(g => !enabledGroups.includes(g));
  if (disabledGroups.length > 0 && process.env.MCP_TOOLS) {
    console.error(`Available groups (disabled): ${disabledGroups.join(', ')}`);
  } else if (!process.env.MCP_TOOLS) {
    console.error('');
    console.error('To enable tool groups, set MCP_TOOLS environment variable:');
    console.error(`  Available groups: ${allGroups.join(', ')}`);
  }

  // Handle shutdown
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.close();
    process.exit(0);
  });

  server.onerror = (error) => {
    console.error('[MCP Error]', error);
  };
}

// Only run if executed directly
if (require.main === module || process.argv[1]?.endsWith('index.js')) {
  main().catch((error) => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}

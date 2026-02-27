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
import { getLogger, TransportType } from './lib/structuredLogger.js';
import { protectStdout } from './lib/stdioFirewall.js';

async function main() {
  // Set MCP stdio mode to enable protocol protection
  process.env.MCP_STDIO_MODE = 'true';

  // Activate stdout firewall to prevent protocol pollution
  protectStdout();

  // Create logger and log connection events
  // For Stdio transport, disable console output to avoid interfering with MCP communication
  process.env.LOG_CONSOLE = 'false';
  process.env.LOG_STDIO = 'false';
  process.env.LOG_FILE = 'true';
  const logger = getLogger(TransportType.STDIO);

  const server = await AbapAdtServerBase.create(
    "mcp-abap-abap-adt-api",
    "0.2.0"
  );

  // Set transport type for proper logging
  (server as any).setTransportType('stdio' as any);

  const transport = new StdioServerTransport();
  
  transport.onerror = (error) => {
    logger.logStdioConnection('error', { error: error.message || String(error) });
  };

  await server.connect(transport);
  logger.logStdioConnection('connect');

  // Log enabled tool groups (only to file, not to console)
  const enabledGroups = getEnabledToolGroups();
  const enabledTools = getEnabledToolNames();

  logger.info('Server started', {
    transport: 'stdio',
    enabledGroups: enabledGroups.join(','),
    toolCount: enabledTools.size,
    message: 'MCP ABAP ADT API server running on stdio'
  });

  // List available tool groups for reference
  const allGroups = Object.keys(TOOL_GROUPS);
  const disabledGroups = allGroups.filter(g => !enabledGroups.includes(g));
  if (disabledGroups.length > 0 && process.env.MCP_TOOLS) {
    logger.info('Available groups (disabled)', {
      disabledGroups,
      enabledGroups
    });
  } else if (!process.env.MCP_TOOLS) {
    logger.info('Tool groups configuration', {
      message: 'To enable tool groups, set MCP_TOOLS environment variable',
      allGroups
    });
  }

  // Handle shutdown
  process.on('SIGINT', async () => {
    await server.close();
    logger.logStdioConnection('disconnect', { signal: 'SIGINT' });
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.close();
    logger.logStdioConnection('disconnect', { signal: 'SIGTERM' });
    process.exit(0);
  });

  server.onerror = (error) => {
    logger.error('[MCP Error]', error);
  };
}

// Only run if executed directly
if (require.main === module || process.argv[1]?.endsWith('index.js')) {
  main().catch((error) => {
    // Only output to stderr if logger is not initialized yet
    // Otherwise, rely on file logging
    try {
      const logger = getLogger(TransportType.STDIO);
      logger.error('Server failed to start', error);
    } catch {
      console.error('Failed to start MCP server:', error);
    }
    process.exit(1);
  });
}

#!/usr/bin/env node

/**
 * Streamable HTTP Server (Stateless) Entry Point
 * 
 * Stateless mode for MCP Inspector - allows free reconnections
 * without session validation errors.
 */

import { config } from 'dotenv';
import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import path from 'path';

// Load environment variables
config({ path: path.resolve(__dirname, '../.env') });

import { AbapAdtServerBase } from './server/AbapAdtServerBase.js';
import { getEnabledToolGroups } from './toolGroups.js';
import { getLogger, TransportType } from './lib/structuredLogger.js';

async function startServer(port: number = 3000) {
  const server = new AbapAdtServerBase(
    "mcp-abap-abap-adt-api-stateless",
    "0.2.0"
  );

  // Set transport type for proper logging
  (server as any).setTransportType(TransportType.STREAMABLE_HTTP);
  const logger = getLogger(TransportType.STREAMABLE_HTTP);

  // Stateless transport - no session ID generator
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);

  const httpServer = createHttpServer(async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Mcp-Session-Id, Accept');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.url === '/health' && req.method === 'GET') {
      logger.debug('Health check requested');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        mode: 'stateless',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    if (req.url?.startsWith('/mcp')) {
      try {
        await transport.handleRequest(req, res);
      } catch (error: any) {
        logger.error('Request handling error', error);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  httpServer.listen(port, () => {
    const enabledGroups = getEnabledToolGroups();
    logger.info('Server started', {
      port,
      mode: 'stateless',
      toolGroups: enabledGroups.join(','),
      endpoint: `http://localhost:${port}/mcp`,
      note: 'Designed for MCP Inspector debugging',
      displayInfo: {
        title: 'MCP ABAP ADT - Streamable HTTP (Stateless)',
        mode: 'STATELESS (no session persistence)',
        idealFor: 'MCP Inspector debugging'
      }
    });

    console.error(`╔════════════════════════════════════════════════════════════╗`);
    console.error(`║  MCP ABAP ADT - Streamable HTTP (Stateless)              ║`);
    console.error(`╠════════════════════════════════════════════════════════════╣`);
    console.error(`║  MCP Endpoint:      http://localhost:${port}/mcp             ║`);
    console.error(`║  Mode:              STATELESS (no session persistence)        ║`);
    console.error(`║  Ideal for:         MCP Inspector debugging                  ║`);
    console.error(`╠════════════════════════════════════════════════════════════╣`);
    console.error(`║  Tool Groups:       ${enabledGroups.join(', ').padEnd(39)}║`);
    console.error(`║  Streaming:         AUTO (JSON or SSE based on client)        ║`);
    console.error(`╚════════════════════════════════════════════════════════════╝`);
  });

  const shutdown = async () => {
    logger.info('Server shutting down');
    httpServer.close();
    await server.close();
    await transport.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

const port = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3000;
startServer(port).catch((error) => {
  const logger = getLogger(TransportType.STREAMABLE_HTTP);
  logger.error('Server failed to start', error);
  console.error('Failed to start server:', error);
  process.exit(1);
});

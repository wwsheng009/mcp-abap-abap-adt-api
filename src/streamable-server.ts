#!/usr/bin/env node

/**
 * Streamable HTTP Server (Stateful) Entry Point
 * 
 * Production-ready server with session persistence and reconnection support.
 */

import { config } from 'dotenv';
import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from 'crypto';
import path from 'path';

// Load environment variables
config({ path: path.resolve(__dirname, '../.env') });

import { AbapAdtServerBase } from './server/AbapAdtServerBase.js';
import { getEnabledToolGroups } from './toolGroups.js';
import { getLogger, TransportType } from './lib/structuredLogger.js';

async function startServer(port: number = 3000) {
  const server = new AbapAdtServerBase(
    "mcp-abap-abap-adt-api-streamable",
    "0.2.0"
  );

  // Set transport type for proper logging
  (server as any).setTransportType(TransportType.STREAMABLE_HTTP);
  const logger = getLogger(TransportType.STREAMABLE_HTTP);

  // Stateful transport with session ID generation
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
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
        mode: 'stateful',
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
      mode: 'stateful',
      toolGroups: enabledGroups.join(','),
      endpoint: `http://localhost:${port}/mcp`,
      displayInfo: {
        title: 'MCP ABAP ADT - Streamable HTTP (Stateful)',
        mode: 'STATEFUL (session persistence)',
        idealFor: 'Production clients'
      }
    });

    console.error(`╔════════════════════════════════════════════════════════════╗`);
    console.error(`║  MCP ABAP ADT - Streamable HTTP (Stateful)                ║`);
    console.error(`╠════════════════════════════════════════════════════════════╣`);
    console.error(`║  MCP Endpoint:      http://localhost:${port}/mcp             ║`);
    console.error(`║  Mode:              STATEFUL (session persistence)         ║`);
    console.error(`║  Ideal for:         Production clients                      ║`);
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

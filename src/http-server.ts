#!/usr/bin/env node

/**
 * Legacy HTTP/SSE Server Entry Point
 * 
 * This is the original SSE-based HTTP transport (before Streamable HTTP).
 * Kept for backward compatibility.
 */

import { config } from 'dotenv';
import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import path from 'path';

config({ path: path.resolve(__dirname, '../.env') });

import { AbapAdtServerBase } from './server/AbapAdtServerBase.js';
import { getEnabledToolGroups } from './toolGroups.js';

const transports = new Map<string, SSEServerTransport>();

async function startHttpServer(port: number = 3000) {
  const server = new AbapAdtServerBase(
    "mcp-abap-abap-adt-api-http",
    "0.2.0"
  );

  const httpServer = createHttpServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-ID');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (url.pathname === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        transport: 'sse',
        activeConnections: transports.size
      }));
      return;
    }

    if (url.pathname === '/sse' && req.method === 'GET') {
      const transport = new SSEServerTransport('/message', res);
      transports.set(transport.sessionId, transport);

      transport.onclose = () => transports.delete(transport.sessionId);
      transport.onerror = () => transports.delete(transport.sessionId);

      await server.connect(transport);
      return;
    }

    if (url.pathname === '/message' && req.method === 'POST') {
      let sessionId = req.headers['x-session-id'] as string || url.searchParams.get('sessionId') || '';

      const transport = transports.get(sessionId);
      if (!transport) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Session not found' }));
        return;
      }

      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          await transport.handlePostMessage(req, res, body ? JSON.parse(body) : undefined);
        } catch (error: any) {
          if (!res.headersSent) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: error.message }));
          }
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  httpServer.listen(port, () => {
    const enabledGroups = getEnabledToolGroups();
    console.error(`╔════════════════════════════════════════════════════════════╗`);
    console.error(`║  MCP ABAP ADT - HTTP/SSE Server (Legacy)                  ║`);
    console.error(`╠════════════════════════════════════════════════════════════╣`);
    console.error(`║  SSE Endpoint:     http://localhost:${port}/sse            ║`);
    console.error(`║  Message Endpoint: http://localhost:${port}/message         ║`);
    console.error(`║  Health Check:     http://localhost:${port}/health          ║`);
    console.error(`╠════════════════════════════════════════════════════════════╣`);
    console.error(`║  Tool Groups:      ${enabledGroups.join(', ').padEnd(39)}║`);
    console.error(`╚════════════════════════════════════════════════════════════╝`);
  });

  const shutdown = async () => {
    httpServer.close();
    await server.close();
    transports.clear();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

const port = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3000;
startHttpServer(port).catch(console.error);

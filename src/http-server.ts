#!/usr/bin/env node

import { config } from 'dotenv';
import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { AbapAdtServer } from './index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import path from 'path';

// Load environment variables
config({ path: path.resolve(__dirname, '../.env') });

// Store active transports by session ID for message routing
const transports = new Map<string, SSEServerTransport>();

/**
 * Start MCP server with HTTP/SSE transport
 */
async function startHttpServer(port: number = 3000) {
  // Create MCP server instance
  const server = new AbapAdtServer();

  // Create HTTP server
  const httpServer = createHttpServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);

    // Enable CORS for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-ID');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Health check endpoint
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

    // List tools endpoint (REST API alternative)
    if (url.pathname === '/tools' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Available via MCP protocol',
        note: 'Connect to /sse endpoint to interact with tools',
        health: '/health for status check'
      }));
      return;
    }

    // SSE endpoint - establish connection
    if (url.pathname === '/sse' && req.method === 'GET') {
      console.error(`[HTTP] New SSE connection from ${req.socket.remoteAddress}`);

      // Create SSE transport with message endpoint
      const transport = new SSEServerTransport('/message', res);

      // Store transport by session ID for routing POST messages
      transports.set(transport.sessionId, transport);

      // Cleanup on close
      transport.onclose = () => {
        console.error(`[HTTP] SSE session closed: ${transport.sessionId}`);
        transports.delete(transport.sessionId);
      };

      transport.onerror = (error) => {
        console.error(`[HTTP] SSE session error: ${transport.sessionId}`, error);
        transports.delete(transport.sessionId);
      };

      // Connect to MCP server (this will automatically call transport.start())
      await server.connect(transport);

      console.error(`[HTTP] SSE session established: ${transport.sessionId}`);
      console.error(`[HTTP] Active connections: ${transports.size}`);

      return;
    }

    // Message endpoint - receive POST requests from client
    if (url.pathname === '/message' && req.method === 'POST') {
      // Parse session ID from header or URL query parameter
      let sessionId = req.headers['x-session-id'] as string;

      // If not in header, check URL query parameter
      if (!sessionId) {
        sessionId = url.searchParams.get('sessionId') || '';
      }

      if (!sessionId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Missing session ID',
          hint: 'Provide X-Session-ID header or ?sessionId= URL parameter'
        }));
        return;
      }

      // Find the transport for this session
      const transport = transports.get(sessionId);
      if (!transport) {
        console.error(`[HTTP] Unknown session ID: ${sessionId}`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Session not found' }));
        return;
      }

      // Read and parse request body
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const parsedBody = body ? JSON.parse(body) : undefined;
          console.error(`[HTTP] Received message for session ${sessionId}`);

          // Let the transport handle the message
          await transport.handlePostMessage(req, res, parsedBody);
        } catch (error: any) {
          console.error('[HTTP] Failed to handle message:', error);
          // Only send response if not already sent
          if (!res.headersSent) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message || 'Invalid request' }));
          }
        }
      });

      return;
    }

    // 404 for unknown paths
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path: url.pathname }));
  });

  // Start listening
  httpServer.listen(port, () => {
    const enabledGroups = process.env.MCP_TOOLS || 'full';
    console.error(`╔════════════════════════════════════════════════════════════╗`);
    console.error(`║  MCP ABAP ADT API Server - HTTP/SSE Mode                  ║`);
    console.error(`╠════════════════════════════════════════════════════════════╣`);
    console.error(`║  SSE Endpoint:     http://localhost:${port}/sse            ║`);
    console.error(`║  Message Endpoint: http://localhost:${port}/message         ║`);
    console.error(`║  Health Check:     http://localhost:${port}/health          ║`);
    console.error(`║  Tools List:       http://localhost:${port}/tools           ║`);
    console.error(`╠════════════════════════════════════════════════════════════╣`);
    console.error(`║  Tool Groups:      ${enabledGroups.padEnd(40)}║`);
    console.error(`╚════════════════════════════════════════════════════════════╝`);
  });

  // Handle shutdown
  const shutdown = async () => {
    console.error('\n[HTTP] Shutting down server...');
    httpServer.close();
    await server.close();
    transports.clear();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Handle errors
  server.onerror = (error) => {
    console.error('[MCP Error]', error);
  };

  httpServer.on('error', (error) => {
    console.error('[HTTP Server Error]', error);
  });
}

// Get port from environment or use default
const port = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3000;

startHttpServer(port).catch((error) => {
  console.error('Failed to start HTTP server:', error);
  process.exit(1);
});

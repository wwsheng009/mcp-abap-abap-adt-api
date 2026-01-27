#!/usr/bin/env node

import { config } from 'dotenv';
import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode
} from "@modelcontextprotocol/sdk/types.js";
import { ADTClient, session_types } from "abap-adt-api";
import path from 'path';

// Import all handlers (same as streamable server)
import { AuthHandlers } from './handlers/AuthHandlers.js';
import { TransportHandlers } from './handlers/TransportHandlers.js';
import { ObjectHandlers } from './handlers/ObjectHandlers.js';
import { ClassHandlers } from './handlers/ClassHandlers.js';
import { CodeAnalysisHandlers } from './handlers/CodeAnalysisHandlers.js';
import { ObjectLockHandlers } from './handlers/ObjectLockHandlers.js';
import { ObjectSourceHandlers } from './handlers/ObjectSourceHandlers.js';
import { ObjectSourceHandlersV2 } from './handlersV2/ObjectSourceHandlersV2.js';
import { ObjectDeletionHandlers } from './handlers/ObjectDeletionHandlers.js';
import { ObjectManagementHandlers } from './handlers/ObjectManagementHandlers.js';
import { ObjectRegistrationHandlers } from './handlers/ObjectRegistrationHandlers.js';
import { NodeHandlers } from './handlers/NodeHandlers.js';
import { DiscoveryHandlers } from './handlers/DiscoveryHandlers.js';
import { UnitTestHandlers } from './handlers/UnitTestHandlers.js';
import { PrettyPrinterHandlers } from './handlers/PrettyPrinterHandlers.js';
import { GitHandlers } from './handlers/GitHandlers.js';
import { DdicHandlers } from './handlers/DdicHandlers.js';
import { ServiceBindingHandlers } from './handlers/ServiceBindingHandlers.js';
import { QueryHandlers } from './handlers/QueryHandlers.js';
import { FeedHandlers } from './handlers/FeedHandlers.js';
import { DebugHandlers } from './handlers/DebugHandlers.js';
import { RenameHandlers } from './handlers/RenameHandlers.js';
import { AtcHandlers } from './handlers/AtcHandlers.js';
import { TraceHandlers } from './handlers/TraceHandlers.js';
import { RefactorHandlers } from './handlers/RefactorHandlers.js';
import { RevisionHandlers } from './handlers/RevisionHandlers.js';
import { filterToolsByGroups } from './toolGroups.js';

// Load environment variables
config({ path: path.resolve(__dirname, '../.env') });

/**
 * MCP Server with Streamable HTTP support (STATELESS mode for Inspector)
 *
 * This is a stateless variant that doesn't maintain session state between requests.
 * Ideal for development and debugging with MCP Inspector where reconnections
 * are frequent and session persistence is not required.
 */
class AbapAdtServerStateless extends Server {
  private adtClient: ADTClient;
  private handlers: any;

  constructor() {
    super(
      {
        name: "mcp-abap-abap-adt-api-stateless",
        version: "0.2.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    const missingVars = ['SAP_URL', 'SAP_USER', 'SAP_PASSWORD'].filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    this.adtClient = new ADTClient(
      process.env.SAP_URL as string,
      process.env.SAP_USER as string,
      process.env.SAP_PASSWORD as string,
      process.env.SAP_CLIENT as string,
      process.env.SAP_LANGUAGE as string
    );
    this.adtClient.stateful = session_types.stateful;

    // Initialize all handlers
    this.handlers = {
      auth: new AuthHandlers(this.adtClient),
      transport: new TransportHandlers(this.adtClient),
      object: new ObjectHandlers(this.adtClient),
      class: new ClassHandlers(this.adtClient),
      codeAnalysis: new CodeAnalysisHandlers(this.adtClient),
      objectLock: new ObjectLockHandlers(this.adtClient),
      objectSource: new ObjectSourceHandlers(this.adtClient),
      objectSourceV2: new ObjectSourceHandlersV2(this.adtClient),
      objectDeletion: new ObjectDeletionHandlers(this.adtClient),
      objectManagement: new ObjectManagementHandlers(this.adtClient),
      objectRegistration: new ObjectRegistrationHandlers(this.adtClient),
      node: new NodeHandlers(this.adtClient),
      discovery: new DiscoveryHandlers(this.adtClient),
      unitTest: new UnitTestHandlers(this.adtClient),
      prettyPrinter: new PrettyPrinterHandlers(this.adtClient),
      git: new GitHandlers(this.adtClient),
      ddic: new DdicHandlers(this.adtClient),
      serviceBinding: new ServiceBindingHandlers(this.adtClient),
      query: new QueryHandlers(this.adtClient),
      feed: new FeedHandlers(this.adtClient),
      debug: new DebugHandlers(this.adtClient),
      rename: new RenameHandlers(this.adtClient),
      atc: new AtcHandlers(this.adtClient),
      trace: new TraceHandlers(this.adtClient),
      refactor: new RefactorHandlers(this.adtClient),
      revision: new RevisionHandlers(this.adtClient),
    };

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // Collect all tools from handlers (same as streamable server)
    const allTools = [
      ...this.handlers.auth.getTools(),
      ...this.handlers.transport.getTools(),
      ...this.handlers.object.getTools(),
      ...this.handlers.class.getTools(),
      ...this.handlers.codeAnalysis.getTools(),
      ...this.handlers.objectLock.getTools(),
      ...this.handlers.objectSource.getTools(),
      ...this.handlers.objectSourceV2.getTools(),
      ...this.handlers.objectDeletion.getTools(),
      ...this.handlers.objectManagement.getTools(),
      ...this.handlers.objectRegistration.getTools(),
      ...this.handlers.node.getTools(),
      ...this.handlers.discovery.getTools(),
      ...this.handlers.unitTest.getTools(),
      ...this.handlers.prettyPrinter.getTools(),
      ...this.handlers.git.getTools(),
      ...this.handlers.ddic.getTools(),
      ...this.handlers.serviceBinding.getTools(),
      ...this.handlers.query.getTools(),
      ...this.handlers.feed.getTools(),
      ...this.handlers.debug.getTools(),
      ...this.handlers.rename.getTools(),
      ...this.handlers.atc.getTools(),
      ...this.handlers.trace.getTools(),
      ...this.handlers.refactor.getTools(),
      ...this.handlers.revision.getTools(),
      {
        name: 'streamingDemo',
        description: 'Demonstrates streaming responses with progress updates',
        inputSchema: {
          type: 'object',
          properties: {
            steps: { type: 'number', default: 5 },
            delayMs: { type: 'number', default: 1000 }
          }
        }
      },
      {
        name: 'healthcheck',
        description: 'Check server health',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];

    this.setRequestHandler(ListToolsRequestSchema, async () => {
      const filteredTools = filterToolsByGroups(allTools);
      return { tools: filteredTools };
    });

    this.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        let result: any;

        switch (request.params.name) {
          case 'healthcheck':
            result = {
              status: 'healthy',
              timestamp: new Date().toISOString(),
              mode: 'stateless'
            };
            break;

          case 'streamingDemo':
            result = await this.handleStreamingDemo(request);
            break;

          // Route to handlers (simplified - main tools only)
          case 'login':
          case 'logout':
          case 'dropSession':
            result = await this.handlers.auth.handle(request.params.name, request.params.arguments);
            break;

          case 'transportInfo':
          case 'createTransport':
            result = await this.handlers.transport.handle(request.params.name, request.params.arguments);
            break;

          case 'lock':
          case 'unLock':
            result = await this.handlers.objectLock.handle(request.params.name, request.params.arguments);
            break;

          case 'objectStructure':
          case 'searchObject':
            result = await this.handlers.object.handle(request.params.name, request.params.arguments);
            break;

          case 'classIncludes':
          case 'classComponents':
            result = await this.handlers.class.handle(request.params.name, request.params.arguments);
            break;

          case 'getObjectSourceV2':
          case 'grepObjectSource':
            result = await this.handlers.objectSourceV2.handle(request.params.name, request.params.arguments);
            break;

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            , 2)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: error.message || 'Unknown error',
              code: error.code || ErrorCode.InternalError
            })
          }],
          isError: true
        };
      }
    });
  }

  private async handleStreamingDemo(request: any): Promise<any> {
    const { steps = 5, delayMs = 1000 } = request.params.arguments || {};
    const results: string[] = [];

    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      results.push(`Step ${i} completed`);
    }

    return {
      status: 'success',
      duration: `${steps * delayMs}ms`,
      steps: results.length,
      results
    };
  }
}

/**
 * Start STATELESS Streamable HTTP Server for MCP Inspector
 *
 * Key difference: sessionIdGenerator is undefined, making the transport stateless.
 * This allows Inspector to reconnect freely without session validation errors.
 */
async function startStatelessServer(port: number = 3000) {
  const server = new AbapAdtServerStateless();

  // Create STATELESS transport (no sessionIdGenerator)
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,  // STATELESS mode
  });

  await server.connect(transport);

  const httpServer = createHttpServer(async (req: IncomingMessage, res: ServerResponse) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Mcp-Session-Id, Accept');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Health check
    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        mode: 'stateless',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // MCP endpoint
    if (req.url?.startsWith('/mcp')) {
      try {
        await transport.handleRequest(req, res);
      } catch (error: any) {
        console.error('Error:', error);
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
    const enabledGroups = process.env.MCP_TOOLS || 'full';
    console.error(`╔════════════════════════════════════════════════════════════╗`);
    console.error(`║  MCP ABAP ADT - Stateless Server (for Inspector)            ║`);
    console.error(`╠════════════════════════════════════════════════════════════╣`);
    console.error(`║  MCP Endpoint:      http://localhost:${port}/mcp             ║`);
    console.error(`║  Mode:              STATELESS (no session persistence)       ║`);
    console.error(`║  Ideal for:         MCP Inspector debugging                  ║`);
    console.error(`╠════════════════════════════════════════════════════════════╣`);
    console.error(`║  Tool Groups:       ${enabledGroups.padEnd(39)}║`);
    console.error(`╚════════════════════════════════════════════════════════════╝`);
    console.error('');
    console.error('Start Inspector with:');
    console.error(`  npx @modelcontextprotocol/inspector http://localhost:${port}/mcp`);
  });

  const shutdown = async () => {
    console.error('\n[Server] Shutting down...');
    httpServer.close();
    await server.close();
    await transport.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

const port = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3000;

startStatelessServer(port).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

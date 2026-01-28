/**
 * Shared MCP Server Base Class
 * 
 * This file contains the common server logic that was duplicated across
 * multiple server entry points (stdio, http, streamable, stateless).
 * 
 * By centralizing this logic, we:
 * - Eliminate code duplication
 * - Ensure consistent behavior across all transport modes
 * - Make maintenance easier
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode
} from "@modelcontextprotocol/sdk/types.js";
import { ADTClient, session_types } from "abap-adt-api";
import { filterToolsByGroups } from '../toolGroups.js';
import { getLogger, TransportType } from '../lib/structuredLogger.js';

// Import all handlers
import { AuthHandlers } from '../handlers/AuthHandlers.js';
import { TransportHandlers } from '../handlers/TransportHandlers.js';
import { ObjectHandlers } from '../handlers/ObjectHandlers.js';
import { ClassHandlers } from '../handlers/ClassHandlers.js';
import { CodeAnalysisHandlers } from '../handlers/CodeAnalysisHandlers.js';
import { ObjectLockHandlers } from '../handlers/ObjectLockHandlers.js';
import { ObjectSourceHandlers } from '../handlers/ObjectSourceHandlers.js';
import { ObjectSourceHandlersV2 } from '../handlersV2/ObjectSourceHandlersV2.js';
import { ObjectDeletionHandlers } from '../handlers/ObjectDeletionHandlers.js';
import { ObjectManagementHandlers } from '../handlers/ObjectManagementHandlers.js';
import { ObjectRegistrationHandlers } from '../handlers/ObjectRegistrationHandlers.js';
import { NodeHandlers } from '../handlers/NodeHandlers.js';
import { DiscoveryHandlers } from '../handlers/DiscoveryHandlers.js';
import { UnitTestHandlers } from '../handlers/UnitTestHandlers.js';
import { PrettyPrinterHandlers } from '../handlers/PrettyPrinterHandlers.js';
import { GitHandlers } from '../handlers/GitHandlers.js';
import { DdicHandlers } from '../handlers/DdicHandlers.js';
import { ServiceBindingHandlers } from '../handlers/ServiceBindingHandlers.js';
import { QueryHandlers } from '../handlers/QueryHandlers.js';
import { FeedHandlers } from '../handlers/FeedHandlers.js';
import { DebugHandlers } from '../handlers/DebugHandlers.js';
import { RenameHandlers } from '../handlers/RenameHandlers.js';
import { AtcHandlers } from '../handlers/AtcHandlers.js';
import { TraceHandlers } from '../handlers/TraceHandlers.js';
import { RefactorHandlers } from '../handlers/RefactorHandlers.js';
import { RevisionHandlers } from '../handlers/RevisionHandlers.js';

/**
 * Base MCP Server class with all tool handlers registered
 * 
 * This class can be extended for different transport modes (stdio, HTTP, SSE, Streamable)
 * All tools and handler logic is centralized here.
 */
export class AbapAdtServerBase extends Server {
  protected adtClient: ADTClient;
  protected handlers: any;
  protected logger: ReturnType<typeof getLogger>;
  protected transportType: TransportType = TransportType.STDIO;

  constructor(serverName: string, serverVersion: string = "0.2.0") {
    super(
      {
        name: serverName,
        version: serverVersion,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Validate environment variables
    const missingVars = ['SAP_URL', 'SAP_USER', 'SAP_PASSWORD'].filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Initialize ADT client
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

    // Initialize logger (default to stdio, can be overridden)
    this.logger = getLogger(this.transportType);

    this.setupToolHandlers();
  }

  /**
   * Set the transport type and initialize corresponding logger
   */
  protected setTransportType(transport: TransportType): void {
    this.transportType = transport;
    this.logger = getLogger(transport);
  }

  /**
   * Setup all tool handlers
   */
  private setupToolHandlers() {
    // Collect all tools from handlers
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
        name: 'healthcheck',
        description: 'Check server health and connectivity',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];

    // Register tools list handler
    this.setRequestHandler(ListToolsRequestSchema, async () => {
      const filteredTools = filterToolsByGroups(allTools);
      return { tools: filteredTools };
    });

    // Register tool call handler
    this.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        let result: any;

        switch (request.params.name) {
          case 'healthcheck':
            result = {
              status: 'healthy',
              timestamp: new Date().toISOString()
            };
            break;

          // Auth tools
          case 'login':
          case 'logout':
          case 'dropSession':
            result = await this.handlers.auth.handle(request.params.name, request.params.arguments);
            break;

          // Transport tools
          case 'transportInfo':
          case 'createTransport':
          case 'hasTransportConfig':
          case 'transportConfigurations':
          case 'getTransportConfiguration':
          case 'setTransportsConfig':
          case 'createTransportsConfig':
          case 'userTransports':
          case 'transportsByConfig':
          case 'transportDelete':
          case 'transportRelease':
          case 'transportSetOwner':
          case 'transportAddUser':
          case 'systemUsers':
          case 'transportReference':
            result = await this.handlers.transport.handle(request.params.name, request.params.arguments);
            break;

          // Object lock tools
          case 'lock':
          case 'unLock':
            result = await this.handlers.objectLock.handle(request.params.name, request.params.arguments);
            break;

          // Object tools
          case 'objectStructure':
          case 'searchObject':
          case 'findObjectPath':
          case 'objectTypes':
          case 'reentranceTicket':
            result = await this.handlers.object.handle(request.params.name, request.params.arguments);
            break;

          // Class tools
          case 'classIncludes':
          case 'classComponents':
            result = await this.handlers.class.handle(request.params.name, request.params.arguments);
            break;

          // Code analysis tools
          case 'syntaxCheckCode':
          case 'syntaxCheckCdsUrl':
          case 'codeCompletion':
          case 'findDefinition':
          case 'usageReferences':
          case 'syntaxCheckTypes':
          case 'codeCompletionFull':
          case 'runClass':
          case 'codeCompletionElement':
          case 'usageReferenceSnippets':
          case 'fixProposals':
          case 'fixEdits':
          case 'fragmentMappings':
          case 'abapDocumentation':
            result = await this.handlers.codeAnalysis.handle(request.params.name, request.params.arguments);
            break;

          // Source tools (V1)
          case 'getObjectSource':
          case 'setObjectSource':
            result = await this.handlers.objectSource.handle(request.params.name, request.params.arguments);
            break;

          // Source tools (V2)
          case 'getObjectSourceV2':
          case 'grepObjectSource':
          case 'setObjectSourceV2':
            result = await this.handlers.objectSourceV2.handle(request.params.name, request.params.arguments);
            break;

          // Object deletion
          case 'deleteObject':
            result = await this.handlers.objectDeletion.handle(request.params.name, request.params.arguments);
            break;

          // Object management
          case 'activateObjects':
          case 'activateByName':
          case 'inactiveObjects':
            result = await this.handlers.objectManagement.handle(request.params.name, request.params.arguments);
            break;

          // Object registration
          case 'objectRegistrationInfo':
          case 'validateNewObject':
          case 'createObject':
            result = await this.handlers.objectRegistration.handle(request.params.name, request.params.arguments);
            break;

          // Node tools
          case 'nodeContents':
          case 'mainPrograms':
            result = await this.handlers.node.handle(request.params.name, request.params.arguments);
            break;

          // Discovery tools
          case 'featureDetails':
          case 'collectionFeatureDetails':
          case 'findCollectionByUrl':
          case 'loadTypes':
          case 'adtDiscovery':
          case 'adtCoreDiscovery':
          case 'adtCompatibiliyGraph':
            result = await this.handlers.discovery.handle(request.params.name, request.params.arguments);
            break;

          // Unit test tools
          case 'unitTestRun':
          case 'unitTestEvaluation':
          case 'unitTestOccurrenceMarkers':
          case 'createTestInclude':
            result = await this.handlers.unitTest.handle(request.params.name, request.params.arguments);
            break;

          // Pretty printer tools
          case 'prettyPrinterSetting':
          case 'setPrettyPrinterSetting':
          case 'prettyPrinter':
            result = await this.handlers.prettyPrinter.handle(request.params.name, request.params.arguments);
            break;

          // Git tools
          case 'gitRepos':
          case 'gitExternalRepoInfo':
          case 'gitCreateRepo':
          case 'gitPullRepo':
          case 'gitUnlinkRepo':
          case 'stageRepo':
          case 'pushRepo':
          case 'checkRepo':
          case 'remoteRepoInfo':
          case 'switchRepoBranch':
            result = await this.handlers.git.handle(request.params.name, request.params.arguments);
            break;

          // DDIC tools
          case 'annotationDefinitions':
          case 'ddicElement':
          case 'ddicRepositoryAccess':
          case 'packageSearchHelp':
            result = await this.handlers.ddic.handle(request.params.name, request.params.arguments);
            break;

          // Service binding tools
          case 'publishServiceBinding':
          case 'unPublishServiceBinding':
          case 'bindingDetails':
            result = await this.handlers.serviceBinding.handle(request.params.name, request.params.arguments);
            break;

          // Query tools
          case 'tableContents':
          case 'runQuery':
            result = await this.handlers.query.handle(request.params.name, request.params.arguments);
            break;

          // Feed tools
          case 'feeds':
          case 'dumps':
            result = await this.handlers.feed.handle(request.params.name, request.params.arguments);
            break;

          // Debug tools
          case 'debuggerListeners':
          case 'debuggerListen':
          case 'debuggerDeleteListener':
          case 'debuggerSetBreakpoints':
          case 'debuggerDeleteBreakpoints':
          case 'debuggerAttach':
          case 'debuggerSaveSettings':
          case 'debuggerStackTrace':
          case 'debuggerVariables':
          case 'debuggerChildVariables':
          case 'debuggerStep':
          case 'debuggerGoToStack':
          case 'debuggerSetVariableValue':
            result = await this.handlers.debug.handle(request.params.name, request.params.arguments);
            break;

          // Rename tools
          case 'renameEvaluate':
          case 'renamePreview':
          case 'renameExecute':
            result = await this.handlers.rename.handle(request.params.name, request.params.arguments);
            break;

          // ATC tools
          case 'atcCustomizing':
          case 'atcCheckVariant':
          case 'createAtcRun':
          case 'atcWorklists':
          case 'atcUsers':
          case 'atcExemptProposal':
          case 'atcRequestExemption':
          case 'isProposalMessage':
          case 'atcContactUri':
          case 'atcChangeContact':
            result = await this.handlers.atc.handle(request.params.name, request.params.arguments);
            break;

          // Trace tools
          case 'tracesList':
          case 'tracesListRequests':
          case 'tracesHitList':
          case 'tracesDbAccess':
          case 'tracesStatements':
          case 'tracesSetParameters':
          case 'tracesCreateConfiguration':
          case 'tracesDeleteConfiguration':
          case 'tracesDelete':
            result = await this.handlers.trace.handle(request.params.name, request.params.arguments);
            break;

          // Refactor tools
          case 'extractMethodEvaluate':
          case 'extractMethodPreview':
          case 'extractMethodExecute':
            result = await this.handlers.refactor.handle(request.params.name, request.params.arguments);
            break;

          // Revision tools
          case 'revisions':
            result = await this.handlers.revision.handle(request.params.name, request.params.arguments);
            break;

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }

        return this.serializeResult(result);
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  /**
   * Serialize result to MCP response format
   */
  protected serializeResult(result: any) {
    try {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
          , 2)
        }]
      };
    } catch (error) {
      return this.handleError(new McpError(
        ErrorCode.InternalError,
        'Failed to serialize result'
      ));
    }
  }

  /**
   * Handle errors and return MCP error response
   */
  protected handleError(error: unknown) {
    if (!(error instanceof Error)) {
      error = new Error(String(error));
    }
    if (error instanceof McpError) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            code: error.code
          })
        }],
        isError: true
      };
    }
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: 'Internal server error',
          code: ErrorCode.InternalError
        })
      }],
      isError: true
    };
  }
}

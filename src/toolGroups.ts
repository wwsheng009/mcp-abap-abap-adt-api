/**
 * Tool Groups Configuration
 * Controls which tool groups are enabled via environment variables
 */

// Logger will be created lazily to respect environment variables set by server entry points
let logger: any = null;

function getLoggerInstance() {
  if (!logger) {
    // Import dynamically to use environment variables set by server entry points
    const { getLogger, TransportType } = require('./lib/structuredLogger.js');
    logger = getLogger(TransportType.STDIO);
  }
  return logger;
}

export interface ToolGroup {
  name: string;
  description: string;
  enabled: boolean;
  tools: string[];
}

export interface ToolGroupsConfig {
  [key: string]: {
    description: string;
    enabledByDefault: boolean;
    tools: string[];
  };
}

// Tool groups definition
export const TOOL_GROUPS: ToolGroupsConfig = {
  // Core authentication and session
  auth: {
    description: 'Authentication and session management',
    enabledByDefault: true,
    tools: ['login', 'logout', 'dropSession']
  },

  // Transport management
  transport: {
    description: 'Transport request management',
    enabledByDefault: true,
    tools: ['transportInfo', 'createTransport', 'hasTransportConfig', 'transportConfigurations',
      'getTransportConfiguration', 'setTransportsConfig', 'createTransportsConfig',
      'userTransports', 'transportsByConfig', 'transportDelete', 'transportRelease',
      'transportSetOwner', 'transportAddUser', 'transportReference']
  },

  // Object lock operations
  lock: {
    description: 'Object lock/unlock operations',
    enabledByDefault: true,
    tools: ['lock', 'unLock']
  },

  // Core object operations
  object: {
    description: 'Core object operations (structure, search, types)',
    enabledByDefault: true,
    tools: ['objectStructure', 'searchObject', 'findObjectPath', 'objectTypes', 'reentranceTicket']
  },

  // V1 source operations (simple)
  source: {
    description: 'Source code operations (V1 - simple)',
    enabledByDefault: false,
    tools: ['getObjectSource', 'setObjectSource']
  },

  // V2 source operations (optimized with caching)
  sourceV2: {
    description: 'Source code operations (V2 - optimized with line range, grep, token)',
    enabledByDefault: true,
    tools: ['getObjectSourceV2', 'grepObjectSource', 'setObjectSourceV2']
  },

  // Class operations
  class: {
    description: 'ABAP class operations',
    enabledByDefault: true,
    tools: ['classIncludes', 'classComponents']
  },

  // Code analysis (syntax, completion, navigation)
  codeAnalysis: {
    description: 'Code analysis (syntax check, completion, definitions, references)',
    enabledByDefault: true,
    tools: ['syntaxCheckCode', 'syntaxCheckCdsUrl', 'codeCompletion', 'findDefinition',
      'usageReferences', 'syntaxCheckTypes', 'codeCompletionFull', 'runClass',
      'codeCompletionElement', 'usageReferenceSnippets', 'fixProposals', 'fixEdits',
      'fragmentMappings', 'abapDocumentation']
  },

  // Object lifecycle (activation, deletion, creation)
  lifecycle: {
    description: 'Object lifecycle management (activate, delete, create)',
    enabledByDefault: true,
    tools: ['activateObjects', 'activateByName', 'inactiveObjects', 'deleteObject',
      'objectRegistrationInfo', 'validateNewObject', 'createObject']
  },

  // Package/node operations
  node: {
    description: 'Package and node operations',
    enabledByDefault: true,
    tools: ['nodeContents', 'mainPrograms']
  },

  // Discovery and metadata
  discovery: {
    description: 'ADT discovery and feature detection',
    enabledByDefault: true,
    tools: ['featureDetails', 'collectionFeatureDetails', 'findCollectionByUrl',
      'loadTypes', 'adtDiscovery', 'adtCoreDiscovery', 'adtCompatibiliyGraph']
  },

  // Unit testing
  unitTest: {
    description: 'Unit test operations',
    enabledByDefault: false,
    tools: ['unitTestRun', 'unitTestEvaluation', 'unitTestOccurrenceMarkers', 'createTestInclude']
  },

  // Pretty printer
  prettyPrinter: {
    description: 'ABAP pretty printer',
    enabledByDefault: false,
    tools: ['prettyPrinterSetting', 'setPrettyPrinterSetting', 'prettyPrinter']
  },

  // Git operations (disabled by default)
  git: {
    description: 'Git repository operations',
    enabledByDefault: false,
    tools: ['gitRepos', 'gitExternalRepoInfo', 'gitCreateRepo', 'gitPullRepo',
      'gitUnlinkRepo', 'stageRepo', 'pushRepo', 'checkRepo', 'remoteRepoInfo',
      'switchRepoBranch']
  },

  // DDIC/Dictionary operations
  ddic: {
    description: 'Data dictionary operations',
    enabledByDefault: true,
    tools: ['annotationDefinitions', 'ddicElement', 'ddicRepositoryAccess',
      'packageSearchHelp']
  },

  // Service bindings
  serviceBinding: {
    description: 'OData service binding operations',
    enabledByDefault: false,
    tools: ['publishServiceBinding', 'unPublishServiceBinding', 'bindingDetails']
  },

  // Query operations
  query: {
    description: 'Database query operations',
    enabledByDefault: false,
    tools: ['tableContents', 'runQuery']
  },

  // Feed/dump operations
  feed: {
    description: 'Feed and dump operations',
    enabledByDefault: false,
    tools: ['feeds', 'dumps']
  },

  // Debug operations (disabled by default)
  debug: {
    description: 'Debugger operations',
    enabledByDefault: false,
    tools: ['debuggerListeners', 'debuggerListen', 'debuggerDeleteListener',
      'debuggerSetBreakpoints', 'debuggerDeleteBreakpoints', 'debuggerAttach',
      'debuggerSaveSettings', 'debuggerStackTrace', 'debuggerVariables',
      'debuggerChildVariables', 'debuggerStep', 'debuggerGoToStack',
      'debuggerSetVariableValue']
  },

  // Rename/refactor operations
  rename: {
    description: 'Refactoring and rename operations',
    enabledByDefault: false,
    tools: ['renameEvaluate', 'renamePreview', 'renameExecute', 'extractMethodEvaluate',
      'extractMethodPreview', 'extractMethodExecute']
  },

  // ATC (Automatic Test Config) operations (disabled by default)
  atc: {
    description: 'ATC (Automatic Test Config) operations',
    enabledByDefault: false,
    tools: ['atcCustomizing', 'atcCheckVariant', 'createAtcRun', 'atcWorklists',
      'atcUsers', 'atcExemptProposal', 'atcRequestExemption', 'isProposalMessage',
      'atcContactUri', 'atcChangeContact']
  },

  // Trace operations
  trace: {
    description: 'Performance trace operations',
    enabledByDefault: false,
    tools: ['tracesList', 'tracesListRequests', 'tracesHitList', 'tracesDbAccess',
      'tracesStatements', 'tracesSetParameters', 'tracesCreateConfiguration',
      'tracesDeleteConfiguration', 'tracesDelete']
  },

  // Revision operations
  revision: {
    description: 'Revision history operations',
    enabledByDefault: false,
    tools: ['revisions']
  },

  // Help documentation
  help: {
    description: 'Help and documentation tools. Use the "help" tool with a "toolName" argument (e.g., "login", "getObjectSource") to understand tool usage, parameters, and prerequisites before execution.',
    enabledByDefault: true,
    tools: ['help']
  },

  // Health check (always enabled)
  health: {
    description: 'Server health check',
    enabledByDefault: true,
    tools: ['healthcheck']
  }
};

// Preset levels for easy configuration
export const PRESET_LEVELS: Record<string, string[]> = {
  // Minimal: read-only operations
  minimal: ['auth', 'object', 'sourceV2', 'class', 'discovery', 'health', 'help'],

  // Standard: basic development (includes minimal + write operations)
  standard: ['auth', 'lock', 'object', 'sourceV2', 'class', 'codeAnalysis',
    'lifecycle', 'transport', 'node', 'ddic', 'discovery', 'health', 'help'],

  // Advanced: includes standard + testing, refactoring, git
  advanced: ['auth', 'lock', 'object', 'sourceV2', 'class', 'codeAnalysis',
    'lifecycle', 'transport', 'node', 'ddic', 'discovery', 'health',
    'unitTest', 'rename', 'git', 'trace', 'prettyPrinter', 'help'],

  // Full: all tools
  full: Object.keys(TOOL_GROUPS)
};

/**
 * Get enabled tool groups from environment variables
 *
 * Formats:
 *   MCP_TOOLS=full                # All tools (default)
 *   MCP_TOOLS=standard            # Preset level
 *   MCP_TOOLS=auth,transport,...  # Custom groups
 *
 * Behavior:
 * - If MCP_TOOLS is not set: ALL tools are enabled (full)
 * - If MCP_TOOLS is a preset name: use that preset
 * - If MCP_TOOLS is comma-separated: use those groups
 */
export function getEnabledToolGroups(): string[] {
  const envTools = process.env.MCP_TOOLS || '';

  // Default: show ALL tools if no config provided
  if (!envTools) {
    return Object.keys(TOOL_GROUPS);
  }

  // Check if it's a preset level
  const preset = envTools.trim().toLowerCase();
  if (PRESET_LEVELS[preset]) {
    return PRESET_LEVELS[preset];
  }

  // Otherwise, treat as comma-separated group names
  const requestedGroups = envTools.split(',').map(g => g.trim().toLowerCase());

  // Validate group names
  const validGroups = Object.keys(TOOL_GROUPS);
  const unknownGroups = requestedGroups.filter(g => !validGroups.includes(g));

  if (unknownGroups.length > 0) {
    const log = getLoggerInstance();
    if (log) {
      log.warn('Unknown tool groups', {
        unknownGroups,
        availablePresets: Object.keys(PRESET_LEVELS),
        availableGroups: validGroups
      });
    }
  }

  return requestedGroups.filter(g => validGroups.includes(g));
}

/**
 * Get enabled tool names based on configuration
 */
export function getEnabledToolNames(): Set<string> {
  const enabledGroups = getEnabledToolGroups();
  const enabledTools = new Set<string>();

  for (const groupName of enabledGroups) {
    const group = TOOL_GROUPS[groupName];
    if (group) {
      group.tools.forEach(tool => enabledTools.add(tool));
    }
  }

  // Always include healthcheck
  enabledTools.add('healthcheck');

  return enabledTools;
}

/**
 * Filter tools by enabled groups
 */
export function filterToolsByGroups(tools: any[]): any[] {
  const enabledTools = getEnabledToolNames();

  const filtered = tools.filter(tool =>
    enabledTools.has(tool.name)
  );

  const totalTools = tools.length;
  const enabledCount = filtered.length;

  if (enabledCount < totalTools) {
    const log = getLoggerInstance();
    if (log) {
      log.info('Tool filtering summary', {
        enabledCount,
        totalCount: totalTools,
        disabledGroups: Object.keys(TOOL_GROUPS).filter(g => !getEnabledToolGroups().includes(g))
      });
    }
  }

  return filtered;
}

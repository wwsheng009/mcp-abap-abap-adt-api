# Agents Guide: MCP ABAP ADT API Server

This guide helps AI agents work effectively in this repository.

## Project Overview

This is a **Model Context Protocol (MCP) server** that provides tools for interacting with SAP ABAP systems via ADT (ABAP Development Tools) APIs. It wraps the `abap-adt-api` library and exposes functionality as MCP tools for use with AI assistants like Claude, Cline, etc.

**Tech Stack:**
- TypeScript/Node.js
- MCP SDK (`@modelcontextprotocol/sdk`)
- `abap-adt-api` library (local dependency in `../abap-adt-api`)
- Jest for testing

**Key Characteristics:**
- Handler-based architecture (each domain has its own handler)
- Tool groups configuration for selective tool enabling
- V2 source handlers with caching and optimization
- Stateful session management with SAP systems

## Essential Commands

### Build & Run
```bash
# Build TypeScript to JavaScript (output: ./dist)
npm run build

# Run the server (stdio transport)
npm run start

# Development with MCP Inspector (interactive UI)
npm run dev
```

### Testing
```bash
# Run all tests
npm test

# Watch mode (re-run on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Type check without emitting
npx tsc --noEmit
```

### Dependency Management
```bash
# Install dependencies (also builds local abap-adt-api)
npm install

# Note: postinstall builds the local abap-adt-api dependency
cd ../abap-adt-api && npm install && npm run build
```

## Project Structure

```
mcp-abap-abap-adt-api/
├── src/
│   ├── index.ts                    # Main server entry point
│   ├── toolGroups.ts               # Tool groups configuration
│   ├── handlers/                   # V1 handlers (one file per domain)
│   │   ├── BaseHandler.ts          # Abstract base class
│   │   ├── AuthHandlers.ts
│   │   ├── TransportHandlers.ts
│   │   ├── ObjectHandlers.ts
│   │   ├── ObjectSourceHandlers.ts # V1 source operations
│   │   └── ... (20+ handler files)
│   ├── handlersV2/                 # V2 handlers with optimizations
│   │   └── ObjectSourceHandlersV2.ts
│   ├── lib/                        # Shared utilities
│   │   ├── logger.ts               # Structured JSON logging
│   │   ├── sourceCache.ts          # LRU+TTL cache for source code
│   │   └── tokenUtils.ts           # Token generation for conflict detection
│   ├── types/
│   │   └── tools.ts                # ToolDefinition interface
│   └── test/                       # Test files
│       ├── sourceCache.test.ts
│       ├── tokenUtils.test.ts
│       └── ...
├── dist/                           # Compiled JavaScript (generated)
├── docs/                           # Project documentation
├── coverage/                       # Test coverage reports
├── package.json
├── tsconfig.json
├── jest.config.js
└── .env.example                    # Environment template
```

## Code Conventions

### Naming Patterns
- **Classes**: PascalCase (e.g., `AuthHandlers`, `ObjectSourceHandlersV2`)
- **Methods**: camelCase (e.g., `handleLogin`, `getObjectSource`)
- **Tools**: camelCase (e.g., `login`, `getObjectSourceV2`, `grepObjectSource`)
- **Files**: PascalCase for handlers (e.g., `AuthHandlers.ts`)

### Handler Pattern
All handlers extend `BaseHandler` and implement two methods:

```typescript
export class MyHandler extends BaseHandler {
  // 1. Define tool definitions
  getTools(): ToolDefinition[] {
    return [{
      name: 'myTool',
      description: 'Tool description',
      inputSchema: {
        type: 'object',
        properties: {
          param1: { type: 'string', description: '...' }
        },
        required: ['param1']
      }
    }];
  }

  // 2. Handle tool calls
  async handle(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'myTool':
        return this.handleMyTool(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
    }
  }

  // Private implementation methods
  private async handleMyTool(args: any) {
    const startTime = performance.now();
    try {
      const result = await this.adtclient.someMethod(args);
      this.trackRequest(startTime, true);
      return result;
    } catch (error) {
      this.trackRequest(startTime, false);
      throw error;
    }
  }
}
```

### Import Style
```typescript
// Type-only imports preferred
import type { ToolDefinition } from '../types/tools.js';
import type { ADTClient } from "abap-adt-api";

// Value imports
import { BaseHandler } from './BaseHandler.js';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
```

**Note: Use `.js` extensions in imports** - this is compiled to CommonJS.

### Error Handling
```typescript
// Always wrap async operations in try/catch
try {
  const result = await this.adtclient.method();
  this.trackRequest(startTime, true);
  return result;
} catch (error: any) {
  this.trackRequest(startTime, false);

  // Re-throw McpError as-is
  if (error instanceof McpError) {
    throw error;
  }

  // Wrap other errors
  throw new McpError(
    ErrorCode.InternalError,
    `Operation failed: ${error.message || 'Unknown error'}`
  );
}
```

### Logging
```typescript
// Logger is automatically available in handlers (from BaseHandler)
this.logger.info('Operation completed', { key: 'value' });
this.logger.error('Error occurred', { error: error.message });
this.logger.debug('Debug info', { details });
```

Logs are structured JSON to stderr:
```json
{
  "timestamp": "2025-01-27T10:00:00.000Z",
  "level": "info",
  "service": "AuthHandlers",
  "message": "Request completed",
  "duration": 123.45,
  "success": true
}
```

## Adding New Tools

### Option 1: Add to Existing Handler

1. Open the relevant handler file (e.g., `src/handlers/ObjectHandlers.ts`)
2. Add tool definition to `getTools()` return array
3. Add case in `handle()` switch statement
4. Create private handler method

### Option 2: Create New Handler

1. Create `src/handlers/MyNewHandler.ts`
2. Extend `BaseHandler`
3. Implement `getTools()` and `handle()`
4. Register in `src/index.ts`:
   - Import at top
   - Add property declaration
   - Initialize in constructor
   - Add to `allTools` array in `setupToolHandlers()`
   - Add case in `CallToolRequestSchema` handler

## Tool Groups Configuration

The server supports selective tool enabling via `MCP_TOOLS` environment variable.

**Presets:**
- `minimal` - Read-only operations (auth, object, sourceV2, class, discovery, health)
- `standard` - Basic development (minimal + lock, transport, lifecycle, codeAnalysis, node, ddic)
- `advanced` - Advanced features (standard + unitTest, rename, git, trace, prettyPrinter)
- `full` - All tools (default if MCP_TOOLS not set)

**Custom:**
```bash
# Enable specific groups
MCP_TOOLS=auth,transport,sourceV2,object,class

# Use preset
MCP_TOOLS=standard
```

**Adding a new tool group:**
1. Edit `src/toolGroups.ts`
2. Add entry to `TOOL_GROUPS` object
3. Optionally add to `PRESET_LEVELS`
4. Document in `TOOL_GROUPS.md`

## V2 Source Handlers (Optimized)

The V2 handlers (`handlersV2/ObjectSourceHandlersV2.ts`) provide:
- **Line range support** - Fetch specific line ranges
- **Version tokens** - Conflict detection via content hashing
- **Server-side grep** - Search source code with regex
- **Caching** - LRU+TTL cache via `SourceCache`

**Key tools:**
- `getObjectSourceV2` - Get source with line range, returns token
- `grepObjectSource` - Search source with regex
- `setObjectSourceV2` - Set source with token validation

**Token mechanism:**
```typescript
// Token format: timestamp_hash
const token = TokenUtils.generateToken(Date.now(), fullSource);

// On write: validate token
if (cached && cached.token !== token && !skipConflictCheck) {
  throw new McpError(ErrorCode.InvalidRequest, 'Version conflict');
}
```

## Important Gotchas

### Local Dependency
The `abap-adt-api` is a **local file dependency** (`../abap-adt-api`). The `postinstall` script builds it automatically, but if you have issues:
```bash
cd ../abap-adt-api
npm install && npm run build
cd ../mcp-abap-abap-adt-api
npm run build
```

### Environment Variables
Required env vars (in `.env`):
- `SAP_URL` - SAP system URL
- `SAP_USER` - Username
- `SAP_PASSWORD` - Password
- `SAP_CLIENT` - Client number (optional)
- `SAP_LANGUAGE` - Language code (optional)

The `.env` file is **gitignored** - never commit it.

### TypeScript Target
- Target: `es2016`
- Module: `commonjs`
- Strict mode enabled
- Source: `./src` → Output: `./dist`

### Import Extensions
Always use `.js` in imports (not `.ts`), as TypeScript compiles to CommonJS:
```typescript
import { BaseHandler } from './BaseHandler.js';  // ✓
import { BaseHandler } from './BaseHandler';     // ✗ may fail at runtime
```

### Handler Registration
When adding a new handler, you must update **three places** in `index.ts`:
1. Import statement at top
2. Property declaration
3. Constructor initialization
4. `allTools` array in `setupToolHandlers()`
5. Switch case in `CallToolRequestSchema` handler

### Test Configuration
- Tests use `ts-jest` preset
- Test files: `**/*.test.ts` or `**/__tests__/**/*.test.ts`
- Test timeout: 30 seconds (for slow SAP operations)
- Tests auto-clean up: `forceExit: true`

### Source URLs in V2
V2 handlers expect **direct source URLs** (e.g., from `objectStructure.sourceUri`), not object URLs:
```typescript
// Object URL: /sap/bc/adt/oo/classes/zcl_my_class
// Source URL: /sap/bc/adt/oo/classes/zcl_my_class/source/main
```

### ADTClient Session State
The client uses **stateful sessions** (`this.adtClient.stateful = session_types.stateful`). Be aware of:
- Session caching via `dropSession()`
- Login required before operations
- Session expiration possibilities

## Testing Patterns

### Unit Test Example
```typescript
import { MyHandler } from '../MyHandler.js';
import { ADTClient } from "abap-adt-api";

describe('MyHandler', () => {
  let handler: MyHandler;
  let mockClient: jest.Mocked<ADTClient>;

  beforeEach(() => {
    mockClient = {
      someMethod: jest.fn().mockResolvedValue({ result: 'ok' })
    } as any;
    handler = new MyHandler(mockClient);
  });

  it('should handle tool', async () => {
    const result = await handler.handle('myTool', {});
    expect(mockClient.someMethod).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
```

### Cache Testing
```typescript
describe('SourceCache', () => {
  let cache: SourceCache;

  beforeEach(() => {
    cache = new SourceCache(1000, 5); // 1s TTL, max 5 entries
  });

  afterEach(() => {
    cache.stopCleanup(); // Always stop cleanup interval
  });
});
```

## Common Workflows

### Running the Server Locally
```bash
# 1. Build
npm run build

# 2. Configure environment
cp .env.example .env
# Edit .env with your SAP credentials

# 3. Run (stdio mode - for MCP clients)
npm run start

# OR run with Inspector (interactive UI)
npm run dev
```

### Adding a New Tool
1. Identify appropriate handler or create new one
2. Add tool definition to `getTools()`
3. Add handler method with try/catch
4. Register in `index.ts` (5 places!)
5. Add tool group if needed
6. Write tests
7. Build and test

### Debugging
- Use `npm run dev` to open MCP Inspector
- Logs go to stderr as JSON
- Check `coverage/` after running `npm run test:coverage`
- Use `npx tsc --noEmit` for type checking

## Documentation References

- `README.md` - User-facing documentation
- `TOOL_GROUPS.md` - Tool groups configuration reference
- `docs/development.md` - Developer guide (in Chinese)
- `docs/architecture.md` - Architecture overview
- `docs/v2-implementation-summary.md` - V2 features summary

## Quick Reference

| File | Purpose |
|------|---------|
| `src/index.ts` | Server entry, handler routing |
| `src/toolGroups.ts` | Tool groups & presets |
| `src/handlers/BaseHandler.ts` | Base class for all handlers |
| `src/handlersV2/ObjectSourceHandlersV2.ts` | Optimized source operations |
| `src/lib/logger.ts` | Structured JSON logging |
| `src/lib/sourceCache.ts` | LRU+TTL cache implementation |
| `src/types/tools.ts` | ToolDefinition interface |
| `jest.config.js` | Test configuration |

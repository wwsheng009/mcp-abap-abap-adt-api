/**
 * Runtime Mode Detection
 * 
 * Detects whether the application is running in:
 * - CLI mode (human terminal)
 * - HTTP mode (server with stdout not being a protocol)
 * - MCP stdio mode (stdout = JSON-RPC protocol bus)
 */

export enum RuntimeMode {
  CLI = "cli",
  HTTP = "http",
  MCP_STDIO = "mcp_stdio",
}

/**
 * Detect the current runtime mode based on environment variables
 */
export function detectRuntimeMode(): RuntimeMode {
  // MCP stdio mode has highest priority
  if (process.env.MCP_STDIO_MODE === "true") return RuntimeMode.MCP_STDIO
  
  // HTTP mode
  if (process.env.HTTP_MODE === "true") return RuntimeMode.HTTP
  
  // Default to CLI mode
  return RuntimeMode.CLI
}

/**
 * Check if we're running in MCP stdio mode
 */
export function isMcpStdioMode(): boolean {
  return detectRuntimeMode() === RuntimeMode.MCP_STDIO
}

/**
 * Check if we're running in HTTP mode
 */
export function isHttpMode(): boolean {
  return detectRuntimeMode() === RuntimeMode.HTTP
}

/**
 * Check if we're running in CLI mode
 */
export function isCliMode(): boolean {
  return detectRuntimeMode() === RuntimeMode.CLI
}

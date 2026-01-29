/**
 * Stdout Firewall for MCP Protocol Protection
 * 
 * In MCP stdio mode, stdout is a protocol bus (JSON-RPC only).
 * This firewall intercepts all stdout writes and only allows
 * valid JSON-RPC messages to pass through.
 * 
 * This prevents accidental console.log calls or debug output
 * from polluting the MCP protocol stream.
 */

import { RuntimeMode, detectRuntimeMode } from './runtimeMode.js';

let originalStdoutWrite: any = null;
let originalStderrWrite: any = null;
let firewallActive = false;

/**
 * Protect stdout in MCP stdio mode
 * 
 * This wraps process.stdout.write to only allow:
 * - JSON-RPC messages (lines starting with "{")
 * - Batch JSON messages (lines starting with "[")
 * 
 * All other output is silently discarded.
 */
export function protectStdout(): void {
  const mode = detectRuntimeMode();
  
  // Only protect in MCP stdio mode
  if (mode !== RuntimeMode.MCP_STDIO) {
    return;
  }

  // Prevent double wrapping
  if (firewallActive) {
    return;
  }

  // Save original write functions
  originalStdoutWrite = process.stdout.write.bind(process.stdout);
  originalStderrWrite = process.stderr.write.bind(process.stderr);

  // Wrap stdout.write - only allow JSON-RPC messages
  process.stdout.write = ((chunk: any, ...args: any[]) => {
    if (typeof chunk === "string") {
      const trimmed = chunk.trimStart();

      // Only allow JSON-RPC messages
      if (
        trimmed.startsWith("{") ||  // Single JSON object
        trimmed.startsWith("[")     // Batch JSON array
      ) {
        return originalStdoutWrite(chunk, ...args);
      }

      // Silently discard everything else
      return true;
    }

    // For non-string chunks, pass through
    return originalStdoutWrite(chunk, ...args);
  }) as any;

  // Wrap stderr.write - discard ALL output
  process.stderr.write = ((chunk: any, ...args: any[]) => {
    // Silently discard everything
    return true;
  }) as any;

  firewallActive = true;
}

/**
 * Remove stdout/stderr protection
 *
 * Restores the original process.stdout.write and process.stderr.write functions.
 * Should only be used in tests or cleanup scenarios.
 */
export function unprotectStdout(): void {
  if (!firewallActive || !originalStdoutWrite || !originalStderrWrite) {
    return;
  }

  process.stdout.write = originalStdoutWrite;
  process.stderr.write = originalStderrWrite;
  originalStdoutWrite = null;
  originalStderrWrite = null;
  firewallActive = false;
}

/**
 * Check if stdout firewall is active
 */
export function isStdoutProtected(): boolean {
  return firewallActive;
}

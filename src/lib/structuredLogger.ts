/**
 * Structured Logger for MCP ABAP ADT API Server
 * 
 * Features:
 * - Multiple transports: File, Console, Stdio (stderr)
 * - Configurable log levels via LOG_LEVEL env var
 * - Configurable log directory via LOG_DIR env var
 * - Structured JSON output for easy parsing
 * - Request/Response tracking with timing
 * - Sensitive data sanitization
 */

import fs from 'fs';
import path from 'path';
import { IncomingMessage } from 'http';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export enum TransportType {
  STDIO = 'stdio',
  SSE = 'sse',
  STREAMABLE_HTTP = 'streamable-http',
  HTTP = 'http'
}

interface LogEntry {
  timestamp: string;
  level: string;
  transport?: string;
  sessionId?: string;
  requestId?: string;
  method?: string;
  duration?: number;
  success?: boolean;
  message: string;
  data?: Record<string, any>;
  error?: string;
  [key: string]: any;
}

/**
 * Logger Configuration
 */
interface LoggerConfig {
  level: LogLevel;
  logDir: string;
  enableConsole: boolean;
  enableFile: boolean;
  enableStdio: boolean;
  transport: TransportType;
}

/**
 * Parse log level from environment variable
 */
function parseLogLevel(envValue: string | undefined): LogLevel {
  if (!envValue) return LogLevel.INFO;
  switch (envValue.toLowerCase()) {
    case 'debug': return LogLevel.DEBUG;
    case 'info': return LogLevel.INFO;
    case 'warn': case 'warning': return LogLevel.WARN;
    case 'error': return LogLevel.ERROR;
    case 'none': return LogLevel.NONE;
    default: return LogLevel.INFO;
  }
}

/**
 * Get log directory from environment or use default
 */
function getLogDir(): string {
  const envDir = process.env.LOG_DIR;
  if (envDir) {
    return envDir;
  }
  
  // Default to 'logs' directory in project root
  // Resolve from current file location to handle both src/ and dist/
  const currentDir = __dirname;
  
  // Go up from dist/lib/ or src/lib/ to project root
  const projectRoot = path.resolve(currentDir, '..', '..');
  return path.join(projectRoot, 'logs');
}

/**
 * Ensure log directory exists
 */
function ensureLogDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Get log file path based on date and transport
 */
function getLogFilePath(logDir: string, transport: TransportType): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `${transport}-${date}.log`;
  return path.join(logDir, filename);
}

/**
 * Format log entry as JSON string
 */
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Structured Logger Class
 */
export class Logger {
  private config: LoggerConfig;
  private logFileStream: fs.WriteStream | null = null;
  private currentLogFile: string | null = null;
  private requestStartTimes: Map<string, number> = new Map();

  constructor(transport: TransportType = TransportType.STDIO) {
    const logDir = getLogDir();
    
    this.config = {
      level: parseLogLevel(process.env.LOG_LEVEL),
      logDir,
      enableConsole: process.env.LOG_CONSOLE !== 'false', // default true
      enableFile: process.env.LOG_FILE !== 'false', // default true
      enableStdio: process.env.LOG_STDIO !== 'false', // default true
      transport
    };

    // Setup file logging if enabled
    if (this.config.enableFile) {
      ensureLogDir(logDir);
      this.setupLogFile();
    }

    // Log initialization
    this.info('Logger initialized', {
      transport,
      level: LogLevel[this.config.level],
      logDir,
      consoleEnabled: this.config.enableConsole,
      fileEnabled: this.config.enableFile,
      stdioEnabled: this.config.enableStdio
    });
  }

  /**
   * Setup log file with rotation
   */
  private setupLogFile(): void {
    const logFilePath = getLogFilePath(this.config.logDir, this.config.transport);
    
    // If file path changed, close old stream and open new one
    if (this.currentLogFile !== logFilePath) {
      if (this.logFileStream) {
        this.logFileStream.end();
      }
      
      this.logFileStream = fs.createWriteStream(logFilePath, { flags: 'a' });
      this.currentLogFile = logFilePath;
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: Record<string, any>): void {
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      transport: this.config.transport,
      message,
      ...data
    };

    const formatted = formatLogEntry(entry);

    // Console logging
    if (this.config.enableConsole) {
      console.error(formatted);
    }

    // Stdio logging (stderr)
    if (this.config.enableStdio) {
      console.error(formatted);
    }

    // File logging
    if (this.config.enableFile && this.logFileStream) {
      this.logFileStream.write(formatted + '\n');
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info level logging
   */
  info(message: string, data?: Record<string, any>): void {
   
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | any, data?: Record<string, any>): void {
    const errorData = {
      ...data,
      error: error instanceof Error ? error.message : String(error)
    };
    this.log(LogLevel.ERROR, message, errorData);
  }

  /**
   * Log incoming request
   */
  logRequest(requestId: string, method: string, params?: any, sessionId?: string): void {
    this.requestStartTimes.set(requestId, Date.now());
    
    this.info('Request received', {
      requestId,
      sessionId,
      method,
      params: this.sanitizeParams(params)
    });
  }

  /**
   * Log outgoing response
   */
  logResponse(requestId: string, method: string, duration: number, success: boolean, sessionId?: string): void {
    this.requestStartTimes.delete(requestId);
    
    this.info('Request completed', {
      requestId,
      sessionId,
      method,
      duration: `${duration.toFixed(2)}ms`,
      success
    });
  }

  /**
   * Log SSE connection events
   */
  logSSEConnection(event: 'connect' | 'disconnect' | 'error', sessionId?: string, data?: Record<string, any>): void {
    const message = event === 'connect' ? 'SSE connected' : 
                    event === 'disconnect' ? 'SSE disconnected' : 'SSE error';
    
    this.info(message, {
      sessionId,
      ...data
    });
  }

  /**
   * Log Stdio connection events
   */
  logStdioConnection(event: 'connect' | 'disconnect' | 'error', data?: Record<string, any>): void {
    const message = event === 'connect' ? 'Stdio connected' : 
                    event === 'disconnect' ? 'Stdio disconnected' : 'Stdio error';
    
    this.info(message, {
      ...data
    });
  }

  /**
   * Log HTTP request details
   */
  logHTTPRequest(req: IncomingMessage, bodySize?: number): void {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    
    this.debug('HTTP request', {
      method: req.method,
      pathname: url.pathname,
      search: url.search,
      headers: {
        'content-type': req.headers['content-type'],
        'mcp-session-id': req.headers['mcp-session-id'],
        'accept': req.headers['accept']
      },
      bodySize
    });
  }

  /**
   * Sanitize params for logging (remove sensitive data)
   */
  private sanitizeParams(params?: any): any {
    if (!params) return undefined;
    
    const sanitized = { ...params };
    
    // Remove password from params if present
    if (sanitized.password) {
      sanitized.password = '***REDACTED***';
    }
    
    return sanitized;
  }

  /**
   * Close logger and cleanup resources
   */
  close(): void {
    if (this.logFileStream) {
      this.logFileStream.end();
      this.logFileStream = null;
    }
  }
}

/**
 * Default logger instances for each transport type
 */
const loggers = new Map<TransportType, Logger>();

/**
 * Get or create logger instance for a transport
 */
export function getLogger(transport: TransportType): Logger {
  if (!loggers.has(transport)) {
    loggers.set(transport, new Logger(transport));
  }
  return loggers.get(transport)!;
}

/**
 * Close all loggers
 */
export function closeAllLoggers(): void {
  loggers.forEach(logger => logger.close());
  loggers.clear();
}

import fs from 'fs';
import path from 'path';
import { isMcpStdioMode } from './runtimeMode.js';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

let logFileStream: fs.WriteStream | null = null;

// Initialize log file
function initLogFile() {
  if (logFileStream) return logFileStream;

  // Only create log file if LOG_FILE is not set to 'false'
  if (process.env.LOG_FILE === 'false') return null;

  try {
    const logDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const date = new Date().toISOString().split('T')[0];
    const logPath = path.join(logDir, `bridge-${date}.log`);
    logFileStream = fs.createWriteStream(logPath, { flags: 'a' });
    return logFileStream;
  } catch (error) {
    // Fail silently if log file cannot be created
    return null;
  }
}

export function createLogger(name: string) {
  return {
    error: (message: string, meta?: Record<string, unknown>) =>
      log('error', name, message, meta),
    warn: (message: string, meta?: Record<string, unknown>) =>
      log('warn', name, message, meta),
    info: (message: string, meta?: Record<string, unknown>) =>
      log('info', name, message, meta),
    debug: (message: string, meta?: Record<string, unknown>) =>
      log('debug', name, message, meta)
  };
}

function log(level: LogLevel, name: string, message: string, meta?: Record<string, unknown>) {
  const stdioMode = isMcpStdioMode();
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    service: name,
    message,
    ...meta
  };

  const logString = JSON.stringify(logEntry, null, 2);

  // In MCP stdio mode, only write to file
  if (stdioMode) {
    const stream = initLogFile();
    if (stream) {
      stream.write(logString + '\n');
    }
    return;
  }

  // In non-stdio mode, output to console
  switch (level) {
    case 'error':
      console.error(logString);
      break;
    case 'warn':
      console.warn(logString);
      break;
    case 'info':
      console.info(logString);
      break;
    case 'debug':
      console.debug(logString);
      break;
  }
}

export type Logger = ReturnType<typeof createLogger>;

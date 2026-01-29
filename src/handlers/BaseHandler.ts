import type { ToolDefinition } from "../types/tools";
import type { ADTClient } from "abap-adt-api";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { performance } from 'perf_hooks';
import { createLogger } from '../lib/logger';
import { randomUUID } from 'crypto';

enum CustomErrorCode {
  TooManyRequests = 429,
  InvalidParameters = 400
}

export abstract class BaseHandler {
  protected readonly adtclient: ADTClient;
  protected readonly logger = createLogger(this.constructor.name);
  private readonly rateLimiter = new Map<string, number>();
  private readonly metrics = {
    requestCount: 0,
    errorCount: 0,
    successCount: 0,
    totalTime: 0
  };

  constructor(adtclient: ADTClient) {
    this.adtclient = adtclient;
  }

  protected trackRequest(startTime: number, success: boolean, context?: RequestLogContext): void {
    const duration = performance.now() - startTime;
    this.metrics.requestCount++;
    this.metrics.totalTime += duration;
    
    if (success) {
      this.metrics.successCount++;
    } else {
      this.metrics.errorCount++;
    }

    this.logger.info('Request completed', {
      requestId: context?.requestId || this.generateRequestId(),
      toolName: context?.toolName,
      duration,
      success,
      metrics: this.getMetrics(),
      ...(context?.arguments && { arguments: this.sanitizeArguments(context.arguments) })
    });
  }

  protected checkRateLimit(ip: string): void {
    const now = Date.now();
    const lastRequest = this.rateLimiter.get(ip) || 0;
    
    if (now - lastRequest < 1000) { // 1 second rate limit
      this.logger.warn('Rate limit exceeded', { ip });
      throw new McpError(
        CustomErrorCode.TooManyRequests,
        'Rate limit exceeded. Please wait before making another request.'
      );
    }
    
    this.rateLimiter.set(ip, now);
  }

  protected getMetrics() {
    return {
      ...this.metrics,
      averageTime: this.metrics.requestCount > 0 
        ? this.metrics.totalTime / this.metrics.requestCount 
        : 0
    };
  }

  /**
   * Generate a unique request ID
   */
  protected generateRequestId(): string {
    return randomUUID();
  }

  /**
   * Sanitize arguments for logging (remove sensitive data)
   */
  protected sanitizeArguments(args: any): any {
    if (!args || typeof args !== 'object') {
      return args;
    }

    const sanitized = { ...args };
    const sensitiveKeys = ['password', 'pwd', 'secret', 'token', 'credential', 'auth'];

    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Log request start
   */
  protected logRequestStart(context: RequestLogContext): void {
    this.logger.info('Request started', {
      requestId: context.requestId || this.generateRequestId(),
      toolName: context.toolName,
      ...(context.arguments && { arguments: this.sanitizeArguments(context.arguments) })
    });
  }

  /**
   * Log request error with context
   */
  protected logRequestError(error: Error, context: RequestLogContext): void {
    this.logger.error('Request failed', {
      requestId: context.requestId,
      toolName: context.toolName,
      error: error.message,
      ...(error instanceof McpError && { code: error.code }),
      ...(context.arguments && { arguments: this.sanitizeArguments(context.arguments) })
    });
  }

  /**
   * Wrap a handler method with automatic logging
   * This is a convenience method for handlers that don't need custom error handling
   */
  protected async withLogging<T>(
    toolName: string,
    args: any,
    handler: () => Promise<T>
  ): Promise<T> {
    const requestId = this.generateRequestId();
    const context: RequestLogContext = { requestId, toolName, arguments: args };
    
    this.logRequestStart(context);
    const startTime = performance.now();
    
    try {
      const result = await handler();
      this.trackRequest(startTime, true, context);
      return result;
    } catch (error: any) {
      this.trackRequest(startTime, false, context);
      if (!(error instanceof McpError)) {
        this.logRequestError(error, context);
      }
      throw error;
    }
  }

  abstract getTools(): ToolDefinition[];
}

/**
 * Request logging context
 */
export interface RequestLogContext {
  requestId?: string;
  toolName?: string;
  arguments?: any;
}

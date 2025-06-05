/**
 * Log level enum
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

/**
 * Log context interface for structured logging
 */
export interface LogContext {
  correlationId?: string;
  userId?: string;
  tenantId?: string;
  boundedContext?: string;
  component?: string;
  [key: string]: any;
}

/**
 * Logger interface for cross-cutting logging concerns
 */
export interface ILogger {
  /**
   * Log a message at debug level
   * @param message The message to log
   * @param context Optional context data
   */
  debug(message: string, context?: LogContext): void;
  
  /**
   * Log a message at info level
   * @param message The message to log
   * @param context Optional context data
   */
  info(message: string, context?: LogContext): void;
  
  /**
   * Log a message at warn level
   * @param message The message to log
   * @param context Optional context data
   */
  warn(message: string, context?: LogContext): void;
  
  /**
   * Log a message at error level
   * @param message The message to log
   * @param error Optional error object
   * @param context Optional context data
   */
  error(message: string, error?: Error, context?: LogContext): void;
  
  /**
   * Log a message at fatal level
   * @param message The message to log
   * @param error Optional error object
   * @param context Optional context data
   */
  fatal(message: string, error?: Error, context?: LogContext): void;
}

/**
 * Console logger implementation
 */
export class ConsoleLogger implements ILogger {
  constructor(
    private readonly minLevel: LogLevel = LogLevel.INFO,
    private readonly defaultContext: LogContext = {}
  ) {}
  
  /**
   * Log a message at debug level
   * @param message The message to log
   * @param context Optional context data
   */
  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, undefined, context);
  }
  
  /**
   * Log a message at info level
   * @param message The message to log
   * @param context Optional context data
   */
  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, undefined, context);
  }
  
  /**
   * Log a message at warn level
   * @param message The message to log
   * @param context Optional context data
   */
  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, undefined, context);
  }
  
  /**
   * Log a message at error level
   * @param message The message to log
   * @param error Optional error object
   * @param context Optional context data
   */
  public error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, error, context);
  }
  
  /**
   * Log a message at fatal level
   * @param message The message to log
   * @param error Optional error object
   * @param context Optional context data
   */
  public fatal(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.FATAL, message, error, context);
  }
  
  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, error?: Error, context?: LogContext): void {
    // Skip if below minimum level
    if (!this.shouldLog(level)) {
      return;
    }
    
    const timestamp = new Date().toISOString();
    const mergedContext = { ...this.defaultContext, ...context };
    
    // Format the log entry
    const logEntry = {
      timestamp,
      level,
      message,
      ...(error && { 
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }),
      ...(Object.keys(mergedContext).length > 0 && { context: mergedContext })
    };
    
    // Output to console based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(JSON.stringify(logEntry));
        break;
      case LogLevel.INFO:
        console.info(JSON.stringify(logEntry));
        break;
      case LogLevel.WARN:
        console.warn(JSON.stringify(logEntry));
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(JSON.stringify(logEntry));
        break;
    }
  }
  
  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const minLevelIndex = levels.indexOf(this.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex >= minLevelIndex;
  }
}

/**
 * Logger factory for creating loggers with different configurations
 */
export class LoggerFactory {
  private static instance: LoggerFactory;
  private readonly loggers: Map<string, ILogger> = new Map();
  private defaultLogger: ILogger;
  
  private constructor() {
    this.defaultLogger = new ConsoleLogger();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): LoggerFactory {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new LoggerFactory();
    }
    
    return LoggerFactory.instance;
  }
  
  /**
   * Set the default logger
   * @param logger The logger to set as default
   */
  public setDefaultLogger(logger: ILogger): void {
    this.defaultLogger = logger;
  }
  
  /**
   * Register a logger with a name
   * @param name The logger name
   * @param logger The logger instance
   */
  public registerLogger(name: string, logger: ILogger): void {
    this.loggers.set(name, logger);
  }
  
  /**
   * Get a logger by name, or the default logger if not found
   * @param name The logger name
   * @returns The logger instance
   */
  public getLogger(name?: string): ILogger {
    if (!name) {
      return this.defaultLogger;
    }
    
    return this.loggers.get(name) || this.defaultLogger;
  }
  
  /**
   * Create a logger for a specific bounded context
   * @param boundedContext The bounded context name
   * @param component Optional component name
   * @returns A logger with context pre-configured
   */
  public createContextLogger(boundedContext: string, component?: string): ILogger {
    const contextLogger = new ConsoleLogger(LogLevel.INFO, {
      boundedContext,
      ...(component && { component })
    });
    
    return contextLogger;
  }
}

/**
 * Logger centralizado
 * Padroniza logs da aplicação
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    return `[${entry.timestamp}] [${entry.level}] ${entry.message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;

    // Em produção, só loga WARN e ERROR
    return level === LogLevel.WARN || level === LogLevel.ERROR;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    const formatted = this.formatLog(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted, context);
        break;
      case LogLevel.INFO:
        console.info(formatted, context);
        break;
      case LogLevel.WARN:
        console.warn(formatted, context);
        break;
      case LogLevel.ERROR:
        console.error(formatted, error || context);
        break;
    }

    // Aqui você poderia enviar para um serviço de logging externo
    // this.sendToExternalService(entry);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const err = error instanceof Error ? error : new Error(String(error));
    this.log(LogLevel.ERROR, message, context, err);
  }
}

export const logger = new Logger();

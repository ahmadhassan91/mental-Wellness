import { randomUUID } from 'crypto';

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  [key: string]: unknown;
}

class Logger {
  log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    const logString = JSON.stringify(logEntry);

    switch (level) {
      case 'error':
        console.error(logString);
        break;
      case 'warn':
        console.warn(logString);
        break;
      default:
        console.log(logString);
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }
}

export const logger = new Logger();

export function generateRequestId(): string {
  return randomUUID();
}

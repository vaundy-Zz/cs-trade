import pino from 'pino';

export interface Logger {
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
}

export class PinoLogger implements Logger {
  private logger: pino.Logger;

  constructor(options?: pino.LoggerOptions) {
    this.logger = pino(options ?? { level: process.env.LOG_LEVEL || 'info' });
  }

  info(message: string, context?: Record<string, any>): void {
    this.logger.info(context ?? {}, message);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.logger.warn(context ?? {}, message);
  }

  error(message: string, context?: Record<string, any>): void {
    this.logger.error(context ?? {}, message);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug(context ?? {}, message);
  }
}

export const logger = new PinoLogger();

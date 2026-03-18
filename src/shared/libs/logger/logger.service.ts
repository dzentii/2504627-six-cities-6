import pino from 'pino';
import { injectable } from 'inversify';
import { LoggerInterface } from './logger.interface.js';

const LOGGER_NAME = 'six-cities';
const LOG_LEVEL = 'info';

@injectable()
export default class LoggerService implements LoggerInterface {
  private readonly logger: ReturnType<typeof pino>;

  constructor() {
    this.logger = pino({
      name: LOGGER_NAME,
      level: LOG_LEVEL
    });
  }

  public info(message: string): void {
    this.logger.info(message);
  }

  public warn(message: string): void {
    this.logger.warn(message);
  }

  public error(message: string): void {
    this.logger.error(message);
  }
}

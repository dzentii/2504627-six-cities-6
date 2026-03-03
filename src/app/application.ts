import { inject, injectable } from 'inversify';
import { ConfigInterface } from '../shared/libs/config/config.interface.js';
import { LoggerInterface } from '../shared/libs/logger/logger.interface.js';
import { Component } from '../shared/types/component.enum.js';

@injectable()
export default class Application {
  constructor(
    @inject(Component.Logger) private readonly logger: LoggerInterface,
    @inject(Component.Config) private readonly config: ConfigInterface
  ) {}

  public init(): void {
    const port = this.config.getPort();
    this.logger.info(`Server will run on port: ${port}`);
    this.logger.info('Application has been initialized.');
  }
}

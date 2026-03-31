import { inject, injectable } from 'inversify';
import { ConfigInterface } from '../shared/libs/config/config.interface.js';
import { DatabaseClientInterface } from '../shared/libs/database-client/database-client.interface.js';
import { LoggerInterface } from '../shared/libs/logger/logger.interface.js';
import { Component } from '../shared/types/component.enum.js';

@injectable()
export default class Application {
  constructor(
    @inject(Component.Logger) private readonly logger: LoggerInterface,
    @inject(Component.Config) private readonly config: ConfigInterface,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClientInterface
  ) {}

  public async init(): Promise<void> {
    await this.databaseClient.connect(this.config.getMongoUri());

    const port = this.config.getPort();
    this.logger.info(`Server will run on port: ${port}`);
    this.logger.info('Application has been initialized.');
  }
}

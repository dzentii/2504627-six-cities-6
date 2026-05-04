import { inject, injectable } from 'inversify';
import express, { Express } from 'express';
import { ConfigInterface } from '../shared/libs/config/config.interface.js';
import { DatabaseClientInterface } from '../shared/libs/database-client/database-client.interface.js';
import { LoggerInterface } from '../shared/libs/logger/logger.interface.js';
import { ExceptionFilterInterface } from '../shared/libs/rest/exception-filter.interface.js';
import FavoriteController from '../shared/modules/favorite/favorite.controller.js';
import OfferController from '../shared/modules/offer/offer.controller.js';
import UserController from '../shared/modules/user/user.controller.js';
import { Component } from '../shared/types/component.enum.js';

const USERS_ROUTE_PREFIX = '/users';
const OFFERS_ROUTE_PREFIX = '/offers';

@injectable()
export default class Application {
  private readonly expressApplication: Express;

  constructor(
    @inject(Component.Logger) private readonly logger: LoggerInterface,
    @inject(Component.Config) private readonly config: ConfigInterface,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClientInterface,
    @inject(Component.UserController) private readonly userController: UserController,
    @inject(Component.OfferController) private readonly offerController: OfferController,
    @inject(Component.FavoriteController) private readonly favoriteController: FavoriteController,
    @inject(Component.ExceptionFilter) private readonly exceptionFilter: ExceptionFilterInterface
  ) {
    this.expressApplication = express();
  }

  public async init(): Promise<void> {
    await this.databaseClient.connect(this.config.getMongoUri());

    this.registerMiddleware();
    this.registerRoutes();
    this.registerExceptionFilters();

    const port = this.config.getPort();
    this.expressApplication.listen(port);
    this.logger.info(`Server started on port: ${port}`);
    this.logger.info('Application has been initialized.');
  }

  private registerMiddleware(): void {
    this.expressApplication.use(express.json());
    this.logger.info('Middleware registered: express.json');
  }

  private registerRoutes(): void {
    this.expressApplication.use(USERS_ROUTE_PREFIX, this.userController.getRouter());
    this.expressApplication.use(OFFERS_ROUTE_PREFIX, this.offerController.getRouter());
    this.expressApplication.use(OFFERS_ROUTE_PREFIX, this.favoriteController.getRouter());
    this.logger.info('Routes have been registered.');
  }

  private registerExceptionFilters(): void {
    this.expressApplication.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
    this.logger.info('Exception filter has been registered.');
  }
}

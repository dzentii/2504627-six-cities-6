import { inject, injectable } from 'inversify';
import express, { Express } from 'express';
import cors from 'cors';
import { resolve } from 'node:path';
import { ConfigInterface } from '../shared/libs/config/config.interface.js';
import { DatabaseClientInterface } from '../shared/libs/database-client/database-client.interface.js';
import { LoggerInterface } from '../shared/libs/logger/logger.interface.js';
import { ExceptionFilterInterface } from '../shared/libs/rest/exception-filter.interface.js';
import CommentController from '../shared/modules/comment/comment.controller.js';
import FavoriteController from '../shared/modules/favorite/favorite.controller.js';
import OfferController from '../shared/modules/offer/offer.controller.js';
import UserController from '../shared/modules/user/user.controller.js';
import { Component } from '../shared/types/component.enum.js';

const USERS_ROUTE_PREFIX = '/users';
const OFFERS_ROUTE_PREFIX = '/offers';
const UPLOADS_ROUTE_PREFIX = '/upload';
const IMAGES_ROUTE_PREFIX = '/img';
const IMAGES_DIRECTORY_PATH = 'markup/img';

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
    @inject(Component.CommentController) private readonly commentController: CommentController,
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
    this.expressApplication.use(cors());
    this.expressApplication.use(express.json());
    this.expressApplication.use(
      UPLOADS_ROUTE_PREFIX,
      express.static(resolve(this.config.getUploadDirectoryPath()))
    );
    this.expressApplication.use(
      IMAGES_ROUTE_PREFIX,
      express.static(resolve(IMAGES_DIRECTORY_PATH))
    );

    this.logger.info('Middleware registered: cors');
    this.logger.info('Middleware registered: express.json');
    this.logger.info(`Static middleware registered: ${UPLOADS_ROUTE_PREFIX}`);
    this.logger.info(`Static middleware registered: ${IMAGES_ROUTE_PREFIX}`);
  }

  private registerRoutes(): void {
    this.expressApplication.use(USERS_ROUTE_PREFIX, this.userController.getRouter());
    this.expressApplication.use(OFFERS_ROUTE_PREFIX, this.favoriteController.getRouter());
    this.expressApplication.use(OFFERS_ROUTE_PREFIX, this.commentController.getRouter());
    this.expressApplication.use(OFFERS_ROUTE_PREFIX, this.offerController.getRouter());
    this.logger.info('Routes have been registered.');
  }

  private registerExceptionFilters(): void {
    this.expressApplication.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
    this.logger.info('Exception filter has been registered.');
  }
}

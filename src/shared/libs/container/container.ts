import 'reflect-metadata';
import { Container } from 'inversify';
import { Model } from 'mongoose';
import Application from '../../../app/application.js';
import { ConfigInterface } from '../config/config.interface.js';
import ConfigService from '../config/config.service.js';
import { DatabaseClientInterface } from '../database-client/database-client.interface.js';
import MongooseDatabaseClient from '../database-client/mongoose.database-client.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import LoggerService from '../logger/logger.service.js';
import { CommentEntity, CommentModel } from '../../modules/comment/comment.entity.js';
import { CommentServiceInterface } from '../../modules/comment/comment-service.interface.js';
import DefaultCommentService from '../../modules/comment/default-comment.service.js';
import { FavoriteEntity, FavoriteModel } from '../../modules/favorite/favorite.entity.js';
import { FavoriteServiceInterface } from '../../modules/favorite/favorite-service.interface.js';
import DefaultFavoriteService from '../../modules/favorite/default-favorite.service.js';
import { OfferEntity, OfferModel } from '../../modules/offer/offer.entity.js';
import { OfferServiceInterface } from '../../modules/offer/offer-service.interface.js';
import DefaultOfferService from '../../modules/offer/default-offer.service.js';
import { UserEntity, UserModel } from '../../modules/user/user.entity.js';
import { UserServiceInterface } from '../../modules/user/user-service.interface.js';
import DefaultUserService from '../../modules/user/default-user.service.js';
import { Component } from '../../types/component.enum.js';

export function createApplicationContainer(): Container {
  const container = new Container();

  container.bind<Application>(Component.Application).to(Application).inSingletonScope();
  container.bind<LoggerInterface>(Component.Logger).to(LoggerService).inSingletonScope();
  container.bind<ConfigInterface>(Component.Config).to(ConfigService).inSingletonScope();
  container.bind<DatabaseClientInterface>(Component.DatabaseClient).to(MongooseDatabaseClient).inSingletonScope();
  container.bind<Model<UserEntity>>(Component.UserModel).toConstantValue(UserModel);
  container.bind<Model<OfferEntity>>(Component.OfferModel).toConstantValue(OfferModel);
  container.bind<Model<CommentEntity>>(Component.CommentModel).toConstantValue(CommentModel);
  container.bind<Model<FavoriteEntity>>(Component.FavoriteModel).toConstantValue(FavoriteModel);
  container.bind<UserServiceInterface>(Component.UserService).to(DefaultUserService).inSingletonScope();
  container.bind<FavoriteServiceInterface>(Component.FavoriteService).to(DefaultFavoriteService).inSingletonScope();
  container.bind<OfferServiceInterface>(Component.OfferService).to(DefaultOfferService).inSingletonScope();
  container.bind<CommentServiceInterface>(Component.CommentService).to(DefaultCommentService).inSingletonScope();

  return container;
}

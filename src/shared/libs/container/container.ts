import 'reflect-metadata';
import { Container } from 'inversify';
import Application from '../../../app/application.js';
import { ConfigInterface } from '../config/config.interface.js';
import ConfigService from '../config/config.service.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import LoggerService from '../logger/logger.service.js';
import { Component } from '../../types/component.enum.js';

export function createApplicationContainer(): Container {
  const container = new Container();

  container.bind<Application>(Component.Application).to(Application).inSingletonScope();
  container.bind<LoggerInterface>(Component.Logger).to(LoggerService).inSingletonScope();
  container.bind<ConfigInterface>(Component.Config).to(ConfigService).inSingletonScope();

  return container;
}

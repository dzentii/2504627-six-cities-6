import Application from './app/application.js';
import { createApplicationContainer } from './shared/libs/container/container.js';
import { Component } from './shared/types/component.enum.js';

function bootstrap(): void {
  const container = createApplicationContainer();
  const application = container.get<Application>(Component.Application);
  application.init();
}

bootstrap();

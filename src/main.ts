import Application from './app/application.js';
import { createApplicationContainer } from './shared/libs/container/container.js';
import { Component } from './shared/types/component.enum.js';

async function bootstrap(): Promise<void> {
  const container = createApplicationContainer();
  const application = container.get<Application>(Component.Application);
  await application.init();
}

bootstrap().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

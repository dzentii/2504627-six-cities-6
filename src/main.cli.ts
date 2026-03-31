#!/usr/bin/env node
import CLIApplication from './cli/cli-application.js';
import HelpCommand from './cli/commands/help.command.js';
import VersionCommand from './cli/commands/version.command.js';
import ImportCommand from './cli/commands/import.command.js';
import GenerateCommand from './cli/commands/generate.command.js';
import { createApplicationContainer } from './shared/libs/container/container.js';
import { DatabaseClientInterface } from './shared/libs/database-client/database-client.interface.js';
import { OfferServiceInterface } from './shared/modules/offer/offer-service.interface.js';
import { UserServiceInterface } from './shared/modules/user/user-service.interface.js';
import { Component } from './shared/types/component.enum.js';

const cliManager = new CLIApplication();
const container = createApplicationContainer();
const databaseClient = container.get<DatabaseClientInterface>(Component.DatabaseClient);
const userService = container.get<UserServiceInterface>(Component.UserService);
const offerService = container.get<OfferServiceInterface>(Component.OfferService);

cliManager.registerCommands([
  new HelpCommand(),
  new VersionCommand(),
  new ImportCommand(databaseClient, userService, offerService),
  new GenerateCommand(),
]);

cliManager.processCommand(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

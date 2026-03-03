#!/usr/bin/env node
import CLIApplication from './cli/cli-application.js';
import HelpCommand from './cli/commands/help.command.js';
import VersionCommand from './cli/commands/version.command.js';
import ImportCommand from './cli/commands/import.command.js';
import GenerateCommand from './cli/commands/generate.command.js';

const cliManager = new CLIApplication();

cliManager.registerCommands([
  new HelpCommand(),
  new VersionCommand(),
  new ImportCommand(),
  new GenerateCommand(),
]);

cliManager.processCommand(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

#!/usr/bin/env node
import CLIApplication from './cli/cli-application.js';
import HelpCommand from './cli/commands/help.command.js';
import VersionCommand from './cli/commands/version.command.js';
import ImportCommand from './cli/commands/import.command.js';

const cliManager = new CLIApplication();

cliManager.registerCommands([
  new HelpCommand(),
  new VersionCommand(),
  new ImportCommand(),
]);

cliManager.processCommand(process.argv);

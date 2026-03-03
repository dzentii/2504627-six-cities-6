import { CommandInterface } from './commands/command.interface.js';

type CommandCollection = Record<string, CommandInterface>;

export default class CLIApplication {
  private commands: CommandCollection = {};
  private readonly defaultCommand = '--help';

  public registerCommands(commandList: CommandInterface[]): void {
    commandList.reduce((acc, command) => {
      acc[command.name] = command;
      return acc;
    }, this.commands);
  }

  public getCommand(commandName: string): CommandInterface {
    return this.commands[commandName] ?? this.commands[this.defaultCommand];
  }

  public async processCommand(argv: string[]): Promise<void> {
    const [,, commandName, ...parameters] = argv;
    const command = this.getCommand(commandName);
    await command.execute(...parameters);
  }
}

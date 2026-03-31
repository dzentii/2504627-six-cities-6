import chalk from 'chalk';
import { CommandInterface } from './command.interface.js';

export default class HelpCommand implements CommandInterface {
  public readonly name = '--help';

  public async execute(): Promise<void> {
    console.info(`
        ${chalk.bold('Программа для подготовки данных для REST API сервера.')}
        ${chalk.yellow('Пример:')}
            main.cli.js --<command> [--arguments]
        ${chalk.yellow('Команды:')}
            ${chalk.green('--version:')}
            ${chalk.green('--help:')}
            ${chalk.green('--import <path> <db-uri>:')}
            ${chalk.green('--generate <n> <path> <url>:')}
    `);
  }
}

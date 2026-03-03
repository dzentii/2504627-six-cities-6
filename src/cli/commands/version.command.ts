import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import chalk from 'chalk';
import { CommandInterface } from './command.interface.js';

export default class VersionCommand implements CommandInterface {
  public readonly name = '--version';

  private static readVersion(): string {
    const jsonContent = readFileSync(resolve('./package.json'), 'utf-8');
    const importedData = JSON.parse(jsonContent);
    return importedData.version;
  }

  public async execute(): Promise<void> {
    try {
      const version = VersionCommand.readVersion();
      console.info(chalk.bgBlue.white(` Версия проекта: ${version} `));
    } catch (error: unknown) {
      console.error(chalk.red(`Не удалось прочитать версию: ${error instanceof Error ? error.message : error}`));
    }
  }
}

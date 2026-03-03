import chalk from 'chalk';
import { CommandInterface } from './command.interface.js';
import TSVFileReader from '../../shared/libs/file-reader/tsv-file-reader.js';

export default class ImportCommand implements CommandInterface {
  public readonly name = '--import';

  public async execute(...parameters: string[]): Promise<void> {
    const [filename] = parameters;

    if (!filename) {
      console.error(chalk.red('Ошибка: укажите путь к tsv-файлу.'));
      return;
    }

    const fileReader = new TSVFileReader(filename.trim());

    fileReader.on('line', (offer) => {
      console.log(chalk.cyan('Импортировано:'), offer.title);
    });

    fileReader.on('end', (count) => {
      console.log(chalk.green.bold(`\nУспех! Всего обработано строк: ${count}`));
    });

    try {
      await fileReader.read();
    } catch (err) {
      console.error(chalk.bgRed.white(` Ошибка чтения: ${err instanceof Error ? err.message : err} `));
    }
  }
}

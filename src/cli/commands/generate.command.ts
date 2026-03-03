import { createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import { get as httpGet } from 'node:http';
import { get as httpsGet } from 'node:https';
import { fileURLToPath, URL } from 'node:url';
import chalk from 'chalk';
import OfferGenerator from '../../shared/libs/offer-generator/offer-generator.js';
import { Location } from '../../types/offer.type.js';
import { MockServerData } from '../../types/mock-server-data.type.js';
import { CommandInterface } from './command.interface.js';

const MIN_OFFER_COUNT = 1;
const LINE_BREAK = '\n';
const SUCCESS_STATUS_CODE_MAX = 299;
const FILE_PROTOCOL = 'file:';
const HTTPS_PROTOCOL = 'https:';

export default class GenerateCommand implements CommandInterface {
  public readonly name = '--generate';

  public async execute(...parameters: string[]): Promise<void> {
    const [countParameter, filepath, url] = parameters;
    const offerCount = Number.parseInt(countParameter ?? '', 10);

    if (!countParameter || !filepath || !url || Number.isNaN(offerCount) || offerCount < MIN_OFFER_COUNT) {
      console.error(chalk.red('Ошибка: используйте формат --generate <n> <filepath> <url>.'));
      return;
    }

    try {
      const mockServerData = await GenerateCommand.fetchMockServerData(url.trim());
      const offerGenerator = new OfferGenerator(mockServerData);
      await GenerateCommand.writeOffers(filepath.trim(), offerCount, offerGenerator);
      console.info(chalk.green.bold(`Данные успешно записаны в файл: ${filepath}`));
    } catch (error: unknown) {
      console.error(chalk.bgRed.white(` Ошибка генерации: ${error instanceof Error ? error.message : error} `));
    }
  }

  private static async fetchMockServerData(url: string): Promise<MockServerData> {
    const rawData = await GenerateCommand.request(url);
    const data: unknown = JSON.parse(rawData);

    if (!GenerateCommand.isMockServerData(data)) {
      throw new Error('Некорректный формат mock-данных.');
    }

    return data;
  }

  private static async writeOffers(filepath: string, offerCount: number, offerGenerator: OfferGenerator): Promise<void> {
    const writeStream = createWriteStream(filepath, { encoding: 'utf-8' });
    const errorPromise = new Promise<never>((_, reject) => {
      writeStream.once('error', reject);
    });

    for (let i = 0; i < offerCount; i++) {
      const line = `${offerGenerator.generate()}${LINE_BREAK}`;
      const canWrite = writeStream.write(line);

      if (!canWrite) {
        await Promise.race([once(writeStream, 'drain'), errorPromise]);
      }
    }

    writeStream.end();
    await Promise.race([once(writeStream, 'finish'), errorPromise]);
  }

  private static async request(url: string): Promise<string> {
    const requestUrl = new URL(url);

    if (requestUrl.protocol === FILE_PROTOCOL) {
      const filepath = fileURLToPath(requestUrl);
      return readFile(filepath, 'utf-8');
    }

    const requestFunction = requestUrl.protocol === HTTPS_PROTOCOL ? httpsGet : httpGet;

    return new Promise<string>((resolve, reject) => {
      const request = requestFunction(requestUrl, (response) => {
        if (!response.statusCode || response.statusCode > SUCCESS_STATUS_CODE_MAX) {
          reject(new Error(`Ошибка загрузки mock-данных: HTTP ${response.statusCode}`));
          response.resume();
          return;
        }

        const chunks: string[] = [];
        response.setEncoding('utf-8');
        response.on('data', (chunk: string) => chunks.push(chunk));
        response.on('end', () => resolve(chunks.join('')));
      });

      request.on('error', reject);
    });
  }

  private static isMockServerData(value: unknown): value is MockServerData {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    return (
      GenerateCommand.isStringArray(Reflect.get(value, 'titles')) &&
      GenerateCommand.isStringArray(Reflect.get(value, 'descriptions')) &&
      GenerateCommand.isStringArray(Reflect.get(value, 'cities')) &&
      GenerateCommand.isStringArray(Reflect.get(value, 'previewImages')) &&
      GenerateCommand.isStringMatrix(Reflect.get(value, 'images')) &&
      GenerateCommand.isBooleanArray(Reflect.get(value, 'isPremiumValues')) &&
      GenerateCommand.isBooleanArray(Reflect.get(value, 'isFavoriteValues')) &&
      GenerateCommand.isNumberArray(Reflect.get(value, 'ratings')) &&
      GenerateCommand.isStringArray(Reflect.get(value, 'housingTypes')) &&
      GenerateCommand.isNumberArray(Reflect.get(value, 'bedrooms')) &&
      GenerateCommand.isNumberArray(Reflect.get(value, 'maxAdults')) &&
      GenerateCommand.isNumberArray(Reflect.get(value, 'prices')) &&
      GenerateCommand.isStringMatrix(Reflect.get(value, 'goods')) &&
      GenerateCommand.isStringArray(Reflect.get(value, 'names')) &&
      GenerateCommand.isStringArray(Reflect.get(value, 'emails')) &&
      GenerateCommand.isStringArray(Reflect.get(value, 'avatarPaths')) &&
      GenerateCommand.isStringArray(Reflect.get(value, 'passwords')) &&
      GenerateCommand.isStringArray(Reflect.get(value, 'userTypes')) &&
      GenerateCommand.isLocationArray(Reflect.get(value, 'locations'))
    );
  }

  private static isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
  }

  private static isNumberArray(value: unknown): value is number[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'number' && Number.isFinite(item));
  }

  private static isBooleanArray(value: unknown): value is boolean[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'boolean');
  }

  private static isStringMatrix(value: unknown): value is string[][] {
    return Array.isArray(value) && value.every((item) => GenerateCommand.isStringArray(item));
  }

  private static isLocationArray(value: unknown): value is Location[] {
    return Array.isArray(value) && value.every((item) => GenerateCommand.isLocation(item));
  }

  private static isLocation(value: unknown): value is Location {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const latitude = Reflect.get(value, 'latitude');
    const longitude = Reflect.get(value, 'longitude');

    return (
      typeof latitude === 'number' &&
      Number.isFinite(latitude) &&
      typeof longitude === 'number' &&
      Number.isFinite(longitude)
    );
  }
}

import chalk from 'chalk';
import { CommandInterface } from './command.interface.js';
import TSVFileReader from '../../shared/libs/file-reader/tsv-file-reader.js';
import { DatabaseClientInterface } from '../../shared/libs/database-client/database-client.interface.js';
import { CreateOfferDto, OfferServiceInterface } from '../../shared/modules/offer/offer-service.interface.js';
import { CreateUserDto, UserServiceInterface } from '../../shared/modules/user/user-service.interface.js';
import { Offer } from '../../types/offer.type.js';

const IMPORT_COMMAND_FORMAT = '--import <filepath> <db-uri>';

export default class ImportCommand implements CommandInterface {
  public readonly name = '--import';

  constructor(
    private readonly databaseClient: DatabaseClientInterface,
    private readonly userService: UserServiceInterface,
    private readonly offerService: OfferServiceInterface
  ) {}

  public async execute(...parameters: string[]): Promise<void> {
    const [filename, dbUri] = parameters;

    if (!filename || !dbUri) {
      console.error(chalk.red(`Ошибка: используйте формат ${IMPORT_COMMAND_FORMAT}.`));
      return;
    }

    const trimmedFilename = filename.trim();
    const trimmedDbUri = dbUri.trim();

    if (trimmedFilename.length === 0 || trimmedDbUri.length === 0) {
      console.error(chalk.red(`Ошибка: используйте формат ${IMPORT_COMMAND_FORMAT}.`));
      return;
    }

    const fileReader = new TSVFileReader(trimmedFilename);

    try {
      await this.databaseClient.connect(trimmedDbUri);

      let importedCount = 0;
      let skippedCount = 0;

      const processedCount = await fileReader.read(async (offer) => {
        try {
          await this.saveOffer(offer);
          importedCount++;
          console.log(chalk.cyan('Импортировано:'), offer.title);
        } catch (error: unknown) {
          skippedCount++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(chalk.yellow(`Строка пропущена: ${errorMessage}`));
        }
      });

      console.log(
        chalk.green.bold(
          `\nУспех! Обработано строк: ${processedCount}. Импортировано: ${importedCount}. Пропущено: ${skippedCount}.`
        )
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.bgRed.white(` Ошибка импорта: ${errorMessage} `));
    } finally {
      await this.databaseClient.disconnect();
    }
  }

  private async saveOffer(offer: Offer): Promise<void> {
    if (Number.isNaN(offer.postDate.getTime())) {
      throw new Error('Некорректная дата публикации.');
    }

    const authorId = await this.getAuthorId(offer);
    const offerData = ImportCommand.buildOfferData(offer, authorId);
    await this.offerService.create(offerData);
  }

  private async getAuthorId(offer: Offer): Promise<string> {
    const existedUser = await this.userService.findByEmail(offer.author.email);

    if (existedUser) {
      return existedUser.id;
    }

    const userData = ImportCommand.buildUserData(offer);
    const createdUser = await this.userService.create(userData);
    return createdUser.id;
  }

  private static buildUserData(offer: Offer): CreateUserDto {
    return {
      name: offer.author.name,
      email: offer.author.email,
      avatarPath: offer.author.avatarPath || undefined,
      password: offer.author.password || '',
      type: offer.author.type
    };
  }

  private static buildOfferData(offer: Offer, authorId: string): CreateOfferDto {
    return {
      title: offer.title,
      description: offer.description,
      postDate: offer.postDate,
      city: offer.city,
      previewImage: offer.previewImage,
      images: offer.images,
      isPremium: offer.isPremium,
      isFavorite: offer.isFavorite,
      rating: offer.rating,
      type: offer.type,
      bedrooms: offer.bedrooms,
      maxAdults: offer.maxAdults,
      price: offer.price,
      goods: offer.goods,
      authorId,
      location: offer.location
    };
  }
}

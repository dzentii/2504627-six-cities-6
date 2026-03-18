import { createReadStream } from 'node:fs';
import { EventEmitter } from 'node:events';
import { createInterface } from 'node:readline';
import { Offer, HousingType, CityName } from '../../../types/offer.type.js';
import { UserType } from '../../../types/user.type.js';

const DEFAULT_CITY = CityName.Paris;
const DEFAULT_HOUSING_TYPE = HousingType.Apartment;
const DEFAULT_USER_TYPE = UserType.Regular;
const REGULAR_USER_TYPE_ALIAS = 'regular';
const EMPTY_STRING = '';
const COMMA_SEPARATOR = ',';
const INTEGER_RADIX = 10;
const DEFAULT_NUMBER = 0;
const LINE_BREAK_DELAY = Infinity;

export default class TSVFileReader extends EventEmitter {
  constructor(private readonly filename: string) {
    super();
  }

  public async read(lineHandler?: (offer: Offer) => Promise<void> | void): Promise<number> {
    const fileStream = createReadStream(this.filename, { encoding: 'utf-8' });
    const lineReader = createInterface({
      input: fileStream,
      crlfDelay: LINE_BREAK_DELAY
    });

    let linesCount = 0;

    for await (const line of lineReader) {
      if (line.trim().length === 0) {
        continue;
      }

      const offer = TSVFileReader.parseLine(line);

      if (lineHandler) {
        await lineHandler(offer);
      }

      this.emit('line', offer);
      linesCount++;
    }

    this.emit('end', linesCount);
    return linesCount;
  }

  private static parseLine(line: string): Offer {
    const [
      title, description, postDate, city, previewImage, images,
      isPremium, isFavorite, rating, type, bedrooms, maxAdults,
      price, goods, name, email, avatarPath, password, userType,
      latitude, longitude
    ] = line.split('\t');

    return {
      title: title ?? EMPTY_STRING,
      description: description ?? EMPTY_STRING,
      postDate: new Date(postDate),
      city: TSVFileReader.parseCity(city),
      previewImage: previewImage ?? EMPTY_STRING,
      images: TSVFileReader.parseList(images),
      isPremium: isPremium === 'true',
      isFavorite: isFavorite === 'true',
      rating: TSVFileReader.parseFloat(rating),
      type: TSVFileReader.parseHousingType(type),
      bedrooms: TSVFileReader.parseInteger(bedrooms),
      maxAdults: TSVFileReader.parseInteger(maxAdults),
      price: TSVFileReader.parseInteger(price),
      goods: TSVFileReader.parseList(goods),
      author: {
        name: name ?? EMPTY_STRING,
        email: email ?? EMPTY_STRING,
        avatarPath: avatarPath ?? EMPTY_STRING,
        password: password ?? EMPTY_STRING,
        type: TSVFileReader.parseUserType(userType)
      },
      location: {
        latitude: TSVFileReader.parseFloat(latitude),
        longitude: TSVFileReader.parseFloat(longitude)
      },
    };
  }

  private static parseList(value: string | undefined): string[] {
    if (!value) {
      return [];
    }

    return value.split(COMMA_SEPARATOR);
  }

  private static parseInteger(value: string | undefined): number {
    if (!value) {
      return DEFAULT_NUMBER;
    }

    const parsedValue = Number.parseInt(value, INTEGER_RADIX);
    return Number.isNaN(parsedValue) ? DEFAULT_NUMBER : parsedValue;
  }

  private static parseFloat(value: string | undefined): number {
    if (!value) {
      return DEFAULT_NUMBER;
    }

    const parsedValue = Number.parseFloat(value);
    return Number.isNaN(parsedValue) ? DEFAULT_NUMBER : parsedValue;
  }

  private static parseCity(city: string | undefined): CityName {
    switch (city) {
      case CityName.Paris:
        return CityName.Paris;
      case CityName.Cologne:
        return CityName.Cologne;
      case CityName.Brussels:
        return CityName.Brussels;
      case CityName.Amsterdam:
        return CityName.Amsterdam;
      case CityName.Hamburg:
        return CityName.Hamburg;
      case CityName.Dusseldorf:
        return CityName.Dusseldorf;
      default:
        return DEFAULT_CITY;
    }
  }

  private static parseHousingType(housingType: string | undefined): HousingType {
    switch (housingType) {
      case HousingType.Apartment:
        return HousingType.Apartment;
      case HousingType.House:
        return HousingType.House;
      case HousingType.Room:
        return HousingType.Room;
      case HousingType.Hotel:
        return HousingType.Hotel;
      default:
        return DEFAULT_HOUSING_TYPE;
    }
  }

  private static parseUserType(userType: string | undefined): UserType {
    switch (userType) {
      case UserType.Pro:
        return UserType.Pro;
      case UserType.Regular:
      case REGULAR_USER_TYPE_ALIAS:
        return UserType.Regular;
      default:
        return DEFAULT_USER_TYPE;
    }
  }
}

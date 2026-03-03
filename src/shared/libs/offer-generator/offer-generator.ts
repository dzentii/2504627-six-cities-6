import { getRandomInteger, getRandomItem } from '../../helpers/random.js';
import { Location } from '../../../types/offer.type.js';
import { MockServerData } from '../../../types/mock-server-data.type.js';

const TSV_FIELD_SEPARATOR = '\t';
const CSV_FIELD_SEPARATOR = ',';
const MILLISECONDS_PER_DAY = 86400000;
const MAX_DAYS_OFFSET = 7;
const RATING_DECIMAL_DIGITS = 1;

export default class OfferGenerator {
  constructor(private readonly mockData: MockServerData) {}

  public generate(): string {
    const images = getRandomItem(this.mockData.images);
    const goods = getRandomItem(this.mockData.goods);
    const location = getRandomItem(this.mockData.locations);

    const fields = [
      getRandomItem(this.mockData.titles),
      getRandomItem(this.mockData.descriptions),
      OfferGenerator.generatePostDate(),
      getRandomItem(this.mockData.cities),
      getRandomItem(this.mockData.previewImages),
      images.join(CSV_FIELD_SEPARATOR),
      String(getRandomItem(this.mockData.isPremiumValues)),
      String(getRandomItem(this.mockData.isFavoriteValues)),
      this.generateRating(),
      getRandomItem(this.mockData.housingTypes),
      String(getRandomItem(this.mockData.bedrooms)),
      String(getRandomItem(this.mockData.maxAdults)),
      String(getRandomItem(this.mockData.prices)),
      goods.join(CSV_FIELD_SEPARATOR),
      getRandomItem(this.mockData.names),
      getRandomItem(this.mockData.emails),
      getRandomItem(this.mockData.avatarPaths),
      getRandomItem(this.mockData.passwords),
      getRandomItem(this.mockData.userTypes),
      OfferGenerator.formatCoordinate(location.latitude),
      OfferGenerator.formatCoordinate(location.longitude),
    ];

    return fields.join(TSV_FIELD_SEPARATOR);
  }

  private static generatePostDate(): string {
    const dayOffset = getRandomInteger(0, MAX_DAYS_OFFSET);
    const createdDate = new Date(Date.now() - (dayOffset * MILLISECONDS_PER_DAY));
    return createdDate.toISOString().slice(0, 10);
  }

  private generateRating(): string {
    const rating = getRandomItem(this.mockData.ratings);
    return rating.toFixed(RATING_DECIMAL_DIGITS);
  }

  private static formatCoordinate(coordinate: Location['latitude']): string {
    return coordinate.toString();
  }
}

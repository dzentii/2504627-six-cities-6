import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import { Offer, HousingType, CityName } from '../../../types/offer.type';
import { UserType } from '../../../types/user.type.js';

export default class TSVFileReader extends EventEmitter {
  constructor(private readonly filename: string) {
    super();
  }

  public read(): void {
    const rawData = readFileSync(this.filename, { encoding: 'utf-8' });

    const lines = rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .map((line) => this.parseLine(line));

    lines.forEach((line) => this.emit('line', line));
    this.emit('end', lines.length);
  }

  private parseLine(line: string): Offer {
    const [
      title, description, postDate, city, previewImage, images,
      isPremium, isFavorite, rating, type, bedrooms, maxAdults,
      price, goods, name, email, avatarPath, password, userType,
      latitude, longitude
    ] = line.split('\t');

    return {
      title,
      description,
      postDate: new Date(postDate),
      city: city as CityName,
      previewImage,
      images: images.split(','),
      isPremium: isPremium === 'true',
      isFavorite: isFavorite === 'true',
      rating: Number.parseFloat(rating),
      type: type as HousingType,
      bedrooms: Number.parseInt(bedrooms, 10),
      maxAdults: Number.parseInt(maxAdults, 10),
      price: Number.parseInt(price, 10),
      goods: goods.split(','),
      author: {
        name,
        email,
        avatarPath,
        password,
        type: userType as UserType
      },
      location: {
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude)
      },
    };
  }
}

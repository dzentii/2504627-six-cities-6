import { CityName, HousingType, Location } from '../../../types/offer.type.js';
import { OfferDocument } from './offer.entity.js';

export type CreateOfferDto = {
  title: string;
  description: string;
  postDate: Date;
  city: CityName;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: HousingType;
  bedrooms: number;
  maxAdults: number;
  price: number;
  goods: string[];
  authorId: string;
  location: Location;
  commentsCount?: number;
};

export interface OfferServiceInterface {
  findById(id: string): Promise<OfferDocument | null>;
  create(data: CreateOfferDto): Promise<OfferDocument>;
}

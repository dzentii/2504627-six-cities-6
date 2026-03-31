import { CityName, HousingType, Location } from '../../../types/offer.type.js';
import { OfferEntity } from './offer.entity.js';
import { OfferDocument } from './offer.entity.js';

export type CreateOfferDto = {
  title: string;
  description: string;
  postDate: Date;
  city: CityName;
  previewImage: string;
  images: string[];
  isPremium: boolean;
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

export type UpdateOfferDto = Partial<Omit<CreateOfferDto, 'authorId'>>;
export type OfferView = OfferEntity & {
  id: string;
  isFavorite: boolean;
};

export interface OfferServiceInterface {
  findById(id: string, userId?: string): Promise<OfferView | null>;
  find(limit?: number, userId?: string): Promise<OfferView[]>;
  findPremiumByCity(city: CityName, limit?: number, userId?: string): Promise<OfferView[]>;
  findFavorites(userId: string, limit?: number): Promise<OfferView[]>;
  create(data: CreateOfferDto): Promise<OfferDocument>;
  updateById(id: string, data: UpdateOfferDto): Promise<OfferDocument | null>;
  deleteById(id: string): Promise<OfferDocument | null>;
  setFavoriteStatus(id: string, userId: string, isFavorite: boolean): Promise<OfferView | null>;
}

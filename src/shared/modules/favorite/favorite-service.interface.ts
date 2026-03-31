import { FavoriteDocument } from './favorite.entity.js';

export type CreateFavoriteDto = {
  userId: string;
  offerId: string;
};

export interface FavoriteServiceInterface {
  findByUserId(userId: string): Promise<FavoriteDocument[]>;
  findByUserIdAndOfferIds(userId: string, offerIds: string[]): Promise<FavoriteDocument[]>;
  add(data: CreateFavoriteDto): Promise<FavoriteDocument>;
  remove(userId: string, offerId: string): Promise<number>;
  exists(userId: string, offerId: string): Promise<boolean>;
  removeByOfferId(offerId: string): Promise<number>;
}

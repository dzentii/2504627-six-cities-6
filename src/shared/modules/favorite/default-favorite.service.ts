import { inject, injectable } from 'inversify';
import { Model } from 'mongoose';
import { Component } from '../../types/component.enum.js';
import { CreateFavoriteDto, FavoriteServiceInterface } from './favorite-service.interface.js';
import { FavoriteDocument, FavoriteEntity } from './favorite.entity.js';

const ZERO_DELETED_COUNT = 0;

@injectable()
export default class DefaultFavoriteService implements FavoriteServiceInterface {
  constructor(
    @inject(Component.FavoriteModel) private readonly favoriteModel: Model<FavoriteEntity>
  ) {}

  public findByUserId(userId: string): Promise<FavoriteDocument[]> {
    return this.favoriteModel.find({ user: userId }).exec();
  }

  public findByUserIdAndOfferIds(userId: string, offerIds: string[]): Promise<FavoriteDocument[]> {
    return this.favoriteModel.find({
      user: userId,
      offer: { $in: offerIds }
    }).exec();
  }

  public add(data: CreateFavoriteDto): Promise<FavoriteDocument> {
    const { offerId, userId } = data;

    return this.favoriteModel.findOneAndUpdate(
      { user: userId, offer: offerId },
      { user: userId, offer: offerId },
      {
        upsert: true,
        new: true
      }
    ).orFail().exec();
  }

  public async remove(userId: string, offerId: string): Promise<number> {
    const deleteResult = await this.favoriteModel.deleteOne({ user: userId, offer: offerId }).exec();
    return deleteResult.deletedCount ?? ZERO_DELETED_COUNT;
  }

  public async exists(userId: string, offerId: string): Promise<boolean> {
    const favoriteDocument = await this.favoriteModel.findOne({ user: userId, offer: offerId }).exec();
    return favoriteDocument !== null;
  }

  public async removeByOfferId(offerId: string): Promise<number> {
    const deleteResult = await this.favoriteModel.deleteMany({ offer: offerId }).exec();
    return deleteResult.deletedCount ?? ZERO_DELETED_COUNT;
  }
}

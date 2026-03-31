import { inject, injectable } from 'inversify';
import { Model } from 'mongoose';
import { Component } from '../../types/component.enum.js';
import { CommentEntity } from '../comment/comment.entity.js';
import { FavoriteServiceInterface } from '../favorite/favorite-service.interface.js';
import { CityName } from '../../../types/offer.type.js';
import { CreateOfferDto, OfferServiceInterface, OfferView, UpdateOfferDto } from './offer-service.interface.js';
import { OfferDocument, OfferEntity } from './offer.entity.js';

const DEFAULT_COMMENTS_COUNT = 0;
const DEFAULT_OFFERS_LIMIT = 60;
const DEFAULT_PREMIUM_OFFERS_LIMIT = 3;
const POST_DATE_DESCENDING = -1;

@injectable()
export default class DefaultOfferService implements OfferServiceInterface {
  constructor(
    @inject(Component.OfferModel) private readonly offerModel: Model<OfferEntity>,
    @inject(Component.CommentModel) private readonly commentModel: Model<CommentEntity>,
    @inject(Component.FavoriteService) private readonly favoriteService: FavoriteServiceInterface
  ) {}

  public async findById(id: string, userId?: string): Promise<OfferView | null> {
    const offer = await this.offerModel.findById(id).exec();

    if (!offer) {
      return null;
    }

    const favoriteOfferIdSet = await this.getFavoriteOfferIdSet(userId, [offer.id]);
    return this.toOfferView(offer, favoriteOfferIdSet.has(offer.id));
  }

  public async find(limit = DEFAULT_OFFERS_LIMIT, userId?: string): Promise<OfferView[]> {
    const offers = await this.offerModel
      .find()
      .sort({ postDate: POST_DATE_DESCENDING })
      .limit(limit)
      .exec();

    return this.mapOffersWithFavorite(offers, userId);
  }

  public async findPremiumByCity(city: CityName, limit = DEFAULT_PREMIUM_OFFERS_LIMIT, userId?: string): Promise<OfferView[]> {
    const offers = await this.offerModel
      .find({
        city,
        isPremium: true
      })
      .sort({ postDate: POST_DATE_DESCENDING })
      .limit(limit)
      .exec();

    return this.mapOffersWithFavorite(offers, userId);
  }

  public async findFavorites(userId: string, limit?: number): Promise<OfferView[]> {
    const favorites = await this.favoriteService.findByUserId(userId);
    const favoriteOfferIds = favorites.map((favorite) => favorite.offer.toString());

    if (favoriteOfferIds.length === 0) {
      return [];
    }

    const query = this.offerModel
      .find({ _id: { $in: favoriteOfferIds } })
      .sort({ postDate: POST_DATE_DESCENDING });

    if (typeof limit === 'number') {
      query.limit(limit);
    }

    const favoriteOffers = await query.exec();
    return favoriteOffers.map((favoriteOffer) => this.toOfferView(favoriteOffer, true));
  }

  public create(data: CreateOfferDto): Promise<OfferDocument> {
    const { authorId, commentsCount, ...offerData } = data;

    return this.offerModel.create({
      ...offerData,
      author: authorId,
      commentsCount: commentsCount ?? DEFAULT_COMMENTS_COUNT
    });
  }

  public updateById(id: string, data: UpdateOfferDto): Promise<OfferDocument | null> {
    return this.offerModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  public async deleteById(id: string): Promise<OfferDocument | null> {
    await this.commentModel.deleteMany({ offer: id }).exec();
    await this.favoriteService.removeByOfferId(id);
    return this.offerModel.findByIdAndDelete(id).exec();
  }

  public async setFavoriteStatus(id: string, userId: string, isFavorite: boolean): Promise<OfferView | null> {
    const offer = await this.offerModel.findById(id).exec();

    if (!offer) {
      return null;
    }

    if (isFavorite) {
      await this.favoriteService.add({ userId, offerId: id });
    } else {
      await this.favoriteService.remove(userId, id);
    }

    return this.findById(id, userId);
  }

  private async mapOffersWithFavorite(offers: OfferDocument[], userId?: string): Promise<OfferView[]> {
    const offerIds = offers.map((offer) => offer.id);
    const favoriteOfferIdSet = await this.getFavoriteOfferIdSet(userId, offerIds);

    return offers.map((offer) => this.toOfferView(offer, favoriteOfferIdSet.has(offer.id)));
  }

  private async getFavoriteOfferIdSet(userId: string | undefined, offerIds: string[]): Promise<Set<string>> {
    if (!userId || offerIds.length === 0) {
      return new Set<string>();
    }

    const favorites = await this.favoriteService.findByUserIdAndOfferIds(userId, offerIds);
    return new Set(favorites.map((favorite) => favorite.offer.toString()));
  }

  private toOfferView(offer: OfferDocument, isFavorite: boolean): OfferView {
    return {
      ...offer.toObject(),
      id: offer.id,
      isFavorite
    } as OfferView;
  }
}

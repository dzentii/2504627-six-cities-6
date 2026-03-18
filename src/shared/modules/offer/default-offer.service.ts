import { inject, injectable } from 'inversify';
import { Model } from 'mongoose';
import { Component } from '../../types/component.enum.js';
import { CreateOfferDto, OfferServiceInterface } from './offer-service.interface.js';
import { OfferDocument, OfferEntity } from './offer.entity.js';

const DEFAULT_COMMENTS_COUNT = 0;

@injectable()
export default class DefaultOfferService implements OfferServiceInterface {
  constructor(
    @inject(Component.OfferModel) private readonly offerModel: Model<OfferEntity>
  ) {}

  public findById(id: string): Promise<OfferDocument | null> {
    return this.offerModel.findById(id).exec();
  }

  public create(data: CreateOfferDto): Promise<OfferDocument> {
    const { authorId, commentsCount, ...offerData } = data;

    return this.offerModel.create({
      ...offerData,
      author: authorId,
      commentsCount: commentsCount ?? DEFAULT_COMMENTS_COUNT
    });
  }
}

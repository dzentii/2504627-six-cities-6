import { inject, injectable } from 'inversify';
import { Model, PipelineStage, Types } from 'mongoose';
import { OfferEntity } from '../offer/offer.entity.js';
import { Component } from '../../types/component.enum.js';
import { CommentDocument, CommentEntity } from './comment.entity.js';
import { CommentServiceInterface, CreateCommentDto } from './comment-service.interface.js';

const DEFAULT_COMMENTS_LIMIT = 50;
const PUBLISH_DATE_DESCENDING = -1;
const RATING_DECIMAL_MULTIPLIER = 10;
const ZERO_RATING = 0;
const ZERO_COMMENTS_COUNT = 0;

type OfferStatistics = {
  _id: Types.ObjectId;
  commentsCount: number;
  averageRating: number;
};

@injectable()
export default class DefaultCommentService implements CommentServiceInterface {
  constructor(
    @inject(Component.CommentModel) private readonly commentModel: Model<CommentEntity>,
    @inject(Component.OfferModel) private readonly offerModel: Model<OfferEntity>
  ) {}

  public findById(id: string): Promise<CommentDocument | null> {
    return this.commentModel.findById(id).exec();
  }

  public findByOfferId(offerId: string, limit = DEFAULT_COMMENTS_LIMIT): Promise<CommentDocument[]> {
    return this.commentModel
      .find({ offer: offerId })
      .sort({ publishDate: PUBLISH_DATE_DESCENDING })
      .limit(limit)
      .exec();
  }

  public async create(data: CreateCommentDto): Promise<CommentDocument> {
    const { authorId, offerId, publishDate, ...commentData } = data;

    const createdComment = await this.commentModel.create({
      ...commentData,
      author: authorId,
      offer: offerId,
      publishDate: publishDate ?? new Date()
    });

    await this.updateOfferStatistics(offerId);
    return createdComment;
  }

  public async deleteByOfferId(offerId: string): Promise<number> {
    const deleteResult = await this.commentModel.deleteMany({ offer: offerId }).exec();
    return deleteResult.deletedCount ?? ZERO_COMMENTS_COUNT;
  }

  private async updateOfferStatistics(offerId: string): Promise<void> {
    const offerObjectId = new Types.ObjectId(offerId);
    const statisticsPipeline: PipelineStage[] = [
      {
        $match: {
          offer: offerObjectId
        }
      },
      {
        $group: {
          _id: '$offer',
          commentsCount: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ];

    const [statistics] = await this.commentModel.aggregate<OfferStatistics>(statisticsPipeline).exec();
    const commentsCount = statistics?.commentsCount ?? ZERO_COMMENTS_COUNT;
    const averageRating = statistics?.averageRating ?? ZERO_RATING;

    await this.offerModel.findByIdAndUpdate(offerId, {
      commentsCount,
      rating: DefaultCommentService.roundRating(averageRating)
    }).exec();
  }

  private static roundRating(value: number): number {
    return Math.round(value * RATING_DECIMAL_MULTIPLIER) / RATING_DECIMAL_MULTIPLIER;
  }
}

import { HydratedDocument, model, Schema, Types } from 'mongoose';
import { OfferModelName } from '../offer/offer.entity.js';
import { UserModelName } from '../user/user.entity.js';

const COMMENTS_COLLECTION_NAME = 'comments';
export const CommentModelName = 'Comment';

export type CommentEntity = {
  text: string;
  publishDate: Date;
  rating: number;
  author: Types.ObjectId;
  offer: Types.ObjectId;
};

export type CommentDocument = HydratedDocument<CommentEntity>;

const commentSchema = new Schema<CommentEntity>({
  text: {
    type: String,
    required: true
  },
  publishDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  rating: {
    type: Number,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: UserModelName,
    required: true
  },
  offer: {
    type: Schema.Types.ObjectId,
    ref: OfferModelName,
    required: true
  }
}, {
  timestamps: true,
  collection: COMMENTS_COLLECTION_NAME
});

export const CommentModel = model<CommentEntity>(CommentModelName, commentSchema);

import { HydratedDocument, model, Schema, Types } from 'mongoose';
import { OfferModelName } from '../offer/offer.entity.js';
import { UserModelName } from '../user/user.entity.js';

const FAVORITES_COLLECTION_NAME = 'favorites';
export const FavoriteModelName = 'Favorite';

export type FavoriteEntity = {
  user: Types.ObjectId;
  offer: Types.ObjectId;
};

export type FavoriteDocument = HydratedDocument<FavoriteEntity>;

const favoriteSchema = new Schema<FavoriteEntity>({
  user: {
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
  collection: FAVORITES_COLLECTION_NAME
});

favoriteSchema.index({ user: 1, offer: 1 }, { unique: true });

export const FavoriteModel = model<FavoriteEntity>(FavoriteModelName, favoriteSchema);

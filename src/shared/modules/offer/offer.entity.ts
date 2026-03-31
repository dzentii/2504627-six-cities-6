import { HydratedDocument, model, Schema, Types } from 'mongoose';
import { CityName, HousingType } from '../../../types/offer.type.js';
import { UserModelName } from '../user/user.entity.js';

const OFFERS_COLLECTION_NAME = 'offers';
export const OfferModelName = 'Offer';

type OfferLocation = {
  latitude: number;
  longitude: number;
};

export type OfferEntity = {
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
  author: Types.ObjectId;
  commentsCount: number;
  location: OfferLocation;
};

export type OfferDocument = HydratedDocument<OfferEntity>;

const offerSchema = new Schema<OfferEntity>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  postDate: {
    type: Date,
    required: true
  },
  city: {
    type: String,
    required: true,
    enum: Object.values(CityName)
  },
  previewImage: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    required: true
  },
  isPremium: {
    type: Boolean,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(HousingType)
  },
  bedrooms: {
    type: Number,
    required: true
  },
  maxAdults: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  goods: {
    type: [String],
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: UserModelName,
    required: true
  },
  commentsCount: {
    type: Number,
    required: true,
    default: 0
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  }
}, {
  timestamps: true,
  collection: OFFERS_COLLECTION_NAME
});

export const OfferModel = model<OfferEntity>(OfferModelName, offerSchema);

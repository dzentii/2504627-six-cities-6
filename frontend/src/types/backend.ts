import { CityName, Location, Type } from './types';

export type BackendUserType = 'pro' | 'обычный';

export type BackendUser = {
  id: string;
  name: string;
  email: string;
  avatarPath?: string;
  userType: BackendUserType;
};

export type BackendLoginResponse = {
  token: string;
  user: BackendUser;
};

export type BackendOfferPreview = {
  id: string;
  title: string;
  type: Type;
  price: number;
  previewImage: string;
  city: CityName;
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  commentsCount: number;
  postDate: string;
};

export type BackendOfferDetail = BackendOfferPreview & {
  description: string;
  images: string[];
  bedrooms: number;
  maxAdults: number;
  goods: string[];
  author: BackendUser;
  location: Location;
  createdAt: string;
  updatedAt: string;
};

export type BackendComment = {
  id: string;
  text: string;
  rating: number;
  publishDate: string;
  author: BackendUser;
};

import { Location } from './offer.type.js';

export type MockServerData = {
  titles: string[];
  descriptions: string[];
  cities: string[];
  previewImages: string[];
  images: string[][];
  isPremiumValues: boolean[];
  isFavoriteValues: boolean[];
  ratings: number[];
  housingTypes: string[];
  bedrooms: number[];
  maxAdults: number[];
  prices: number[];
  goods: string[][];
  names: string[];
  emails: string[];
  avatarPaths: string[];
  passwords: string[];
  userTypes: string[];
  locations: Location[];
};

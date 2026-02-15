import { User } from './user.type.js';

export enum CityName {
  Paris = 'Paris',
  Cologne = 'Cologne',
  Brussels = 'Brussels',
  Amsterdam = 'Amsterdam',
  Hamburg = 'Hamburg',
  Dusseldorf = 'Dusseldorf',
}

export enum HousingType {
  Apartment = 'apartment',
  House = 'house',
  Room = 'room',
  Hotel = 'hotel',
}

export type Location = {
  latitude: number;
  longitude: number;
};

export type Offer = {
  title: string;
  description: string;
  postDate: Date;
  city: CityName;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: HousingType;
  bedrooms: number;
  maxAdults: number;
  price: number;
  goods: string[];
  author: User;
  location: Location;
};
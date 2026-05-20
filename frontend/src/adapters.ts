import { BACKEND_URL } from './api';
import { CITIES, CityLocation } from './const';
import { BackendComment, BackendOfferDetail, BackendOfferPreview, BackendUser } from './types/backend';
import { City, CityName, Comment, Offer, User } from './types/types';

const DEFAULT_AVATAR_URL = '/img/avatar.svg';
const DEFAULT_PREVIEW_IMAGE = '/img/apartment-01.jpg';

const DEFAULT_USER: User = {
  name: 'Anonymous',
  email: '',
  avatarUrl: DEFAULT_AVATAR_URL,
  isPro: false
};

function isCityName(value: string): value is CityName {
  return CITIES.includes(value as CityName);
}

function resolveCity(cityName: string): City {
  const resolvedCityName: CityName = isCityName(cityName) ? cityName : CITIES[0];

  return {
    name: resolvedCityName,
    location: CityLocation[resolvedCityName]
  };
}

function resolveImageUrl(path?: string, fallback = DEFAULT_PREVIEW_IMAGE): string {
  if (!path || path === 'default-avatar.png') {
    return fallback;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${BACKEND_URL}${path}`;
  }

  if (path.startsWith('upload/')) {
    return `${BACKEND_URL}/${path}`;
  }

  if (!path.includes('/')) {
    return `/img/${path}`;
  }

  return path;
}

export function adaptBackendUserToClient(user: BackendUser): User {
  return {
    name: user.name,
    email: user.email,
    avatarUrl: resolveImageUrl(user.avatarPath, DEFAULT_AVATAR_URL),
    isPro: user.userType === 'pro'
  };
}

export function adaptBackendOfferPreviewToClient(offer: BackendOfferPreview): Offer {
  const city = resolveCity(offer.city);

  return {
    id: offer.id,
    price: offer.price,
    rating: offer.rating,
    title: offer.title,
    isPremium: offer.isPremium,
    isFavorite: offer.isFavorite,
    city,
    location: city.location,
    previewImage: resolveImageUrl(offer.previewImage, DEFAULT_PREVIEW_IMAGE),
    type: offer.type,
    bedrooms: 1,
    description: '',
    goods: [],
    host: DEFAULT_USER,
    images: [resolveImageUrl(offer.previewImage, DEFAULT_PREVIEW_IMAGE)],
    maxAdults: 1
  };
}

export function adaptBackendOfferDetailToClient(offer: BackendOfferDetail): Offer {
  const city = resolveCity(offer.city);

  return {
    id: offer.id,
    price: offer.price,
    rating: offer.rating,
    title: offer.title,
    isPremium: offer.isPremium,
    isFavorite: offer.isFavorite,
    city,
    location: offer.location,
    previewImage: resolveImageUrl(offer.previewImage, DEFAULT_PREVIEW_IMAGE),
    type: offer.type,
    bedrooms: offer.bedrooms,
    description: offer.description,
    goods: offer.goods,
    host: adaptBackendUserToClient(offer.author),
    images: offer.images.map((image) => resolveImageUrl(image, DEFAULT_PREVIEW_IMAGE)),
    maxAdults: offer.maxAdults
  };
}

export function adaptBackendCommentToClient(comment: BackendComment): Comment {
  return {
    id: comment.id,
    comment: comment.text,
    date: comment.publishDate,
    rating: comment.rating,
    user: adaptBackendUserToClient(comment.author)
  };
}

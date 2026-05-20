import type { History } from 'history';
import type { AxiosInstance, AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

import type { UserAuth, Offer, Comment, CommentAuth, FavoriteAuth, UserRegister, NewOffer } from '../types/types';
import type { BackendComment, BackendLoginResponse, BackendOfferDetail, BackendOfferPreview, BackendUser } from '../types/backend';
import { ApiRoute, AppRoute, HttpCode } from '../const';
import { Token } from '../utils';
import {
  adaptBackendCommentToClient,
  adaptBackendOfferDetailToClient,
  adaptBackendOfferPreviewToClient
} from '../adapters';

const OFFER_IMAGES_COUNT = 6;
const DEFAULT_OFFER_RATING = 1;
const DEFAULT_IS_FAVORITE = false;

type Extra = {
  api: AxiosInstance;
  history: History;
}

type CreateOfferRequest = {
  title: string;
  description: string;
  postDate: string;
  city: Offer['city']['name'];
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: Offer['type'];
  bedrooms: number;
  maxAdults: number;
  price: number;
  goods: string[];
  location: Offer['location'];
};

type UpdateOfferRequest = Partial<CreateOfferRequest>;

const resolveOfferImages = (previewImage: string, images?: string[]): string[] => {
  if (images && images.length === OFFER_IMAGES_COUNT) {
    return images;
  }

  return Array.from({ length: OFFER_IMAGES_COUNT }, () => previewImage);
};

const buildCreateOfferRequest = (offer: NewOffer): CreateOfferRequest => ({
  title: offer.title,
  description: offer.description,
  postDate: new Date().toISOString(),
  city: offer.city.name,
  previewImage: offer.previewImage,
  images: resolveOfferImages(offer.previewImage),
  isPremium: offer.isPremium,
  isFavorite: DEFAULT_IS_FAVORITE,
  rating: DEFAULT_OFFER_RATING,
  type: offer.type,
  bedrooms: offer.bedrooms,
  maxAdults: offer.maxAdults,
  price: offer.price,
  goods: offer.goods,
  location: offer.location
});

const buildUpdateOfferRequest = (offer: Offer): UpdateOfferRequest => ({
  title: offer.title,
  description: offer.description,
  city: offer.city.name,
  previewImage: offer.previewImage,
  images: resolveOfferImages(offer.previewImage, offer.images),
  isPremium: offer.isPremium,
  isFavorite: offer.isFavorite,
  rating: offer.rating,
  type: offer.type,
  bedrooms: offer.bedrooms,
  maxAdults: offer.maxAdults,
  price: offer.price,
  goods: offer.goods,
  location: offer.location
});

const isProUser = (value: UserRegister['isPro']): boolean => value;

const resolveAvatarFile = (avatar: UserRegister['avatar']): File | null => avatar instanceof File ? avatar : null;

export const Action = {
  FETCH_OFFERS: 'offers/fetch',
  FETCH_OFFER: 'offer/fetch',
  POST_OFFER: 'offer/post-offer',
  EDIT_OFFER: 'offer/edit-offer',
  DELETE_OFFER: 'offer/delete-offer',
  FETCH_FAVORITE_OFFERS: 'offers/fetch-favorite',
  FETCH_PREMIUM_OFFERS: 'offers/fetch-premium',
  FETCH_COMMENTS: 'offer/fetch-comments',
  POST_COMMENT: 'offer/post-comment',
  POST_FAVORITE: 'offer/post-favorite',
  LOGIN_USER: 'user/login',
  LOGOUT_USER: 'user/logout',
  FETCH_USER_STATUS: 'user/fetch-status',
  REGISTER_USER: 'user/register'
};

export const fetchOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<BackendOfferPreview[]>(ApiRoute.Offers);

    return data.map(adaptBackendOfferPreviewToClient);
  });

export const fetchFavoriteOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_FAVORITE_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;

    try {
      const { data } = await api.get<BackendOfferPreview[]>(ApiRoute.Favorites);
      return data.map(adaptBackendOfferPreviewToClient);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        return [];
      }

      return Promise.reject(error);
    }
  });

export const fetchOffer = createAsyncThunk<Offer, Offer['id'], { extra: Extra }>(
  Action.FETCH_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;

    try {
      const { data } = await api.get<BackendOfferDetail>(`${ApiRoute.Offers}/${id}`);

      return adaptBackendOfferDetailToClient(data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NotFound) {
        history.push(AppRoute.NotFound);
      }

      return Promise.reject(error);
    }
  });

export const postOffer = createAsyncThunk<void, NewOffer, { extra: Extra }>(
  Action.POST_OFFER,
  async (newOffer, { extra, dispatch }) => {
    const { api, history } = extra;
    const offerRequestData = buildCreateOfferRequest(newOffer);
    const { data } = await api.post<BackendOfferDetail>(ApiRoute.Offers, offerRequestData);

    await dispatch(fetchOffers());
    await dispatch(fetchFavoriteOffers());
    history.push(`${AppRoute.Property}/${data.id}`);
  });

export const editOffer = createAsyncThunk<void, Offer, { extra: Extra }>(
  Action.EDIT_OFFER,
  async (offer, { extra, dispatch }) => {
    const { api, history } = extra;
    const offerRequestData = buildUpdateOfferRequest(offer);
    const { data } = await api.patch<BackendOfferDetail>(`${ApiRoute.Offers}/${offer.id}`, offerRequestData);

    await dispatch(fetchOffers());
    await dispatch(fetchFavoriteOffers());
    history.push(`${AppRoute.Property}/${data.id}`);
  });

export const deleteOffer = createAsyncThunk<void, string, { extra: Extra }>(
  Action.DELETE_OFFER,
  async (id, { extra, dispatch }) => {
    const { api, history } = extra;
    await api.delete(`${ApiRoute.Offers}/${id}`);
    await dispatch(fetchOffers());
    await dispatch(fetchFavoriteOffers());
    history.push(AppRoute.Root);
  });

export const fetchPremiumOffers = createAsyncThunk<Offer[], string, { extra: Extra }>(
  Action.FETCH_PREMIUM_OFFERS,
  async (cityName, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<BackendOfferPreview[]>(`${ApiRoute.Offers}/premium/${cityName}`);

    return data.map(adaptBackendOfferPreviewToClient);
  });

export const fetchComments = createAsyncThunk<Comment[], Offer['id'], { extra: Extra }>(
  Action.FETCH_COMMENTS,
  async (id, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<BackendComment[]>(`${ApiRoute.Offers}/${id}/comments`);

    return data.map(adaptBackendCommentToClient);
  });

export const fetchUserStatus = createAsyncThunk<UserAuth['email'], undefined, { extra: Extra }>(
  Action.FETCH_USER_STATUS,
  async (_, { extra }) => {
    const { api } = extra;

    try {
      const { data } = await api.get<BackendUser>(ApiRoute.CheckAuth);

      return data.email;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        Token.drop();
      }

      return Promise.reject(error);
    }
  });

export const loginUser = createAsyncThunk<UserAuth['email'], UserAuth, { extra: Extra }>(
  Action.LOGIN_USER,
  async ({ email, password }, { extra, dispatch }) => {
    const { api, history } = extra;
    const { data } = await api.post<BackendLoginResponse>(ApiRoute.Login, { email, password });

    Token.save(data.token);
    await Promise.all([
      dispatch(fetchOffers()),
      dispatch(fetchFavoriteOffers())
    ]);
    history.push(AppRoute.Root);

    return data.user.email;
  });

export const logoutUser = createAsyncThunk<void, undefined, { extra: Extra }>(
  Action.LOGOUT_USER,
  async (_, { extra, dispatch }) => {
    const { api } = extra;
    await api.post(ApiRoute.Logout);

    Token.drop();
    await dispatch(fetchOffers());
    await dispatch(fetchFavoriteOffers());
  });

export const registerUser = createAsyncThunk<UserAuth['email'], UserRegister, { extra: Extra }>(
  Action.REGISTER_USER,
  async ({ email, password, name, avatar, isPro }, { extra, dispatch }) => {
    const { api, history } = extra;

    await api.post(ApiRoute.Register, {
      email,
      password,
      name,
      userType: isProUser(isPro) ? 'pro' : 'regular'
    });

    const loginResponse = await api.post<BackendLoginResponse>(ApiRoute.Login, { email, password });
    Token.save(loginResponse.data.token);

    const avatarFile = resolveAvatarFile(avatar);
    if (avatarFile) {
      const payload = new FormData();
      payload.append('avatar', avatarFile);
      await api.post(ApiRoute.Avatar, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    await Promise.all([
      dispatch(fetchOffers()),
      dispatch(fetchFavoriteOffers())
    ]);
    history.push(AppRoute.Root);
    return email;
  });


export const postComment = createAsyncThunk<Comment, CommentAuth, { extra: Extra }>(
  Action.POST_COMMENT,
  async ({ id, comment, rating }, { extra }) => {
    const { api } = extra;
    const { data } = await api.post<BackendComment>(`${ApiRoute.Offers}/${id}/comments`, { text: comment, rating });

    return adaptBackendCommentToClient(data);
  });

export const postFavorite = createAsyncThunk<Offer, FavoriteAuth, { extra: Extra }>(
  Action.POST_FAVORITE,
  async ({ id, status }, { extra }) => {
    const { api, history } = extra;

    try {
      const response = status === 1
        ? await api.post<BackendOfferPreview>(`${ApiRoute.Offers}/${id}/favorite`)
        : await api.delete<BackendOfferPreview>(`${ApiRoute.Offers}/${id}/favorite`);

      return adaptBackendOfferPreviewToClient(response.data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        history.push(AppRoute.Login);
      }

      return Promise.reject(error);
    }
  });

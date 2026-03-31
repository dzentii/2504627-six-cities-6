import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { CityName } from '../../../types/offer.type.js';
import { Component } from '../../types/component.enum.js';
import AbstractController from '../../libs/rest/abstract.controller.js';
import HttpError from '../../libs/rest/http-error.js';
import { fillDto, fillDtos } from '../../libs/rest/fill-dto.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { HttpMethod } from '../../libs/rest/http-method.enum.js';
import { UserDocument } from '../user/user.entity.js';
import { UserServiceInterface } from '../user/user-service.interface.js';
import CreateOfferRequest from './dto/create-offer.request.js';
import UpdateOfferRequest from './dto/update-offer.request.js';
import { CreateOfferDto, OfferServiceInterface, OfferView, UpdateOfferDto } from './offer-service.interface.js';
import OfferDetailResponse from './rdo/offer-detail.response.js';
import OfferPreviewResponse from './rdo/offer-preview.response.js';

const OFFER_NOT_FOUND_MESSAGE = 'Offer not found.';
const OFFER_ACCESS_DENIED_MESSAGE = 'You cannot modify this offer.';
const OFFER_AUTHOR_NOT_FOUND_MESSAGE = 'Offer author not found.';

@injectable()
export default class OfferController extends AbstractController {
  constructor(
    @inject(Component.Logger) logger: LoggerInterface,
    @inject(Component.OfferService) private readonly offerService: OfferServiceInterface,
    @inject(Component.UserService) private readonly userService: UserServiceInterface
  ) {
    super(logger);

    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.getOffers
    });

    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.createOffer
    });

    this.addRoute({
      path: '/premium/:city',
      method: HttpMethod.Get,
      handler: this.getPremiumOffers
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.getOfferById
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.updateOffer
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.deleteOffer
    });
  }

  private async getOffers(request: Request, response: Response): Promise<void> {
    const limit = OfferController.parseLimit(request.query.limit);
    const userId = this.getUserId(request);
    const offers = await this.offerService.find(limit, userId);

    this.ok(response, fillDtos(OfferPreviewResponse, offers));
  }

  private async createOffer(request: Request, response: Response): Promise<void> {
    const userId = this.ensureAuthenticated(request);
    const requestData = fillDto(CreateOfferRequest, request.body);
    const createData = OfferController.buildCreateOfferData(requestData, userId);

    const createdOffer = await this.offerService.create(createData);
    if (requestData.isFavorite) {
      await this.offerService.setFavoriteStatus(createdOffer.id, userId, true);
    }

    const offer = await this.offerService.findById(createdOffer.id, userId);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, OFFER_NOT_FOUND_MESSAGE);
    }

    const author = await this.userService.findById(userId);
    if (!author) {
      throw new HttpError(StatusCodes.NOT_FOUND, OFFER_AUTHOR_NOT_FOUND_MESSAGE);
    }

    const responseData = fillDto(OfferDetailResponse, OfferController.prepareOfferDetailData(offer, author));
    this.created(response, responseData);
  }

  private async getOfferById(request: Request, response: Response): Promise<void> {
    const offerId = this.getRouteParameter(request, 'offerId');
    const userId = this.getUserId(request);

    const offer = await this.offerService.findById(offerId, userId);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, OFFER_NOT_FOUND_MESSAGE);
    }

    const author = await this.findOfferAuthor(offer);
    const responseData = fillDto(OfferDetailResponse, OfferController.prepareOfferDetailData(offer, author));

    this.ok(response, responseData);
  }

  private async updateOffer(request: Request, response: Response): Promise<void> {
    const userId = this.ensureAuthenticated(request);
    const offerId = this.getRouteParameter(request, 'offerId');

    const existingOffer = await this.offerService.findById(offerId, userId);
    if (!existingOffer) {
      throw new HttpError(StatusCodes.NOT_FOUND, OFFER_NOT_FOUND_MESSAGE);
    }

    if (OfferController.extractOfferAuthorId(existingOffer) !== userId) {
      throw new HttpError(StatusCodes.FORBIDDEN, OFFER_ACCESS_DENIED_MESSAGE);
    }

    const requestData = fillDto(UpdateOfferRequest, request.body);
    const updateData = OfferController.buildUpdateOfferData(requestData);

    const updatedOffer = await this.offerService.updateById(offerId, updateData);
    if (!updatedOffer) {
      throw new HttpError(StatusCodes.NOT_FOUND, OFFER_NOT_FOUND_MESSAGE);
    }

    if (typeof requestData.isFavorite !== 'undefined') {
      await this.offerService.setFavoriteStatus(offerId, userId, requestData.isFavorite);
    }

    const offer = await this.offerService.findById(offerId, userId);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, OFFER_NOT_FOUND_MESSAGE);
    }

    const author = await this.findOfferAuthor(offer);
    const responseData = fillDto(OfferDetailResponse, OfferController.prepareOfferDetailData(offer, author));

    this.ok(response, responseData);
  }

  private async deleteOffer(request: Request, response: Response): Promise<void> {
    const userId = this.ensureAuthenticated(request);
    const offerId = this.getRouteParameter(request, 'offerId');

    const offer = await this.offerService.findById(offerId, userId);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, OFFER_NOT_FOUND_MESSAGE);
    }

    if (OfferController.extractOfferAuthorId(offer) !== userId) {
      throw new HttpError(StatusCodes.FORBIDDEN, OFFER_ACCESS_DENIED_MESSAGE);
    }

    await this.offerService.deleteById(offerId);
    this.noContent(response);
  }

  private async getPremiumOffers(request: Request, response: Response): Promise<void> {
    const city = this.getRouteParameter(request, 'city') as CityName;
    const userId = this.getUserId(request);
    const offers = await this.offerService.findPremiumByCity(city, undefined, userId);

    this.ok(response, fillDtos(OfferPreviewResponse, offers));
  }

  private async findOfferAuthor(offer: OfferView): Promise<UserDocument> {
    const authorId = OfferController.extractOfferAuthorId(offer);
    const author = await this.userService.findById(authorId);

    if (!author) {
      throw new HttpError(StatusCodes.NOT_FOUND, OFFER_AUTHOR_NOT_FOUND_MESSAGE);
    }

    return author;
  }

  private static parseLimit(limitValue: unknown): number | undefined {
    if (typeof limitValue !== 'string') {
      return undefined;
    }

    const parsedLimit = Number.parseInt(limitValue, 10);
    return Number.isNaN(parsedLimit) ? undefined : parsedLimit;
  }

  private static buildCreateOfferData(requestData: CreateOfferRequest, authorId: string): CreateOfferDto {
    return {
      title: requestData.title,
      description: requestData.description,
      postDate: requestData.postDate,
      city: requestData.city,
      previewImage: requestData.previewImage,
      images: requestData.images,
      isPremium: requestData.isPremium,
      rating: requestData.rating,
      type: requestData.type,
      bedrooms: requestData.bedrooms,
      maxAdults: requestData.maxAdults,
      price: requestData.price,
      goods: requestData.goods,
      location: requestData.location,
      authorId
    };
  }

  private static buildUpdateOfferData(requestData: UpdateOfferRequest): UpdateOfferDto {
    const updateData: UpdateOfferDto = {};

    if (typeof requestData.title !== 'undefined') {
      updateData.title = requestData.title;
    }

    if (typeof requestData.description !== 'undefined') {
      updateData.description = requestData.description;
    }

    if (typeof requestData.postDate !== 'undefined') {
      updateData.postDate = requestData.postDate;
    }

    if (typeof requestData.city !== 'undefined') {
      updateData.city = requestData.city;
    }

    if (typeof requestData.previewImage !== 'undefined') {
      updateData.previewImage = requestData.previewImage;
    }

    if (typeof requestData.images !== 'undefined') {
      updateData.images = requestData.images;
    }

    if (typeof requestData.isPremium !== 'undefined') {
      updateData.isPremium = requestData.isPremium;
    }

    if (typeof requestData.rating !== 'undefined') {
      updateData.rating = requestData.rating;
    }

    if (typeof requestData.type !== 'undefined') {
      updateData.type = requestData.type;
    }

    if (typeof requestData.bedrooms !== 'undefined') {
      updateData.bedrooms = requestData.bedrooms;
    }

    if (typeof requestData.maxAdults !== 'undefined') {
      updateData.maxAdults = requestData.maxAdults;
    }

    if (typeof requestData.price !== 'undefined') {
      updateData.price = requestData.price;
    }

    if (typeof requestData.goods !== 'undefined') {
      updateData.goods = requestData.goods;
    }

    if (typeof requestData.location !== 'undefined') {
      updateData.location = requestData.location;
    }

    return updateData;
  }

  private static extractOfferAuthorId(offer: OfferView): string {
    return offer.author.toString();
  }

  private static prepareOfferDetailData(offer: OfferView, author: UserDocument): Record<string, unknown> {
    return {
      ...offer,
      author: {
        ...author.toObject(),
        id: author.id
      }
    };
  }
}

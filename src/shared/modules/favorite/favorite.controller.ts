import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Component } from '../../types/component.enum.js';
import AbstractController from '../../libs/rest/abstract.controller.js';
import DocumentExistsMiddleware from '../../libs/rest/document-exists.middleware.js';
import HttpError from '../../libs/rest/http-error.js';
import { fillDto, fillDtos } from '../../libs/rest/fill-dto.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { HttpMethod } from '../../libs/rest/http-method.enum.js';
import ObjectIdMiddleware from '../../libs/rest/object-id.middleware.js';
import { OfferView, OfferServiceInterface } from '../offer/offer-service.interface.js';
import OfferPreviewResponse from '../offer/rdo/offer-preview.response.js';

const OFFER_NOT_FOUND_MESSAGE = 'Offer not found.';

@injectable()
export default class FavoriteController extends AbstractController {
  private readonly offerIdValidationMiddleware: ObjectIdMiddleware;
  private readonly offerExistsMiddleware: DocumentExistsMiddleware<OfferView>;

  constructor(
    @inject(Component.Logger) logger: LoggerInterface,
    @inject(Component.OfferService) private readonly offerService: OfferServiceInterface
  ) {
    super(logger);

    this.offerIdValidationMiddleware = new ObjectIdMiddleware('offerId');
    this.offerExistsMiddleware = new DocumentExistsMiddleware(this.offerService, 'offerId', OFFER_NOT_FOUND_MESSAGE);

    this.addRoute({
      path: '/favorites',
      method: HttpMethod.Get,
      handler: this.index
    });

    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [this.offerIdValidationMiddleware, this.offerExistsMiddleware]
    });

    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [this.offerIdValidationMiddleware, this.offerExistsMiddleware]
    });
  }

  private async index(request: Request, response: Response): Promise<void> {
    const userId = this.getUserId(request);

    if (!userId) {
      this.ok(response, []);
      return;
    }

    const offers = await this.offerService.findFavorites(userId);
    this.ok(response, fillDtos(OfferPreviewResponse, offers));
  }

  private async create(request: Request, response: Response): Promise<void> {
    const offerId = this.getRouteParameter(request, 'offerId');
    const userId = await this.resolveUserId(request, offerId);

    const offer = await this.offerService.setFavoriteStatus(offerId, userId, true);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, OFFER_NOT_FOUND_MESSAGE);
    }

    this.ok(response, fillDto(OfferPreviewResponse, offer));
  }

  private async delete(request: Request, response: Response): Promise<void> {
    const offerId = this.getRouteParameter(request, 'offerId');
    const userId = await this.resolveUserId(request, offerId);

    const offer = await this.offerService.setFavoriteStatus(offerId, userId, false);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, OFFER_NOT_FOUND_MESSAGE);
    }

    this.ok(response, fillDto(OfferPreviewResponse, offer));
  }

  private async resolveUserId(request: Request, offerId: string): Promise<string> {
    const requestUserId = this.getUserId(request);
    if (requestUserId) {
      return requestUserId;
    }

    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, OFFER_NOT_FOUND_MESSAGE);
    }

    return FavoriteController.extractOfferAuthorId(offer);
  }

  private static extractOfferAuthorId(offer: OfferView): string {
    return offer.author.toString();
  }
}

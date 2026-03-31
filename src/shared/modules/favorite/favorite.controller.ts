import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Component } from '../../types/component.enum.js';
import AbstractController from '../../libs/rest/abstract.controller.js';
import HttpError from '../../libs/rest/http-error.js';
import { fillDto, fillDtos } from '../../libs/rest/fill-dto.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { HttpMethod } from '../../libs/rest/http-method.enum.js';
import { OfferServiceInterface } from '../offer/offer-service.interface.js';
import OfferPreviewResponse from '../offer/rdo/offer-preview.response.js';

const OFFER_NOT_FOUND_MESSAGE = 'Offer not found.';

@injectable()
export default class FavoriteController extends AbstractController {
  constructor(
    @inject(Component.Logger) logger: LoggerInterface,
    @inject(Component.OfferService) private readonly offerService: OfferServiceInterface
  ) {
    super(logger);

    this.addRoute({
      path: '/favorites',
      method: HttpMethod.Get,
      handler: this.getFavorites
    });

    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Post,
      handler: this.addToFavorites
    });

    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Delete,
      handler: this.removeFromFavorites
    });
  }

  private async getFavorites(request: Request, response: Response): Promise<void> {
    const userId = this.ensureAuthenticated(request);
    const offers = await this.offerService.findFavorites(userId);

    this.ok(response, fillDtos(OfferPreviewResponse, offers));
  }

  private async addToFavorites(request: Request, response: Response): Promise<void> {
    const userId = this.ensureAuthenticated(request);
    const offerId = this.getRouteParameter(request, 'offerId');

    const offer = await this.offerService.setFavoriteStatus(offerId, userId, true);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, OFFER_NOT_FOUND_MESSAGE);
    }

    this.ok(response, fillDto(OfferPreviewResponse, offer));
  }

  private async removeFromFavorites(request: Request, response: Response): Promise<void> {
    const userId = this.ensureAuthenticated(request);
    const offerId = this.getRouteParameter(request, 'offerId');

    const offer = await this.offerService.setFavoriteStatus(offerId, userId, false);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, OFFER_NOT_FOUND_MESSAGE);
    }

    this.ok(response, fillDto(OfferPreviewResponse, offer));
  }
}

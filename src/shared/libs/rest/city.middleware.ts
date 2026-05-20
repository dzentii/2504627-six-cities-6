import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { injectable } from 'inversify';
import { CityName } from '../../../types/offer.type.js';
import HttpError from './http-error.js';
import { MiddlewareInterface } from './middleware.interface.js';

const INVALID_CITY_MESSAGE = 'Invalid city in parameter';

@injectable()
export default class CityMiddleware implements MiddlewareInterface {
  constructor(
    private readonly parameterName: string
  ) {}

  public execute(request: Request, _response: Response, next: NextFunction): void {
    const parameterValue = request.params[this.parameterName];
    const city = Array.isArray(parameterValue) ? parameterValue[0] : parameterValue;

    if (!city || !CityMiddleware.isCityName(city)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `${INVALID_CITY_MESSAGE}: ${this.parameterName}`
      );
    }

    next();
  }

  private static isCityName(value: string): value is CityName {
    return Object.values(CityName).includes(value as CityName);
  }
}

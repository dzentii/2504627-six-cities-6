import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { isValidObjectId } from 'mongoose';
import HttpError from './http-error.js';
import { MiddlewareInterface } from './middleware.interface.js';

const INVALID_IDENTIFIER_MESSAGE = 'Invalid object id in parameter';

export default class ObjectIdMiddleware implements MiddlewareInterface {
  constructor(
    private readonly parameterName: string
  ) {}

  public execute(request: Request, _response: Response, next: NextFunction): void {
    const parameterValue = request.params[this.parameterName];
    const objectId = Array.isArray(parameterValue) ? parameterValue[0] : parameterValue;

    if (!objectId || !isValidObjectId(objectId)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `${INVALID_IDENTIFIER_MESSAGE}: ${this.parameterName}`
      );
    }

    next();
  }
}

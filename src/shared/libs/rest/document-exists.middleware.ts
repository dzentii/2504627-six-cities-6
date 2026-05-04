import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpError from './http-error.js';
import { DocumentExistsServiceInterface } from './document-exists.interface.js';
import { MiddlewareInterface } from './middleware.interface.js';

const EMPTY_STRING = '';

export default class DocumentExistsMiddleware<T> implements MiddlewareInterface {
  constructor(
    private readonly service: DocumentExistsServiceInterface<T>,
    private readonly parameterName: string,
    private readonly notFoundMessage: string
  ) {}

  public async execute(request: Request, _response: Response, next: NextFunction): Promise<void> {
    const parameterValue = request.params[this.parameterName];
    const documentId = Array.isArray(parameterValue) ? parameterValue[0] : parameterValue;

    const document = await this.service.findById(documentId ?? EMPTY_STRING);
    if (!document) {
      throw new HttpError(StatusCodes.NOT_FOUND, this.notFoundMessage);
    }

    next();
  }
}

import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Component } from '../../types/component.enum.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import { ExceptionFilterInterface } from './exception-filter.interface.js';
import HttpError from './http-error.js';

const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal server error';

type ErrorResponse = {
  error: string;
  details?: string[];
};

@injectable()
export default class DefaultExceptionFilter implements ExceptionFilterInterface {
  constructor(
    @inject(Component.Logger) private readonly logger: LoggerInterface
  ) {}

  public catch(error: Error, request: Request, response: Response, next: NextFunction): void {
    void next;

    if (error instanceof HttpError) {
      this.logger.error(`[${request.method}] ${request.path} ${error.statusCode}: ${error.message}`);

      const errorResponse: ErrorResponse = {
        error: error.message
      };

      if (error.details.length > 0) {
        errorResponse.details = error.details;
      }

      response.status(error.statusCode).json(errorResponse);
      return;
    }

    this.logger.error(
      `[${request.method}] ${request.path} ${StatusCodes.INTERNAL_SERVER_ERROR}: ${error.message}`
    );

    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: INTERNAL_SERVER_ERROR_MESSAGE
    } as ErrorResponse);
  }
}

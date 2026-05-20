import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/component.enum.js';
import { TokenServiceInterface } from '../token/token-service.interface.js';
import HttpError from './http-error.js';
import { MiddlewareInterface } from './middleware.interface.js';

const AUTHORIZATION_HEADER_NAME = 'authorization';
const BEARER_TOKEN_PREFIX = 'Bearer ';
const AUTHORIZED_USER_ACCESS_DENIED_MESSAGE = 'Authorized users cannot access this route.';

@injectable()
export default class AnonymousRouteMiddleware implements MiddlewareInterface {
  constructor(
    @inject(Component.TokenService) private readonly tokenService: TokenServiceInterface
  ) {}

  public async execute(request: Request, _response: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = request.header(AUTHORIZATION_HEADER_NAME);

    if (!authorizationHeader) {
      return next();
    }

    if (authorizationHeader.startsWith(BEARER_TOKEN_PREFIX)) {
      const token = authorizationHeader.slice(BEARER_TOKEN_PREFIX.length).trim();

      try {
        if (token) {
          await this.tokenService.verifyToken(token);
        }
      } catch (error: unknown) {
        void error;
      }
    }

    throw new HttpError(StatusCodes.FORBIDDEN, AUTHORIZED_USER_ACCESS_DENIED_MESSAGE);
  }
}

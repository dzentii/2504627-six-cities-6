import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/component.enum.js';
import { TokenServiceInterface } from '../token/token-service.interface.js';
import HttpError from './http-error.js';
import { MiddlewareInterface } from './middleware.interface.js';

const AUTHORIZATION_HEADER_NAME = 'authorization';
const BEARER_TOKEN_PREFIX = 'Bearer ';
const USER_IS_NOT_AUTHORIZED_MESSAGE = 'User is not authorized.';

@injectable()
export default class PrivateRouteMiddleware implements MiddlewareInterface {
  constructor(
    @inject(Component.TokenService) private readonly tokenService: TokenServiceInterface
  ) {}

  public async execute(request: Request, _response: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = request.header(AUTHORIZATION_HEADER_NAME);

    if (!authorizationHeader || !authorizationHeader.startsWith(BEARER_TOKEN_PREFIX)) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, USER_IS_NOT_AUTHORIZED_MESSAGE);
    }

    const token = authorizationHeader.slice(BEARER_TOKEN_PREFIX.length).trim();
    if (!token) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, USER_IS_NOT_AUTHORIZED_MESSAGE);
    }

    try {
      request.tokenPayload = await this.tokenService.verifyToken(token);
    } catch {
      throw new HttpError(StatusCodes.UNAUTHORIZED, USER_IS_NOT_AUTHORIZED_MESSAGE);
    }

    next();
  }
}

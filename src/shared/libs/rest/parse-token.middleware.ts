import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/component.enum.js';
import { TokenServiceInterface } from '../token/token-service.interface.js';
import { MiddlewareInterface } from './middleware.interface.js';

const AUTHORIZATION_HEADER_NAME = 'authorization';
const BEARER_TOKEN_PREFIX = 'Bearer ';

@injectable()
export default class ParseTokenMiddleware implements MiddlewareInterface {
  constructor(
    @inject(Component.TokenService) private readonly tokenService: TokenServiceInterface
  ) {}

  public async execute(request: Request, _response: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = request.header(AUTHORIZATION_HEADER_NAME);

    if (!authorizationHeader || !authorizationHeader.startsWith(BEARER_TOKEN_PREFIX)) {
      next();
      return;
    }

    const token = authorizationHeader.slice(BEARER_TOKEN_PREFIX.length).trim();
    if (!token) {
      next();
      return;
    }

    try {
      request.tokenPayload = await this.tokenService.verifyToken(token);
    } catch {
      request.tokenPayload = undefined;
    }

    next();
  }
}

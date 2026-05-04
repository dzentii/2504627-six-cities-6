import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { LoggerInterface } from '../logger/logger.interface.js';
import { ControllerInterface } from './controller.interface.js';
import { RouteInterface } from './route.interface.js';
import HttpError from './http-error.js';

const USER_ID_HEADER_NAME = 'x-user-id';
const AUTHORIZATION_HEADER_NAME = 'authorization';
const BEARER_TOKEN_PREFIX = 'Bearer ';
const USER_TOKEN_PREFIX = 'token-';
const USER_IS_NOT_AUTHORIZED_MESSAGE = 'User is not authorized.';
const EMPTY_STRING = '';

export default abstract class AbstractController implements ControllerInterface {
  private readonly router: Router;

  protected constructor(
    protected readonly logger: LoggerInterface
  ) {
    this.router = Router();
  }

  public getRouter(): Router {
    return this.router;
  }

  protected addRoute(route: RouteInterface): void {
    const routeHandler = asyncHandler(route.handler.bind(this));
    const middlewares = route.middlewares ?? [];

    this.router[route.method](route.path, ...middlewares, routeHandler);
    this.logger.info(`Route registered: [${route.method.toUpperCase()}] ${route.path}`);
  }

  protected send<T>(response: Response, statusCode: StatusCodes, data?: T): void {
    if (typeof data === 'undefined') {
      response.status(statusCode).end();
      return;
    }

    response.status(statusCode).json(data);
  }

  protected ok<T>(response: Response, data: T): void {
    this.send(response, StatusCodes.OK, data);
  }

  protected created<T>(response: Response, data: T): void {
    this.send(response, StatusCodes.CREATED, data);
  }

  protected noContent(response: Response): void {
    this.send(response, StatusCodes.NO_CONTENT);
  }

  protected getUserId(request: Request): string | undefined {
    const authorizationHeader = request.header(AUTHORIZATION_HEADER_NAME);

    if (authorizationHeader?.startsWith(BEARER_TOKEN_PREFIX)) {
      const token = authorizationHeader.slice(BEARER_TOKEN_PREFIX.length).trim();

      if (token.startsWith(USER_TOKEN_PREFIX)) {
        const tokenUserId = token.slice(USER_TOKEN_PREFIX.length).trim();
        return tokenUserId || undefined;
      }
    }

    const userId = request.header(USER_ID_HEADER_NAME);
    return userId?.trim() || undefined;
  }

  protected ensureAuthenticated(request: Request): string {
    const userId = this.getUserId(request);

    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, USER_IS_NOT_AUTHORIZED_MESSAGE);
    }

    return userId;
  }

  protected getRouteParameter(request: Request, parameterName: string): string {
    const parameterValue = request.params[parameterName];

    if (Array.isArray(parameterValue)) {
      return parameterValue[0] ?? EMPTY_STRING;
    }

    return parameterValue ?? EMPTY_STRING;
  }
}

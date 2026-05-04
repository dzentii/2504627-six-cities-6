import { NextFunction, Request, Response } from 'express';
import { HttpMethod } from './http-method.enum.js';
import { MiddlewareInterface } from './middleware.interface.js';

export type AppRouteHandler = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<void> | void;

export interface RouteInterface {
  path: string;
  method: HttpMethod;
  handler: AppRouteHandler;
  middlewares?: MiddlewareInterface[];
}

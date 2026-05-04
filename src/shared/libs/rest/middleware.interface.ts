import { NextFunction, Request, Response } from 'express';

export interface MiddlewareInterface {
  execute(request: Request, response: Response, next: NextFunction): void | Promise<void>;
}

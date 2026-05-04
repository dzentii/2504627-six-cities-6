import { NextFunction, Request, Response } from 'express';

export interface ExceptionFilterInterface {
  catch(error: Error, request: Request, response: Response, next: NextFunction): void;
}

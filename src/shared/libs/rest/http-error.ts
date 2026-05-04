import { StatusCodes } from 'http-status-codes';

export default class HttpError extends Error {
  constructor(
    public readonly statusCode: StatusCodes,
    message: string,
    public readonly details: string[] = []
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

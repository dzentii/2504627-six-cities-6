import { plainToInstance, ClassConstructor } from 'class-transformer';
import { NextFunction, Request, Response } from 'express';
import { ValidationError, ValidatorOptions, validate } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import HttpError from './http-error.js';
import { MiddlewareInterface } from './middleware.interface.js';

const VALIDATION_ERROR_MESSAGE = 'Validation failed.';
const NESTED_PROPERTY_SEPARATOR = '.';

const DEFAULT_VALIDATION_OPTIONS: ValidatorOptions = {
  whitelist: true,
  forbidNonWhitelisted: true
};

const DEFAULT_TRANSFORM_OPTIONS = {
  enableImplicitConversion: true,
};

export default class ValidateDtoMiddleware<T extends object> implements MiddlewareInterface {
  constructor(
    private readonly dtoClass: ClassConstructor<T>,
    private readonly validationOptions: ValidatorOptions = DEFAULT_VALIDATION_OPTIONS
  ) {}

  public async execute(request: Request, _response: Response, next: NextFunction): Promise<void> {
    const dtoInstance = plainToInstance(this.dtoClass, request.body, DEFAULT_TRANSFORM_OPTIONS);
    const validationErrors = await validate(dtoInstance, this.validationOptions);

    if (validationErrors.length > 0) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        VALIDATION_ERROR_MESSAGE,
        ValidateDtoMiddleware.mapValidationErrors(validationErrors)
      );
    }

    request.body = dtoInstance;
    next();
  }

  private static mapValidationErrors(validationErrors: ValidationError[], parentPath = ''): string[] {
    const mappedErrors: string[] = [];

    for (const validationError of validationErrors) {
      const currentPath = parentPath
        ? `${parentPath}${NESTED_PROPERTY_SEPARATOR}${validationError.property}`
        : validationError.property;

      const constraintMessages = validationError.constraints
        ? Object.values(validationError.constraints).map((message) => `${currentPath}: ${message}`)
        : [];

      const childrenMessages = validationError.children?.length
        ? ValidateDtoMiddleware.mapValidationErrors(validationError.children, currentPath)
        : [];

      mappedErrors.push(...constraintMessages, ...childrenMessages);
    }

    return mappedErrors;
  }
}

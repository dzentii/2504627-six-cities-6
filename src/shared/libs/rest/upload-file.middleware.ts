import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import multer, { FileFilterCallback, StorageEngine } from 'multer';
import { extension } from 'mime-types';
import { nanoid } from 'nanoid';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpError from './http-error.js';
import { MiddlewareInterface } from './middleware.interface.js';

const DEFAULT_FILE_NAME_LENGTH = 16;
const FILE_NAME_SEPARATOR = '.';
const IMAGE_JPEG_MIME_TYPE = 'image/jpeg';
const IMAGE_PNG_MIME_TYPE = 'image/png';
const INVALID_FILE_TYPE_MESSAGE = 'Invalid file type.';
const FILE_IS_REQUIRED_MESSAGE = 'File is required.';
const FILE_UPLOAD_ERROR_MESSAGE = 'Cannot upload file.';

type UploadFileMiddlewareOptions = {
  fieldName: string;
  uploadDirectoryPath: string;
};

export default class UploadFileMiddleware implements MiddlewareInterface {
  private readonly uploadHandler: RequestHandler;
  private readonly uploadDirectoryPath: string;

  constructor(
    options: UploadFileMiddlewareOptions
  ) {
    this.uploadDirectoryPath = resolve(options.uploadDirectoryPath);
    mkdirSync(this.uploadDirectoryPath, { recursive: true });

    const storage = this.createStorage();

    this.uploadHandler = multer({
      storage,
      fileFilter: UploadFileMiddleware.filterFileByMimeType
    }).single(options.fieldName);
  }

  public async execute(request: Request, response: Response, next: NextFunction): Promise<void> {
    await new Promise<void>((resolvePromise, rejectPromise) => {
      this.uploadHandler(request, response, (error?: unknown) => {
        if (error instanceof Error) {
          rejectPromise(new HttpError(StatusCodes.BAD_REQUEST, FILE_UPLOAD_ERROR_MESSAGE, [error.message]));
          return;
        }

        resolvePromise();
      });
    });

    if (!request.file) {
      throw new HttpError(StatusCodes.BAD_REQUEST, FILE_IS_REQUIRED_MESSAGE);
    }

    next();
  }

  private createStorage(): StorageEngine {
    return multer.diskStorage({
      destination: (_request, _file, callback) => callback(null, this.uploadDirectoryPath),
      filename: (_request, file, callback) => callback(
        null,
        UploadFileMiddleware.createFileName(file.mimetype)
      )
    });
  }

  private static createFileName(mimeType: string): string {
    const fileExtension = extension(mimeType);

    if (!fileExtension) {
      throw new HttpError(StatusCodes.BAD_REQUEST, INVALID_FILE_TYPE_MESSAGE);
    }

    return `${nanoid(DEFAULT_FILE_NAME_LENGTH)}${FILE_NAME_SEPARATOR}${fileExtension}`;
  }

  private static filterFileByMimeType(
    _request: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
  ): void {
    const allowedMimeTypes = new Set<string>([IMAGE_JPEG_MIME_TYPE, IMAGE_PNG_MIME_TYPE]);

    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new HttpError(StatusCodes.BAD_REQUEST, INVALID_FILE_TYPE_MESSAGE));
      return;
    }

    callback(null, true);
  }
}

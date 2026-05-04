import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Component } from '../../types/component.enum.js';
import AbstractController from '../../libs/rest/abstract.controller.js';
import DocumentExistsMiddleware from '../../libs/rest/document-exists.middleware.js';
import { fillDto, fillDtos } from '../../libs/rest/fill-dto.js';
import HttpError from '../../libs/rest/http-error.js';
import { HttpMethod } from '../../libs/rest/http-method.enum.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import ObjectIdMiddleware from '../../libs/rest/object-id.middleware.js';
import ValidateDtoMiddleware from '../../libs/rest/validate-dto.middleware.js';
import { OfferServiceInterface, OfferView } from '../offer/offer-service.interface.js';
import { UserDocument } from '../user/user.entity.js';
import { UserServiceInterface } from '../user/user-service.interface.js';
import { CommentDocument } from './comment.entity.js';
import { CommentServiceInterface } from './comment-service.interface.js';
import CreateCommentRequest from './dto/create-comment.request.js';
import CommentResponse from './rdo/comment.response.js';

const OFFER_NOT_FOUND_MESSAGE = 'Offer not found.';
const COMMENT_AUTHOR_NOT_FOUND_MESSAGE = 'Comment author not found.';

@injectable()
export default class CommentController extends AbstractController {
  private readonly offerIdValidationMiddleware: ObjectIdMiddleware;
  private readonly offerExistsMiddleware: DocumentExistsMiddleware<OfferView>;
  private readonly createCommentValidationMiddleware: ValidateDtoMiddleware<CreateCommentRequest>;

  constructor(
    @inject(Component.Logger) logger: LoggerInterface,
    @inject(Component.CommentService) private readonly commentService: CommentServiceInterface,
    @inject(Component.OfferService) private readonly offerService: OfferServiceInterface,
    @inject(Component.UserService) private readonly userService: UserServiceInterface
  ) {
    super(logger);

    this.offerIdValidationMiddleware = new ObjectIdMiddleware('offerId');
    this.offerExistsMiddleware = new DocumentExistsMiddleware(this.offerService, 'offerId', OFFER_NOT_FOUND_MESSAGE);
    this.createCommentValidationMiddleware = new ValidateDtoMiddleware(CreateCommentRequest);

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [this.offerIdValidationMiddleware, this.offerExistsMiddleware]
    });

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [this.offerIdValidationMiddleware, this.createCommentValidationMiddleware, this.offerExistsMiddleware]
    });
  }

  private async index(request: Request, response: Response): Promise<void> {
    const offerId = this.getRouteParameter(request, 'offerId');
    const comments = await this.commentService.findByOfferId(offerId);
    const responseData = await this.mapCommentsWithAuthors(comments);

    this.ok(response, fillDtos(CommentResponse, responseData));
  }

  private async create(request: Request, response: Response): Promise<void> {
    const offerId = this.getRouteParameter(request, 'offerId');
    const requestData = request.body as CreateCommentRequest;
    const author = await this.userService.findById(requestData.authorId);

    if (!author) {
      throw new HttpError(StatusCodes.NOT_FOUND, COMMENT_AUTHOR_NOT_FOUND_MESSAGE);
    }

    const createdComment = await this.commentService.create({
      text: requestData.text,
      rating: requestData.rating,
      authorId: requestData.authorId,
      offerId
    });

    const responseData = CommentController.prepareCommentData(createdComment, author);
    this.created(response, fillDto(CommentResponse, responseData));
  }

  private async mapCommentsWithAuthors(comments: CommentDocument[]): Promise<Record<string, unknown>[]> {
    return Promise.all(comments.map(async (comment) => {
      const authorId = comment.author.toString();
      const author = await this.userService.findById(authorId);

      if (!author) {
        throw new HttpError(StatusCodes.NOT_FOUND, COMMENT_AUTHOR_NOT_FOUND_MESSAGE);
      }

      return CommentController.prepareCommentData(comment, author);
    }));
  }

  private static prepareCommentData(comment: CommentDocument, author: UserDocument): Record<string, unknown> {
    return {
      ...comment.toObject(),
      id: comment.id,
      author: {
        ...author.toObject(),
        id: author.id
      }
    };
  }
}

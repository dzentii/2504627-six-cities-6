import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Component } from '../../types/component.enum.js';
import AbstractController from '../../libs/rest/abstract.controller.js';
import HttpError from '../../libs/rest/http-error.js';
import { fillDto } from '../../libs/rest/fill-dto.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { HttpMethod } from '../../libs/rest/http-method.enum.js';
import ValidateDtoMiddleware from '../../libs/rest/validate-dto.middleware.js';
import { UserDocument } from './user.entity.js';
import { UserServiceInterface } from './user-service.interface.js';
import CreateUserRequest from './dto/create-user.request.js';
import LoginUserRequest from './dto/login-user.request.js';
import UserResponse from './rdo/user.response.js';
import LoginResponse from './rdo/login.response.js';

const USER_ALREADY_EXISTS_MESSAGE = 'User with this email already exists.';
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';
const USER_NOT_FOUND_MESSAGE = 'User not found.';

@injectable()
export default class UserController extends AbstractController {
  private readonly createUserValidationMiddleware: ValidateDtoMiddleware<CreateUserRequest>;
  private readonly loginValidationMiddleware: ValidateDtoMiddleware<LoginUserRequest>;

  constructor(
    @inject(Component.Logger) logger: LoggerInterface,
    @inject(Component.UserService) private readonly userService: UserServiceInterface
  ) {
    super(logger);

    this.createUserValidationMiddleware = new ValidateDtoMiddleware(CreateUserRequest);
    this.loginValidationMiddleware = new ValidateDtoMiddleware(LoginUserRequest);

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [this.createUserValidationMiddleware]
    });

    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [this.loginValidationMiddleware]
    });

    this.addRoute({
      path: '/logout',
      method: HttpMethod.Post,
      handler: this.logout
    });

    this.addRoute({
      path: '/check-auth',
      method: HttpMethod.Get,
      handler: this.show
    });
  }

  private async create(request: Request, response: Response): Promise<void> {
    const requestData = request.body as CreateUserRequest;

    const existingUser = await this.userService.findByEmail(requestData.email);
    if (existingUser) {
      throw new HttpError(StatusCodes.CONFLICT, USER_ALREADY_EXISTS_MESSAGE);
    }

    const createdUser = await this.userService.create(requestData);
    const userResponse = fillDto(UserResponse, UserController.prepareUserData(createdUser));

    this.created(response, userResponse);
  }

  private async login(request: Request, response: Response): Promise<void> {
    const requestData = request.body as LoginUserRequest;

    const user = await this.userService.findByEmail(requestData.email);
    if (!user || user.password !== requestData.password) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, INVALID_CREDENTIALS_MESSAGE);
    }

    const responseData = fillDto(LoginResponse, {
      token: UserController.createToken(user.id),
      user: UserController.prepareUserData(user)
    });

    this.ok(response, responseData);
  }

  private async logout(request: Request, response: Response): Promise<void> {
    this.ensureAuthenticated(request);
    this.noContent(response);
  }

  private async show(request: Request, response: Response): Promise<void> {
    const userId = this.ensureAuthenticated(request);
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, USER_NOT_FOUND_MESSAGE);
    }

    const responseData = fillDto(UserResponse, UserController.prepareUserData(user));
    this.ok(response, responseData);
  }

  private static prepareUserData(user: UserDocument): Record<string, unknown> {
    return {
      ...user.toObject(),
      id: user.id
    };
  }

  private static createToken(userId: string): string {
    return `token-${userId}`;
  }
}

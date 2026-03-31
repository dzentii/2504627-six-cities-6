import { inject, injectable } from 'inversify';
import { Model } from 'mongoose';
import { Component } from '../../types/component.enum.js';
import { CreateUserDto, UserServiceInterface } from './user-service.interface.js';
import { UserDocument, UserEntity } from './user.entity.js';

@injectable()
export default class DefaultUserService implements UserServiceInterface {
  constructor(
    @inject(Component.UserModel) private readonly userModel: Model<UserEntity>
  ) {}

  public findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  public findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  public create(data: CreateUserDto): Promise<UserDocument> {
    return this.userModel.create(data);
  }
}

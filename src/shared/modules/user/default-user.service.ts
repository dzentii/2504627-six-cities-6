import { createHash } from 'node:crypto';
import { inject, injectable } from 'inversify';
import { Model } from 'mongoose';
import { ConfigInterface } from '../../libs/config/config.interface.js';
import { Component } from '../../types/component.enum.js';
import { CreateUserDto, UserServiceInterface, VerifyUserDto } from './user-service.interface.js';
import { UserDocument, UserEntity } from './user.entity.js';

const PASSWORD_HASH_ALGORITHM = 'sha256';
const PASSWORD_HASH_ENCODING = 'hex';
const PASSWORD_SALT_SEPARATOR = ':';
const DEFAULT_AVATAR_PATH = '/img/avatar.svg';

@injectable()
export default class DefaultUserService implements UserServiceInterface {
  constructor(
    @inject(Component.Config) private readonly config: ConfigInterface,
    @inject(Component.UserModel) private readonly userModel: Model<UserEntity>
  ) {}

  public findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  public findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  public async verifyUser(data: VerifyUserDto): Promise<UserDocument | null> {
    const user = await this.findByEmail(data.email);

    if (!user) {
      return null;
    }

    const passwordHash = this.createPasswordHash(data.password);
    return user.password === passwordHash ? user : null;
  }

  public create(data: CreateUserDto): Promise<UserDocument> {
    return this.userModel.create({
      ...data,
      avatarPath: data.avatarPath || DEFAULT_AVATAR_PATH,
      password: this.createPasswordHash(data.password)
    });
  }

  public updateAvatarById(id: string, avatarPath: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      { avatarPath },
      { new: true }
    ).exec();
  }

  private createPasswordHash(password: string): string {
    const salt = this.config.getSalt();
    return createHash(PASSWORD_HASH_ALGORITHM)
      .update(`${salt}${PASSWORD_SALT_SEPARATOR}${password}`)
      .digest(PASSWORD_HASH_ENCODING);
  }
}

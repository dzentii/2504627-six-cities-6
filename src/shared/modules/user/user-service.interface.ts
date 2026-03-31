import { UserType } from '../../../types/user.type.js';
import { UserDocument } from './user.entity.js';

export type CreateUserDto = {
  name: string;
  email: string;
  avatarPath?: string;
  password: string;
  type: UserType;
};

export interface UserServiceInterface {
  findById(id: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  create(data: CreateUserDto): Promise<UserDocument>;
}

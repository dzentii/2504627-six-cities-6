import { HydratedDocument, model, Schema } from 'mongoose';
import { UserType } from '../../../types/user.type.js';

const USERS_COLLECTION_NAME = 'users';
export const UserModelName = 'User';

export type UserEntity = {
  name: string;
  email: string;
  avatarPath?: string;
  password: string;
  type: UserType;
};

export type UserDocument = HydratedDocument<UserEntity>;

const userSchema = new Schema<UserEntity>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatarPath: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(UserType)
  }
}, {
  timestamps: true,
  collection: USERS_COLLECTION_NAME
});

export const UserModel = model<UserEntity>(UserModelName, userSchema);

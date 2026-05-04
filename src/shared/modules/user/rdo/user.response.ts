import { Expose } from 'class-transformer';
import { UserType } from '../../../../types/user.type.js';

export default class UserResponse {
  @Expose()
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  public email!: string;

  @Expose()
  public avatarPath?: string;

  @Expose({ name: 'type' })
  public userType!: UserType;

  @Expose()
  public createdAt!: Date;

  @Expose()
  public updatedAt!: Date;
}

import { Expose } from 'class-transformer';
import { UserType } from '../../../../types/user.type.js';

export default class CreateUserRequest {
  @Expose()
  public name!: string;

  @Expose()
  public email!: string;

  @Expose()
  public avatarPath?: string;

  @Expose()
  public password!: string;

  @Expose({ name: 'userType' })
  public type!: UserType;
}

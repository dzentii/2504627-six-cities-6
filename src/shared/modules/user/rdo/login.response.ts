import { Expose, Type } from 'class-transformer';
import UserResponse from './user.response.js';

export default class LoginResponse {
  @Expose()
  public token!: string;

  @Expose()
  @Type(() => UserResponse)
  public user!: UserResponse;
}

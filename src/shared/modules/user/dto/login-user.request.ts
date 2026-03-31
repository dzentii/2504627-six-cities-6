import { Expose } from 'class-transformer';

export default class LoginUserRequest {
  @Expose()
  public email!: string;

  @Expose()
  public password!: string;
}

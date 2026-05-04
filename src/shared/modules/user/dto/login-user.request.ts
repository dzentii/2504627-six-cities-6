import { Expose } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

const USER_PASSWORD_MIN_LENGTH = 6;
const USER_PASSWORD_MAX_LENGTH = 12;

export default class LoginUserRequest {
  @Expose()
  @IsEmail()
  public email!: string;

  @Expose()
  @IsString()
  @Length(USER_PASSWORD_MIN_LENGTH, USER_PASSWORD_MAX_LENGTH)
  public password!: string;
}

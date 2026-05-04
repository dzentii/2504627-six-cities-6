import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { UserType } from '../../../../types/user.type.js';

const USER_NAME_MIN_LENGTH = 1;
const USER_NAME_MAX_LENGTH = 15;
const USER_PASSWORD_MIN_LENGTH = 6;
const USER_PASSWORD_MAX_LENGTH = 12;
const AVATAR_FILE_EXTENSION_REGEXP = /\.(jpg|png)$/i;

export default class CreateUserRequest {
  @Expose()
  @IsString()
  @Length(USER_NAME_MIN_LENGTH, USER_NAME_MAX_LENGTH)
  public name!: string;

  @Expose()
  @IsEmail()
  public email!: string;

  @Expose()
  @IsOptional()
  @IsString()
  @Matches(AVATAR_FILE_EXTENSION_REGEXP)
  public avatarPath?: string;

  @Expose()
  @IsString()
  @Length(USER_PASSWORD_MIN_LENGTH, USER_PASSWORD_MAX_LENGTH)
  public password!: string;

  @Expose({ name: 'userType' })
  @Transform(({ value }: { value: string }) => (value === 'regular' ? UserType.Regular : value))
  @IsEnum(UserType)
  public type!: UserType;
}

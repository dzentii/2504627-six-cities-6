import { Expose } from 'class-transformer';
import { IsInt, IsString, Length, Max, Min } from 'class-validator';

const TEXT_MIN_LENGTH = 5;
const TEXT_MAX_LENGTH = 1024;
const RATING_MIN_VALUE = 1;
const RATING_MAX_VALUE = 5;

export default class CreateCommentRequest {
  @Expose()
  @IsString()
  @Length(TEXT_MIN_LENGTH, TEXT_MAX_LENGTH)
  public text!: string;

  @Expose()
  @IsInt()
  @Min(RATING_MIN_VALUE)
  @Max(RATING_MAX_VALUE)
  public rating!: number;
}

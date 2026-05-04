import { Expose, Type } from 'class-transformer';
import CommentAuthorResponse from './comment-author.response.js';

export default class CommentResponse {
  @Expose()
  public id!: string;

  @Expose()
  public text!: string;

  @Expose()
  public rating!: number;

  @Expose()
  public publishDate!: Date;

  @Expose()
  @Type(() => CommentAuthorResponse)
  public author!: CommentAuthorResponse;
}

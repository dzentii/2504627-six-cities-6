import { CommentDocument } from './comment.entity.js';

export type CreateCommentDto = {
  text: string;
  rating: number;
  authorId: string;
  offerId: string;
  publishDate?: Date;
};

export interface CommentServiceInterface {
  findById(id: string): Promise<CommentDocument | null>;
  findByOfferId(offerId: string, limit?: number): Promise<CommentDocument[]>;
  create(data: CreateCommentDto): Promise<CommentDocument>;
  deleteByOfferId(offerId: string): Promise<number>;
}

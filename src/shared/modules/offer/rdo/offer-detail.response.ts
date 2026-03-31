import { Expose, Type } from 'class-transformer';
import CoordinatesResponse from './coordinates.response.js';
import OfferAuthorResponse from './offer-author.response.js';
import OfferPreviewResponse from './offer-preview.response.js';

export default class OfferDetailResponse extends OfferPreviewResponse {
  @Expose()
  public description!: string;

  @Expose()
  public images!: string[];

  @Expose()
  public bedrooms!: number;

  @Expose()
  public maxAdults!: number;

  @Expose()
  public goods!: string[];

  @Expose()
  @Type(() => OfferAuthorResponse)
  public author!: OfferAuthorResponse;

  @Expose()
  @Type(() => CoordinatesResponse)
  public location!: CoordinatesResponse;

  @Expose()
  public createdAt!: Date;

  @Expose()
  public updatedAt!: Date;
}

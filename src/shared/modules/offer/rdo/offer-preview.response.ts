import { Expose } from 'class-transformer';
import { CityName, HousingType } from '../../../../types/offer.type.js';

export default class OfferPreviewResponse {
  @Expose()
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public type!: HousingType;

  @Expose()
  public price!: number;

  @Expose()
  public previewImage!: string;

  @Expose()
  public city!: CityName;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public commentsCount!: number;

  @Expose()
  public postDate!: Date;
}

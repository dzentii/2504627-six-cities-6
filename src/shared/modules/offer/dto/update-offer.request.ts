import { Expose, Transform, Type } from 'class-transformer';
import { CityName, HousingType, Location } from '../../../../types/offer.type.js';

export default class UpdateOfferRequest {
  @Expose()
  public title?: string;

  @Expose()
  public description?: string;

  @Expose()
  @Transform(({ value }: { value?: string }) => (value ? new Date(value) : undefined))
  public postDate?: Date;

  @Expose()
  public city?: CityName;

  @Expose()
  public previewImage?: string;

  @Expose()
  public images?: string[];

  @Expose()
  public isPremium?: boolean;

  @Expose()
  public isFavorite?: boolean;

  @Expose()
  public rating?: number;

  @Expose()
  public type?: HousingType;

  @Expose()
  public bedrooms?: number;

  @Expose()
  public maxAdults?: number;

  @Expose()
  public price?: number;

  @Expose()
  public goods?: string[];

  @Expose()
  @Type(() => Object)
  public location?: Location;
}

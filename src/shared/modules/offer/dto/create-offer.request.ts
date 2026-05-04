import { Expose, Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CityName, HousingType } from '../../../../types/offer.type.js';

const TITLE_MIN_LENGTH = 10;
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MIN_LENGTH = 20;
const DESCRIPTION_MAX_LENGTH = 1024;
const IMAGES_COUNT = 6;
const RATING_MIN_VALUE = 1;
const RATING_MAX_VALUE = 5;
const RATING_MAX_DECIMAL_PLACES = 1;
const BEDROOMS_MIN_VALUE = 1;
const BEDROOMS_MAX_VALUE = 8;
const MAX_ADULTS_MIN_VALUE = 1;
const MAX_ADULTS_MAX_VALUE = 10;
const PRICE_MIN_VALUE = 100;
const PRICE_MAX_VALUE = 100000;
const GOODS_MIN_COUNT = 1;
const LATITUDE_MIN_VALUE = -90;
const LATITUDE_MAX_VALUE = 90;
const LONGITUDE_MIN_VALUE = -180;
const LONGITUDE_MAX_VALUE = 180;

const OFFER_GOODS = [
  'Breakfast',
  'Air conditioning',
  'Laptop friendly workspace',
  'Baby seat',
  'Washer',
  'Towels',
  'Fridge',
] as const;

class CreateOfferLocationRequest {
  @Expose()
  @IsNumber()
  @Min(LATITUDE_MIN_VALUE)
  @Max(LATITUDE_MAX_VALUE)
  public latitude!: number;

  @Expose()
  @IsNumber()
  @Min(LONGITUDE_MIN_VALUE)
  @Max(LONGITUDE_MAX_VALUE)
  public longitude!: number;
}

export default class CreateOfferRequest {
  @Expose()
  @IsString()
  @Length(TITLE_MIN_LENGTH, TITLE_MAX_LENGTH)
  public title!: string;

  @Expose()
  @IsString()
  @Length(DESCRIPTION_MIN_LENGTH, DESCRIPTION_MAX_LENGTH)
  public description!: string;

  @Expose()
  @Transform(({ value }: { value: string }) => new Date(value))
  @IsDate()
  public postDate!: Date;

  @Expose()
  @IsEnum(CityName)
  public city!: CityName;

  @Expose()
  @IsString()
  public previewImage!: string;

  @Expose()
  @IsArray()
  @ArrayMinSize(IMAGES_COUNT)
  @ArrayMaxSize(IMAGES_COUNT)
  @IsString({ each: true })
  public images!: string[];

  @Expose()
  @IsBoolean()
  public isPremium!: boolean;

  @Expose()
  @IsBoolean()
  public isFavorite!: boolean;

  @Expose()
  @IsNumber({ maxDecimalPlaces: RATING_MAX_DECIMAL_PLACES })
  @Min(RATING_MIN_VALUE)
  @Max(RATING_MAX_VALUE)
  public rating!: number;

  @Expose()
  @IsEnum(HousingType)
  public type!: HousingType;

  @Expose()
  @IsInt()
  @Min(BEDROOMS_MIN_VALUE)
  @Max(BEDROOMS_MAX_VALUE)
  public bedrooms!: number;

  @Expose()
  @IsInt()
  @Min(MAX_ADULTS_MIN_VALUE)
  @Max(MAX_ADULTS_MAX_VALUE)
  public maxAdults!: number;

  @Expose()
  @IsInt()
  @Min(PRICE_MIN_VALUE)
  @Max(PRICE_MAX_VALUE)
  public price!: number;

  @Expose()
  @IsArray()
  @ArrayMinSize(GOODS_MIN_COUNT)
  @IsIn(OFFER_GOODS, { each: true })
  public goods!: string[];

  @Expose()
  @IsMongoId()
  public authorId!: string;

  @Expose()
  @ValidateNested()
  @Type(() => CreateOfferLocationRequest)
  public location!: CreateOfferLocationRequest;
}

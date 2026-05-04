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
  IsNumber,
  IsOptional,
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

class UpdateOfferLocationRequest {
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

export default class UpdateOfferRequest {
  @Expose()
  @IsOptional()
  @IsString()
  @Length(TITLE_MIN_LENGTH, TITLE_MAX_LENGTH)
  public title?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @Length(DESCRIPTION_MIN_LENGTH, DESCRIPTION_MAX_LENGTH)
  public description?: string;

  @Expose()
  @IsOptional()
  @Transform(({ value }: { value?: string }) => (value ? new Date(value) : undefined))
  @IsDate()
  public postDate?: Date;

  @Expose()
  @IsOptional()
  @IsEnum(CityName)
  public city?: CityName;

  @Expose()
  @IsOptional()
  @IsString()
  public previewImage?: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @ArrayMinSize(IMAGES_COUNT)
  @ArrayMaxSize(IMAGES_COUNT)
  @IsString({ each: true })
  public images?: string[];

  @Expose()
  @IsOptional()
  @IsBoolean()
  public isPremium?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  public isFavorite?: boolean;

  @Expose()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: RATING_MAX_DECIMAL_PLACES })
  @Min(RATING_MIN_VALUE)
  @Max(RATING_MAX_VALUE)
  public rating?: number;

  @Expose()
  @IsOptional()
  @IsEnum(HousingType)
  public type?: HousingType;

  @Expose()
  @IsOptional()
  @IsInt()
  @Min(BEDROOMS_MIN_VALUE)
  @Max(BEDROOMS_MAX_VALUE)
  public bedrooms?: number;

  @Expose()
  @IsOptional()
  @IsInt()
  @Min(MAX_ADULTS_MIN_VALUE)
  @Max(MAX_ADULTS_MAX_VALUE)
  public maxAdults?: number;

  @Expose()
  @IsOptional()
  @IsInt()
  @Min(PRICE_MIN_VALUE)
  @Max(PRICE_MAX_VALUE)
  public price?: number;

  @Expose()
  @IsOptional()
  @IsArray()
  @ArrayMinSize(GOODS_MIN_COUNT)
  @IsIn(OFFER_GOODS, { each: true })
  public goods?: string[];

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateOfferLocationRequest)
  public location?: UpdateOfferLocationRequest;
}

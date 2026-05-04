import { Expose } from 'class-transformer';

export default class CoordinatesResponse {
  @Expose()
  public latitude!: number;

  @Expose()
  public longitude!: number;
}

import { ClassConstructor, plainToInstance } from 'class-transformer';

export function fillDto<T, V>(targetClass: ClassConstructor<T>, plainObject: V): T {
  return plainToInstance(targetClass, plainObject, {
    excludeExtraneousValues: true
  });
}

export function fillDtos<T, V>(targetClass: ClassConstructor<T>, plainObjects: V[]): T[] {
  return plainObjects.map((plainObject) => fillDto(targetClass, plainObject));
}

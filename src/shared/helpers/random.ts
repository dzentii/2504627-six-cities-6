export function getRandomInteger(min: number, max: number): number {
  const lowerBound = Math.ceil(Math.min(min, max));
  const upperBound = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
}

export function getRandomItem<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error('Collection must not be empty.');
  }

  const randomIndex = getRandomInteger(0, items.length - 1);
  return items[randomIndex];
}

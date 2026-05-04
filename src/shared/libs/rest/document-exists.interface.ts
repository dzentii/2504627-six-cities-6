export interface DocumentExistsServiceInterface<T> {
  findById(id: string): Promise<T | null>;
}

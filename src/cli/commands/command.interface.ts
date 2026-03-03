export interface CommandInterface {
  readonly name: string;
  execute(...parameters: string[]): Promise<void>;
}

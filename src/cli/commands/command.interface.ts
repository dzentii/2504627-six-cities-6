export interface CommandInterface {
  readonly name: string;
  execute(...parameters: string[]): void;
}

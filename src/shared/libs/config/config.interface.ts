export type ConfigValues = {
  port: number;
  dbHost: string;
  salt: string;
};

export interface ConfigInterface {
  getPort(): number;
  getDbHost(): string;
  getSalt(): string;
}

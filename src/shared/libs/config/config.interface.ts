export type ConfigValues = {
  port: number;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  salt: string;
};

export interface ConfigInterface {
  getPort(): number;
  getDbHost(): string;
  getDbPort(): number;
  getDbName(): string;
  getDbUser(): string;
  getDbPassword(): string;
  getSalt(): string;
  getMongoUri(): string;
}

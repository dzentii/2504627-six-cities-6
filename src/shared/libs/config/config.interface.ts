export type ConfigValues = {
  port: number;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  salt: string;
  uploadDirectoryPath: string;
  jwtSecret: string;
};

export interface ConfigInterface {
  getPort(): number;
  getDbHost(): string;
  getDbPort(): number;
  getDbName(): string;
  getDbUser(): string;
  getDbPassword(): string;
  getSalt(): string;
  getUploadDirectoryPath(): string;
  getJwtSecret(): string;
  getMongoUri(): string;
}

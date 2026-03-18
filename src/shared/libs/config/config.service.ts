import convict, { Config } from 'convict';
import convictFormatWithValidator from 'convict-format-with-validator';
import dotenv from 'dotenv';
import { injectable } from 'inversify';
import { ConfigInterface, ConfigValues } from './config.interface.js';

const SERVER_PORT_ENV_NAME = 'PORT';
const DATABASE_HOST_ENV_NAME = 'DB_HOST';
const DATABASE_PORT_ENV_NAME = 'DB_PORT';
const DATABASE_NAME_ENV_NAME = 'DB_NAME';
const DATABASE_USER_ENV_NAME = 'DB_USER';
const DATABASE_PASSWORD_ENV_NAME = 'DB_PASSWORD';
const SALT_ENV_NAME = 'SALT';
const DEFAULT_PORT_VALUE = 0;
const DEFAULT_DATABASE_PORT_VALUE = 0;
const EMPTY_STRING = '';
const AUTH_SOURCE_DATABASE = 'admin';

convict.addFormats(convictFormatWithValidator);

const configSchema = {
  port: {
    doc: 'Application port',
    format: 'port',
    default: DEFAULT_PORT_VALUE,
    env: SERVER_PORT_ENV_NAME
  },
  dbHost: {
    doc: 'Database host IP address',
    format: 'ipaddress',
    default: EMPTY_STRING,
    env: DATABASE_HOST_ENV_NAME
  },
  dbPort: {
    doc: 'Database port',
    format: 'port',
    default: DEFAULT_DATABASE_PORT_VALUE,
    env: DATABASE_PORT_ENV_NAME
  },
  dbName: {
    doc: 'Database name',
    format: String,
    default: EMPTY_STRING,
    env: DATABASE_NAME_ENV_NAME
  },
  dbUser: {
    doc: 'Database user',
    format: String,
    default: EMPTY_STRING,
    env: DATABASE_USER_ENV_NAME
  },
  dbPassword: {
    doc: 'Database password',
    format: String,
    default: EMPTY_STRING,
    env: DATABASE_PASSWORD_ENV_NAME
  },
  salt: {
    doc: 'Password hash salt',
    format: String,
    default: EMPTY_STRING,
    env: SALT_ENV_NAME
  }
};

@injectable()
export default class ConfigService implements ConfigInterface {
  private readonly config: Config<ConfigValues>;

  constructor() {
    dotenv.config({ quiet: true });
    this.config = convict<ConfigValues>(configSchema);
    this.config.validate({ allowed: 'strict' });
    this.validateRequiredValues();
  }

  public getPort(): number {
    return this.config.get('port');
  }

  public getDbHost(): string {
    return this.config.get('dbHost');
  }

  public getDbPort(): number {
    return this.config.get('dbPort');
  }

  public getDbName(): string {
    return this.config.get('dbName');
  }

  public getDbUser(): string {
    return this.config.get('dbUser');
  }

  public getDbPassword(): string {
    return this.config.get('dbPassword');
  }

  public getSalt(): string {
    return this.config.get('salt');
  }

  public getMongoUri(): string {
    const dbUser = encodeURIComponent(this.getDbUser());
    const dbPassword = encodeURIComponent(this.getDbPassword());
    const dbHost = this.getDbHost();
    const dbPort = this.getDbPort();
    const dbName = this.getDbName();

    return `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?authSource=${AUTH_SOURCE_DATABASE}`;
  }

  private validateRequiredValues(): void {
    const requiredEnvironmentVariables = [
      SERVER_PORT_ENV_NAME,
      DATABASE_HOST_ENV_NAME,
      DATABASE_PORT_ENV_NAME,
      DATABASE_NAME_ENV_NAME,
      DATABASE_USER_ENV_NAME,
      DATABASE_PASSWORD_ENV_NAME,
      SALT_ENV_NAME,
    ];

    for (const variableName of requiredEnvironmentVariables) {
      if (!process.env[variableName]) {
        throw new Error(`Environment variable ${variableName} is required.`);
      }
    }
  }
}

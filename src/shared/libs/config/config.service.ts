import convict, { Config } from 'convict';
import convictFormatWithValidator from 'convict-format-with-validator';
import dotenv from 'dotenv';
import { injectable } from 'inversify';
import { ConfigInterface, ConfigValues } from './config.interface.js';

const SERVER_PORT_ENV_NAME = 'PORT';
const DATABASE_HOST_ENV_NAME = 'DB_HOST';
const SALT_ENV_NAME = 'SALT';
const DEFAULT_PORT_VALUE = 0;
const EMPTY_STRING = '';

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

  public getSalt(): string {
    return this.config.get('salt');
  }

  private validateRequiredValues(): void {
    const dbHost = this.config.get('dbHost');
    const salt = this.config.get('salt');
    const port = process.env[SERVER_PORT_ENV_NAME];

    if (!port) {
      throw new Error(`Environment variable ${SERVER_PORT_ENV_NAME} is required.`);
    }

    if (dbHost.length === 0) {
      throw new Error(`Environment variable ${DATABASE_HOST_ENV_NAME} is required.`);
    }

    if (salt.length === 0) {
      throw new Error(`Environment variable ${SALT_ENV_NAME} is required.`);
    }
  }
}

import mongoose from 'mongoose';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/component.enum.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import { DatabaseClientInterface } from './database-client.interface.js';

const DISCONNECTED_STATE = 0;

@injectable()
export default class MongooseDatabaseClient implements DatabaseClientInterface {
  constructor(
    @inject(Component.Logger) private readonly logger: LoggerInterface
  ) {}

  public async connect(uri: string): Promise<void> {
    this.logger.info('Trying to connect to MongoDB...');

    try {
      await mongoose.connect(uri);
      this.logger.info('MongoDB connection established.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`MongoDB connection failed: ${errorMessage}`);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (mongoose.connection.readyState === DISCONNECTED_STATE) {
      return;
    }

    await mongoose.disconnect();
    this.logger.info('MongoDB connection closed.');
  }
}

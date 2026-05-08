import { inject, injectable } from 'inversify';
import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import { ConfigInterface } from '../config/config.interface.js';
import { Component } from '../../types/component.enum.js';
import { TokenPayload } from './token-payload.type.js';
import { TokenServiceInterface } from './token-service.interface.js';

const JWT_ALGORITHM = 'HS256';
const JWT_TYPE = 'JWT';
const JWT_EXPIRATION_TIME = '2d';
const TOKEN_PAYLOAD_IS_INVALID_MESSAGE = 'Token payload is invalid.';

@injectable()
export default class DefaultTokenService implements TokenServiceInterface {
  constructor(
    @inject(Component.Config) private readonly config: ConfigInterface
  ) {}

  public async createToken(payload: TokenPayload): Promise<string> {
    return new SignJWT({
      userId: payload.userId,
      email: payload.email
    })
      .setProtectedHeader({ alg: JWT_ALGORITHM, typ: JWT_TYPE })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION_TIME)
      .sign(this.getSecretKey());
  }

  public async verifyToken(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, this.getSecretKey());
    return DefaultTokenService.extractTokenPayload(payload);
  }

  private getSecretKey(): Uint8Array {
    return new TextEncoder().encode(this.config.getJwtSecret());
  }

  private static extractTokenPayload(payload: JWTPayload): TokenPayload {
    if (typeof payload.userId !== 'string' || typeof payload.email !== 'string') {
      throw new Error(TOKEN_PAYLOAD_IS_INVALID_MESSAGE);
    }

    return {
      userId: payload.userId,
      email: payload.email
    };
  }
}

import { TokenPayload } from './token-payload.type.js';

export interface TokenServiceInterface {
  createToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
}

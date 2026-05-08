import { TokenPayload } from '../shared/libs/token/token-payload.type.js';

declare global {
  namespace Express {
    interface Request {
      tokenPayload?: TokenPayload;
    }
  }
}

export {};

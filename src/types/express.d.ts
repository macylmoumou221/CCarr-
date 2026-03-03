import { JwtPayload } from '../utils/jwt';

/**
 * Extension du type Request d'Express pour inclure l'utilisateur authentifié.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

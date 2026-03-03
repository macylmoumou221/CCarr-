import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import ApiError from '../utils/ApiError';
import User from '../models/user.model';

/**
 * Middleware d'authentification.
 * Vérifie le JWT dans le header Authorization (Bearer <token>).
 * Injecte `req.user` si le token est valide.
 */
const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Accès refusé – token manquant');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'Accès refusé – token invalide');
    }

    // Vérifie et décode le token
    const decoded = verifyToken(token);

    // Vérifie que l'utilisateur existe toujours en base
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, 'Utilisateur introuvable – token invalide');
    }

    // Attache l'utilisateur au request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(401, 'Token invalide ou expiré'));
  }
};

export default authMiddleware;

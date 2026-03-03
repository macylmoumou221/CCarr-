import { Request, Response, NextFunction } from 'express';
import Annonce from '../models/annonce.model';

/**
 * Controller "placeholder" pour les annonces.
 * Sprint 1 – on expose uniquement une route GET protégée de test.
 */

/* ────────────────────────────────────────────
   GET /api/annonces  (route protégée)
   ──────────────────────────────────────────── */
export const getAnnonces = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const annonces = await Annonce.find()
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: annonces.length,
      data: { annonces },
    });
  } catch (error) {
    next(error);
  }
};

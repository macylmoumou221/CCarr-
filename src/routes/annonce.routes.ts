import { Router } from 'express';
import { getAnnonces } from '../controllers/annonce.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/annonces
 * @desc    Récupérer toutes les annonces (route protégée)
 * @access  Private
 */
router.get('/', authMiddleware, getAnnonces);

export default router;

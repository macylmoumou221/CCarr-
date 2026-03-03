import { Router } from 'express';
import authRoutes from './auth.routes';
import annonceRoutes from './annonce.routes';

const router = Router();

/** Auth – inscription / connexion */
router.use('/auth', authRoutes);

/** Annonces */
router.use('/annonces', annonceRoutes);

export default router;

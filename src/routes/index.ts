import { Router } from 'express';
import authRoutes from './auth.routes';
import annonceRoutes from './annonce.routes';
import echangeRoutes from './echange.routes';
import messageRoutes from './message.routes';
import notificationRoutes from './notification.routes';
import favoriteRoutes from './favorite.routes';

const router = Router();

/** Auth – inscription / connexion */
router.use('/auth', authRoutes);

/** Annonces */
router.use('/annonces', annonceRoutes);

/** Échanges */
router.use('/echanges', echangeRoutes);

/** Messages */
router.use('/messages', messageRoutes);

/** Notifications */
router.use('/notifications', notificationRoutes);

/** Favoris */
router.use('/favorites', favoriteRoutes);

export default router;

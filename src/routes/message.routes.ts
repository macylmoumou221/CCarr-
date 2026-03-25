import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import { sendMessage, getMessagesByEchange } from '../controllers/message.controller';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * POST /api/messages
 * Send a message in an exchange
 */
router.post('/', sendMessage);

/**
 * GET /api/messages/:echangeId
 * Get all messages for an exchange
 */
router.get('/:echangeId', getMessagesByEchange);

export default router;

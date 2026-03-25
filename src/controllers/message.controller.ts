import { Request, Response, NextFunction } from 'express';
import Message from '../models/message.model';
import Echange from '../models/echange.model';
import ApiError from '../utils/ApiError';

/* ────────────────────────────────────────────
   POST /api/messages
   Send a message in an exchange
   ──────────────────────────────────────────── */
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { echangeId, contenu } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(401, 'Utilisateur non authentifié');
    }

    if (!echangeId || !contenu) {
      throw new ApiError(400, "L'ID de l'échange et le contenu sont requis");
    }

    // Vérifier que l'échange existe
    const echange = await Echange.findById(echangeId);
    if (!echange) {
      throw new ApiError(404, "L'échange n'existe pas");
    }

    // Vérifier que l'utilisateur est impliqué dans l'échange
    const isInvolved =
      echange.utilisateurDemandeur.toString() === userId ||
      echange.utilisateurProprietaire.toString() === userId;

    if (!isInvolved) {
      throw new ApiError(403, "Vous ne pouvez pas envoyer de message dans cet échange");
    }

    // Créer le message
    const message = await Message.create({
      echangeId,
      expediteur: userId,
      contenu,
    });

    const populatedMessage = await message.populate('expediteur');

    res.status(201).json({
      success: true,
      message: 'Message envoyé',
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

/* ────────────────────────────────────────────
   GET /api/messages/:echangeId
   Get all messages for an exchange
   ──────────────────────────────────────────── */
export const getMessagesByEchange = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { echangeId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(401, 'Utilisateur non authentifié');
    }

    // Vérifier que l'échange existe
    const echange = await Echange.findById(echangeId);
    if (!echange) {
      throw new ApiError(404, "L'échange n'existe pas");
    }

    // Vérifier que l'utilisateur est impliqué dans l'échange
    const isInvolved =
      echange.utilisateurDemandeur.toString() === userId ||
      echange.utilisateurProprietaire.toString() === userId;

    if (!isInvolved) {
      throw new ApiError(403, "Vous n'avez pas accès aux messages de cet échange");
    }

    const messages = await Message.find({ echangeId })
      .populate('expediteur')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

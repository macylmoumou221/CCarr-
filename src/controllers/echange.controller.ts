import { Request, Response, NextFunction } from 'express';
import Echange, { EchangeStatus } from '../models/echange.model';
import Annonce from '../models/annonce.model';
import User from '../models/user.model';
import ApiError from '../utils/ApiError';
import Notification, { NotificationType } from '../models/notification.model';

/* ────────────────────────────────────────────
   POST /api/echanges
   Create a new exchange request
   ──────────────────────────────────────────── */
export const createEchange = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { annonceId, messageInitial } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(401, 'Utilisateur non authentifié');
    }

    if (!annonceId) {
      throw new ApiError(400, "L'ID de l'annonce est requis");
    }

    // Vérifier que l'annonce existe
    const annonce = await Annonce.findById(annonceId).populate('owner');
    if (!annonce) {
      throw new ApiError(404, "L'annonce n'existe pas");
    }

    // Un utilisateur ne peut pas créer un échange sur sa propre annonce
    if (annonce.owner._id.toString() === userId) {
      throw new ApiError(400, "Vous ne pouvez pas créer un échange sur votre propre annonce");
    }

    // Vérifier qu'un échange n'existe pas déjà
    const existingEchange = await Echange.findOne({
      utilisateurDemandeur: userId,
      annonce: annonceId,
      statut: { $in: [EchangeStatus.EN_ATTENTE, EchangeStatus.ACCEPTE] },
    });

    if (existingEchange) {
      throw new ApiError(400, 'Un échange actif existe déjà pour cette annonce');
    }

    // Créer l'échange
    const echange = await Echange.create({
      utilisateurDemandeur: userId,
      utilisateurProprietaire: annonce.owner._id,
      annonce: annonceId,
      messageInitial,
      statut: EchangeStatus.EN_ATTENTE,
    });

    // Créer une notification pour le propriétaire
    await Notification.create({
      user: annonce.owner._id,
      type: NotificationType.ECHANGE_REQUEST,
      contenu: `Une demande d'échange a été reçue pour votre annonce "${annonce.title}"`,
      relatedEchange: echange._id,
    });

    const populatedEchange = await echange.populate([
      'utilisateurDemandeur',
      'utilisateurProprietaire',
      'annonce',
    ]);

    res.status(201).json({
      success: true,
      message: 'Demande d\'échange créée avec succès',
      data: populatedEchange,
    });
  } catch (error) {
    next(error);
  }
};

/* ────────────────────────────────────────────
   GET /api/echanges
   Get all exchanges for the current user
   ──────────────────────────────────────────── */
export const getUserEchanges = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { statut } = req.query;

    if (!userId) {
      throw new ApiError(401, 'Utilisateur non authentifié');
    }

    const filter: any = {
      $or: [
        { utilisateurDemandeur: userId },
        { utilisateurProprietaire: userId },
      ],
    };

    if (statut && Object.values(EchangeStatus).includes(statut as EchangeStatus)) {
      filter.statut = statut;
    }

    const echanges = await Echange.find(filter)
      .populate([
        'utilisateurDemandeur',
        'utilisateurProprietaire',
        'annonce',
      ])
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: echanges,
    });
  } catch (error) {
    next(error);
  }
};

/* ────────────────────────────────────────────
   PUT /api/echanges/:id/accept
   Accept an exchange request
   ──────────────────────────────────────────── */
export const acceptEchange = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(401, 'Utilisateur non authentifié');
    }

    const echange = await Echange.findById(id);
    if (!echange) {
      throw new ApiError(404, "L'échange n'existe pas");
    }

    // Seul le propriétaire peut accepter l'échange
    if (echange.utilisateurProprietaire.toString() !== userId) {
      throw new ApiError(403, 'Vous ne pouvez pas accepter cet échange');
    }

    if (echange.statut !== EchangeStatus.EN_ATTENTE) {
      throw new ApiError(400, "Cet échange n'est pas en attente");
    }

    echange.statut = EchangeStatus.ACCEPTE;
    await echange.save();

    // Créer une notification pour le demandeur
    await Notification.create({
      user: echange.utilisateurDemandeur,
      type: NotificationType.ECHANGE_ACCEPTED,
      contenu: 'Votre demande d\'échange a été acceptée',
      relatedEchange: echange._id,
    });

    const populatedEchange = await echange.populate([
      'utilisateurDemandeur',
      'utilisateurProprietaire',
      'annonce',
    ]);

    res.status(200).json({
      success: true,
      message: 'Échange accepté',
      data: populatedEchange,
    });
  } catch (error) {
    next(error);
  }
};

/* ────────────────────────────────────────────
   PUT /api/echanges/:id/refuse
   Refuse an exchange request
   ──────────────────────────────────────────── */
export const refuseEchange = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(401, 'Utilisateur non authentifié');
    }

    const echange = await Echange.findById(id);
    if (!echange) {
      throw new ApiError(404, "L'échange n'existe pas");
    }

    // Seul le propriétaire peut refuser l'échange
    if (echange.utilisateurProprietaire.toString() !== userId) {
      throw new ApiError(403, 'Vous ne pouvez pas refuser cet échange');
    }

    if (echange.statut !== EchangeStatus.EN_ATTENTE) {
      throw new ApiError(400, "Cet échange n'est pas en attente");
    }

    echange.statut = EchangeStatus.REFUSE;
    await echange.save();

    // Créer une notification pour le demandeur
    await Notification.create({
      user: echange.utilisateurDemandeur,
      type: NotificationType.ECHANGE_REFUSED,
      contenu: 'Votre demande d\'échange a été refusée',
      relatedEchange: echange._id,
    });

    res.status(200).json({
      success: true,
      message: 'Échange refusé',
      data: echange,
    });
  } catch (error) {
    next(error);
  }
};

/* ────────────────────────────────────────────
   PUT /api/echanges/:id/complete
   Complete an exchange
   ──────────────────────────────────────────── */
export const completeEchange = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(401, 'Utilisateur non authentifié');
    }

    const echange = await Echange.findById(id);
    if (!echange) {
      throw new ApiError(404, "L'échange n'existe pas");
    }

    // Seulement les utilisateurs impliqués peuvent finaliser l'échange
    const isInvolved =
      echange.utilisateurDemandeur.toString() === userId ||
      echange.utilisateurProprietaire.toString() === userId;

    if (!isInvolved) {
      throw new ApiError(403, 'Vous ne pouvez pas finaliser cet échange');
    }

    if (echange.statut !== EchangeStatus.ACCEPTE) {
      throw new ApiError(400, "Seul un échange accepté peut être finalisé");
    }

    echange.statut = EchangeStatus.TERMINE;
    await echange.save();

    // Créer des notifications pour les deux utilisateurs
    const otherUserId =
      echange.utilisateurDemandeur.toString() === userId
        ? echange.utilisateurProprietaire
        : echange.utilisateurDemandeur;

    await Notification.create({
      user: otherUserId,
      type: NotificationType.ECHANGE_COMPLETED,
      contenu: 'Un échange a été marqué comme terminé',
      relatedEchange: echange._id,
    });

    const populatedEchange = await echange.populate([
      'utilisateurDemandeur',
      'utilisateurProprietaire',
      'annonce',
    ]);

    res.status(200).json({
      success: true,
      message: 'Échange finalisé',
      data: populatedEchange,
    });
  } catch (error) {
    next(error);
  }
};

/* ────────────────────────────────────────────
   GET /api/echanges/history
   Get exchange history (ongoing and completed)
   ──────────────────────────────────────────── */
export const getExchangeHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(401, 'Utilisateur non authentifié');
    }

    const ongoingEchanges = await Echange.find({
      $or: [
        { utilisateurDemandeur: userId },
        { utilisateurProprietaire: userId },
      ],
      statut: { $in: [EchangeStatus.EN_ATTENTE, EchangeStatus.ACCEPTE] },
    })
      .populate(['utilisateurDemandeur', 'utilisateurProprietaire', 'annonce'])
      .sort({ createdAt: -1 });

    const completedEchanges = await Echange.find({
      $or: [
        { utilisateurDemandeur: userId },
        { utilisateurProprietaire: userId },
      ],
      statut: EchangeStatus.TERMINE,
    })
      .populate(['utilisateurDemandeur', 'utilisateurProprietaire', 'annonce'])
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ongoing: ongoingEchanges,
        completed: completedEchanges,
      },
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import Annonce, { AnnonceType } from '../models/annonce.model';
import ApiError from '../utils/ApiError';

/* ────────────────────────────────────────────
   POST /api/annonces  –  Créer une annonce
   ──────────────────────────────────────────── */
export const createAnnonce = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { title, description, type, category, images } = req.body;

    // Validation du type
    if (!title || !description || !type) {
      throw new ApiError(400, 'Le titre, la description et le type sont obligatoires');
    }

    if (!Object.values(AnnonceType).includes(type)) {
      throw new ApiError(400, 'Le type doit être : vente, pret ou demandePret');
    }

    const annonce = await Annonce.create({
      title,
      description,
      type,
      category,
      images: images || [],
      owner: req.user!.userId,
    });

    await annonce.populate('owner', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Annonce créée avec succès',
      data: { annonce },
    });
  } catch (error) {
    next(error);
  }
};

/* ────────────────────────────────────────────
   GET /api/annonces  –  Récupérer toutes les annonces
   ──────────────────────────────────────────── */
export const getAnnonces = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Filtres optionnels via query params
    const { type, category, status } = req.query;
    const filter: Record<string, any> = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const annonces = await Annonce.find(filter)
      .populate('owner', 'firstName lastName email')
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

/* ────────────────────────────────────────────
   GET /api/annonces/:id  –  Récupérer une annonce par ID
   ──────────────────────────────────────────── */
export const getAnnonceById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const annonce = await Annonce.findById(req.params.id)
      .populate('owner', 'firstName lastName email');

    if (!annonce) {
      throw new ApiError(404, 'Annonce introuvable');
    }

    res.status(200).json({
      success: true,
      data: { annonce },
    });
  } catch (error) {
    next(error);
  }
};

/* ────────────────────────────────────────────
   PUT /api/annonces/:id  –  Modifier une annonce
   ──────────────────────────────────────────── */
export const updateAnnonce = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { title, description, type, category, status, images } = req.body;

    // Valider le type s'il est fourni
    if (type && !Object.values(AnnonceType).includes(type)) {
      throw new ApiError(400, 'Le type doit être : vente, pret ou demandePret');
    }

    const existing = await Annonce.findById(req.params.id);
    if (!existing) {
      throw new ApiError(404, 'Annonce introuvable');
    }
    if (existing.owner.toString() !== req.user!.userId) {
      throw new ApiError(403, "Tu n'es pas autorisé à modifier cette annonce");
    }

    const annonce = await Annonce.findByIdAndUpdate(
      req.params.id,
      { title, description, type, category, status, images },
      { new: true, runValidators: true },
    ).populate('owner', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Annonce modifiée avec succès',
      data: { annonce },
    });
  } catch (error) {
    next(error);
  }
};

/* ────────────────────────────────────────────
   DELETE /api/annonces/:id  –  Supprimer une annonce
   ──────────────────────────────────────────── */
export const deleteAnnonce = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) {
      throw new ApiError(404, 'Annonce introuvable');
    }
    if (annonce.owner.toString() !== req.user!.userId) {
      throw new ApiError(403, "Tu n'es pas autorisé à supprimer cette annonce");
    }

    await Annonce.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Annonce supprimée avec succès',
    });
  } catch (error) {
    next(error);
  }
};

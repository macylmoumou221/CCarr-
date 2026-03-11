import mongoose, { Document, Schema, Types } from 'mongoose';

/* ───────── Types ───────── */

export enum AnnonceType {
  VENTE = 'vente',
  PRET = 'pret',
  DEMANDE_PRET = 'demandePret',
}

export enum AnnonceStatus {
  DISPONIBLE = 'disponible',
  RESERVE = 'reserve',
}

/* ───────── Interface ───────── */

export interface IAnnonce extends Document {
  title: string;
  description: string;
  type: AnnonceType;
  category?: string;
  status: AnnonceStatus;
  images: string[];
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/* ───────── Schéma ───────── */

const annonceSchema = new Schema<IAnnonce>(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      minlength: [3, 'Le titre doit faire au moins 3 caractères'],
      maxlength: [120, 'Le titre ne peut pas dépasser 120 caractères'],
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      trim: true,
      minlength: [10, 'La description doit faire au moins 10 caractères'],
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'],
    },
    type: {
      type: String,
      enum: {
        values: Object.values(AnnonceType),
        message: 'Le type doit être : vente, pret ou demandePret',
      },
      required: [true, 'Le type est requis'],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'La catégorie ne peut pas dépasser 50 caractères'],
    },
    status: {
      type: String,
      enum: Object.values(AnnonceStatus),
      default: AnnonceStatus.DISPONIBLE,
    },
    images: {
      type: [String],
      default: [],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Le propriétaire est requis'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { __v, ...clean } = ret;
        return clean;
      },
    },
  },
);

/* ───────── Index ───────── */

annonceSchema.index({ owner: 1 });
annonceSchema.index({ type: 1 });
annonceSchema.index({ status: 1 });
annonceSchema.index({ category: 1 });
annonceSchema.index({ createdAt: -1 });

/* ───────── Export ───────── */

const Annonce = mongoose.model<IAnnonce>('Annonce', annonceSchema);
export default Annonce;

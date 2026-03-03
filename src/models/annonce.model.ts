import mongoose, { Document, Schema, Types } from 'mongoose';

/* ───────── Types ───────── */

export enum AnnonceCategory {
  LOGEMENT = 'logement',
  COVOITURAGE = 'covoiturage',
  MATERIEL = 'materiel',
  COURS = 'cours',
  AUTRE = 'autre',
}

export enum AnnonceStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  DRAFT = 'draft',
}

/* ───────── Interface ───────── */

export interface IAnnonce extends Document {
  title: string;
  description: string;
  category: AnnonceCategory;
  price?: number;
  author: Types.ObjectId;
  status: AnnonceStatus;
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
    category: {
      type: String,
      enum: Object.values(AnnonceCategory),
      required: [true, 'La catégorie est requise'],
    },
    price: {
      type: Number,
      min: [0, 'Le prix ne peut pas être négatif'],
      default: 0,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'auteur est requis"],
    },
    status: {
      type: String,
      enum: Object.values(AnnonceStatus),
      default: AnnonceStatus.ACTIVE,
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

annonceSchema.index({ author: 1 });
annonceSchema.index({ category: 1 });
annonceSchema.index({ status: 1 });
annonceSchema.index({ createdAt: -1 });

/* ───────── Export ───────── */

const Annonce = mongoose.model<IAnnonce>('Annonce', annonceSchema);
export default Annonce;

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { EMAIL_REGEX } from '../utils/constants';

/* ───────── Interface ───────── */

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
  confirmationToken?: string;
  confirmationExpires?: Date;
  favorites: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/* ───────── Schéma ───────── */

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
      minlength: [2, 'Le prénom doit faire au moins 2 caractères'],
      maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères'],
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      minlength: [2, 'Le nom doit faire au moins 2 caractères'],
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "Seules les adresses @etu.univ-amu.fr sont acceptées"],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [8, 'Le mot de passe doit faire au moins 8 caractères'],
      select: false, // Ne pas renvoyer le password par défaut dans les queries
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    confirmationToken: {
      type: String,
      select: false,
    },
    confirmationExpires: {
      type: Date,
      select: false,
    },
    favorites: {
      type: [Schema.Types.ObjectId],
      ref: 'Annonce',
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, __v, confirmationToken, confirmationExpires, ...clean } = ret;
        return clean;
      },
    },
  },
);

/* ───────── Middleware pre-save : hash du mot de passe ───────── */

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ───────── Méthode d'instance : comparaison de mot de passe ───────── */

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ───────── Index ───────── */

userSchema.index({ email: 1 });

/* ───────── Export ───────── */

const User = mongoose.model<IUser>('User', userSchema);
export default User;

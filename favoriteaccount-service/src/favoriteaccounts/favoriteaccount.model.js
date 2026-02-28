import { Schema, model } from 'mongoose';

const favoriteAccountSchema = new Schema(
  {
    userId: {
      type: String, 
      required: true,
      index: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    alias: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Evita duplicados por usuario
favoriteAccountSchema.index(
  { userId: 1, accountNumber: 1 },
  { unique: true }
);

export default model('FavoriteAccount', favoriteAccountSchema);
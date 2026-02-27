import mongoose from 'mongoose';

import { Schema, model } from 'mongoose';

const favoriteAccountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    accountNumber: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Evita que un usuario agregue la misma cuenta más de una vez
favoriteAccountSchema.index(
  { userId: 1, accountNumber: 1 },
  { unique: true }
);

export default model('FavoriteAccount', favoriteAccountSchema);
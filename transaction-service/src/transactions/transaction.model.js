'use strict';

import { Schema, model } from 'mongoose';

// Tipos de transacción soportados
export const TRANSACTION_TYPES = {
    DEPOSIT: 'DEPOSIT',
    WITHDRAW: 'WITHDRAW',
    TRANSFER: 'TRANSFER'
};

const transactionSchema = new Schema(
    {
        accountId: {
            type: Schema.Types.ObjectId,
            ref: 'Account',
            required: true
        },

        type: {
            type: String,
            required: true,
            enum: Object.values(TRANSACTION_TYPES)
        },

        amount: {
            type: Number,
            required: true,
            min: 0.01
        },

        previousBalance: {
            type: Number,
            required: true
        },

        newBalance: {
            type: Number,
            required: true
        },

        description: {
            type: String,
            trim: true
        },

        accountNumber: {
            type: String,
            required: true
        },

        // Solo aplica para transferencias
        toAccountNumber: {
            type: String,
            trim: true
        },

        status: {
            type: String,
            enum: ['COMPLETADA', 'REVERTIDA'],
            default: 'COMPLETADA'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default model('Transaction', transactionSchema);
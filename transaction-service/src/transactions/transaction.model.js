'use strict';

import { Schema, model } from 'mongoose';

export const TRANSACTION_TYPES = {
    DEPOSIT: 'DEPOSITO',
    WITHDRAW: 'RETIRO',
    TRANSFER_IN: 'TRANSFERENCIA_ENTRADA',
    TRANSFER_OUT: 'TRANSFERENCIA_SALIDA'
};

const transactionSchema = new Schema(
    {
        accountId: {
            type: Schema.Types.ObjectId,
            ref: 'Account',
            required: [true, 'La cuenta es requerida'],
            index: true
        },

        type: {
            type: String,
            required: [true, 'El tipo de movimiento es requerido'],
            enum: {
                values: Object.values(TRANSACTION_TYPES),
                message: 'Tipo de transacción no válido'
            }
        },

        amount: {
            type: Number,
            required: [true, 'El monto es requerido'],
            min: [0.01, 'El monto debe ser mayor a 0']
        },

        previousBalance: {
            type: Number,
            required: true,
            min: 0
        },

        newBalance: {
            type: Number,
            required: true,
            min: 0
        },

        description: {
            type: String,
            trim: true,
            maxLength: [150, 'La descripción no puede exceder los 150 caracteres']
        },

        reference: {
            type: String,
            trim: true,
            maxLength: 50
        },

        status: {
            type: String,
            enum: {
                values: ['COMPLETADA', 'RECHAZADA', 'PENDIENTE'],
                message: 'Estado de transacción no válido'
            },
            default: 'COMPLETADA'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

transactionSchema.index({ accountId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });

export default model('Transaction', transactionSchema);

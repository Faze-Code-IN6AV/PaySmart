'use strict';

import { Schema, model } from 'mongoose';

const purchaseSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'El producto es requerido.']
        },
        userId: {
            type: String,
            required: [true, 'El usuario es requerido.'],
            trim: true
        },
        accountId: {
            type: String,
            required: [true, 'La cuenta es requerida.'],
            trim: true
        },
        amount: {
            type: Number,
            required: [true, 'El monto es requerido.'],
            min: [0, 'El monto no puede ser negativo.']
        },
        currency: {
            type: String,
            enum: {
                values: ['GTQ'],
                message: 'Moneda no válida.'
            },
            default: 'GTQ'
        },
        status: {
            type: String,
            enum: {
                values: ['PENDING', 'COMPLETED', 'FAILED'],
                message: 'Estado de compra no válido.'
            },
            default: 'PENDING'
        },
        transactionId: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

/* Índices */
purchaseSchema.index({ userId: 1 });
purchaseSchema.index({ accountId: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ userId: 1, status: 1 });

export default model('Purchase', purchaseSchema);
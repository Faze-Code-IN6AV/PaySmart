'use strict';

import { Schema, model } from 'mongoose';

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre del producto es requerido.'],
            trim: true,
            maxLength: [100, 'El nombre no puede exceder los 100 caracteres.']
        },
        description: {
            type: String,
            trim: true,
            maxLength: [300, 'La descripción no puede exceder los 300 caracteres.']
        },
        price: {
            type: Number,
            required: [true, 'El precio es requerido.'],
            min: [0, 'El precio no puede ser negativo.']
        },
        currency: {
            type: String,
            enum: {
                values: ['GTQ'],
                message: 'Moneda no válida.'
            },
            default: 'GTQ'
        },
        type: {
            type: String,
            required: [true, 'El tipo de producto es requerido. Debe ser SERVICE o PRODUCT.'],
            enum: {
                values: ['SERVICE', 'PRODUCT'],
                message: 'Tipo de producto no válido.'
            }
        },
        // Stock disponible, null significa ilimitado
        stock: {
            type: Number,
            default: null,
            min: [0, 'El stock no puede ser negativo.']
        },
        exclusive: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: {
                values: ['ACTIVO', 'INACTIVO'],
                message: 'Estado del producto no válido.'
            },
            default: 'ACTIVO'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

/* Índices */
productSchema.index({ status: 1 });
productSchema.index({ type: 1 });
productSchema.index({ exclusive: 1 });

export default model('Product', productSchema);
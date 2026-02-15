'use strict';

import { Schema, model } from 'mongoose';

const accountSchema = new Schema(
    {
        accountNumber: {
            type: String,
            required: [true, 'El número de cuenta es requerido.'],
            unique: true,
            trim: true,
            maxLength: [20, 'El número de cuenta no puede exceder los 20 caracteres.'],
        },
        userId: {
            type: String,
            required: [true, 'El usuario es requerido'],
            trim: true
        },
        accountType: {
            type: String,
            required: [true, 'El tipo de cuenta es requerida.'],
            enum: {
                values: ['AHORRO', 'MONETARIA', 'EMPRESARIAL'],
                message: 'Tipo de cuenta no válido.',
            },
        },
        balance: {
            type: Number,
            required: [true, 'El saldo inicial es requerido.'],
            min: [0, 'El saldo no puede ser negativo.'],
            validate: function (value) {
                if(this.accountType === 'AHORRO') return value >= 100
                if(this.accountType === 'MONETARIA') return value >= 200
                if(this.accountType === 'EMPRESARIAL') return value >= 1000
                
                return false
            }, message: 'El monto inicial no cumple con el mínimo requerido para este tipo de cuenta.'
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
                values: ['ACTIVO', 'SUSPENDIDO', 'CERRADO'],
                message: 'Estado no válido'
            },
            default: 'ACTIVO'
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Índices para optimizar búsquedas
accountSchema.index({ userId: 1 })
accountSchema.index({ accountNumber: 1 })
accountSchema.index({ status: 1 })
accountSchema.index({ userId: 1, status: 1 })

export default model('Account', accountSchema);
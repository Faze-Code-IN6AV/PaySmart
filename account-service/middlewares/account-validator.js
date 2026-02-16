import { body, param } from 'express-validator';
import { validateJWT } from './validate-JWT.js';
import { checkValidators } from './check-validators.js';

// Validaciones para crear cuentas (account)
export const validateCreateAccount = [
    validateJWT,
    body('userId')
        .trim()
        .notEmpty()
        .withMessage('El usuario es requerido'),
    body('accountType')
        .notEmpty()
        .withMessage('El tipo de cuenta es requerido.')
        .isIn(['AHORRO', 'MONETARIA', 'EMPRESARIAL'])
        .withMessage('Tipo de cuenta no válida'),
    body('balance')
        .notEmpty()
        .withMessage('El saldo inicial es requerido.')
        .isFloat({ min: 0 })
        .withMessage('El saldo no puede ser negativo.')
        .custom((value, { req }) => {
            const type = req.body.accountType

            if(type === 'AHORRO' && value < 100){
                throw new Error('La cuenta de AHORRO requiere mínimo Q 100.00.')
            }
            if(type === 'MONETARIA' && value < 200){
                throw new Error('La cuenta MONETARIA requiere mínimo Q 200.00.')
            }
            if(type === 'EMPRESARIAL' && value < 1000){
                throw new Error('La cuenta EMPRESARIAL requiere mínimo Q 1000.00.')
            }

            return true
        }),
    body('currency')
        .optional()
        .isIn(['GTQ'])
        .withMessage('Moneda no válida.'),
    checkValidators,
];
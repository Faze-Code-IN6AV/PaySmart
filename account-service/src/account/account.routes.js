import { Router } from 'express';
import { createAccount, getMyAccounts, getBalance, getBalanceInternal, updateBalanceInternal } from './account.controller.js';
import { validateCreateAccount } from '../../middlewares/account-validator.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Account
 *   description: Gestion de cuentas bancarias
 */

/**
 * @swagger
 * /paySmart/v1/account:
 *   post:
 *     tags: [Account]
 *     summary: Crear una nueva cuenta bancaria (Token de un usuario autenticado requerido)
 *     description: Crea una cuenta bancaria asociada al usuario autenticado 'AHORRO', 'MONETARIA', 'EMPRESARIAL'.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountType
 *               - balance
 *             properties:
 *               accountType:
 *                 type: string
 *                 example: SAVINGS
 *               balance:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente.
 *       400:
 *         description: Error al crear la cuenta.
 */
router.post(
    '/',
    validateCreateAccount,
    createAccount
);

/**
 * @swagger
 * /paySmart/v1/account:
 *   get:
 *     tags: [Account]
 *     summary: Obtener todas las cuentas del usuario autenticado
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Lista de cuentas del usuario.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.get(
    '/',
    validateJWT,
    getMyAccounts
);

/**
 * @swagger
 * /paySmart/v1/account/{accountNumber}/balance:
 *   get:
 *     tags: [Account]
 *     summary: Consultar saldo de una cuenta del usuario autenticado
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Numero de la cuenta a consultar
 *     responses:
 *       200:
 *         description: Saldo obtenido exitosamente.
 *       404:
 *         description: Cuenta no encontrada o no pertenece al usuario.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.get(
    '/:accountNumber/balance',
    validateJWT,
    getBalance
);

/**
 * @swagger
 * /paySmart/v1/account/internal/{accountNumber}/balance:
 *   get:
 *     tags: [Account]
 *     summary: Consultar saldo de una cuenta (uso interno entre microservicios)
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Numero de la cuenta a consultar
 *     responses:
 *       200:
 *         description: Saldo obtenido exitosamente.
 *       404:
 *         description: Cuenta no encontrada.
 */
router.get(
    '/internal/:accountNumber/balance',
    getBalanceInternal
);

/**
 * @swagger
 * /paySmart/v1/account/internal/{accountNumber}/balance:
 *   patch:
 *     tags: [Account]
 *     summary: Actualizar saldo de una cuenta (uso interno entre microservicios)
 *     description: Soporta tipo DEPOSIT para sumar y WITHDRAW para restar.
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Numero de la cuenta a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *               type:
 *                 type: string
 *                 enum: [DEPOSIT, WITHDRAW]
 *                 example: DEPOSIT
 *     responses:
 *       200:
 *         description: Saldo actualizado exitosamente.
 *       400:
 *         description: Datos invalidos o fondos insuficientes.
 *       404:
 *         description: Cuenta no encontrada.
 */
router.patch(
    '/internal/:accountNumber/balance',
    updateBalanceInternal
);

export default router;
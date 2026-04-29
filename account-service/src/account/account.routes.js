'use strict';

import { Router } from 'express';
import {  createAccount, getMyAccounts, getBalance, getBalanceInternal, updateBalanceInternal, getAccountsByEmailController, deactivateAccount, activateAccount, suspendAccount} from './account.controller.js';
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

/**
 * @swagger
 * /paySmart/v1/account/admin/user/{email}:
 *   get:
 *     tags: [Account]
 *     summary: Obtener cuentas de un usuario por email (solo ADMIN_ROLE)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email del usuario a consultar
 *     responses:
 *       200:
 *         description: Cuentas del usuario obtenidas exitosamente.
 *       404:
 *         description: No se encontraron cuentas para ese usuario.
 *       401:
 *         description: Token no valido o no proporcionado.
 *       403:
 *         description: No tienes permisos para realizar esta acción.
 */
router.get(
    '/admin/user/:email',
    validateJWT,
    getAccountsByEmailController
);

/**
 * @swagger
 * /paySmart/v1/account/admin/{accountNumber}/deactivate:
 *   patch:
 *     tags: [Account]
 *     summary: Eliminar (cerrar) una cuenta bancaria (solo ADMIN_ROLE)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Numero de la cuenta a eliminar
 *     responses:
 *       200:
 *         description: Cuenta eliminada exitosamente.
 *       400:
 *         description: Error al eliminar la cuenta.
 *       404:
 *         description: Cuenta no encontrada.
 *       401:
 *         description: Token no valido o no proporcionado.
 *       403:
 *         description: No tienes permisos para realizar esta acción.
 */
router.patch(
    '/admin/:accountNumber/deactivate',
    validateJWT,
    deactivateAccount
);

/**
 * @swagger
 * /paySmart/v1/account/admin/{accountNumber}/activate:
 *   patch:
 *     tags: [Account]
 *     summary: Activar una cuenta suspendida (solo ADMIN_ROLE)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Numero de la cuenta a activar
 *     responses:
 *       200:
 *         description: Cuenta activada exitosamente.
 *       400:
 *         description: Error al activar la cuenta.
 *       404:
 *         description: Cuenta no encontrada.
 *       401:
 *         description: Token no valido o no proporcionado.
 *       403:
 *         description: No tienes permisos para realizar esta acción.
 */
router.patch(
    '/admin/:accountNumber/activate',
    validateJWT,
    activateAccount
);

/**
 * @swagger
 * /paySmart/v1/account/admin/{accountNumber}/suspend:
 *   patch:
 *     tags: [Account]
 *     summary: Suspender una cuenta bancaria (solo ADMIN_ROLE)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Numero de la cuenta a suspender
 *     responses:
 *       200:
 *         description: Cuenta suspendida exitosamente.
 *       400:
 *         description: Error al suspender la cuenta.
 *       404:
 *         description: Cuenta no encontrada.
 *       401:
 *         description: Token no valido o no proporcionado.
 *       403:
 *         description: No tienes permisos para realizar esta acción.
 */
router.patch(
    '/admin/:accountNumber/suspend',
    validateJWT,
    suspendAccount
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


export default router;
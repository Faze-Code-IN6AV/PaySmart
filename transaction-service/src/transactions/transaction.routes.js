'use strict';

import { Router } from 'express';
import { depositController, reverseDepositController, transferController, purchaseTransactionController, listTransactionsController, listLastTransactionsController, accountMostMovementsController, accountsAdminOverviewController } from './transaction.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Depositos, transferencias, compras y consulta de historial (Necesita token de usuario)
 */

/**
 * @swagger
 * /paySmart/v1/transaction/deposit:
 *   post:
 *     tags: [Transaction]
 *     summary: Realizar un deposito en una cuenta 
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountNumber
 *               - amount
 *             properties:
 *               accountNumber:
 *                 type: string
 *                 example: ACC-000123
 *               amount:
 *                 type: number
 *                 example: 1000
 *               description:
 *                 type: string
 *                 example: Deposito de nomina
 *     responses:
 *       201:
 *         description: Deposito realizado exitosamente.
 *       400:
 *         description: Datos incompletos o error al procesar.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.post('/deposit', validateJWT, depositController);

/**
 * @swagger
 * /paySmart/v1/transaction/transfer:
 *   post:
 *     tags: [Transaction]
 *     summary: Realizar una transferencia entre cuentas
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAccountNumber
 *               - toAccountNumber
 *               - amount
 *             properties:
 *               fromAccountNumber:
 *                 type: string
 *                 example: ACC-000123
 *               toAccountNumber:
 *                 type: string
 *                 example: ACC-000456
 *               amount:
 *                 type: number
 *                 example: 500
 *               description:
 *                 type: string
 *                 example: Pago de renta
 *     responses:
 *       201:
 *         description: Transferencia realizada exitosamente.
 *       400:
 *         description: Datos incompletos, fondos insuficientes o error al procesar.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.post('/transfer', validateJWT, transferController);

/**
 * @swagger
 * /paySmart/v1/transaction/purchase:
 *   post:
 *     tags: [Transaction]
 *     summary: Registrar una transaccion de compra
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountNumber
 *               - amount
 *             properties:
 *               accountNumber:
 *                 type: string
 *                 example: ACC-000123
 *               amount:
 *                 type: number
 *                 example: 250
 *               description:
 *                 type: string
 *                 example: Compra de seguro de vida
 *     responses:
 *       201:
 *         description: Transaccion de compra registrada exitosamente.
 *       400:
 *         description: Datos incompletos o error al procesar.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.post('/purchase', validateJWT, purchaseTransactionController);

/**
 * @swagger
 * /paySmart/v1/transaction/reverse/{transactionId}:
 *   put:
 *     tags: [Transaction]
 *     summary: Revertir un deposito
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transaccion a revertir
 *     responses:
 *       200:
 *         description: Deposito revertido exitosamente.
 *       400:
 *         description: Error al revertir el deposito.
 *       404:
 *         description: Transaccion no encontrada.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.put('/reverse/:transactionId', validateJWT, reverseDepositController);

/**
 * @swagger
 * /paySmart/v1/transaction/internal/stats/accounts-most-movements:
 *   get:
 *     tags: [Transaction]
 *     summary: Estadisticas de cuentas con mas movimientos (uso interno)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de los resultados
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Numero maximo de resultados
 *     responses:
 *       200:
 *         description: Estadisticas generadas exitosamente.
 *       400:
 *         description: Error al generar las estadisticas.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.get('/internal/stats/accounts-most-movements', validateJWT, accountMostMovementsController);

/**
 * @swagger
 * /paySmart/v1/transaction/internal/admin/accounts-overview:
 *   get:
 *     tags: [Transaction]
 *     summary: Resumen general de cuentas para administrador (ADMIN)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Numero de cuentas a incluir en el resumen
 *     responses:
 *       200:
 *         description: Resumen generado exitosamente.
 *       400:
 *         description: Error al generar el resumen.
 *       401:
 *         description: Token no valido o no proporcionado.
 *       403:
 *         description: Se requiere rol ADMIN_ROLE.
 */
router.get('/internal/admin/accounts-overview', validateJWT, accountsAdminOverviewController);

/**
 * @swagger
 * /paySmart/v1/transaction/{accountNumber}:
 *   get:
 *     tags: [Transaction]
 *     summary: Obtener historial completo de transacciones de una cuenta
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Numero de cuenta
 *     responses:
 *       200:
 *         description: Historial de transacciones obtenido exitosamente.
 *       500:
 *         description: Error interno del servidor.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.get('/:accountNumber', validateJWT, listTransactionsController);

/**
 * @swagger
 * /paySmart/v1/transaction/{accountNumber}/last:
 *   get:
 *     tags: [Transaction]
 *     summary: Obtener las ultimas 5 transacciones de una cuenta
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Numero de cuenta
 *     responses:
 *       200:
 *         description: Ultimas transacciones obtenidas exitosamente.
 *       500:
 *         description: Error interno del servidor.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.get('/:accountNumber/last', validateJWT, listLastTransactionsController);

export default router;
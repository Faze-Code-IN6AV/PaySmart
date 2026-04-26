'use strict'

import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';
import * as purchaseController from './purchase.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Purchase
 *   description: Gestion de compras de productos
 */

/**
 * @swagger
 * /paySmart/v1/purchases:
 *   post:
 *     tags: [Purchase]
 *     summary: Crear una compra
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - accountNumber
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d1
 *               accountNumber:
 *                 type: string
 *                 example: ACC-000123
 *     responses:
 *       201:
 *         description: Compra creada exitosamente.
 *       400:
 *         description: Error al procesar la compra.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.post(
  '/',
  validateJWT,
  purchaseController.create
);

/**
 * @swagger
 * /paySmart/v1/purchases/my:
 *   get:
 *     tags: [Purchase]
 *     summary: Obtener compras del usuario autenticado
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Lista de compras del usuario.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.get(
  '/my',
  validateJWT,
  purchaseController.getMine
);

/**
 * @swagger
 * /paySmart/v1/purchases:
 *   get:
 *     tags: [Purchase]
 *     summary: Obtener todas las compras (ADMIN)
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Lista completa de compras.
 *       401:
 *         description: Token no valido o no proporcionado.
 *       403:
 *         description: Se requiere rol ADMIN_ROLE.
 */
router.get(
  '/',
  validateJWT,
  requireRole('ADMIN_ROLE'),
  purchaseController.getAll
);

/**
 * @swagger
 * /paySmart/v1/purchases/{id}:
 *   get:
 *     tags: [Purchase]
 *     summary: Obtener una compra por ID (ADMIN)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la compra
 *     responses:
 *       200:
 *         description: Compra encontrada.
 *       404:
 *         description: Compra no encontrada.
 *       401:
 *         description: Token no valido o no proporcionado.
 *       403:
 *         description: Se requiere rol ADMIN_ROLE.
 */
router.get(
  '/:id',
  validateJWT,
  requireRole('ADMIN_ROLE'),
  purchaseController.getById
);

export default router;
import { Router } from 'express';
import {
  createFavorite,
  getFavorites,
  editFavorite,
  removeFavorite,
  deactivateFavorite,
  activateFavorite,
  quickTransfer
} from './favoriteAccount.controller.js';

import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: FavoriteAccount
 *   description: Gestion de cuentas favoritas y transferencias rapidas (necesita token de usuario)
 */

/**
 * @swagger
 * /paySmart/v1/favoriteAccounts:
 *   post:
 *     tags: [FavoriteAccount]
 *     summary: Agregar una cuenta favorita
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
 *             properties:
 *               accountNumber:
 *                 type: string
 *                 example: ACC-000123
 *               alias:
 *                 type: string
 *                 example: Cuenta de Juan
 *     responses:
 *       201:
 *         description: Cuenta favorita agregada exitosamente.
 *       400:
 *         description: Error al agregar la cuenta favorita.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.post('/', validateJWT, createFavorite);

/**
 * @swagger
 * /paySmart/v1/favoriteAccounts:
 *   get:
 *     tags: [FavoriteAccount]
 *     summary: Listar cuentas favoritas del usuario autenticado
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Lista de cuentas favoritas.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.get('/', validateJWT, getFavorites);

/**
 * @swagger
 * /paySmart/v1/favoriteAccounts/{id}:
 *   put:
 *     tags: [FavoriteAccount]
 *     summary: Editar el alias de una cuenta favorita
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cuenta favorita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alias
 *             properties:
 *               alias:
 *                 type: string
 *                 example: Mi cuenta principal
 *     responses:
 *       200:
 *         description: Cuenta favorita actualizada exitosamente.
 *       400:
 *         description: Error al actualizar la cuenta favorita.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.put('/:id', validateJWT, editFavorite);

/**
 * @swagger
 * /paySmart/v1/favoriteAccounts/{id}:
 *   delete:
 *     tags: [FavoriteAccount]
 *     summary: Eliminar una cuenta favorita (soft-delete)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cuenta favorita
 *     responses:
 *       200:
 *         description: Cuenta favorita eliminada exitosamente.
 *       400:
 *         description: Error al eliminar la cuenta favorita.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.delete('/:id', validateJWT, removeFavorite);

/**
 * @swagger
 * /paySmart/v1/favoriteAccounts/{id}/deactivate:
 *   patch:
 *     tags: [FavoriteAccount]
 *     summary: Desactivar una cuenta favorita
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cuenta favorita
 *     responses:
 *       200:
 *         description: Cuenta favorita desactivada exitosamente.
 *       400:
 *         description: Error al desactivar la cuenta favorita.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.patch('/:id/deactivate', validateJWT, deactivateFavorite);

/**
 * @swagger
 * /paySmart/v1/favoriteAccounts/{id}/activate:
 *   patch:
 *     tags: [FavoriteAccount]
 *     summary: Activar una cuenta favorita
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cuenta favorita
 *     responses:
 *       200:
 *         description: Cuenta favorita activada exitosamente.
 *       400:
 *         description: Error al activar la cuenta favorita.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.patch('/:id/activate', validateJWT, activateFavorite);

/**
 * @swagger
 * /paySmart/v1/favoriteAccounts/{id}/transfer:
 *   post:
 *     tags: [FavoriteAccount]
 *     summary: Realizar una transferencia rapida a una cuenta favorita
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cuenta favorita destino
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAccountNumber
 *               - amount
 *             properties:
 *               fromAccountNumber:
 *                 type: string
 *                 example: ACC-000456
 *               amount:
 *                 type: number
 *                 example: 200
 *               description:
 *                 type: string
 *                 example: Pago de deuda
 *     responses:
 *       200:
 *         description: Transferencia realizada exitosamente.
 *       400:
 *         description: Error al realizar la transferencia.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.post('/:id/transfer', validateJWT, quickTransfer);

export default router;
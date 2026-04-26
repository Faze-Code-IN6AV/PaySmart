'use strict';

import { Router } from 'express';
import { createProduct, getAllProducts, getAvailableProducts, getProductById, updateProduct, disableProduct, enableProduct } from './product.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Gestion de productos (ADMIN) y consulta de productos disponibles
 */

/**
 * @swagger
 * /paySmart/v1/products/available/list:
 *   get:
 *     tags: [Product]
 *     summary: Obtener productos disponibles
 *     description: Retorna los productos activos. Accesible por cualquier usuario autenticado.
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Lista de productos disponibles.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.get('/available/list', validateJWT, getAvailableProducts);

/**
 * @swagger
 * /paySmart/v1/products:
 *   post:
 *     tags: [Product]
 *     summary: Crear un producto (ADMIN)
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Seguro de vida
 *               description:
 *                 type: string
 *                 example: Cobertura completa anual
 *               price:
 *                 type: number
 *                 example: 1500.00
 *     responses:
 *       201:
 *         description: Producto creado exitosamente.
 *       400:
 *         description: Error al crear el producto.
 *       401:
 *         description: Token no valido o no proporcionado.
 *       403:
 *         description: Se requiere rol ADMIN_ROLE.
 */
router.post('/', validateJWT, requireRole('ADMIN_ROLE'), createProduct);

/**
 * @swagger
 * /paySmart/v1/products:
 *   get:
 *     tags: [Product]
 *     summary: Obtener todos los productos (ADMIN)
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Lista completa de productos.
 *       401:
 *         description: Token no valido o no proporcionado.
 *       403:
 *         description: Se requiere rol ADMIN_ROLE.
 */
router.get('/', validateJWT, requireRole('ADMIN_ROLE'), getAllProducts);

/**
 * @swagger
 * /paySmart/v1/products/{id}:
 *   get:
 *     tags: [Product]
 *     summary: Obtener un producto por ID (ADMIN)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado.
 *       404:
 *         description: Producto no encontrado.
 *       401:
 *         description: Token no valido o no proporcionado.
 *       403:
 *         description: Se requiere rol ADMIN_ROLE.
 */
router.get('/:id', validateJWT, requireRole('ADMIN_ROLE'), getProductById);

/**
 * @swagger
 * /paySmart/v1/products/{id}:
 *   patch:
 *     tags: [Product]
 *     summary: Actualizar un producto (ADMIN)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente.
 *       404:
 *         description: Producto no encontrado.
 *       401:
 *         description: Token no valido o no proporcionado.
 *       403:
 *         description: Se requiere rol ADMIN_ROLE.
 */
router.patch('/:id', validateJWT, requireRole('ADMIN_ROLE'), updateProduct);

/**
 * @swagger
 * /paySmart/v1/products/{id}:
 *   delete:
 *     tags: [Product]
 *     summary: Desactivar un producto (ADMIN)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto desactivado correctamente.
 *       404:
 *         description: Producto no encontrado.
 *       401:
 *         description: Token no valido o no proporcionado.
 *       403:
 *         description: Se requiere rol ADMIN_ROLE.
 */
router.delete('/:id', validateJWT, requireRole('ADMIN_ROLE'), disableProduct);

/**
 * @swagger
 * /paySmart/v1/products/{id}/activate:
 *   patch:
 *     tags: [Product]
 *     summary: Activar un producto desactivado (ADMIN)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto activado correctamente.
 *       404:
 *         description: Producto no encontrado.
 *       401:
 *         description: Token no valido o no proporcionado.
 *       403:
 *         description: Se requiere rol ADMIN_ROLE.
 */
router.patch('/:id/activate', validateJWT, requireRole('ADMIN_ROLE'), enableProduct);

export default router;
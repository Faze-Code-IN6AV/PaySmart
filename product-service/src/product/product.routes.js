'use strict';

import { Router } from 'express';
import { createProduct, getAllProducts, getAvailableProducts, getProductById, updateProduct, disableProduct, enableProduct  } from './product.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';

const router = Router();

// Ruta pública para clientes 
router.get('/available/list', validateJWT, getAvailableProducts);

// ADMIN - CRUD
router.post('/', validateJWT, requireRole('ADMIN_ROLE'), createProduct);
router.get('/', validateJWT, requireRole('ADMIN_ROLE'), getAllProducts);
router.get('/:id', validateJWT, requireRole('ADMIN_ROLE'), getProductById);
router.patch('/:id', validateJWT, requireRole('ADMIN_ROLE'), updateProduct);
router.delete('/:id', validateJWT, requireRole('ADMIN_ROLE'), disableProduct);
router.patch('/:id/activate', validateJWT, requireRole('ADMIN_ROLE'), enableProduct);

export default router;
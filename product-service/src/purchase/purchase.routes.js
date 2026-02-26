'use strict'

import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';
import * as purchaseController from './purchase.controller.js';

const router = Router();

router.post(
  '/',
  validateJWT,
  purchaseController.create
);

router.get(
  '/my',
  validateJWT,
  purchaseController.getMine
);

router.get(
  '/',
  validateJWT,
  requireRole('ADMIN_ROLE'),
  purchaseController.getAll
);

router.get(
  '/:id',
  validateJWT,
  requireRole('ADMIN_ROLE'),
  purchaseController.getById
);

export default router;
'use strict';

import { Router } from 'express';
import { depositController, reverseDepositController, transferController, purchaseTransactionController, listTransactionsController, listLastTransactionsController, accountMostMovementsController, accountsAdminOverviewController } from './transaction.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

// Rutas de transacciones
router.post('/deposit', validateJWT, depositController);
router.post('/transfer', validateJWT, transferController);
router.post('/purchase', validateJWT, purchaseTransactionController);
router.put('/reverse/:transactionId', validateJWT, reverseDepositController);

// Rutas internas - deben ir ANTES de /:accountNumber para que Express no las confunda
router.get('/internal/stats/accounts-most-movements', validateJWT, accountMostMovementsController);
router.get('/internal/admin/accounts-overview', validateJWT, accountsAdminOverviewController);

// Rutas de historial
router.get('/:accountNumber', validateJWT, listTransactionsController);
router.get('/:accountNumber/last', validateJWT, listLastTransactionsController);

export default router;
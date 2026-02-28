'use strict';

import { Router } from 'express';
import { depositController, purchaseTransactionController, reverseDepositController, listTransactionsController, listLastTransactionsController } from './transaction.controller.js';
import { transferController, accountMostMovementsController } from './transaction.controller.js';
import { middleware } from '../../middlewares/validate-JWT.js';

const router = Router();

router.post('/deposit', middleware, depositController);
router.post('/transfer', middleware, transferController);
router.post('/purchase', middleware, purchaseTransactionController);
router.put('/reverse/:transactionId', middleware, reverseDepositController);

router.get('/internal/stats/accounts-most-movements', middleware, accountMostMovementsController);

router.get('/:accountNumber', middleware, listTransactionsController);
router.get('/:accountNumber/last', middleware, listLastTransactionsController);

export default router;
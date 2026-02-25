'use strict';

import { Router } from 'express';
import { depositController, reverseDepositController, listTransactionsController, listLastTransactionsController } from './transaction.controller.js';
import { transferController } from './transaction.controller.js';
import { middleware } from '../../middlewares/validate-JWT.js';

const router = Router();

router.post('/deposit', middleware, depositController);
router.post('/transfer', middleware, transferController);
router.put('/reverse/:transactionId', middleware, reverseDepositController);
router.get('/:accountNumber', middleware, listTransactionsController);
router.get('/:accountNumber/last', middleware, listLastTransactionsController);

export default router;
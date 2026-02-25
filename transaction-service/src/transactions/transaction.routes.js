'use strict';

import { Router } from 'express';
import { depositController, reverseDepositController, listTransactionsController, listLastTransactionsController } from './transaction.controller.js';
import { transferController } from './transaction.controller.js';

const router = Router();

// Depositar
router.post(
    '/deposit', 
    depositController
);

// Revertir depósito (< 1 min)
router.put(
    '/reverse/:transactionId', 
    reverseDepositController
);

router.post(
    '/transfer', 
    transferController
);

// Historial completo
router.get(
    '/:accountNumber', 
    listTransactionsController
);

// Últimos 5 movimientos
router.get(
    '/:accountNumber/last', 
    listLastTransactionsController
);

export default router;
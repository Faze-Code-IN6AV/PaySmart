'use strict';

import { Router } from 'express';
import { depositController, reverseDepositController } from './transaction.controller.js';
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

export default router;
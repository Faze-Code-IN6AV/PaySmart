import { Router } from 'express';
import { createAccount, getMyAccounts, getBalance } from './account.controller.js';
import { validateCreateAccount } from '../../middlewares/account-validator.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.post(
    '/',
    validateCreateAccount,
    createAccount
);

router.get(
    '/',
    validateJWT,
    getMyAccounts
);

router.get(
    '/:accountNumber/balance',
    validateJWT,
    getBalance
);

export default router;

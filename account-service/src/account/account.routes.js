import { Router } from 'express';
import { createAccount } from './account.controller.js';
import { validateCreateAccount } from '../../middlewares/account-validator.js';

const router = Router();

router.post(
    '/',
    validateCreateAccount,
    createAccount
);

export default router;
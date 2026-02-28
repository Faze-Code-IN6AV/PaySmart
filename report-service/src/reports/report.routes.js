import { Router } from 'express';
import { accountsMostMovementsReportController } from './report.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

// GET /reports/accounts-most-movements?order=asc|desc&limit=10
router.get('/accounts-most-movements', validateJWT, accountsMostMovementsReportController);

export default router;
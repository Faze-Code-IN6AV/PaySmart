import { Router } from 'express';
import { accountsMostMovementsReportController, accountsAdminOverviewController } from './report.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: Reportes y estadisticas de cuentas
 */

/**
 * @swagger
 * /paySmart/v1/reports/accounts-most-movements:
 *   get:
 *     tags: [Report]
 *     summary: Reporte de cuentas con mas movimientos
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de los resultados
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Numero maximo de resultados
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente.
 *       400:
 *         description: Error al generar el reporte.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.get('/accounts-most-movements', validateJWT, accountsMostMovementsReportController);

/**
 * @swagger
 * /paySmart/v1/reports/admin/accounts-overview:
 *   get:
 *     tags: [Report]
 *     summary: Resumen general de cuentas para administrador (ADMIN)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Numero de cuentas a incluir en el resumen
 *     responses:
 *       200:
 *         description: Resumen generado exitosamente.
 *       400:
 *         description: Error al generar el resumen.
 *       401:
 *         description: Token no valido o no proporcionado.
 */
router.get('/admin/accounts-overview', validateJWT, accountsAdminOverviewController);

export default router;
import { Router } from 'express';
import { getLeaveBalanceController } from '../controllers/leave-balance.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * GET /api/v1/employees/:employeeId/leave-balance?year=YYYY
 * Requires Bearer token. EMPLOYEE=own, ADMIN=any.
 */
router.get(
  '/api/v1/employees/:employeeId/leave-balance',
  authenticate,
  getLeaveBalanceController,
);

export default router;

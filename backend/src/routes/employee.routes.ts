import { Router } from 'express';
import { createEmployeeController } from '../controllers/employee.controller';

const router = Router();

/**
 * POST /api/v1/employees
 * Creates a new employee. UUID is auto-generated.
 */
router.post('/api/v1/employees', createEmployeeController);

export default router;

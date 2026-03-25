import { Router } from 'express';
import { createLeaveRecordController } from '../controllers/leave-record.controller';

const router = Router();

/**
 * POST /api/v1/leave-records
 * Creates a new leave record for an employee.
 */
router.post('/api/v1/leave-records', createLeaveRecordController);

export default router;

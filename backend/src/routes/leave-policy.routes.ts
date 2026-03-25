import { Router } from 'express';
import { createLeavePolicyController } from '../controllers/leave-policy.controller';

const router = Router();

/**
 * POST /api/v1/leave-policies
 * Creates a new leave policy.
 */
router.post('/api/v1/leave-policies', createLeavePolicyController);

export default router;

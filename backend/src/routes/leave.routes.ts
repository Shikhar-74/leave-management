import { Router } from 'express';
import {
  applyLeaveController,
  getMyLeavesController,
  getLeaveByIdController,
  cancelLeaveController,
  getAllLeavesController,
  processLeaveController,
} from '../controllers/leave.controller';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

/** POST /api/v1/leaves/apply — requires auth */
router.post('/api/v1/leaves/apply', authenticate, applyLeaveController);

/** GET /api/v1/leaves/all — requires ADMIN */
router.get('/api/v1/leaves/all', authenticate, authorizeRole(['ADMIN']), getAllLeavesController);

/** GET /api/v1/leaves/my — requires auth */
router.get('/api/v1/leaves/my', authenticate, getMyLeavesController);

/** PATCH /api/v1/leaves/:leaveId/process — requires ADMIN */
router.patch('/api/v1/leaves/:leaveId/process', authenticate, authorizeRole(['ADMIN']), processLeaveController);

/** GET /api/v1/leaves/:leaveId — requires auth */
router.get('/api/v1/leaves/:leaveId', authenticate, getLeaveByIdController);

/** PATCH /api/v1/leaves/:leaveId/cancel — requires auth */
router.patch('/api/v1/leaves/:leaveId/cancel', authenticate, cancelLeaveController);

export default router;

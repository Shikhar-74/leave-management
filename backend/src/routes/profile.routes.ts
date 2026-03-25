import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getAllEmployees,
  deleteProfile,
} from '../controllers/profile.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Profile endpoints — all require auth
router.get('/api/v1/profile', authenticate, getProfile);
router.put('/api/v1/profile', authenticate, updateProfile);
router.delete('/api/v1/profile/:employeeId', authenticate, deleteProfile);

// Employee listing — ADMIN only (auth checked, role checked in controller)
router.get('/api/v1/employees', authenticate, getAllEmployees);

export default router;

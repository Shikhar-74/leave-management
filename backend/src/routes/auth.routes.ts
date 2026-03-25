import { Router } from 'express';
import {
  signupController,
  loginController,
  logoutController,
  refreshController,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/** POST /api/v1/auth/signup — open */
router.post('/api/v1/auth/signup', signupController);

/** POST /api/v1/auth/login — open */
router.post('/api/v1/auth/login', loginController);

/** POST /api/v1/auth/logout — requires auth */
router.post('/api/v1/auth/logout', authenticate, logoutController);

/** POST /api/v1/auth/refresh — open (uses refresh token in body) */
router.post('/api/v1/auth/refresh', refreshController);

export default router;

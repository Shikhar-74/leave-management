import { Router } from 'express';
import { addSkill, getSkills } from '../controllers/skill.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/api/v1/employees/:employeeId/skills', authenticate, addSkill);
router.get('/api/v1/employees/:employeeId/skills', authenticate, getSkills);

export default router;

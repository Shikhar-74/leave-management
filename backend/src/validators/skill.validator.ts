import { z } from 'zod';

export const addSkillSchema = z.object({
  skill_name: z.string()
    .trim()
    .min(1, 'skill_name cannot be empty')
    .max(100, 'skill_name must be at most 100 characters'),
  proficiency: z.number()
    .int('proficiency must be an integer')
    .min(1, 'proficiency must be at least 1')
    .max(5, 'proficiency must be at most 5'),
}).strict();

export type AddSkillInput = z.infer<typeof addSkillSchema>;

export const employeeIdParamSchema = z.object({
  employeeId: z.coerce.number().int().positive('employee_id must be a positive integer'),
});

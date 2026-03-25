import { z } from 'zod';

/**
 * Update profile — partial updates allowed, all fields optional.
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email('Invalid email format').max(255).optional(),
  phone_number: z.string().max(20).optional().nullable(),
  designation: z.string().max(100).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  manager_id: z.number().int().positive().optional().nullable(),
  profile_photo_url: z.string().url().max(2048).refine(
    (v) => v.startsWith('https://'),
    { message: 'profile_photo_url must use HTTPS' },
  ).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(50).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country: z.string().max(50).optional().nullable(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional().nullable(),
  marital_status: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'PREFER_NOT_TO_SAY']).optional().nullable(),
  emergency_contact_name: z.string().max(100).optional().nullable(),
  emergency_contact_phone: z.string().max(20).optional().nullable(),
  emergency_contact_relationship: z.string().max(50).optional().nullable(),
  password: z
    .string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, '1 uppercase letter required')
    .regex(/[0-9]/, '1 digit required')
    .regex(/[!@#$%^&*]/, '1 special character required')
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * GET /employees — Admin list with filters.
 */
export const getAllEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  role: z.enum(['EMPLOYEE', 'ADMIN']).optional(),
  department: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  search: z.string().optional(),
  sort_by: z.enum(['created_at', 'name', 'email', 'department', 'joining_date']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export type GetAllEmployeesQuery = z.infer<typeof getAllEmployeesQuerySchema>;

/**
 * DELETE /profile/:employeeId — path param.
 */
export const deleteProfileParamSchema = z.object({
  employeeId: z.coerce.number().int().positive('employee_id must be a positive integer'),
});

/**
 * DELETE query — optional reason.
 */
export const deleteProfileQuerySchema = z.object({
  reason: z.string().max(500).optional(),
});

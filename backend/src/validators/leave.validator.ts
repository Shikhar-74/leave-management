import { z } from 'zod';

/**
 * Apply for leave — request body validation.
 */
export const applyLeaveSchema = z.object({
  start_date: z
    .string({ message: 'start_date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date must be in YYYY-MM-DD format'),
  end_date: z
    .string({ message: 'end_date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'end_date must be in YYYY-MM-DD format'),
  leave_type: z.enum(['SICK', 'CASUAL', 'EARNED'], {
    message: 'leave_type must be SICK, CASUAL, or EARNED',
  }),
  reason: z.string().max(500, 'reason must be at most 500 characters').optional(),
});

export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;

/**
 * GET /leaves/my query parameters.
 */
export const getMyLeavesQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  year: z.coerce.number().int().min(1000).max(9999).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type GetMyLeavesQuery = z.infer<typeof getMyLeavesQuerySchema>;

/**
 * Leave ID path parameter.
 */
export const leaveIdSchema = z.object({
  leaveId: z.coerce
    .number({ message: 'leave_id must be a number' })
    .int('leave_id must be an integer')
    .positive('leave_id must be a positive integer'),
});

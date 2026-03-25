import { z } from 'zod';

/**
 * Validates the request body for creating a leave record.
 * Spec: employee_id (positive INT), leave_date (YYYY-MM-DD), leave_type (SICK|CASUAL|EARNED).
 */
export const createLeaveRecordSchema = z.object({
  employeeId: z.number().int().positive('employee_id must be a positive integer'),
  leaveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  leaveType: z.enum(['SICK', 'CASUAL', 'EARNED'], {
    message: 'leave_type must be SICK, CASUAL, or EARNED',
  }),
});

export type CreateLeaveRecordInput = z.infer<typeof createLeaveRecordSchema>;

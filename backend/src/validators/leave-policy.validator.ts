import { z } from 'zod';

/**
 * Validates the request body for creating a leave policy.
 * Spec: year (4-digit INT), total_leave (INT ≥ 0).
 */
export const createLeavePolicySchema = z.object({
  year: z.number().int('Year must be an integer').min(1000).max(9999, 'Year must be 4 digits'),
  totalLeave: z.number().int('Must be a whole number').min(0, 'total_leave must be ≥ 0'),
});

export type CreateLeavePolicyInput = z.infer<typeof createLeavePolicySchema>;

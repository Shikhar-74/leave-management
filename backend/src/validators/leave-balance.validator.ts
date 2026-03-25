import { z } from 'zod';

/**
 * Validates the leave-balance GET request parameters.
 *
 * Spec rules:
 *  - employee_id: positive integer (from path param)
 *  - year: 4-digit integer, must be current year or up to 2 months ahead
 */
export const leaveBalanceQuerySchema = z.object({
  employeeId: z.coerce
    .number({ message: 'employee_id must be a number' })
    .int('employee_id must be an integer')
    .positive('employee_id must be a positive integer'),

  year: z.coerce
    .number({ message: 'year must be a number' })
    .int('year must be an integer')
    .refine(
      (val) => val >= 1000 && val <= 9999,
      { message: 'year must be a 4-digit number' },
    )
    .refine(
      (val) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Allow current year
        if (val === currentYear) return true;

        // Allow next year only if we are within 2 months
        // e.g. in November (month 10) or December (month 11), next year is valid
        if (val === currentYear + 1 && currentMonth >= 10) return true;

        return false;
      },
      {
        message:
          'year must be the current year, or up to 2 months ahead',
      },
    ),
});

export type LeaveBalanceQuery = z.infer<typeof leaveBalanceQuerySchema>;

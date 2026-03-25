/**
 * Type definitions for the Leave Balance API — per spec.
 */

/** Successful leave balance response. */
export interface LeaveBalanceResponse {
  employee_id: number;
  year: number;
  total_leaves: number;
  leaves_taken: number;
  remaining_leaves: number;
}

/** Standard error response format per spec. */
export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
}

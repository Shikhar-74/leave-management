import { eq, and, sql, inArray } from 'drizzle-orm';
import { db } from '../db';
import { employees, leavePolicy, leaveRecords } from '../db/schema';
import { AppError } from '../middlewares/error-handler';
import type { LeaveBalanceResponse } from '../types/leave-balance.types';

/**
 * Fetches leave balance for an employee in a given year.
 *
 * Only PENDING and APPROVED leave records count toward leaves_taken.
 * CANCELLED and REJECTED are excluded.
 */
export async function getLeaveBalance(
  employeeId: number,
  year: number,
): Promise<LeaveBalanceResponse> {
  // ── 1. Employee lookup ────────────────────────────────────────
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, employeeId),
  });

  if (!employee) {
    throw new AppError(404, 'EMPLOYEE_NOT_FOUND', `No employee found with id ${employeeId}`);
  }

  // ── 2. Leave policy lookup ────────────────────────────────────
  const policy = await db.query.leavePolicy.findFirst({
    where: eq(leavePolicy.year, year),
  });

  if (!policy) {
    throw new AppError(404, 'NO_POLICY_FOR_YEAR', `No leave policy found for year ${year}`);
  }

  const totalLeaves = policy.totalLeave;

  // ── 3. Count leave records (only PENDING + APPROVED) ──────────
  const [result] = await db
    .select({
      count: sql<number>`COUNT(*)::int`,
    })
    .from(leaveRecords)
    .where(
      and(
        eq(leaveRecords.employeeId, employeeId),
        sql`EXTRACT(YEAR FROM ${leaveRecords.leaveDate}::date) = ${year}`,
        inArray(leaveRecords.status, ['PENDING', 'APPROVED']),
      ),
    );

  const leavesTaken = result?.count ?? 0;

  // ── 4. Check data consistency ─────────────────────────────────
  if (leavesTaken > totalLeaves) {
    console.error(
      `⚠️ DATA INTEGRITY ALERT: employee ${employeeId} has taken ${leavesTaken} leaves ` +
        `but policy allows only ${totalLeaves} for year ${year}`,
    );
    throw new AppError(
      422,
      'DATA_INTEGRITY_ERROR',
      `Data inconsistency: leaves taken (${leavesTaken}) exceeds total allowed (${totalLeaves})`,
    );
  }

  // ── 5. Compute & return ───────────────────────────────────────
  const remainingLeaves = totalLeaves - leavesTaken;

  return {
    employee_id: employeeId,
    year,
    total_leaves: totalLeaves,
    leaves_taken: leavesTaken,
    remaining_leaves: remainingLeaves,
  };
}

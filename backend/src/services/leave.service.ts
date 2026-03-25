import { eq, and, sql, inArray, desc } from 'drizzle-orm';
import { db } from '../db';
import { employees, leavePolicy, leaveRecords } from '../db/schema';
import { AppError } from '../middlewares/error-handler';
import type { ApplyLeaveInput, GetMyLeavesQuery } from '../validators/leave.validator';

/**
 * Calculate working days (Mon–Sat) between two dates, excluding Sundays.
 * Returns an array of YYYY-MM-DD date strings for each working day.
 */
function getWorkingDays(startDate: Date, endDate: Date): string[] {
  const days: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    // 0 = Sunday — exclude
    if (current.getDay() !== 0) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      days.push(`${yyyy}-${mm}-${dd}`);
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}

// ── APPLY FOR LEAVE ───────────────────────────────────────────────

export async function applyLeave(employeeId: number, data: ApplyLeaveInput) {
  const startDate = new Date(data.start_date + 'T00:00:00');
  const endDate = new Date(data.end_date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Validate start_date is tomorrow or later
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (startDate < tomorrow) {
    throw new AppError(400, 'PAST_DATE', 'start_date must be tomorrow or later');
  }

  // Validate end_date >= start_date
  if (endDate < startDate) {
    throw new AppError(400, 'INVALID_DATE_RANGE', 'end_date must be on or after start_date');
  }

  // Calculate working days
  const workingDays = getWorkingDays(startDate, endDate);

  if (workingDays.length === 0) {
    throw new AppError(400, 'INVALID_DATE_RANGE', 'Date range contains no working days (Mon-Sat)');
  }

  // Determine the year(s) — for simplicity use start_date year
  const year = startDate.getFullYear();

  // Check leave balance
  const policy = await db.query.leavePolicy.findFirst({
    where: eq(leavePolicy.year, year),
  });

  if (!policy) {
    throw new AppError(404, 'NO_POLICY_FOR_YEAR', `No leave policy found for year ${year}`);
  }

  // Count existing used leaves (PENDING + APPROVED) for this year
  const [balanceResult] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(leaveRecords)
    .where(
      and(
        eq(leaveRecords.employeeId, employeeId),
        sql`EXTRACT(YEAR FROM ${leaveRecords.leaveDate}::date) = ${year}`,
        inArray(leaveRecords.status, ['PENDING', 'APPROVED']),
      ),
    );

  const leavesTaken = balanceResult?.count ?? 0;
  const remainingLeaves = policy.totalLeave - leavesTaken;

  if (workingDays.length > remainingLeaves) {
    throw new AppError(
      422,
      'INSUFFICIENT_BALANCE',
      `Insufficient leave balance. Requested: ${workingDays.length}, Available: ${remainingLeaves}`,
    );
  }

  // Check for conflicts with existing PENDING or APPROVED leaves
  const conflicts = await db
    .select({ id: leaveRecords.id, leaveDate: leaveRecords.leaveDate })
    .from(leaveRecords)
    .where(
      and(
        eq(leaveRecords.employeeId, employeeId),
        inArray(leaveRecords.leaveDate, workingDays),
        inArray(leaveRecords.status, ['PENDING', 'APPROVED']),
      ),
    );

  if (conflicts.length > 0) {
    throw new AppError(
      409,
      'DATE_CONFLICT',
      `Overlapping leave found on date(s): ${conflicts.map((c) => c.leaveDate).join(', ')}`,
    );
  }

  // Insert one row per working day — all share the same applied_at timestamp
  const appliedAt = new Date();

  const insertValues = workingDays.map((day) => ({
    employeeId,
    leaveDate: day,
    leaveType: data.leave_type as 'SICK' | 'CASUAL' | 'EARNED',
    status: 'PENDING' as const,
    reason: data.reason || null,
    appliedAt,
  }));

  const inserted = await db.insert(leaveRecords).values(insertValues).returning();

  // Use the first inserted row's id as the leave_id (group identifier)
  const leaveId = inserted[0].id;

  return {
    leave_id: leaveId,
    employee_id: employeeId,
    start_date: data.start_date,
    end_date: data.end_date,
    leave_type: data.leave_type,
    days_requested: workingDays.length,
    status: 'PENDING',
    reason: data.reason || null,
    applied_at: appliedAt.toISOString(),
  };
}

// ── GET MY LEAVES ─────────────────────────────────────────────────

export async function getMyLeaves(employeeId: number, query: GetMyLeavesQuery) {
  const { page, limit } = query;
  const offset = (page - 1) * limit;
  const year = query.year || new Date().getFullYear();

  // Build conditions
  const conditions = [
    eq(leaveRecords.employeeId, employeeId),
    sql`EXTRACT(YEAR FROM ${leaveRecords.leaveDate}::date) = ${year}`,
  ];

  if (query.status) {
    conditions.push(eq(leaveRecords.status, query.status));
  }

  // We need to group by leave application (same applied_at + employee_id).
  // For simplicity, we'll return individual records grouped by their first ID.
  // Actually, per spec, each "leave" is a group of records with the same applied_at.
  // Let's query distinct leave applications.

  const allRecords = await db
    .select()
    .from(leaveRecords)
    .where(and(...conditions))
    .orderBy(desc(leaveRecords.appliedAt));

  // Group records by applied_at timestamp to form leave applications
  const leaveGroups = new Map<string, typeof allRecords>();

  for (const record of allRecords) {
    const key = `${record.appliedAt.toISOString()}_${record.leaveType}`;
    if (!leaveGroups.has(key)) {
      leaveGroups.set(key, []);
    }
    leaveGroups.get(key)!.push(record);
  }

  const leaves = Array.from(leaveGroups.values()).map((group) => {
    const sorted = group.sort(
      (a, b) => new Date(a.leaveDate).getTime() - new Date(b.leaveDate).getTime(),
    );
    return {
      leave_id: sorted[0].id,
      start_date: sorted[0].leaveDate,
      end_date: sorted[sorted.length - 1].leaveDate,
      leave_type: sorted[0].leaveType,
      days_requested: sorted.length,
      status: sorted[0].status,
    };
  });

  // Apply pagination
  const total = leaves.length;
  const paginated = leaves.slice(offset, offset + limit);

  return {
    total,
    page,
    limit,
    leaves: paginated,
  };
}

// ── GET SINGLE LEAVE DETAIL ───────────────────────────────────────

export async function getLeaveById(leaveId: number, requesterId: number, requesterRole: string) {
  // Find the record by ID
  const record = await db.query.leaveRecords.findFirst({
    where: eq(leaveRecords.id, leaveId),
  });

  if (!record) {
    throw new AppError(404, 'LEAVE_NOT_FOUND', `No leave found with id ${leaveId}`);
  }

  // Authorization
  if (requesterRole === 'EMPLOYEE' && record.employeeId !== requesterId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only view your own leaves');
  }

  // Get all records from the same application group
  const groupRecords = await db
    .select()
    .from(leaveRecords)
    .where(
      and(
        eq(leaveRecords.employeeId, record.employeeId),
        eq(leaveRecords.appliedAt, record.appliedAt),
        eq(leaveRecords.leaveType, record.leaveType),
      ),
    );

  const sorted = groupRecords.sort(
    (a, b) => new Date(a.leaveDate).getTime() - new Date(b.leaveDate).getTime(),
  );

  return {
    leave_id: sorted[0].id,
    employee_id: record.employeeId,
    start_date: sorted[0].leaveDate,
    end_date: sorted[sorted.length - 1].leaveDate,
    leave_type: record.leaveType,
    days_requested: sorted.length,
    status: record.status,
    reason: record.reason,
    applied_at: record.appliedAt.toISOString(),
  };
}

// ── CANCEL LEAVE ──────────────────────────────────────────────────

export async function cancelLeave(leaveId: number, requesterId: number, requesterRole: string) {
  // Find the record
  const record = await db.query.leaveRecords.findFirst({
    where: eq(leaveRecords.id, leaveId),
  });

  if (!record) {
    throw new AppError(404, 'LEAVE_NOT_FOUND', `No leave found with id ${leaveId}`);
  }

  // Authorization
  if (requesterRole === 'EMPLOYEE' && record.employeeId !== requesterId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only cancel your own leaves');
  }

  // Check if already cancelled
  if (record.status === 'CANCELLED') {
    throw new AppError(409, 'ALREADY_CANCELLED', 'Leave is already cancelled');
  }

  // Only PENDING can be cancelled
  if (record.status !== 'PENDING') {
    throw new AppError(
      400,
      'INVALID_STATUS',
      `Cannot cancel a leave with status ${record.status}. Only PENDING leaves can be cancelled`,
    );
  }

  // Cancel all records from the same application group
  await db
    .update(leaveRecords)
    .set({ status: 'CANCELLED' })
    .where(
      and(
        eq(leaveRecords.employeeId, record.employeeId),
        eq(leaveRecords.appliedAt, record.appliedAt),
        eq(leaveRecords.leaveType, record.leaveType),
      ),
    );

  return {
    leave_id: leaveId,
    status: 'CANCELLED',
    message: 'Leave cancelled successfully',
  };
}

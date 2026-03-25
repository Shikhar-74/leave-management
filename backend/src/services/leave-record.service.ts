import { eq } from 'drizzle-orm';
import { db } from '../db';
import { employees, leaveRecords } from '../db/schema';
import { AppError } from '../middlewares/error-handler';
import type { CreateLeaveRecordInput } from '../validators/leave-record.validator';

/**
 * Inserts a new leave record into the database.
 * Validates that the referenced employee exists before inserting.
 */
export async function createLeaveRecord(data: CreateLeaveRecordInput) {
  // Verify employee exists
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, data.employeeId),
  });

  if (!employee) {
    throw new AppError(404, 'EMPLOYEE_NOT_FOUND', `No employee found with id ${data.employeeId}`);
  }

  const [created] = await db.insert(leaveRecords).values(data).returning();
  return created;
}

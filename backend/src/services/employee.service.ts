import { db } from '../db';
import { employees } from '../db/schema';
import { AppError } from '../middlewares/error-handler';
import type { CreateEmployeeInput } from '../validators/employee.validator';

/**
 * Inserts a new employee into the database.
 * This is a utility/seed route — signup is the primary way to create employees.
 * Uses a placeholder password hash since this route doesn't take a password.
 */
export async function createEmployee(data: CreateEmployeeInput) {
  try {
    const [created] = await db
      .insert(employees)
      .values({
        ...data,
        passwordHash: 'PLACEHOLDER_NOT_FOR_LOGIN',
      })
      .returning();
    return created;
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === '23505'
    ) {
      throw new AppError(409, 'DUPLICATE_EMAIL', 'An employee with this email already exists');
    }
    throw error;
  }
}

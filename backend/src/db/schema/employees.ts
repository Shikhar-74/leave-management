import { pgTable, serial, varchar, boolean, integer, timestamp, date } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Role enum — EMPLOYEE or ADMIN.
 */
export const roleEnum = pgEnum('role', ['EMPLOYEE', 'ADMIN']);

/**
 * employees table — core employee identity, auth state, and basic profile.
 */
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').default('EMPLOYEE').notNull(),
  department: varchar('department', { length: 100 }),
  joiningDate: date('joining_date'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  designation: varchar('designation', { length: 100 }),
  managerId: integer('manager_id'),
  isActive: boolean('is_active').default(true).notNull(),
  failedAttempts: integer('failed_attempts').default(0).notNull(),
  lockedUntil: timestamp('locked_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

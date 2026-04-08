import { pgTable, serial, integer, date, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';
import { employees } from './employees';

/**
 * leave_type enum — restricts leave records to these three types.
 */
export const leaveTypeEnum = pgEnum('leave_type', ['SICK', 'CASUAL', 'EARNED']);

/**
 * leave_status enum — tracks lifecycle of each leave record.
 */
export const leaveStatusEnum = pgEnum('leave_status', [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
]);

/**
 * leave_records table — individual leave entries (one row = one day of leave).
 *
 * Indexes:
 *  - idx_leave_records_emp_date(employee_id, leave_date) — primary query path
 *  - idx_leave_records_status(status) — for filtering by leave status
 */
export const leaveRecords = pgTable(
  'leave_records',
  {
    id: serial('id').primaryKey(),
    employeeId: integer('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    leaveDate: date('leave_date').notNull(),
    leaveType: leaveTypeEnum('leave_type').notNull(),
    status: leaveStatusEnum('leave_status').default('PENDING').notNull(),
    reason: varchar('reason', { length: 500 }),
    adminRemark: varchar('admin_remark', { length: 500 }),
    appliedAt: timestamp('applied_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_leave_records_emp_date').on(table.employeeId, table.leaveDate),
    index('idx_leave_records_status').on(table.status),
  ],
);

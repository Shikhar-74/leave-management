import { pgTable, serial, integer, varchar, json, timestamp, index } from 'drizzle-orm/pg-core';
import { employees } from './employees';

/**
 * audit_logs table — tracks profile updates and sensitive operations.
 *
 * - employee_id: who triggered the action (CASCADE DELETE)
 * - target_employee_id: whose profile was affected (SET NULL on delete)
 */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    employeeId: integer('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    actionType: varchar('action_type', { length: 50 }).notNull(),
    targetEmployeeId: integer('target_employee_id')
      .references(() => employees.id, { onDelete: 'set null' }),
    changes: json('changes'),
    reason: varchar('reason', { length: 500 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_audit_logs_employee_id').on(table.employeeId),
    index('idx_audit_logs_target').on(table.targetEmployeeId),
    index('idx_audit_logs_action_type').on(table.actionType),
    index('idx_audit_logs_created_at').on(table.createdAt),
  ],
);

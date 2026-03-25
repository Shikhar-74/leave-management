/**
 * Schema barrel export.
 * Re-exports all tables, enums, and relations for the Drizzle ORM instance.
 */
import { relations } from 'drizzle-orm';
import { employees, roleEnum } from './employees';
import { leavePolicy } from './leave-policy';
import { leaveRecords, leaveTypeEnum, leaveStatusEnum } from './leave-records';
import { refreshTokens } from './refresh-tokens';

// ── Re-export tables & enums ────────────────────────────────────
export {
  employees,
  roleEnum,
  leavePolicy,
  leaveRecords,
  leaveTypeEnum,
  leaveStatusEnum,
  refreshTokens,
};

// ── Relations ───────────────────────────────────────────────────

/** An employee has many leave records. */
export const employeesRelations = relations(employees, ({ many }) => ({
  leaveRecords: many(leaveRecords),
  refreshTokens: many(refreshTokens),
}));

/** A leave record belongs to one employee. */
export const leaveRecordsRelations = relations(leaveRecords, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveRecords.employeeId],
    references: [employees.id],
  }),
}));

/** A refresh token belongs to one employee. */
export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  employee: one(employees, {
    fields: [refreshTokens.employeeId],
    references: [employees.id],
  }),
}));

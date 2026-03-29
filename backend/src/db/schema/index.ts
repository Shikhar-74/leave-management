/**
 * Schema barrel export.
 * Re-exports all tables, enums, and relations for the Drizzle ORM instance.
 */
import { relations } from 'drizzle-orm';
import { employees, roleEnum } from './employees';
import { leavePolicy } from './leave-policy';
import { leaveRecords, leaveTypeEnum, leaveStatusEnum } from './leave-records';
import { refreshTokens } from './refresh-tokens';
import { employeeProfiles, genderEnum, maritalStatusEnum } from './employee-profiles';
import { auditLogs } from './audit-logs';
import { employeeSkills } from './employee-skills';

// ── Re-export tables & enums ────────────────────────────────────
export {
  employees,
  roleEnum,
  leavePolicy,
  leaveRecords,
  leaveTypeEnum,
  leaveStatusEnum,
  refreshTokens,
  employeeProfiles,
  genderEnum,
  maritalStatusEnum,
  auditLogs,
  employeeSkills,
};

// ── Relations ───────────────────────────────────────────────────

export const employeesRelations = relations(employees, ({ many, one }) => ({
  leaveRecords: many(leaveRecords),
  refreshTokens: many(refreshTokens),
  profile: one(employeeProfiles, {
    fields: [employees.id],
    references: [employeeProfiles.employeeId],
  }),
  skills: many(employeeSkills),
  auditLogs: many(auditLogs),
  // Self-reference: employee reports to manager
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
    relationName: 'manager',
  }),
  // Self-reference: manager has direct reports
  directReports: many(employees, { relationName: 'manager' }),
}));

export const leaveRecordsRelations = relations(leaveRecords, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveRecords.employeeId],
    references: [employees.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  employee: one(employees, {
    fields: [refreshTokens.employeeId],
    references: [employees.id],
  }),
}));

export const employeeProfilesRelations = relations(employeeProfiles, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeProfiles.employeeId],
    references: [employees.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  employee: one(employees, {
    fields: [auditLogs.employeeId],
    references: [employees.id],
    relationName: 'auditLogActor',
  }),
  targetEmployee: one(employees, {
    fields: [auditLogs.targetEmployeeId],
    references: [employees.id],
    relationName: 'auditLogTarget',
  }),
}));

export const employeeSkillsRelations = relations(employeeSkills, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeSkills.employeeId],
    references: [employees.id],
  }),
}));

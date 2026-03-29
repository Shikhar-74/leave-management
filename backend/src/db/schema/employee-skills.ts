import { pgTable, serial, integer, varchar, timestamp, uniqueIndex, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { employees } from './employees';

export const employeeSkills = pgTable(
  'employee_skills',
  {
    id: serial('id').primaryKey(),
    employeeId: integer('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    skillName: varchar('skill_name', { length: 100 }).notNull(),
    proficiency: integer('proficiency').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      // Constraints
      proficiencyCheck: check('proficiency_check', sql`${table.proficiency} >= 1 AND ${table.proficiency} <= 5`),
      
      // Indexes
      employeeIdIdx: index('idx_employee_skills_employee_id').on(table.employeeId),
      uniqueSkillIdx: uniqueIndex('idx_employee_skills_unique').on(table.employeeId, table.skillName),
      createdAtIdx: index('idx_employee_skills_created_at').on(table.createdAt),
    };
  }
);

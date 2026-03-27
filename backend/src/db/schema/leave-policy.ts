import { pgTable, serial, integer, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * leave_policy table — defines annual leave entitlement.
 * One row per year. Year is unique.
 * CHECK: total_leave >= 0.
 */
export const leavePolicy = pgTable(
  'leave_policy',
  {
    id: serial('id').primaryKey(),
    year: integer('year').notNull().unique(),
    totalLeave: integer('total_leave').notNull(),
  },
  (table) => [
    check('chk_total_leave_non_negative', sql`${table.totalLeave} >= 0`),
  ],
);

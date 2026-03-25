import { pgTable, serial, integer } from 'drizzle-orm/pg-core';

/**
 * leave_policy table — defines annual leave entitlement.
 * One row per year. Year is unique.
 */
export const leavePolicy = pgTable('leave_policy', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull().unique(),
  totalLeave: integer('total_leave').notNull(),
});

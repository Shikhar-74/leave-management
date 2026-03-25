import { db } from '../db';
import { leavePolicy } from '../db/schema';
import type { CreateLeavePolicyInput } from '../validators/leave-policy.validator';

/**
 * Inserts a new leave policy into the database.
 * Defines annual leave entitlement for a given year.
 */
export async function createLeavePolicy(data: CreateLeavePolicyInput) {
  const [created] = await db.insert(leavePolicy).values(data).returning();
  return created;
}

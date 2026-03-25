import { Request, Response, NextFunction } from 'express';
import { createLeavePolicySchema } from '../validators/leave-policy.validator';
import { createLeavePolicy } from '../services/leave-policy.service';

/**
 * POST /api/v1/leave-policies
 * Validates body → creates leave policy → returns 201 with created row.
 */
export async function createLeavePolicyController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = createLeavePolicySchema.parse(req.body);
    const policy = await createLeavePolicy(data);
    res.status(201).json(policy);
  } catch (error) {
    next(error);
  }
}

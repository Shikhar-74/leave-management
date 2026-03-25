import { Request, Response, NextFunction } from 'express';
import { createLeaveRecordSchema } from '../validators/leave-record.validator';
import { createLeaveRecord } from '../services/leave-record.service';

/**
 * POST /api/v1/leave-records
 * Validates body → verifies employee exists → creates leave record → returns 201.
 */
export async function createLeaveRecordController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = createLeaveRecordSchema.parse(req.body);
    const record = await createLeaveRecord(data);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
}

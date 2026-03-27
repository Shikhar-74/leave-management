import { Request, Response, NextFunction } from 'express';
import {
  applyLeaveSchema,
  getMyLeavesQuerySchema,
  leaveIdSchema,
} from '../validators/leave.validator';
import * as leaveService from '../services/leave.service';
import { ZodError } from 'zod';

/**
 * Map Zod issue path/code to spec-specific error codes for apply leave.
 */
function mapApplyLeaveZodError(error: ZodError): { status: number; code: string; message: string } | null {
  const issue = error.issues[0];
  if (!issue) return null;

  const path = issue.path?.[0] as string;

  // Date format errors (regex validation failures on start_date/end_date)
  if ((path === 'start_date' || path === 'end_date') && (issue.code === 'invalid_format' || issue.code === 'custom')) {
    return { status: 400, code: 'INVALID_DATE_FORMAT', message: issue.message };
  }

  // leave_type enum mismatch
  if (path === 'leave_type') {
    return { status: 400, code: 'INVALID_LEAVE_TYPE', message: issue.message };
  }

  // reason too long
  if (path === 'reason' && issue.code === 'too_big') {
    return { status: 400, code: 'REASON_TOO_LONG', message: issue.message };
  }

  return null;
}

/**
 * POST /api/v1/leaves/apply
 */
export async function applyLeaveController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = applyLeaveSchema.parse(req.body);
    const result = await leaveService.applyLeave(req.employee!.id, data);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const mapped = mapApplyLeaveZodError(error);
      if (mapped) {
        res.status(mapped.status).json({
          error: mapped.code,
          message: mapped.message,
          status: mapped.status,
        });
        return;
      }
    }
    next(error);
  }
}

/**
 * GET /api/v1/leaves/my
 */
export async function getMyLeavesController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = getMyLeavesQuerySchema.parse(req.query);
    const result = await leaveService.getMyLeaves(req.employee!.id, query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/leaves/:leaveId
 */
export async function getLeaveByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { leaveId } = leaveIdSchema.parse({ leaveId: req.params.leaveId });
    const result = await leaveService.getLeaveById(
      leaveId,
      req.employee!.id,
      req.employee!.role,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/leaves/:leaveId/cancel
 */
export async function cancelLeaveController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { leaveId } = leaveIdSchema.parse({ leaveId: req.params.leaveId });
    const result = await leaveService.cancelLeave(
      leaveId,
      req.employee!.id,
      req.employee!.role,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

import { Request, Response, NextFunction } from 'express';
import {
  applyLeaveSchema,
  getMyLeavesQuerySchema,
  leaveIdSchema,
} from '../validators/leave.validator';
import * as leaveService from '../services/leave.service';

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

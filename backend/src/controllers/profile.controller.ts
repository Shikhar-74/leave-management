import { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profile.service';
import {
  updateProfileSchema,
  getAllEmployeesQuerySchema,
  deleteProfileParamSchema,
  deleteProfileQuerySchema,
} from '../validators/profile.validator';
import { AppError } from '../middlewares/error-handler';

/**
 * GET /api/v1/profile — Get own profile.
 */
export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const employeeId = req.employee!.id;
    const profile = await profileService.getProfile(employeeId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/profile — Update own profile.
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const employeeId = req.employee!.id;
    const parsed = updateProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        parsed.error.issues.map((e: { message: string }) => e.message).join(', '),
      );
    }

    // EMPLOYEE cannot update date_of_birth
    if (req.employee!.role === 'EMPLOYEE' && parsed.data.date_of_birth !== undefined) {
      throw new AppError(403, 'INSUFFICIENT_PERMISSIONS', 'Employees cannot update date of birth');
    }

    const result = await profileService.updateProfile(employeeId, parsed.data, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/employees — List all employees (ADMIN only).
 */
export async function getAllEmployees(req: Request, res: Response, next: NextFunction) {
  try {
    // Admin check
    if (req.employee!.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Only admins can access employee list');
    }

    const parsed = getAllEmployeesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        parsed.error.issues.map((e: { message: string }) => e.message).join(', '),
      );
    }

    const result = await profileService.getAllEmployees(parsed.data);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/profile/:employeeId — Soft-delete employee (ADMIN only).
 */
export async function deleteProfile(req: Request, res: Response, next: NextFunction) {
  try {
    // Admin check
    if (req.employee!.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Only admins can delete employee profiles');
    }

    const paramParsed = deleteProfileParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      throw new AppError(400, 'INVALID_EMPLOYEE_ID', 'employee_id must be a positive integer');
    }

    const queryParsed = deleteProfileQuerySchema.safeParse(req.query);
    const reason = queryParsed.success ? queryParsed.data.reason : undefined;

    const result = await profileService.deleteProfile(
      req.employee!.id,
      paramParsed.data.employeeId,
      reason,
      { ip: req.ip, userAgent: req.headers['user-agent'] },
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}
